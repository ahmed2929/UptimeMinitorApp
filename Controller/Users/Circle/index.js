const SchdulerSchema = require("../../../DB/Schema/Schduler");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const {UploadFileToAzureBlob,GenerateOccurances,GenerateOccurancesWithDays,GenerateRandomCode} =require("../../../utils/HelperFunctions")
const Occurance = require("../../../DB/Schema/Occurances");
const mongoose = require("mongoose");
const Dependent = require("../../../DB/Schema/DependetUser");
const User = require("../../../DB/Schema/User");
const messages = require("../../../Messages/index")
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const Symptom = require("../../../DB/Schema/Symptoms");
const Profile = require("../../../DB/Schema/Profile")
const Permissions = require("../../../DB/Schema/Permissions")

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
                User:id,
               CanWriteMeds:true,
                CanWriteSymptoms:true,

            }]
         }) 
         // create new permissions for the depenent user
            const newPermissions = new Permissions({
                Profile:newProfile._id,
                User:id,
            })
     // link perissons to profile to user
        newProfile.Viewers[0].Permissions = newPermissions._id
        // link profile to depenent user
        newDependent.DependentProfile = newProfile._id

        // link profile to user
        profile.Dependents.push({
            Profile:newProfile._id,
            AccountType:1,
        })
        // save all the data
        await newDependent.save()
        await newProfile.save()
        await newPermissions.save()
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
            const invitation = userprofile.receivedInvitations.find(invitation=>invitation.Profile.toString() === ProfileID)
            if(invitation){
                return errorResMsg(res, 400, req.t("invitation_sent_before"));
            }
            // check if the user is already a dependent on that user
            const isDependent = userprofile.Dependents.find(dependent=>dependent.Profile.toString() === ProfileID)
            if(isDependent){
                return errorResMsg(res, 400, req.t("user_already_dependent"));
            }
            // check if the user is already a viewer on that user
            const isViewer = userprofile.Viewers.find(viewer=>viewer.User.toString() === id)
            if(isViewer){
                return errorResMsg(res, 400, req.t("user_already_viewer"));
            }
            // check if the user is already a owner on that user
            if(userprofile.Owner.User._id.toString() === id){
                return errorResMsg(res, 400, req.t("user_already_owner"));
            }
            // add the invitation
            profile.sentInvitations.push({
                Profile:userprofile._id,
                AccountType:0,

            })
            userprofile.receivedInvitations.push({
                Profile:ProfileID,
                AccountType:2,

            })
            // save the profile
            await profile.save()
            await userprofile.save()

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
                AccountType:0,
                receivedInvitations:[{
                    Profile:ProfileID,
                    AccountType:2,

                }],
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
            })
            // link profiles
            newUser.profile=newUserProfile._id

            // add rest password code and its expiration date

          
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
             
                // save to db
            await newUser.save()
            await newUserProfile.save()
            await newDependentUser.save()



            //send notifications

        
   
      // create new depenent user
        const newDependent = new Dependent({
            img:img,
            firstName:firstName,
            lastName:lastName,
            nickName:nickName,
            email:email,
            mobileNumber:mobileNumber,
            MasterProfile:ProfileID
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
                User:id,
               CanWriteMeds:true,
                CanWriteSymptoms:true,

            }]
         }) 
         // create new permissions for the depenent user
            const newPermissions = new Permissions({
                Profile:newProfile._id,
                User:id,
            })
     // link perissons to profile to user
        newProfile.Viewers[0].Permissions = newPermissions._id
        // link profile to depenent user
        newDependent.DependentProfile = newProfile._id

        // link profile to user
        profile.Dependents.push({
            Profile:newProfile._id,
            AccountType:1,
        })
        // save all the data
        await newDependent.save()
        await newProfile.save()
        await newPermissions.save()
        await profile.save()
    
        const responseData ={
            ProfileID:newProfile._id,
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
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmied ,2 rejected
        
       
      }=req.body
      /**
       * accept or reject invitation
       
       */
    
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  }; 