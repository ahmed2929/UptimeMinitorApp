
/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Measurement
 * 
 */

const Viewer =require("../../../DB/Schema/Viewers")
const {SendPushNotificationToUserRegardlessLangAndOs,
CheckProfilePermissions,GetBloodGlucoseMeasurementForProfileID,
GetBloodGlucoseForProfileIDList,BindNickNameWithDependentSymptom,UploadFileToAzureBlob,BindNickNameWithDependentMeasurement} =require("../../../utils/HelperFunctions")
const {CreateNewMeasurementScheduler,CreateMeasurementsOccurrences} =require("../../../utils/ControllerHelpers")


const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const BloodGlucose = require("../../../DB/Schema/BloodGlucoseManualMeasurement");
const MeasurementScheduler=require("../../../DB/Schema/MeasurementScheduler")
const Profile = require("../../../DB/Schema/Profile")



/**
 * create new BloodGlucose
 * 
 * @function
 * @memberof controllers
 * @memberof Measurement
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.glucoseLevel - 
 * @param {string} req.body.MeasurementDateTime 
 * @param {string} req.body.MeasurementUnit - 
 * @param {string} req.body.MeasurementNote -  
 * @param {string} req.body.ProfileID - ProfileID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * @returns {Object} - Returns created Symptom
 * @description 
 * -  check if the caller is the profile owner or has permission
 * - create new BloodGlucose
       
 * 
 */




