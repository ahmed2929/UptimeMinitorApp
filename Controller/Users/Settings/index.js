
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
const Invitation =require("../../../DB/Schema/invitations")
const FeedBack =require("../../../DB/Schema/Feedback")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");

const {GenerateToken,GenerateRandomCode,GenerateRefreshToken,IsMasterOwnerToThatProfile,CheckProfilePermissions,isValidEmail} =require("../../../utils/HelperFunctions");
const Viewer = require("../../../DB/Schema/Viewers");



exports.EditProfile = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {ProfileID,firstName,lastName,countryCode,phoneNumber,gender,DateOfBirth,KeepOldImg}=req.body
     
  
  
      const profile =await Profile.findById(ProfileID).populate('Owner.User')
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      console.log(profile.Owner.User,id)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

  
      if(phoneNumber){
       if(isNaN(phoneNumber)){
         return errorResMsg(res, 400, req.t("phone_number_is_not_valid"));
       
      }
    }
         const users = await User.find()
      const searchForPhone = users.find((user) => {
        return user.mobileNumber.countryCode === countryCode&&user.mobileNumber.phoneNumber === phoneNumber;
      })
      if(searchForPhone){
        if(searchForPhone._id.toString()!==id){
          return errorResMsg(res, 400, req.t("Phone_number_already_exist"));
        }
      }

     
      let img=null
      // store the image to azure
      if(req.file){
         img = await UploadFileToAzureBlob(req.file)
      }
      // update profile info
      
      profile.gender=Number(gender)>=0?Number(gender):profile.gender
      console.log(Number(gender)>=0?Number(gender):profile.gender)
      console.log(Number(gender))
      profile.DateOfBirth=DateOfBirth?new Date(+DateOfBirth):null||profile.DateOfBirth
      console.log(gender)
      await profile.save()
      const user=await User.findById(id)

      user.mobileNumber.countryCode=countryCode||user.mobileNumber.countryCode
      user.mobileNumber.phoneNumber=phoneNumber||user.mobileNumber.phoneNumber
      user.firstName=firstName||user.firstName
      user.lastName=lastName||user.lastName
      user.img=KeepOldImg==='true'?user.img:img
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
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
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
      const {ProfileID,newEmail,Password}=req.body
     
      const profile =await Profile.findById(ProfileID).populate('Owner.User')
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
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      if(newEmail){
        if(!isValidEmail(newEmail)){
         return errorResMsg(res, 400, req.t("email_is_not_valid"));
       
      }}

      const user =await User.findById(profile.Owner.User._id).select("+password");
      // check if the old password is correct
   
      const isMatch=await user.correctPassword(Password,user.password)
      if (!isMatch) {
        return errorResMsg(res, 400, req.t("Invalid_Password"));
      }
  
 

      const users = await User.find()
      const searchForEmail = users.find((user) => {
        return user.email === newEmail;
      })
      if(searchForEmail){
        return errorResMsg(res, 400, req.t("Email_already_exists"));
      }
      const tempEmailFound=await TempEmails.findOne({
        email:newEmail,
      })
      // if email found not create new one
      if(tempEmailFound){
             // register temp user with that email
     
      //send OTP to verify email
      const verificationCode = await GenerateRandomCode(2);
      const verificationExpiryDate =  Date.now()  + 600000 ;
       let verificationMessage;
       if(profile.lang==="en"){
         verificationMessage = messages.verifyAccount_EN(verificationCode);
       }else{
         verificationMessage = messages.verifyAccount_AR(verificationCode);
       }
      
  
  
       tempEmailFound.verificationCode=verificationCode;
       tempEmailFound.verificationExpiryDate=verificationExpiryDate;
     await tempEmailFound.save();
  
     await SendEmailToUser(tempEmailFound.email,verificationMessage)
      return successResMsg(res, 200, {message:req.t("OPT_has_sent")});

      }
      // register temp user with that email
      const tempEmail=new TempEmails({
        email:newEmail,
        profile:ProfileID
      })
      //send OTP to verify email
      const verificationCode = await GenerateRandomCode(2);
      const verificationExpiryDate =  Date.now()  + 600000 ;
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
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      if(ChangedEmail){
        if(!isValidEmail(ChangedEmail)){
         return errorResMsg(res, 400, req.t("email_is_not_valid"));
       
      }}
  
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
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      if(newEmail){
        if(!isValidEmail(newEmail)){
         return errorResMsg(res, 400, req.t("email_is_not_valid"));
       
      }}
  
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
        const verificationExpiryDate =  Date.now()  + 600000 ;
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
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
        // delete user
        await User.findOneAndDelete({
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
     await Invitation.deleteMany({ From: ProfileID })
      await Invitation.deleteMany({ To: ProfileID })
      return successResMsg(res, 200, {message:req.t("Profile_Deleted")});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  exports.CreateFeedBack = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        Type,
        Description,
      }=req.body
 
      // get the viewer permissions

      const userInfo=await User.findById(id)
      if(!userInfo){
        return errorResMsg(res, 400, req.t("User_not_found"));
      }
      let img
      // store the image to azure
      if(req.files.img&&req.files.img[0]){
         img = await UploadFileToAzureBlob(req.files.img[0])
      }
      // store voice record to azure
      let voice
      if(req.files.voice&&req.files.voice[0]){
        voice = await UploadFileToAzureBlob(req.files.voice[0])
      }
     
  
      // create new feedback
      const newFeedBack = new FeedBack({
        img,
        User:id,
        Type,
        Description,
        VoiceRecord:voice,
       
  
      })
      
      await newFeedBack.save()
    const responseData={
      ...newFeedBack._doc,
    }
    const emailData={
      firstName:userInfo.firstName,
      lastName:userInfo.lastName,
      email:userInfo.email,
      CountryCode:userInfo.mobileNumber.countryCode?userInfo.mobileNumber.countryCode:'',
      phoneNumber:userInfo.mobileNumber.phoneNumber?userInfo.mobileNumber.phoneNumber:'',
      type:Type,
      Description:Description?Description:'',
      img:img?img:false,
      voice:voice?voice:false,
    }
    const feedbackEmail = messages.NewFeedBack_EN(emailData);
    await SendEmailToUser('info@voithy.com',feedbackEmail)
      // return successful response
      return successResMsg(res, 200, {message:req.t("FeedBack_Created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
  exports.GetUserFeedBacks = async (req, res) => {
 
    try {
  
     const {id} =req.id
      const page=req.query.page||1
      const itemPerPage = 10 ;
      let totalItems;
     
  
  
          totalItems = await FeedBack.find().countDocuments();
      
            const feedbacks = await FeedBack.find({User:id})
              .sort({createdAt: -1})
              .skip((page - 1) * itemPerPage)
              .limit(itemPerPage)
              .populate({
                path: "User",
                select: "firstName lastName email"
  
              })
             
           
             const results= {
                  total:totalItems,
                  feedbacks
                }
      
      // return successful response
         
      return successResMsg(res, 200, {data:results});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };

/**
 * Get notification settings (caregiver/dependent level)
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.id - User ID
 * @param {string} req.query.ProfileID - Profile ID
 * @param {string} req.query.DependentProfileID - Dependent Profile ID
 * @returns {Object} - Returns notification settings of a viewer (caregiver/dependent)
 */
  exports.getNotificationSettings= async (req,res)=>{
    try {
      const {id}=req.id
      const {ProfileID,DependentProfileID}=req.query
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      const viewer =await Viewer.findOne({
        ViewerProfile:ProfileID,
        DependentProfile:DependentProfileID
      })
      if(!viewer){
        return errorResMsg(res, 400, req.t("relationship_not_found"));
      }
      return successResMsg(res, 200, {data:viewer.NotificationSettings});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }


  }


  /**
 * Edit notification settings
 * @async
 * @function
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {string} req.id - User ID
 * @param {string} req.body.ProfileID - Profile ID
 * @param {string} req.body.DependentProfileID - Dependent Profile ID
 * @param {Object} req.body.NotificationSettings - Notification settings object
 * @returns {Object} - Returns updated notification settings of a viewer (caregiver/dependent)
 *
 * @description This API allows you to edit the notification settings of a viewer (caregiver/dependent). The `ProfileID` parameter is used to identify the profile of the viewer, and the `DependentProfileID` parameter is used to identify the dependent profile of the viewer. The `NotificationSettings` parameter is an object containing the updated notification settings of the viewer. The function returns a promise that resolves with an object containing the updated notification settings of the viewer.
 *
 * @example
 * // Request body
 * {
  "ProfileID":"63f612e311bbf29952f1cf0f",
   "DependentProfileID":"63f64d946d3833e2b435776c",
   "NotificationSettings":{
        "DoseNotify30m": true,
            "DoseNotify60m": true,
            "MedRefile": true,
            "NewSymptom": false,
            "NewBloodGlucoseReading": true,
            "BloodGlucoseReminder30m": true,
            "BloodGlucoseReminder60m": true,
            "NewBloodPressureReading": true,
            "BloodPressureReminder30m": true,
            "BloodPressureReminder60m": true
   }
}
 *
 * // Response body
 * {
 *   ""data": {
            "DoseNotify30m": true,
            "DoseNotify60m": true,
            "MedRefile": true,
            "NewSymptom": false,
            "NewBloodGlucoseReading": true,
            "BloodGlucoseReminder30m": true,
            "BloodGlucoseReminder60m": true,
            "NewBloodPressureReading": true,
            "BloodPressureReminder30m": true,
            "BloodPressureReminder60m": true
        }
 * }
 */


  exports.EditNotificationSettings= async (req,res)=>{
    try {
      const {id}=req.id
      const {ProfileID,DependentProfileID,NotificationSettings}=req.body
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const IsMaster=await IsMasterOwnerToThatProfile(id,profile)
      if(profile.Owner.User._id.toString()!==id&&!IsMaster){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditProfile')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      const viewer =await Viewer.findOne({
        ViewerProfile:ProfileID,
        DependentProfile:DependentProfileID
      })
      viewer.NotificationSettings=NotificationSettings
      await viewer.save()
      if(!viewer){
        return errorResMsg(res, 400, req.t("relationship_not_found"));
      }
      return successResMsg(res, 200, {data:viewer.NotificationSettings});
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }


  }