const SchdulerSchema = require("../../../DB/Schema/Schduler");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const {UploadFileToAzureBlob,GenerateOccurances,GenerateOccurancesWithDays,GenerateRandomCode} =require("../../../utils/HelperFunctions")
const Occurance = require("../../../DB/Schema/Occurances");
const mongoose = require("mongoose");
const Dependent = require("../../../DB/Schema/DependetUser");
const Invetation =require("../../../DB/Schema/invitations")
const User = require("../../../DB/Schema/User");
const Viewer =require("../../../DB/Schema/Viewers")
const messages = require("../../../Messages/index")
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const Symptom = require("../../../DB/Schema/Symptoms");
const Profile = require("../../../DB/Schema/Profile")
const Permissions = require("../../../DB/Schema/Permissions");
const { populate } = require("../../../DB/Schema/Schduler");

exports.CreateDependetA = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        firstName,
        lastName,
        nickName,
        email,
        phoneNumber,
        countryCode
        
       
      }=req.body
      /**
       * case 1 
       * -1 user access this api to create a dependent who has no phone
       * -2 email and phone nubmer are optional
       * -3 if email and phone number are provided make sure that the are unique
       * -4 link the new dependent to the user profile
       * -5 user can confirm or reject depenent doses
       * -6 user has full permissons to mange the depenent 
       * -7 (read/write) medications,schudle,doses and get notifications
       * -8 create a new profile to that depenent
       * -9 the depenent profile only has a read permission
       */
        // check if the user has a profile
        const profile = await Profile.findById(ProfileID)
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // check if the user if the user is the owner of that profile
        if(profile.Owner.User.toString() !== id){
            return errorResMsg(res, 400, req.t("Unauthorized"));
        }

        // check for  email and mobile if it provided
        if(email){
            const emailExist = await User.findOne({
                email:email
            })
            if(emailExist){
                return errorResMsg(res, 400, req.t("email_exist"));
            }
        }
        const mobileNumber ={
            phoneNumber:phoneNumber,
            countryCode:countryCode
        }
        if(mobileNumber){
            const mobileExist = await User.findOne({
                'mobileNumber.phoneNumber':mobileNumber.phoneNumber
            })
            if(mobileExist){
                return errorResMsg(res, 400, req.t("mobile_exist"));
            }
        }
     
      // store the image to aure
      let img;
      if(req.file){
        img = await UploadFileToAzureBlob(req.file)
     }
     
      // create new depenent user
        const newDependent = new Dependent({
            img:img,
            firstName:firstName,
            lastName:lastName,
            nickName:nickName,
            email:email,
            mobileNumber:mobileNumber,
            MasterProfile:ProfileID,
            Status:1
        })
        // create new viewer for the depenent user
        const newViewer = new Viewer({
            ViewerProfile:ProfileID,
            CanWriteDoses:true,
            CanWriteSymtoms:true
            
        })
       // create a new profile for depenent user
         const newProfile = new Profile({
            Owner:{
                User:id,
                Permissions:{
                    Read:true,
                    Write:true,
                }
            },
            AccountType:1,
            Viewers:[{
                viewer:newViewer._id,
                Dependent:newDependent._id

            }]
         })
         // link profile to viewer
            newViewer.DependentProfile = newProfile._id 

       

        // link profile to user
        profile.Dependents.push({
            Profile:newProfile._id,
            AccountType:1,
            Dependent:newDependent._id
        })
        // save all the data
        await newDependent.save()
        await newProfile.save()
        await newViewer.save()
        await profile.save()
    
        const responseData ={
            ProfileID:newProfile._id,
            firstName,
            lastName,
            nickName,
            email,
            phoneNumber,
            countryCode,
            img
        }
    
        // return succesfull response
      return successResMsg(res, 200, {message:req.t("depenentA_created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };


  exports.CreateDependetB = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        firstName,
        lastName,
        nickName,
        email,
        phoneNumber,
        countryCode
        
       
      }=req.body
      /**
       * case 2
       * -1 user access this api to create a dependent who has phone
       * -2 email and phone nubmer are required
       * -3 email and phone number are unique
       * -4 if email and phone already registered send invitation
       * -5 if the email and phone doesnt exist
       *    -create new user 
       *    -crete new profile
       *    -send notification to that user
       *    -generate one time otp for that user
       *    -user uses this otp to enter the app for the first time
       *    -after entering the otp the account is automaticly activated
       *    -user generates a new password 
       *    -user accept or reject invitation
       *    -if invitation is sent before return
       *    -if invitation sent and the user is in temp moode return
       */
        // check if the user has a profile
        const profile = await Profile.findById(ProfileID).populate("Owner.User")
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // check if the user if the user is the owner of that profile
        if(profile.Owner.User._id.toString() !== id){
            return errorResMsg(res, 400, req.t("Unauthorized"));
        }

        // check for  email and mobile if it provided
        const mobileNumber={
            phoneNumber:phoneNumber,
            countryCode:countryCode
        }
        if(!(email||mobileNumber.phoneNumber)){
            return errorResMsg(res, 400, req.t("email_or_mobile_required"));
        }

          
      // store the image to aure
      let img;
      if(req.file){
        img = await UploadFileToAzureBlob(req.file)
     }
     
        const user = await User.findOne(
            { "$or": [ { email: email }, { 'mobileNumber.phoneNumber':phoneNumber} ] }
          );
            // if the invitation is sent before return 
            
          // check if user exists and send invitation to that user
          // case user is active
          if (user&&!user.temp) {
            /**
             * user alreay exists
             * send notification to that user
             */
            // get user profile
            const userprofile = await Profile.findById(user.profile).populate("Owner.User")
            if(!userprofile){
                return errorResMsg(res, 400, req.t("profile_not_found"));
            }
            //check if the invitation sent before

            const invetation =await Invetation.find({
                From:ProfileID,
                To:userprofile._id,
            })

            if(invetation.length>0){
                return errorResMsg(res, 400, req.t("invitation_sent_before"));
            }
            //create dependent user
            const newDependentUser = new Dependent({
                firstName:firstName,
                lastName:lastName,
                nickName:nickName,
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                MasterProfile:ProfileID,
                DependentProfile:userprofile._id,
                AccountType:1,
                img
            })
            // create new invitation
            const newInvetation = new Invetation({
                From:ProfileID,
                To:userprofile._id,
                Status:0,
                dependent:newDependentUser._id

            })

            // save all the data
            await newDependentUser.save()
            await newInvetation.save()

            // send notification to the user

            if(userprofile.Owner.User.lang==="en"){
                const Invitation = messages.InvetationSentToExistentDependentUser_EN(profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,Invitation)
               }else{
                const Invitation = messages.InvetationSentToExistentDependentUser_AR(RestPasswordCode,profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,Invitation)
               }
          

            const responseData ={
                ProfileID:userprofile._id,
                firstName,
                lastName,
                nickName,
                email,
                phoneNumber,
                countryCode,
                img,
                AccountType:1,
                Status:0
            }
            return successResMsg(res, 200, {message:req.t("invitation_sent"),data:responseData});




          }

            // case user is not active
            if (user&&user.temp) {
                return errorResMsg(res, 400, req.t("user_is_not_active"));
            }
//******************************************************************* */
                  
            // create new user
            const newUser = new User({
                firstName:firstName,
                lastName:lastName,
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                temp:true,



            })
            // create new profile for the user
            const newUserProfile = new Profile({
                Owner:{
                    User:newUser._id,
                    Permissions:{
                        Read:true,
                        Write:true,
                    }
                },
                temp:true
            })
            // create a new dependent user
            const newDependentUser = new Dependent({
                firstName:firstName,
                lastName:lastName,
                nickName:nickName,
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                MasterProfile:ProfileID,
                DependentProfile:newUserProfile._id,
                AccountType:1,
                img
            })
            // link profiles
            newUser.profile=newUserProfile._id

            // add rest password code and its expiration date

              //send notifications
               const RestPasswordCode = await GenerateRandomCode(2);
               const ResetPasswordXpireDate =  Date.now()  + 8.64e+7 ;
               if(newUser.lang==="en"){
                const Invitation = messages.InvetationSentToDependent_EN(RestPasswordCode,profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,Invitation)
               }else{
                const Invitation = messages.InvetationSentToDependent_AR(RestPasswordCode,profile.Owner.User.firstName,firstName);
                await SendEmailToUser(email,Invitation)
               }
          
          
               newUser.RestPasswordCode=RestPasswordCode;
               newUser.ResetPasswordXpireDate=ResetPasswordXpireDate;

               // register the invitation
                // create new invitation
            const newInvetation = new Invetation({
                From:ProfileID,
                To:newUserProfile._id,
                Status:0,
                dependent:newDependentUser._id

            })
                 
             
                // save to db
            await newUser.save()
            await newUserProfile.save()
            await newDependentUser.save()
            await newInvetation.save()
                 
    
        const responseData ={
            ProfileID:newUserProfile._id,
            firstName,
            lastName,
            nickName,
            email,
            phoneNumber,
            countryCode,
            img,
            Status:0,
            AccountType:1,
        }
    
        // return succesfull response
      return successResMsg(res, 200, {message:req.t("invitation_sent"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };  

  exports.ChangeInvitationStatus = async (req, res) => {
    /**
       * accept or reject invitation
       *
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmied ,2 rejected
        invetationID

        
       
      }=req.body
        // get the invitation
        const invetation = await Invetation.findById(invetationID)
        if(!invetation){
            return errorResMsg(res, 400, req.t("invetation_not_found"));
        }
        // get the master profile
        const masterProfile = await Profile.findById(mongoose.Types.ObjectId(invetation.From))
        if(!masterProfile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // get the dependetProfile
        const dependentProfile = await Profile.findById(mongoose.Types.ObjectId(invetation.To))
        if(dependentProfile.Owner.User.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(ProfileID.toString()!=invetation.To.toString()){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
      
        // change the inviation status............................................................
        if(invetation.Status!=0){
            return errorResMsg(res, 400, req.t("invitation_status_changed_before"));
        }
        //rejection case
        if(Status===2){
            invetation.Status=2;
            await invetation.save()
            // return reject confirmation

            return successResMsg(res, 200, {message:req.t("invitation_rejected")});

        }
        //acceptance case
        if(Status===1){
            invetation.Status=1;
            
            // add the dependent to the master profile
            masterProfile.Dependents.push({
                Profile:dependentProfile._id,
                Dependent: invetation.dependent
            })
            // create a new viewer for the master profile
            const newViewer = new Viewer({
                ViewerProfile:masterProfile._id,
                DependentProfile:dependentProfile._id
            })
            // add the master to the dependent profile
            dependentProfile.Viewers.push({
                Dependent:invetation.dependent._id,
                viewer:newViewer._id

            })
            await dependentProfile.save()
            await masterProfile.save()
            await invetation.save()
            await newViewer.save()
            // return accept confirmation
            return successResMsg(res, 200, {message:req.t("invitation_accepted")});

       
        }

        // return error response
        return errorResMsg(res, 400, req.t("invalid_invitation_status"));
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 

  exports.getInvitations = async (req, res) => {
    /**
       * get invetations
       * filter it based on the status sent 
       * if no status provided return all the inviations
       *
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmied ,2 rejected
        sent,
        recieved

       
      }=req.query
        // make sure that the api consumer is authorized
        if(!mongoose.isValidObjectId(ProfileID)){
            return errorResMsg(res, 400, req.t("invalid_profile_id"));
        }
        const profile = await Profile.findById(ProfileID)
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Owner.User.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
        }
        // get the invetations
        let invetations;
        //defult filter with all prametars
        if(sent && recieved){
            invetations = await Invetation.find({
                $or:[{From:ProfileID},{To:ProfileID}],
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }else if(sent&&!recieved){
            invetations = await Invetation.find({
                From:ProfileID,
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }else if(recieved&&!sent){
            invetations = await Invetation.find({
                To:ProfileID,
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }else{
            invetations = await Invetation.find({
                $or:[{From:ProfileID},{To:ProfileID}],
                Status:Status||{ $exists:true}
            }).populate("dependent")
        }
        responseData=[
            ...invetations
        ]
        // return succesfull response
        return successResMsg(res, 200, {message:req.t("invetations"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 

  exports.Dependents = async (req, res) => {
    /**
       * get the user dependnts 
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
       
      }=req.query
        // make sure that the api consumer is authorized
        if(!mongoose.isValidObjectId(ProfileID)){
            return errorResMsg(res, 400, req.t("invalid_profile_id"));
        }
        const profile = await Profile.findById(ProfileID).populate("Dependents.Profile.Owner.User")
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Owner.User._id.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
        }
       
        // get user profile dependents
        


        responseData=[
            ...profile.Dependents
        ]
        // return succesfull response
        return successResMsg(res, 200, {message:req.t("dependent"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 


  exports.AddCareGiver = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        email,
        phoneNumber,
        countryCode,
        permissions
        
       
      }=req.body
      /**
       * case 3
       * -1 user access this api to add a caregiver
       * -2 user should provide care giver mobile or email
       * -3 if the care giver already exist send him inviation
       * -4 if he doesnt exist create him a new profile and send him inviation
       */
        // check if the user has a profile
        const profile = await Profile.findById(ProfileID).populate("Owner.User")
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // check if the user if the user is the owner of that profile
        if(profile.Owner.User._id.toString() !== id){
            return errorResMsg(res, 400, req.t("Unauthorized"));
        }

        // check for  email and mobile if it provided
        const mobileNumber={
            phoneNumber:phoneNumber,
            countryCode:countryCode
        }
        if(!(email||mobileNumber.phoneNumber)){
            return errorResMsg(res, 400, req.t("email_or_mobile_required"));
        }

          
        const user = await User.findOne(
            { "$or": [ { email: email }, { 'mobileNumber.phoneNumber':phoneNumber} ] }
          );
            // if the invitation is sent before return 
            
          // if no user found return 
          if (!user) {
            return errorResMsg(res, 400, req.t("caregiver_not_registered"));

        }
        
            /**
             * user alreay exists
             * send notification to that user
             */
            // get user profile 
            const CareGiverprofile = await Profile.findById(user.profile).populate("Owner.User")
            if(!CareGiverprofile){
                return errorResMsg(res, 400, req.t("profile_not_found"));
            }
            //check if the invitation sent before

            const invetation =await Invetation.find({
                From:ProfileID,
                To:CareGiverprofile._id,
            })

            if(invetation.length>0){
                return errorResMsg(res, 400, req.t("invitation_sent_before"));
            }
            //create dependent user
            const newDependentUser = new Dependent({
                firstName:user.firstName,
                lastName:user.lastName,
                nickName:'',
                email:email,
                mobileNumber:{
                    countryCode:countryCode,
                    phoneNumber:phoneNumber
                },
                MasterProfile:CareGiverprofile._id,
                DependentProfile:ProfileID,
                AccountType:2,
                img:user.img,
               
            })
            let CanReadSpacificMeds;
            if(permissions.CanReadAllMeds){
                CanReadSpacificMeds=null
            }else{
                CanReadSpacificMeds=permissions.CanReadSpacificMeds
            }
            // create new invitation
            const newInvetation = new Invetation({
                From:ProfileID,
                To:CareGiverprofile._id,
                Status:0,
                dependent:newDependentUser._id,
                permissions:{
                   ... permissions,
                   CanReadSpacificMeds,
                },
                AccountType:2

            })

            // save all the data
            await newDependentUser.save()
            await newInvetation.save()

            // send notification to the user

            if(CareGiverprofile.Owner.User.lang==="en"){
                const Invitation = messages.InvetationSentToExistentCareGiverUser_EN(profile.Owner.User.firstName,user.firstName);
                await SendEmailToUser(email,Invitation)
               }else{
                const Invitation = messages.InvetationSentToExistentCareGiverUser_AR(RestPasswordCode,profile.Owner.User.firstName,user.firstName);
                await SendEmailToUser(email,Invitation)
               }
          

            const responseData ={
                CareGiverProfileID:CareGiverprofile._id,
                firstName:user.firstName,
                lastName:user.lastName,
                nickName:user.nickName,
                email:user.email,
                phoneNumber:user.mobileNumber.phoneNumber,
                countryCode:user.mobileNumber.countryCode,
                img:user.img,
                AccountType:2,
                Status:0
            }
            return successResMsg(res, 200, {message:req.t("invitation_sent"),data:responseData});
       
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };  

  exports.ChangeInvitationStatusToAcceptDependent = async (req, res) => {
    /**
       * accept or reject invitation
       *
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmied ,2 rejected
        invetationID

        
       
      }=req.body
        // get the invitation
        const invetation = await Invetation.findById(invetationID)
        if(!invetation){
            return errorResMsg(res, 400, req.t("invetation_not_found"));
        }
        // get the caregiver profile
        const CareGiverProfile = await Profile.findById(mongoose.Types.ObjectId(invetation.To))
        if(!CareGiverProfile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // get the dependetProfile
        const dependentProfile = await Profile.findById(mongoose.Types.ObjectId(invetation.From))
        if(CareGiverProfile.Owner.User.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(ProfileID.toString()!=invetation.To.toString()){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(invetation.Status!=0){
            return errorResMsg(res, 400, req.t("invitation_status_changed_before"));
        }
        // change the inviation status............................................................
        //rejection case
        if(Status===2){
            invetation.Status=2;
            await invetation.save()
            // return reject confirmation

            return successResMsg(res, 200, {message:req.t("invitation_rejected")});

        }
        //acceptance case
        if(Status===1){
            invetation.Status=1;
            
            // add the dependent to the master profile
            CareGiverProfile.Dependents.push({
                Profile:dependentProfile._id,
                Dependent: invetation.dependent
            })
            //get careGiver permissions
            const permissions = {
               ... invetation.permissions
            }
            // create new viewer
            const newViewer = new Viewer({
                ViewerProfile:CareGiverProfile._id,
                DependentProfile:dependentProfile._id,
                ...permissions

            })
            // add the master to the dependent profile
            dependentProfile.Viewers.push({
                viewer:newViewer._id,
                Dependent:invetation.dependent

            })
            // save all the data
            await newViewer.save()
            await dependentProfile.save()
            await CareGiverProfile.save()
            await invetation.save()
            // return accept confirmation
            return successResMsg(res, 200, {message:req.t("invitation_accepted")});

       
        }

        // return error response
        return errorResMsg(res, 400, req.t("invalid_invitation_status"));
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 

  exports.CareGiver = async (req, res) => {
    /**
       * get the user dependnts 
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
       
      }=req.query
        // make sure that the api consumer is authorized
        if(!mongoose.isValidObjectId(ProfileID)){
            return errorResMsg(res, 400, req.t("invalid_profile_id"));
        }
        const profile = await Profile.findById(ProfileID).populate({
            path: 'Viewers.viewer',
            select: 'ViewerProfile',
            populate: {
                path: 'ViewerProfile',
                select:'User',
                populate:{
                    path:'Owner.User',
                    select:'firstName lastName nickName img email mobileNumber'
                }
            }
            
          })
        if(!profile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        if(profile.Owner.User._id.toString()!=id){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_view_this_profile"));
        }
       
        // get user profile dependents
        


        responseData=[
            ...profile.Viewers
        ]
        // return succesfull response
        return successResMsg(res, 200, {message:req.t("caregivers"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 