exports.BloodGlucoseMeasurement = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        glucoseLevel,
        MeasurementDateTime,
        MeasurementUnit,
        MeasurementNote,
        Status,
        Fasting

       
      }=req.body
      /*
      
      check permission will only allow if the id is the Owner id 
      and has a write permission Or
       in Viewers array and has write permission ?
      
      */
      /*
      
      check permission will only allow if the id is the Owner id 
      and has a addMed permission
      
      */
      const profile =await Profile.findById(ProfileID).populate("Owner.User")
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      }).populate("Owner.User")
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(viewerProfile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       CanAddBloodGlucoseMeasurement:true,
       IsDeleted:false
      })
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
       
   

      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanManageMeasurement')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      // upload voice if exists
      let voice
      if(req.files.voice&&req.files.voice[0]){
        voice = await UploadFileToAzureBlob(req.files.voice[0])
      }
     
 
  
      // create new BloodGlucoseMeasurement
      const newBloodGlucoseMeasurement = new BloodGlucose({
        ProfileID,
        glucoseLevel,
        MeasurementDateTime,
        MeasurementUnit,
        MeasurementNote,
        CreatorProfile:viewerProfile._id,
        Status:Status,
        PlannedDateTime:MeasurementDateTime,
        VoiceRecord:voice,
        Fasting:Fasting
  
      })
      
      await newBloodGlucoseMeasurement.save()

    // populated BloodGlucose data
    const PopulatedBloodGlucoseMeasurement=await BloodGlucose.findById(newBloodGlucoseMeasurement._id).populate({
      path:"ProfileID",
      select:"firstName lastName img",
      populate:{
        path:"Owner.User",
        select:"firstName lastName img"
      }
    })
    //deep clone populated BloodGlucose
    const populatedPopulatedBloodGlucoseMeasurementClone=JSON.parse(JSON.stringify(PopulatedBloodGlucoseMeasurement))
    //send notification to his care circle
    const careCircle =await Viewer.find({
      DependentProfile:ProfileID,
      IsDeleted:false,
      CanReadBloodGlucoseMeasurement:true,
      notify:true,
      'NotificationSettings.NewBloodGlucoseReading':true
    })
    .populate("ViewerProfile")
    for await (const viewer of careCircle) {
      //skip the viewer if his ViewerProfile is the same as viewerProfile
      if(viewer.ViewerProfile._id.toString()===viewerProfile._id.toString()){
        continue
      }
      await SendPushNotificationToUserRegardlessLangAndOs(profile,viewer.ViewerProfile,"BloodGlucoseMeasurement",{
        BloodGlucoseMeasurement:populatedPopulatedBloodGlucoseMeasurementClone,
        ProfileInfoOfSender:{
          firstName:profile.Owner.User.firstName,
          lastName:profile.Owner.User.lastName,
          img:profile.Owner.User.img,
          email:profile.Owner.User.email,
          ProfileID:profile._id,
          DependentProfileNickName:viewer.DependentProfileNickName
        }
      })
    }
    // notify profile dependent if the profile.Owner.User._id is not as id
    if(profile.Owner.User._id.toString() !== id){
      await SendPushNotificationToUserRegardlessLangAndOs(viewerProfile,profile,"BloodGlucoseMeasurementAddToMe",{
        BloodGlucoseMeasurement:populatedPopulatedBloodGlucoseMeasurementClone,
        ProfileInfoOfSender:{
          firstName:viewerProfile.Owner.User.firstName,
          lastName:viewerProfile.Owner.User.lastName,
          img:viewerProfile.Owner.User.img,
          email:viewerProfile.Owner.User.email,
          ProfileID:viewerProfile._id,
       

        }
      })
    }

      // return successful response
      return successResMsg(res, 200, {message:req.t("Measurement_created"),data:populatedPopulatedBloodGlucoseMeasurementClone});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
 
 
    /**
 * BloodGlucoseMeasurement
 * 
 * @function
 * @memberof controllers
 * @memberof Measurement
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.ProfileID - Profile ID of the user
 * @param {string} req.body.StartDate - start date
 * @param {string} req.body.EndDate -EndDate date 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * 
 * 
 * @returns {Object} - Returns BloodGlucoses of that date range
 * @description 
 *    return BloodGlucose with a date range and not deleted
     * ********************************
     * logic
     return BloodGlucose with a date range and not deleted
     * 
     * 
       
 * 
 */

  
  exports.getBloodGlucoseMeasurement=async (req, res) => {
  
    
    try {
  
      const {id} =req.id
      const {ProfileID,StartDate,EndDate,Status}=req.query
      console.log(ProfileID)
               /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID).populate("Owner.User")
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(profile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
      if(viewerProfile.Deleted){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
    
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false,
       CanReadBloodGlucoseMeasurement:true
      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner or has a read permissions
        // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
    
      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanReadMeasurement')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      
     
    if(StartDate&&EndDate){
        
      const BloodGlucoseArray =await BloodGlucose.find({
        ProfileID:ProfileID,
        PlannedDateTime:{
          $gte:new Date(+StartDate),
          $lte:new Date (+EndDate)
        },
        Status:Status||{$exists:true},
        isDeleted:false
  
      }).populate({
        path:"ProfileID",
        select:"firstName lastName img",
        populate:{
          path:"Owner.User",
          select:"firstName lastName img"
        }
      })
     
     

      
      // return successfully response
      return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
  
    
   
  
    }else{
        const BloodGlucoseArray =await BloodGlucose.find({
          ProfileID:ProfileID,
          isDeleted:false,
          Status:Status||{$exists:true},
    
        }).populate({
          path:"ProfileID",
          select:"firstName lastName img",
          populate:{
            path:"Owner.User",
            select:"firstName lastName img"
          }
        })
       
       
        // return successfully response
        return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
    
      
     
    }
   
  
 
     
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  

 /**
 * edit BloodGlucoseMeasurement
 * 
 * @function
 * @memberof controllers
 * @memberof Measurement
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.Type - Type
 * @param {string} req.body.Description - Description
 * @param {string} req.body.StartedIn - start date in ms
 * @param {string} req.body.Severity -  // 0 mild ,1 moderate, 2 severe
 * @param {string} req.file.img - img
 * @param {string} req.file.voice - voice
 * @param {string} req.body.ProfileID - ProfileID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * @throws {Error} if the BloodGlucoses is deleted 
 * @throws {Error} if the BloodGlucose does not exist
 * 
 * @returns {Object} - Returns edited Symptom
 * @description 
 * -  check if the caller is the profile owner or has permission
 * - get the BloodGlucose if it is not flagged as deleted 
       
 * 
 */




exports.EditBloodGlucoseMeasurement= async (req, res) => {
  try {

    const {id} =req.id
    const {
      ProfileID,
      glucoseLevel,
      MeasurementDateTime,
      MeasurementUnit,
      MeasurementNote,
      BloodGlucoseMeasurementID,
      KeepOldVoice,
      Status,
      Fasting
    }=req.body

    const profile =await Profile.findById(ProfileID).populate("Owner.User")
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    })
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     IsDeleted:false,
     CanEditBloodGlucoseMeasurement:true
    })
   
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
    


    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanManageMeasurement')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }
 


    // get the BloodGlucoseMeasurement

    
    const BloodGlucoseMeasurement =await BloodGlucose.findById(BloodGlucoseMeasurementID)
    if(!BloodGlucoseMeasurement){
      return errorResMsg(res, 400, req.t("Measurement_not_found"));
    }
    // check if  deleted
    if(BloodGlucoseMeasurement.isDeleted){
      return errorResMsg(res, 400, req.t("Measurement_is_deleted"));
    }

    // store voice record to azure
    let voice
    if(req.files.voice&&req.files.voice[0]){
      voice = await UploadFileToAzureBlob(req.files.voice[0])
    }
   

    // update the BloodGlucose
console.log("will update")
    BloodGlucoseMeasurement.glucoseLevel=glucoseLevel
    BloodGlucoseMeasurement.MeasurementDateTime=MeasurementDateTime
    BloodGlucoseMeasurement.MeasurementUnit=MeasurementUnit
    BloodGlucoseMeasurement.MeasurementNote=MeasurementNote
    BloodGlucoseMeasurement.EditedBy=viewerProfile._id
    BloodGlucoseMeasurement.Status=Status
    BloodGlucoseMeasurement.PlannedDateTime=MeasurementDateTime
    BloodGlucoseMeasurement.VoiceRecord=KeepOldVoice==='true'?BloodGlucoseMeasurement.VoiceRecord:voice
    BloodGlucoseMeasurement.Fasting=Fasting

    
    await BloodGlucoseMeasurement.save()
    const PopulatedBloodGlucoseMeasurement=await BloodGlucose.findById(BloodGlucoseMeasurement._id).populate({
      path:"ProfileID",
      select:"firstName lastName img",
      populate:{
        path:"Owner.User",
        select:"firstName lastName img"
      }
    })
   //deep clone populated BloodGlucose
   const populatedPopulatedBloodGlucoseMeasurementClone=JSON.parse(JSON.stringify(PopulatedBloodGlucoseMeasurement))
   //send notification to his care circle
   const careCircle =await Viewer.find({
     DependentProfile:ProfileID,
     IsDeleted:false,
     CanReadBloodGlucoseMeasurement:true,
     notify:true,
     'NotificationSettings.NewBloodGlucoseReading':true
   })
   .populate("ViewerProfile")
   for await (const viewer of careCircle) {
     //skip the viewer if his ViewerProfile is the same as viewerProfile
     if(viewer.ViewerProfile._id.toString()===viewerProfile._id.toString()){
       continue
     }
     await SendPushNotificationToUserRegardlessLangAndOs(profile,viewer.ViewerProfile,"BloodGlucoseMeasurement",{
       BloodGlucoseMeasurement:populatedPopulatedBloodGlucoseMeasurementClone,
       ProfileInfoOfSender:{
         firstName:profile.Owner.User.firstName,
         lastName:profile.Owner.User.lastName,
         img:profile.Owner.User.img,
         email:profile.Owner.User.email,
         ProfileID:profile._id,
         DependentProfileNickName:viewer.DependentProfileNickName

       }
     })
   }
   // notify profile dependent if the profile.Owner.User._id is not as id
   if(profile.Owner.User._id.toString() !== id){
     await SendPushNotificationToUserRegardlessLangAndOs(viewerProfile,profile,"BloodGlucoseMeasurementAddToMe",{
       BloodGlucoseMeasurement:populatedPopulatedBloodGlucoseMeasurementClone,
       ProfileInfoOfSender:{
         firstName:viewerProfile.Owner.User.firstName,
         lastName:viewerProfile.Owner.User.lastName,
         img:viewerProfile.Owner.User.img,
         email:viewerProfile.Owner.User.email,
         ProfileID:viewerProfile._id,
         

       }
     })
   }

   
  const responseData={
    ...PopulatedBloodGlucoseMeasurement._doc,
  }
    // return successfully response
    return successResMsg(res, 200, {message:req.t("Measurement_updated"),data:responseData});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};
 


 /**
 * delete Measurement
 * 
 * @function
 * @memberof controllers
 * @memberof Measurement
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.BloodGlucoseMeasurementID - BloodGlucoseMeasurementID
 * @param {string} req.body.ProfileID - ProfileID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * @throws {Error} if the BloodGlucose does not exist
 * 
 * @returns {Object} - Returns success message
 * @description 
 * -  check if the caller is the profile owner or has permission
 * -  flag the BloodGlucose as delete
       
 * 
 */




