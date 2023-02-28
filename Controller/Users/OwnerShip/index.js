
/**
 * @file controller/Settings/index.js
 * @namespace controllers
 * @namespace Settings
 * 
 */



const User = require("../../../DB/Schema/User");
const Profile = require("../../../DB/Schema/Profile");
const {UploadFileToAzureBlob}=require("../../../utils/HelperFunctions")
const messages = require("../../../Messages/Email/index")
const TempEmails = require("../../../DB/Schema/TempEmails")
const Occurrence = require("../../../DB/Schema/Occurrences");
const SchedulerSchema = require("../../../DB/Schema/Scheduler");
const UserMedication = require("../../../DB/Schema/UserMedication");
const mongoose = require('mongoose');
const Invitation =require("../../../DB/Schema/invitations")
const NotificationMessages=require("../../../Messages/Notifications/index")
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const {SendPushNotificationToUserRegardlessLangAndOs,CheckProfilePermissions} =require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");

const {GenerateToken,GenerateRandomCode,GenerateRefreshToken,IsMasterOwnerToThatProfile} =require("../../../utils/HelperFunctions")


  exports.ChangeOwnerShipToDependentA = async (req, res) => {
  
    try {
  
      const {id} =req.id
      const {ProfileID,newEmail}=req.body
     
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanManageCareCircle')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      const searchForEmail =await User.findOne({
        email:newEmail
      })
      if(searchForEmail){
        return errorResMsg(res, 400, req.t("Email_already_exists"));
      }
      // register temp user with that email
      const tempEmail=new TempEmails({
        email:newEmail,
        profile:ProfileID
      })
      //send OTP to verify email
      const verificationCode = await GenerateRandomCode(2);
      const verificationExpiryDate =  Date.now()  + 8.64e+7 ;
       let verificationMessage;
       if(profile.lang==="en"){
         verificationMessage = messages.verifyAccount_EN(verificationCode);
       }else{
         verificationMessage = messages.verifyAccount_AR(verificationCode);
       }
      
  
  
       tempEmail.verificationCode=verificationCode;
       tempEmail.verificationExpiryDate=verificationExpiryDate;
     await tempEmail.save();
  
     await SendEmailToUser(tempEmail.email,verificationMessage)
      return successResMsg(res, 200, {message:req.t("OPT_has_sent")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  
  
  }
  
  exports.verifyChangeOwnerShipToDependentA = async (req, res) => {
  
    try {
  
      const {id} =req.id
      const {ProfileID,ChangedEmail,OPT}=req.body
     
      const profile =await Profile.findById(ProfileID)
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanManageCareCircle')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      const searchForEmail =await TempEmails.findOne({
        email:ChangedEmail
      })
      if(!searchForEmail){
        return errorResMsg(res, 400, req.t("Email_Not_found"));
      }
        // check if the OPT is correct
        if (searchForEmail.verificationCode !== OPT) {
            return errorResMsg(res, 400, req.t("Invalid_OPT"));
        }
        // check if the OPT is expired
        if (searchForEmail.verificationExpiryDate < Date.now()) {
            return errorResMsg(res, 400, req.t("OPT_expired"));
        }
        //delete the temp user
        // update user email
        await User.findOneAndUpdate({
            profile:mongoose.Types.ObjectId(ProfileID)
        },{
            email:ChangedEmail
        })
        await TempEmails.findByIdAndDelete(searchForEmail._id)

        return successResMsg(res, 200, {message:req.t("Email_changed")});
     
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  
  
  }

  exports.ResendActivationOPTForTempEmail = async (req, res) => {
  
    try {
  
      const {id} =req.id
      const {ProfileID,newEmail}=req.body
     
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanManageCareCircle')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      let searchForEmail =await TempEmails.findOne({
        email:newEmail
      })
      if(!searchForEmail){
      searchForEmail= new TempEmails({
            email:newEmail,
            profile:ProfileID,
        })
        
       
      }
        //send OTP to verify email
        const verificationCode = await GenerateRandomCode(2);
        const verificationExpiryDate =  Date.now()  + 8.64e+7 ;
         let verificationMessage;
         if(profile.lang==="en"){
           verificationMessage = messages.verifyAccount_EN(verificationCode);
         }else{
           verificationMessage = messages.verifyAccount_AR(verificationCode);
         }
        
    
    
         searchForEmail.verificationCode=verificationCode;
         searchForEmail.verificationExpiryDate=verificationExpiryDate;
       await searchForEmail.save();
    
       await SendEmailToUser(searchForEmail.email,verificationMessage)
     
      return successResMsg(res, 200, {message:req.t("OPT_has_sent")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  
  
  }

  exports.SetDependentAPassword = async (req, res) => {
  
    try {
  
      const {id} =req.id
      const {ProfileID,newPassword}=req.body
     
  
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanManageCareCircle')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      if(!newPassword){
        return errorResMsg(res, 400, req.t("Invalid_Password"));
      }
      const user =await User.findOne({
        profile:ProfileID
      }).select("+password");
      // check if the old password is correct
      if(!user){
        return errorResMsg(res, 400, req.t("User_not_found"));
      }
      // save new password to user
      user.password=newPassword;
      user.IsDependent=false;
      user.verified=true;
      user.MasterUsers=[];
      user.MasterProfiles=[];
      profile.MasterUsers=[];
      profile.MasterProfiles=[];
      await user.save()
      await profile.save()
     
      return successResMsg(res, 200, {message:req.t("Password_changed")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  
  
  }

  exports.ChangeOwnerShipToCareGiver= async (req, res) => {
  
    try {
        /**
         * ActionType : 3 will remove old master , 4 will keep old master
         * 
         */
  
      const {id} =req.id
      const {ProfileID,CareGiverProfileID,ActionType}=req.body
        
      if(ActionType!=3||ActionType!=4){
        return errorResMsg(res, 400, req.t("invalid_Action_type"));
      }
        
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanManageCareCircle')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      const CareGiverProfile=await Profile.findOne({
        _id:CareGiverProfileID,
        Deleted:false
      }).populate("Owner.User")
      if(!CareGiverProfile){
        return errorResMsg(res, 400, req.t("CareGiver_Profile_not_found"));
      }
      const CareGiverIsAlreadyMaster=profile.MasterUsers.includes(mongoose.Types.ObjectId(CareGiverProfileID))
      if(CareGiverIsAlreadyMaster){
        return errorResMsg(res, 400, req.t("CareGiver_is_Already_Master"));
      }
      // send invitation
      const OldMasterUser=await User.findById(id);
      const OldMasterProfile=await Profile.findById(OldMasterUser.profile)
      if(!OldMasterProfile){
        return errorResMsg(res, 400, req.t("user_not_found"));
      }
       // create new invitation
       const newInvitation = new Invitation({
        From:OldMasterUser.profile,
        To:CareGiverProfileID,
        Status:0,
        AccountType:ActionType,//3: the receiver will be MasterToDependent and the old master will be removed,
      

    })


    await newInvitation.save();
    const populatedInvitation = await Invitation.findById(newInvitation._id)
    .populate({
      path:"From",
        select :'Owner.User',
        populate:{
            path:"Owner.User",
            select:'firstName lastName email mobileNumber img'
        }
      }).populate({
        path:"To",
        select :'Owner.User',
        populate:{
            path:"Owner.User",
            select:'firstName lastName email mobileNumber img'
        }
      }).populate({
        path:"permissions.CanReadSpacificMeds.Med",
        select:'name'
    })
    const clonedObject = JSON.parse(JSON.stringify(populatedInvitation));


      if(CareGiverProfile.Owner.User.lang==="en"){
        //  email   
        const invitation = messages.InvitationSentToCareGiverToBeMaster_EN(CareGiverProfile.Owner.User.firstName,OldMasterUser.firstName);
          await SendEmailToUser(CareGiverProfile.Owner.User.email,invitation)
         }else{
          const invitation = messages.InvitationSentToCareGiverToBeMaster_AR(CareGiverProfile.Owner.User.firstName,OldMasterUser.firstName);
          await SendEmailToUser(CareGiverProfile.Owner.User.email,invitation)
         }

        
      // send notification to the user using push notification 
      await SendPushNotificationToUserRegardlessLangAndOs(OldMasterProfile,CareGiverProfile,"NewInvitationToBeMasterUser",{
        Invitation:clonedObject,
        ProfileInfoOfSender:{
          firstName:profile.Owner.User.firstName,
          lastName:profile.Owner.User.lastName,
          img:profile.Owner.User.img,
          email:profile.Owner.User.email,
          ProfileID:profile._id,
        }
      })
     
      return successResMsg(res, 200, {message:req.t("invitation_sent")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  
  
  }
  
 
  exports.ChangeInvitationStatus = async (req, res) => {
    /**
     to accept a caregiver
       */
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Status,//0 pending , 1 confirmed ,2 rejected
        InvitationID,
       
        
       
      }=req.body
        // get the invitation
    
        const invitation = await Invitation.findById(InvitationID).populate({
          path:"From",
            select :'Owner.User',
            populate:{
                path:"Owner.User",
                select:'firstName lastName email mobileNumber img'
            }
          }).populate({
            path:"To",
            select :'Owner.User',
            populate:{
                path:"Owner.User",
                select:'firstName lastName email mobileNumber img'
            }
          }).populate({
            path:"permissions.CanReadSpacificMeds.Med",
            select:'name'
        })
        if(!invitation){
            return errorResMsg(res, 400, req.t("Invitation_not_found"));
        }
        // get the master profile
        const masterProfile = await Profile.findById(mongoose.Types.ObjectId(invitation.From._id))
        if(!masterProfile){
            return errorResMsg(res, 400, req.t("profile_not_found"));
        }
        // get the DependentProfile
        const dependentProfile = await Profile.findById(mongoose.Types.ObjectId(invitation.To._id))
        const IsMaster=await IsMasterOwnerToThatProfile(id,dependentProfile)
        if(dependentProfile.Owner.User._id.toString()!=id&&!IsMaster){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(ProfileID.toString()!=invitation.To._id.toString()){
            return errorResMsg(res, 400, req.t("you_are_not_allowed_to_change_this_invitation"));

        }
        if(dependentProfile.Owner.User._id.toString() === id){
          if(!CheckProfilePermissions(dependentProfile,'CanManageCareCircle')){
            return errorResMsg(res, 400, req.t("Unauthorized"));
          }
        }
        // change the invitation status............................................................
        if(invitation.Status!=0){
            return errorResMsg(res, 400, req.t("invitation_status_changed_before"));
        }
        //rejection case
        if(Status===2){
            invitation.Status=2;
            await invitation.save()
            // return reject confirmation

            return successResMsg(res, 200, {message:req.t("invitation_rejected")});

        }
        //acceptance case
        if(Status===1){
            invitation.Status=1;
            
            let newViewer
            // create a new viewer for the master profile
            if(permissions){
               newViewer = new Viewer({
                ViewerProfile:masterProfile._id,
                DependentProfile:dependentProfile._id,
                ...permissions,
                ...invitation.externalData,

            })
            invitation.permissions=permissions
            }else{
              newViewer = new Viewer({
                ViewerProfile:masterProfile._id,
                DependentProfile:dependentProfile._id,
                ...invitation.externalData,
                CareGiverNickName:nickName
            })
            }
          
             // add the dependent to the master profile
             masterProfile.Dependents.push({
                Profile:dependentProfile._id,
                Dependent: invitation.dependent,
                viewer:newViewer._id
            })
            // add the master to the dependent profile
            dependentProfile.Viewers.push({
                Dependent:invitation.dependent._id,
                viewer:newViewer._id

            })

             // send notification to the user using push notification 
             await SendPushNotificationToUserRegardlessLangAndOs(dependentProfile,masterProfile,"DependentAcceptedInvitation",{
              Invitation:invitation,
              ProfileInfoOfSender:{
                firstName:dependentProfile.Owner.User.firstName,
                lastName:dependentProfile.Owner.User.lastName,
                img:dependentProfile.Owner.User.img,
                email:dependentProfile.Owner.User.email,
                ProfileID:dependentProfile._id,
              }
            })


            await dependentProfile.save()
            await masterProfile.save()
            await invitation.save()
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