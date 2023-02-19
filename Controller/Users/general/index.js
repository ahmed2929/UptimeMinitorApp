
/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace general
 * 
 */
const bcrypt = require("bcryptjs");
const User = require("../../../DB/Schema/User");
const MedRecommendation = require("../../../DB/Schema/MedRecommendation");
const NotificationSchema = require("../../../DB/Schema/Notifications");
const Profile = require("../../../DB/Schema/Profile");
const {UploadFileToAzureBlob}=require("../../../utils/HelperFunctions")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");



function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// change user lang
exports.ChangeUserDefaultLang = async (req, res) => {
 
  try {

    const {lang}=req.body
    const {id} =req.id
    // get user with email
    const user = await User.findById(id);
    user.lang=lang;
    await user.save()

    // return successful response
    return successResMsg(res, 200, {message:req.t("lang_has_changed")});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.SearchForMed = async (req, res) => {
 
  try {

    let results=[];
    if (req.query.name) {
     
      // autocomplete search ?

      const regex = new RegExp(escapeRegex(req.query.name), 'i');
      results = await MedRecommendation.find({
        $or:[{PackageName:regex},{GenericName:regex}]
       
        
      }).limit(5);
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
 * getNotifications
 * 
 * @function
 * @memberof controllers
 * @memberof Notification
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.query.ProfileID - Profile ID of the user
 * @param {number} req.query.page - number of the page (pagination logic)
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile  
 * 
 * 
 * @returns {Object} - Returns notifications from latest to oldest
 * @description 
 *     Returns notifications from latest to oldest
     * ********************************
     * logic
         Returns notifications from latest to oldest with Pagination
     * 
     * 
       
 * 
 */

  


exports.Notification = async (req, res) => {
 
  try {

    const {id} =req.id
    const {ProfileID}=req.query
    const page=req.query.page||1
    const itemPerPage = 10 ;
    let totalItems;
   


    const profile =await Profile.findById(ProfileID)
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    
    if(profile.Owner.User.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }

   

    
        totalItems = await NotificationSchema.find({
          ProfileID:ProfileID
          

          }).countDocuments();
          const totalNumberOfUnseen = await NotificationSchema.find({
            ProfileID:ProfileID,
            Seen:false
            }).countDocuments();
          const notifications = await NotificationSchema.find({
            ProfileID:ProfileID
          

          })
            .sort({createdAt: -1})
            .skip((page - 1) * itemPerPage)
            .limit(itemPerPage);
         
           const results= {
                total:totalItems,
                unSeen:totalNumberOfUnseen,
                notifications
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
 * make notification as seen 
 * 
 * @function
 * @memberof controllers
 * @memberof Notification
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.query.ProfileID - Profile ID of the user
 * @param {number} req.body.NotificationID - number of the page (pagination logic)
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile  
 * 
 * 
 * @returns {Object} - Returns success message
 * @description 
 *     get the notification and make Seen value to true
       
 * 
 */



exports.MakeNotificationSeen = async (req, res) => {
 
  try {

    const {id} =req.id
    const {ProfileID,NotificationID}=req.body
   


    const profile =await Profile.findById(ProfileID)
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Owner.User.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
    // update notification seen status
    const notification =await NotificationSchema.findById(NotificationID)
    if(!notification){
      return errorResMsg(res, 400, req.t("Notification_not_found"));
    }
    if(notification.ProfileID.toString()!=ProfileID.toString()){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
    notification.Seen=true;
    await notification.save()

   

    
       
    return successResMsg(res, 200, {message:req.t("Notification_status_changed")});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};