exports.DeleteBloodGlucoseMeasurement = async (req, res) => {
 
  try {

    const {id} =req.id
    const {
      ProfileID,
      BloodGlucoseMeasurementID
    }=req.body
    /*
    
    check permission will only allow if the id is the Owner id 
    and has a write permission Or
     in Viewers array and has write permission ?
    
    */
    /*
    
    
    */
    const profile =await Profile.findById(ProfileID)
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    })
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     CanDeleteBloodGlucoseMeasurement:true,
     IsDeleted:false

    })
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
    // check if the user is the owner and has write permission or can add BloodGlucose

    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanManageMeasurement')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }
  

    // get BloodGlucose
    const BloodGlucoseMeasurement =await BloodGlucose.findByIdAndUpdate(BloodGlucoseMeasurementID,{
      isDeleted:true
    })
    if(!BloodGlucoseMeasurement){
      return errorResMsg(res, 400, req.t("BloodGlucose_not_found"));
    }
   
    
   
 
    // return successfully response
    return successResMsg(res, 200, {message:req.t("BloodGlucoseMeasurement_deleted")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

/**
 * getAllBloodGlucoseMeasurement
 * 
 * @function
 * @memberof controllers
 * @memberof Measurement
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.StartDate - StartDate
 * @param {string} req.body.EndDate - EndDate
 *  @param {string} req.body.Status - Status
 * 
 * @param {string} req.body.ProfileID - ProfileID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * @throws {Error} if the BloodGlucose does not exist
 * 
 * @returns {Object} - Returns success message
 * @description 
 * -  check if the caller is the profile owner or has permission
 * -  flag the BloodGlucose as delete
       
 * 
 */


exports.getAllBloodGlucoseMeasurement=async (req, res) => {
  try {

    const {id} =req.id
    let {
    StartDate,
    ProfileID,
    EndDate,
    Status
    }=req.query
   
             /*
    
    check permission 
    
    */

    const profile =await Profile.findById(ProfileID)
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    })
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    
    if(profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
   
    
    // get Occurrences which equal today
    if(!StartDate){
      StartDate=new Date()
    }
    const queryDate =new Date(+StartDate)
    let nextDay
    if(!EndDate){
      nextDay=new Date(+StartDate)
      nextDay= new Date(nextDay.setDate(nextDay.getDate()+1))
      }else{
      nextDay=EndDate
    }

    const MyDependents =await Viewer.find({
      ViewerProfile:viewerProfile._id,
      IsDeleted:false,
      CanReadBloodGlucoseMeasurement:true
    })
    const NickNameHashTable={}
    MyDependents.forEach(element => {
      NickNameHashTable[`${element.DependentProfile}`]=element.DependentProfileNickName
    });
    const dependentsProfiles =MyDependents.filter(elem=>{
      return elem.CanReadBloodGlucoseMeasurement;
    })
    const dependentsProfilesIDs =dependentsProfiles.map(elem=>{

      return elem.DependentProfile
    })

   

    // get caller doses
    const MyBloodGlucoseMeasurement=await GetBloodGlucoseMeasurementForProfileID(ProfileID,queryDate,nextDay,Status)
    // get Dependents Doses that has a general read perm
    console.log(dependentsProfilesIDs)
    //const DependentsSymptoms =await GetSymptomForProfileIDList(dependentsProfilesIDs,queryDate,nextDay) 
    const DependentsBloodGlucoseMeasurement=await GetBloodGlucoseForProfileIDList(dependentsProfilesIDs,queryDate,nextDay,Status)

    // bind nickname with dependent

    const BindNickNameWithDependentList =await BindNickNameWithDependentMeasurement(DependentsBloodGlucoseMeasurement,NickNameHashTable) 

  
   

      const finalResult={
        CallerBloodGlucoseMeasurement:MyBloodGlucoseMeasurement,
        DependentsBloodGlucoseMeasurement:BindNickNameWithDependentList
      }



  return successResMsg(res, 200, {message:req.t("Success"),data:finalResult});

   
    
  
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};


/**
 * Creates a new blood glucose measurement scheduler.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise representing the completion of this operation.
 * @description 
 * create new scheduler for BloodGlucose reading reminder
 */

exports.CreateNewBloodGlucoseMeasurementScheduler = async (req, res) => {
 
  try {

    const {id} =req.id
    const {
    ProfileID,
    Scheduler,
    }=req.body
    

   
  
    const profile =await Profile.findById(ProfileID).populate("Owner.User")
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    }).populate("Owner.User")
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     CanAddBloodGlucoseMeasurement:true,
     IsDeleted:false
    })
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
 

    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanManageMeasurement')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }

   

  
    // create Scheduler 
    //deep clone to Scheduler object


    
    let jsonScheduler=JSON.parse(JSON.stringify(Scheduler))
   // check if no end date is provided then make GenerateAutoOccurrence to true
    if(!jsonScheduler.EndDate){
      jsonScheduler.GenerateAutoOccurrence=true
    }
    jsonScheduler.MeasurementType=0
   // validate Scheduler 
   const ValidateScheduler= await CreateNewMeasurementScheduler(jsonScheduler,ProfileID,viewerProfile,req,res)

    console.log("ValidateScheduler **************",ValidateScheduler)
    console.log("jsonScheduler **************",ValidateScheduler)
    // create Occurrences
  const newScheduler= await CreateMeasurementsOccurrences(jsonScheduler,ValidateScheduler,ProfileID,viewerProfile,req,res)


    await newScheduler.save()
   

  

   const responseData={
      scheduler:newScheduler
   }
    // return successful response
    return successResMsg(res, 200, {message:req.t("measurement_scheduler_created"),data:responseData});
    
  } catch (err) {
    // return error response
    console.log("error is ",err)
    return errorResMsg(res, 500, err);
  }
};

