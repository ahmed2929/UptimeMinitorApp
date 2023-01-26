/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Symptom
 * 
 */




const {UploadFileToAzureBlob} =require("../../../utils/HelperFunctions")
const Viewer =require("../../../DB/Schema/Viewers")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const Symptom = require("../../../DB/Schema/Symptoms");
const Profile = require("../../../DB/Schema/Profile")



/**
 * create new Symptom
 * 
 * @function
 * @memberof controllers
 * @memberof Symptom
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
 * 
 * 
 * @returns {Object} - Returns created Symptom
 * @description 
 * -  check if the caller is the profile owner or has permission
 * - create new symptom
       
 * 
 */




exports.CreateSymptom = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Type,
        Description,
        Severity,
        StartedIn,
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
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false
      })
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
       
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User.toString()!==id){
        // check if the user has add med permission
        const hasAddMedPermissonToMeds=viewer.CanWriteSymptoms;
  
        if(!hasAddMedPermissonToMeds){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }
      //case the owner dont has write permission
      if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
  
  
      let img
      // store the image to aure
      if(req.files.img&&req.files.img[0]){
         img = await UploadFileToAzureBlob(req.files.img[0])
      }
      // store voice record to auzre
      let voice
      if(req.files.voice&&req.files.voice[0]){
        voice = await UploadFileToAzureBlob(req.files.voice[0])
      }
     
  
      // create new Symtom
      const newSymton = new Symptom({
        img,
        Profile:ProfileID,
        User:id,
        Type,
        Description,
        Severity,
        StartedIn,
        VoiceRecord:voice,
        CreatorProfile:viewerProfile._id
  
      })
      
      await newSymton.save()
    const responseData={
      ...newSymton._doc,
    }
      // return successful response
      return successResMsg(res, 200, {message:req.t("symtom_created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  


    /**
 * getSymptoms
 * 
 * @function
 * @memberof controllers
 * @memberof Symptom
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
 * @returns {Object} - Returns symptoms of that date range
 * @description 
 *    change dose status
     * ********************************
     * logic
        return symptom with a date range and not deleted
     * 
     * 
       
 * 
 */

  
  exports.getSymptoms=async (req, res) => {
  
    
    try {
  
      const {id} =req.id
      const {ProfileID,StartDate,EndDate}=req.query
      console.log(ProfileID)
               /*
      
      check permission 
      
      */
  
      const profile =await Profile.findById(ProfileID)
      if(!profile){
        return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false
      })
  
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner or has a read permissions
        if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
    
      let hasGeneralReadPermissions;
      if(profile.Owner.User.toString()===id){
        hasGeneralReadPermissions=true
      }else{
        hasGeneralReadPermissions=viewer.CanReadSymptoms;
      }
    
      
     
    if(StartDate&&EndDate){
         // case general permission
    if(hasGeneralReadPermissions){
      const symptoms =await Symptom.find({
        Profile:ProfileID,
        StartedIn:{
          $gte:new Date(+StartDate),
          $lte:new Date (+EndDate)
        },
        isDeleted:false
  
      }).populate({
        path:"CreatorProfile EditedBy",
        select:"firstName lastName img",
        populate:{
          path:"Owner.User",
          select:"firstName lastName img"
        }
      })
     
      
      // return successfully response
      return successResMsg(res, 200, {message:req.t("Success"),data:symptoms});
  
    
    }else{
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
  
    }else{
      if(hasGeneralReadPermissions){
        const symptoms =await Symptom.find({
          Profile:ProfileID,
          isDeleted:false
    
        }).populate({
          path:"CreatorProfile EditedBy",
          select:"firstName lastName img",
          populate:{
            path:"Owner.User",
            select:"firstName lastName img"
          }
        })
       
        
        // return successfully response
        return successResMsg(res, 200, {message:req.t("Success"),data:symptoms});
    
      
      }else{
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
    }
   
  
 
     
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  

 /**
 * edit Symptom
 * 
 * @function
 * @memberof controllers
 * @memberof Symptom
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
 * @throws {Error} if the symptoms is deleted 
 * @throws {Error} if the symptom does not exist
 * 
 * @returns {Object} - Returns edited Symptom
 * @description 
 * -  check if the caller is the profile owner or has permission
 * - get the symptom if it is not flagged as deleted 
       
 * 
 */




exports.EditSymptom = async (req, res) => {
 
  try {

    const {id} =req.id
    const {
      ProfileID,
      Type,
      Description,
      Severity,
      StartedIn,
      SymptomID
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
    const profile =await Profile.findById(ProfileID)
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }

    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    })
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }

    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     IsDeleted:false
    })
    if(!viewer&&profile.Owner.User.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
    // check if the user is the owner and has write permission or can add meds

    if(profile.Owner.User.toString()!==id){
      // check if the user has add med permission
      const CanEditSymptom=viewer.CanWriteSymptoms;

      if(!CanEditSymptom){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
      
    }
    //case the owner does not has write permission
    if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
      return errorResMsg(res, 401, req.t("Unauthorized"));
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
   

    // get symptom
    const symptom =await Symptom.findById(SymptomID)
    if(!symptom){
      return errorResMsg(res, 400, req.t("symptom_not_found"));
    }
    // check if the symptom is deleted
    if(symptom.isDeleted){
      return errorResMsg(res, 400, req.t("symptom_is_deleted"));
    }
    // update the symptom

    symptom.img=img||symptom.img
    symptom.EditedBy=viewerProfile._id
    symptom.Type=Type||symptom.Type
    symptom.Description=Description||symptom.Description
    symptom.Severity=Severity||symptom.Severity
    symptom.StartedIn=StartedIn||symptom.StartedIn
    symptom.VoiceRecord=voice||symptom.VoiceRecord
    
    // save the symptom
   await symptom.save()
    
   
  const responseData={
    ...symptom._doc,
  }
    // return successfully response
    return successResMsg(res, 200, {message:req.t("symptom_updated"),data:responseData});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};
 


 /**
 * delete Symptom
 * 
 * @function
 * @memberof controllers
 * @memberof Symptom
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.SymptomID - SymptomID
 * @param {string} req.body.ProfileID - ProfileID
 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission 
 * @throws {Error} if the symptom does not exist
 * 
 * @returns {Object} - Returns success message
 * @description 
 * -  check if the caller is the profile owner or has permission
 * -  flag the symptom as delete
       
 * 
 */




exports.DeleteSymptom = async (req, res) => {
 
  try {

    const {id} =req.id
    const {
      ProfileID,
      SymptomID
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

    // get the viewer permissions
    const viewerProfile =await Profile.findOne({
    "Owner.User":id
    })
    
    if(!viewerProfile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
    }

    const viewer =await Viewer.findOne({
     ViewerProfile:viewerProfile._id,
     DependentProfile:ProfileID,
     IsDeleted:false

    })
    if(!viewer&&profile.Owner.User.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
    // check if the user is the owner and has write permission or can add symptom

    if(profile.Owner.User.toString()!==id){
      // check if the user has add med permission
      const CanDeleteSymptom=viewer.CanWriteSymptoms;

      if(!CanDeleteSymptom){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
      
    }
    //case the owner does not has write permission
    if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }


    // get symptom
    const symptom =await Symptom.findByIdAndUpdate(SymptomID,{
      isDeleted:true
    })
    if(!symptom){
      return errorResMsg(res, 400, req.t("symptom_not_found"));
    }
   
    
   
 
    // return successfully response
    return successResMsg(res, 200, {message:req.t("symptom_deleted")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

