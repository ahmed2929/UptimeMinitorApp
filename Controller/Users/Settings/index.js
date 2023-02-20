
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
const {SendEmailToUser} =require("../../../utils/HelperFunctions")
const TempEmails = require("../../../DB/Schema/TempEmails")
const Occurrence = require("../../../DB/Schema/Occurrences");
const SchedulerSchema = require("../../../DB/Schema/Scheduler");
const UserMedication = require("../../../DB/Schema/UserMedication");
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");

const {GenerateToken,GenerateRandomCode,GenerateRefreshToken,IsMasterOwnerToThatProfile,CheckProfilePermissions} =require("../../../utils/HelperFunctions")



exports.EditProfile = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {ProfileID,firstName,lastName,countryCode,phoneNumber,gender,DateOfBirth}=req.body
     
  
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)

      if(profile.Owner.User.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      const searchForPhone =await User.findOne({
        "mobileNumber.countryCode":countryCode,
        "mobileNumber.phoneNumber":phoneNumber,
      })
      if(searchForPhone){
        if(searchForPhone._id.toString()!==id){
          return errorResMsg(res, 400, req.t("Phone_number_already_exist"));
        }
      }


      let img
      // store the image to azure
      if(req.file){
         img = await UploadFileToAzureBlob(req.file)
      }
      // update profile info
      profile.gender=gender||profile.gender
      profile.DateOfBirth=DateOfBirth||profile.DateOfBirth
     
      await profile.save()
      const user=await User.findById(id)

      user.mobileNumber.countryCode=countryCode||user.mobileNumber.countryCode
      user.mobileNumber.phoneNumber=phoneNumber||user.mobileNumber.phoneNumber
      user.firstName=firstName||user.firstName
      user.lastName=lastName||user.lastName
      user.img=img||user.img
      await user.save()
      
         
      return successResMsg(res, 200, {message:req.t("profile_info_updated")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  exports.ChangePassword = async (req, res) => {
  
    try {
  
      const {id} =req.id
      const {ProfileID,OldPassword,newPassword}=req.body
     
  
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      if(!OldPassword||!newPassword){
        return errorResMsg(res, 400, req.t("Invalid_Password"));
      }
      const user =await User.findById(id).select("+password");
      // check if the old password is correct
   
      const isMatch=await user.correctPassword(OldPassword,user.password)
      if (!isMatch) {
        return errorResMsg(res, 400, req.t("Invalid_Password"));
      }
      // save new password to user
      user.password=newPassword
      await user.save()
     
      return successResMsg(res, 200, {message:req.t("Password_changed")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  
  
  }
  
  exports.ChangeEmail = async (req, res) => {
  
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
      if(profile.Owner.User.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
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
  
  exports.verifyChangedEmail = async (req, res) => {
  
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
      if(profile.Owner.User.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
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
        await TempEmails.findByIdAndDelete(searchForEmail._id)
        // update user email
        await User.findByIdAndUpdate(id,{
            email:ChangedEmail
        })
      
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
      if(profile.Owner.User.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
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

  exports.DeleteAccount = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {ProfileID}=req.body
      const profile =await Profile.findById(ProfileID)

      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }

      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
        // delete user
        await User.findByOneAndDelete({
          profile:ProfileID
        })
        // delete profile
        profile.Deleted=true
        profile.NotificationInfo=null
        await profile.save()
        await Occurrence.deleteMany({
          ProfileID:ProfileID,
          PlannedDateTime:{$gte:new Date()}
        
        })
        await UserMedication.updateMany({
          ProfileID:ProfileID,

        },{
          $set:{
            isDeleted:true,
    
          }
        })
        await SchedulerSchema.updateMany({
          ProfileID:ProfileID,
        },{
          $set:{
            isDeleted:true,
          }
        })
        await Occurrence.updateMany({
          ProfileID:ProfileID,

        },{
          $set:{
            isSuspended:true,
          }
        })
         
      return successResMsg(res, 200, {message:req.t("Profile_Deleted")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  