/**
 * Edits a blood glucose measurement scheduler.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise representing the completion of this operation.
 */
exports.EditBloodGlucoseMeasurementScheduler=async (req, res) => {
  
 
  try {

    const {id} =req.id
    let {
      MeasurementSchedulerID,
      Scheduler,
      ProfileID,
    }=req.body


    const profile =await Profile.findById(ProfileID).populate("Owner.User")
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    }).populate("Owner.User")
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     CanEditBloodGlucoseMeasurement:true,
     IsDeleted:false
    })
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
 

    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanManageMeasurement')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }

    if(!MeasurementSchedulerID){
      return errorResMsg(res, 400, req.t("MeasurementSchedulerID_required"));
    }
    const OldMeasurementScheduler =await MeasurementScheduler.findById(MeasurementSchedulerID)
  
      // check if the Scheduler sent with the request is the same as the one in the database

    if(!OldMeasurementScheduler){
      return errorResMsg(res, 404, req.t("Scheduler_not_found"));
    }
    if(OldMeasurementScheduler.isDeleted){
      return errorResMsg(res, 404, req.t("Scheduler_not_found"));
    }

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    // delete all the future Occurrences including today if its not 2 or 4
   const deleted= await BloodGlucose.deleteMany({
    MeasurementScheduler:OldMeasurementScheduler._id.toString(),
    PlannedDateTime:{$gte:endOfYesterday},
    Status: { $in: [0, 1, 3, 5] },
    })
   console.log("deleted",deleted) 
  //make the Scheduler as archived 
  const archived=await MeasurementScheduler.findByIdAndUpdate(MeasurementSchedulerID,{
    isDeleted:true
  },{new:true})
    
  
  //generate new Scheduler

  // create Scheduler 
    //deep clone to Scheduler object


    
    let jsonScheduler=JSON.parse(JSON.stringify(Scheduler))
   // check if no end date is provided then make GenerateAutoOccurrence to true
    if(!jsonScheduler.EndDate){
      jsonScheduler.GenerateAutoOccurrence=true
    }
    jsonScheduler.MeasurementType=0
   // validate Scheduler 
   const ValidateScheduler= await CreateNewMeasurementScheduler(jsonScheduler,ProfileID,viewerProfile,req,res)

    console.log("ValidateScheduler **************",ValidateScheduler)
    console.log("jsonScheduler **************",ValidateScheduler)
    // create Occurrences
  const newScheduler= await CreateMeasurementsOccurrences(jsonScheduler,ValidateScheduler,ProfileID,viewerProfile,req,res,true)

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const Measurements=await BloodGlucose.find({
    MeasurementScheduler:OldMeasurementScheduler._id.toString(),
    PlannedDateTime:{$gte:endOfYesterday,$lte:endOfToday},
    Status: { $in: [2,4] }

  })
   for await(const Measurement of Measurements){
    await BloodGlucose.deleteMany({
      MeasurementScheduler:newScheduler._id.toString(),
      PlannedDateTime:Measurement.PlannedDateTime,
      Status: { $in: [0, 1, 3, 5] }
    })

  }
    await OldMeasurementScheduler.save()

    await newScheduler.save()
   

  

   const responseData={
      scheduler:newScheduler
   }
    // return successful response
    return successResMsg(res, 200, {message:req.t("measurement_scheduler_created"),data:responseData});
   
  

 



    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};


