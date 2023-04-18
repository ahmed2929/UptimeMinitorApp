/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Symptom
 * 
 */




const {UploadFileToAzureBlob} =require("../../../utils/HelperFunctions")
const Viewer =require("../../../DB/Schema/Viewers")
const User = require("../../../DB/Schema/User")
const {SendPushNotificationToUserRegardlessLangAndOs,
  BindNickNameWithDependentSymptom,
  GetSymptomForProfileID,
  GetSymptomForProfileIDList,CheckProfilePermissions} =require("../../../utils/HelperFunctions")

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
       IsDeleted:false
      })
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
       
     
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User._id.toString()!==id){
        // check if the user has add med permission
        const CanAddNewSymptom=viewer.CanAddSymptoms;
  
        if(!CanAddNewSymptom){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }

      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanAddSymptom')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      //case the owner don`t has write permission
      // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
      //   return errorResMsg(res, 401, req.t("Unauthorized"));
      // }
  
  
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
     
  
      // create new Symptom
      const newSymptom = new Symptom({
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
      
      await newSymptom.save()
    const responseData={
      ...newSymptom._doc,
    }
    // populated symptom data
    const populateSymptom=await Symptom.findById(newSymptom._id).populate({
      path:"CreatorProfile EditedBy",
      select:"firstName lastName img",
      populate:{
        path:"Owner.User",
        select:"firstName lastName img"
      }
    })
    //deep clone populated symptom
    const populatedSymptomClone=JSON.parse(JSON.stringify(populateSymptom))
    //send notification to his care circle
    const careCircle =await Viewer.find({
      DependentProfile:ProfileID,
      IsDeleted:false,
      CanReadSymptoms:true,
      notify:true,
    'NotificationSettings.NewSymptom':true
    })
    .populate("ViewerProfile")
    for await (const viewer of careCircle) {
      //skip the viewer if his ViewerProfile is the same as viewerProfile
      if(viewer.ViewerProfile._id.toString()===viewerProfile._id.toString()){
        continue
      }
      await SendPushNotificationToUserRegardlessLangAndOs(profile,viewer.ViewerProfile,"NewSymptom",{
        SymptomId:newSymptom._id,
        Symptom:populatedSymptomClone,
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
      await SendPushNotificationToUserRegardlessLangAndOs(viewerProfile,profile,"NewSymptomAddToMe",{
        SymptomId:newSymptom._id,
        Symptom:populatedSymptomClone,
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
      return successResMsg(res, 200, {message:req.t("Symptom_created"),data:responseData});
      
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
 *    return symptom with a date range and not deleted
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
       IsDeleted:false
      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
      // check if the user is the owner or has a read permissions
        // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
    
      let hasGeneralReadPermissions;
      if(profile.Owner.User._id.toString()===id){
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
     
      // add this object exportProfileData={
      //   firstName,
      //   lastName,
        
      // } to every object in symptoms array

      const editedData=symptoms.map(symptom=>{
        return {
          ...symptom._doc,
          exportProfileData:{
            firstName:profile.Owner.User.firstName,
            lastName:profile.Owner.User.lastName,
            img:profile.Owner.User.img,
            email:profile.Owner.User.email,
          }
        }
      })
      
      // return successfully response
      return successResMsg(res, 200, {message:req.t("Success"),data:editedData});
  
    
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
       
        const editedData=symptoms.map(symptom=>{
          return {
            ...symptom._doc,
            exportProfileData:{
              firstName:profile.Owner.User.firstName,
              lastName:profile.Owner.User.lastName,
              img:profile.Owner.User.img,
              email:profile.Owner.User.email,
            }
          }
        })
        // return successfully response
        return successResMsg(res, 200, {message:req.t("Success"),data:editedData});
    
      
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
 console.log("edit symptom")
  try {

    const {id} =req.id
    const {
      ProfileID,
      Type,
      Description,
      Severity,
      StartedIn,
      SymptomID,
      KeepOldImg,
      KeepOldVoice
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
     IsDeleted:false
    })
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
    // check if the user is the owner and has write permission or can add meds

    if(profile.Owner.User._id.toString()!==id){
      // check if the user has add med permission
      const CanEditSymptom=viewer.CanEditSymptoms;

      if(!CanEditSymptom){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
      
    }
    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanEditSymptom')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }
    //case the owner does not has write permission
    // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
    //   return errorResMsg(res, 401, req.t("Unauthorized"));
    // }


    let img=null
    // store the image to azure
    if(req.files.img&&req.files.img[0]){
       img = await UploadFileToAzureBlob(req.files.img[0])
    }
    // store voice record to azure
    let voice=null
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
console.log("will update")
    symptom.img=KeepOldImg==='true'?symptom.img:img
    symptom.EditedBy=viewerProfile._id
    symptom.Type=Type||symptom.Type
    symptom.Description=Description||symptom.Description
    symptom.Severity=Severity||symptom.Severity
    symptom.StartedIn=StartedIn||symptom.StartedIn
    symptom.VoiceRecord=KeepOldVoice==='true'?symptom.VoiceRecord:voice
    
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
     IsDeleted:false

    })
    if(!viewer&&profile.Owner.User._id.toString()!==id){
      return errorResMsg(res, 400, req.t("Unauthorized"));
    }
     
    // check if the user is the owner and has write permission or can add symptom

    if(profile.Owner.User._id.toString()!==id){
      // check if the user has add med permission
      const CanDeleteSymptom=viewer.CanDeleteSymptoms;

      if(!CanDeleteSymptom){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
      
    }
    if(profile.Owner.User._id.toString() === id){
      if(!CheckProfilePermissions(profile,'CanDeleteSymptom')){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
    }
    //case the owner does not has write permission
    // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
    //   return errorResMsg(res, 401, req.t("Unauthorized"));
    // }


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

exports.getAllSymptoms=async (req, res) => {
  /**
   * get my doses and my dependents doses
   * 
   * 
   */
  /** 
   * return doses with a spacic date
   * if no date is provided the default is today
   * returns not suspended dosages
   * 
   */
  try {

    const {id} =req.id
    let {
    date,
    ProfileID,
    EndDate
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
    if(!date){
      date=new Date()
    }
    const queryDate =new Date(+date)
    let nextDay
    if(!EndDate){
      nextDay=new Date(+date)
      nextDay= new Date(nextDay.setDate(nextDay.getDate()+1))
      }else{
      nextDay=EndDate
    }

    const MyDependents =await Viewer.find({
      ViewerProfile:viewerProfile._id,
      IsDeleted:false
    })
    const NickNameHashTable={}
    MyDependents.forEach(element => {
      NickNameHashTable[`${element.DependentProfile}`]=element.DependentProfileNickName
    });
    const dependentsProfiles =MyDependents.filter(elem=>{
      return elem.CanReadSymptoms;
    })
    const dependentsProfilesIDs =dependentsProfiles.map(elem=>{

      return elem.DependentProfile
    })

   
   
    // get caller doses
    const MySymptoms =await GetSymptomForProfileID(ProfileID,queryDate,nextDay)
    // get Dependents Doses that has a general read perm
    console.log(dependentsProfilesIDs)
    //const DependentsSymptoms =await GetSymptomForProfileIDList(dependentsProfilesIDs,queryDate,nextDay) 
    const DependentsSymptoms=await GetSymptomForProfileIDList(dependentsProfilesIDs,queryDate,nextDay)

    for await (UserData of DependentsSymptoms){
      const userInfo =await User.findById(UserData.owner.id)
      UserData.owner.firstName=userInfo.firstName
      UserData.owner.lastName=userInfo.lastName
      UserData.owner.email=userInfo.email
      UserData.owner.img=userInfo.img


     
   }
    // bind nickname with dependent

    const BindNickNameWithDependentList =await BindNickNameWithDependentSymptom(DependentsSymptoms,NickNameHashTable) 

  
   

      const finalResult={
        CallerSymptoms:MySymptoms,
        DependentsSymptoms:BindNickNameWithDependentList
      }



  return successResMsg(res, 200, {message:req.t("Success"),data:finalResult});

   
    
  
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};