/**
 * Deletes a glucose measurement scheduler.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise representing the completion of this operation.
 */
exports.DeleteGlucoseMeasurementScheduler=async (req, res) => {
  
 
  try {

    const {id} =req.id
    let {
      MeasurementSchedulerID,
      ProfileID,
    }=req.body


    const profile =await Profile.findById(ProfileID).populate("Owner.User")
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    }).populate("Owner.User")
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     CanDeleteBloodGlucoseMeasurement:true,
     IsDeleted:false
    })
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
 

    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanManageMeasurement')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }

    if(!MeasurementSchedulerID){
      return errorResMsg(res, 400, req.t("MeasurementSchedulerID_required"));
    }
    const OldMeasurementScheduler =await MeasurementScheduler.findById(MeasurementSchedulerID)
  
      // check if the Scheduler sent with the request is the same as the one in the database

    if(!OldMeasurementScheduler){
      return errorResMsg(res, 404, req.t("Scheduler_not_found"));
    }
    if(OldMeasurementScheduler.isDeleted){
      return errorResMsg(res, 404, req.t("Scheduler_not_found"));
    }

    const endOfYesterday = new Date();
    endOfYesterday.setDate(endOfYesterday.getDate() - 1);
    endOfYesterday.setHours(23, 59, 59, 999);

    // delete all the future Occurrences including today if its not 2 or 4
   const deleted= await BloodGlucose.deleteMany({
    MeasurementScheduler:OldMeasurementScheduler._id.toString(),
    Status:  { $in: [0, 1, 3, 5] },
    
    })
   console.log("deleted",deleted) 
  //make the Scheduler as archived 
  const archived=await MeasurementScheduler.findByIdAndUpdate(MeasurementSchedulerID,{
    isDeleted:true
  },{new:true})
    
  
    

   

  

    // return successful response
    return successResMsg(res, 200, {message:req.t("measurement_scheduler_deleted")});
   
  

 



    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};


/**
 * get glucose measurement scheduler.
 * @function
 * @async
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @returns {Promise<void>} - Promise representing the completion of this operation.
 */

exports.getBloodGlucoseMeasurementScheduler=async (req, res) => {
  
    
  try {

    const {id} =req.id
    const {ProfileID}=req.query
             /*
    
    check permission 
    
    */

    const profile =await Profile.findById(ProfileID).populate("Owner.User")
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(profile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    })
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
    if(viewerProfile.Deleted){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }
  
    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     IsDeleted:false,
     CanReadBloodGlucoseMeasurement:true
    })

    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }

    // check if the user is the owner or has a read permissions
      // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
      //   return errorResMsg(res, 401, req.t("Unauthorized"));
      // }
  
    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanReadMeasurement')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }

    
 
      const BloodGlucoseArray =await MeasurementScheduler.find({
        ProfileID:ProfileID,
        isDeleted:false,
        MeasurementType:0
  
      }).populate({
        path:"ProfileID",
        select:"firstName lastName img",
        populate:{
          path:"Owner.User",
          select:"firstName lastName img"
        }
      })
     
     
      // return successfully response
      return successResMsg(res, 200, {message:req.t("Success"),data:BloodGlucoseArray});
  
    
   
  
 


   
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};