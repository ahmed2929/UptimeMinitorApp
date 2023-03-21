/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Medication
 * 
 */


const SchedulerSchema = require("../../../DB/Schema/Scheduler");
const UserMedication = require("../../../DB/Schema/UserMedication");
const {UploadFileToAzureBlob,GenerateOccurrences,GenerateOccurrencesWithDays,CheckRelationShipBetweenCareGiverAndDependent,CompareOldSchedulerWithTheNewScheduler,CheckProfilePermissions} =require("../../../utils/HelperFunctions")
const Occurrence = require("../../../DB/Schema/Occurrences");
const Viewer =require("../../../DB/Schema/Viewers")
const mongoose = require("mongoose");
const Profile =require("../../../DB/Schema/Profile")
const {CreateNewScheduler,CreateOccurrences,getMedInfoFromFhirPrescription,getDoseInfoFromFhirPrescription} =require("../../../utils/ControllerHelpers")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");



/**
 * Creates a new medication
 * 
 * @function
 * @memberof controllers
 * @memberof Medication
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.name - med name
 * @param {string} req.body.type - med type
 * @param {string} req.body.strength - med strength
 * @param {string} req.body.unit - med unit
 * @param {string} req.body.quantity - med quantity
 * @param {string} req.body.instructions - instructions
 * @param {string} req.body.condition - condition
 * @param {string} req.file.img - img
 * @param {string} req.body.ProfileID - ProfileID
 * @param {Object} req.body.externalInfo - externalInfo is an object which contains the med information which is returned form search api{
 * 
 * "DrugCode":"H21-5135-05410-01",
    etc...
 * 
 * }
 * @param {Object} req.body.Scheduler - the med scheduler object 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * @returns {Object} - Returns created med
 * @description 
 *     * -1 user access this api to create a new med
    *  * -2 check if the user has a profile
    * user token and ProfileID are required:
-the ProfileID is the ProfileID of the person you want to query about him and if you are Authorization will return the data .

-this api is used to create  a new med and its schdule
-med schudle is under 4 senarios 
-SchduleType takes the fowllowing values
-{1:asNeeded,2:everyDay,3:daysInterval,         0:withSapacicDays}
-Note: DateTime is the dose date and time in ms format
example of schdule values
1- occure evry day
{
  "StartDate": 1671636600000,
  "EndDate": 1671985800000,
  "AsNeeded": false,
  "ScheduleType":2,
  "DaysInterval": null,
  "DpacifcDays": null,
  
    "dosage": [
      {
        "dose": 2,
        "DateTime": 1671636600000
      },
       {
        "dose": 1,
        "DateTime": 1671640200000
      }
    ]
  
}
2-  with days intervals
{
  "StartDate": 1671698510816,
  "EndDate": 1671985800000,
  "AsNeeded": false,
  "ScheduleType":3,
  "DaysInterval": 2,
  "DpacifcDays": null,
  
    "dosage": [
      {
        "dose": 5,
        "DateTime": 1671636600000
      },
       {
        "dose": 4,
        "DateTime": 1671640200000
      }
    ]
  
}
3-happens in a spacific days

{
  "StartDate": 1674383236586,
  "EndDate": 1675202400000,
  "AsNeeded": false,
  "ScheduleType": "0",
  "DaysInterval": null,
  "SpecificDays": [
    "Thursday",
    "Friday",
    "Saturday"
  ],
  
  "dosage": [
    {
      "dose": 2,
      "DateTime": 1675240200000
    },
    {
      "dose": 1,
      "DateTime": 1675240200000
    }
  ]
}

4- as needed
{
  "StartDate": 1671695330693,
  "EndDate": null,
  "AsNeeded": true,
  "ScheduleType": "1",
  "DaysInterval": null,
  "dosage": [
    {
      "dose": 2,
      "DateTime": null
    }
   
  ]
}

-externalInfo is an object which contains the med information which is returned form search api
    {
    "DrugCode":"H21-5135-05410-01",
    etc...
    
    }

   // create Occurrences
      *
       *  -date and time are represinted in ms format
       *  -med take time is extracted from startDate ms 
       * -start date must be provided , the api consumer must provide startdate with the choosen time
       * -if then no endDate then the default is date.now()+3 monthes
       * -the default pattern is every day with occurrence pattern 1 means everyday (case 1)
       * -if the user proviced occurrence pattern n(2,3,4 ...etc) means the generated occurrences evry n days (case 2)
       * -case 3 when user choose spacifc days to run the interval
       * - for case 1 and 2 run GenerateOccurrences function wich takes (userID,medId,SchedulerId,occurrencePattern,startDate,endDate,OccurrencesData) as
       * parametars and returns array of objects wich reprisints occurrence valid object
       * - then write the ocuurences in the database
       * 
       * 
       
       
 * 
 */

exports.CreateNewMed = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        name,
        strength,
        description,
        unit,
        quantity,
        instructions,
        condition,
        externalInfo,
        Scheduler,
        type,
        ProfileID,
        Refillable,
        RefileLevel,
        Ringtone
      }=req.body
      

      console.log("requestBody **************",req.body)
      console.log("requestBody.Scheduler **************",req.body.Scheduler)
      console.log("requestFiles **************",req.file)

       /*
      
      check permission will only allow if the id is the Owner id 
      and has a addMed permission
      
      */
    
      const authorized =await CheckRelationShipBetweenCareGiverAndDependent(ProfileID,id)
      if(!authorized){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      const [viewer,profile,viewerProfile]=authorized


       // check if the user is the owner and has write permission or can add meds
   
       if(profile.Owner.User._id.toString()!==id){
         // check if the user has add med permission
         const hasAddMedPermissonToMeds=viewer.CanAddMeds;
   
         if(!hasAddMedPermissonToMeds){
           return errorResMsg(res, 401, req.t("Unauthorized"));
         }
         
       }

       if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanAddMeds')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

       //case the owner does not has write permission
      //  if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
      //    return errorResMsg(res, 401, req.t("Unauthorized"));
      //  }
   
     
      let img
      // store the image to azure
      if(req.file){
         img = await UploadFileToAzureBlob(req.file)
      }
      
     
  
      // create new med
      const newMed = new UserMedication({
        img,
        user:mongoose.Types.ObjectId(id),
        name,
        strength,
        description,
        unit,
        quantity,
        instructions,
        condition,
        externalInfo:JSON.parse(externalInfo||null),
        type,
        ProfileID,
        CreatorProfile:viewerProfile._id,
        Refile:{
          Refillable,
          RefileLevel
        },
        Ringtone
        
      })
    
      
      // generate medIfo snapshot
      const MedInfo={
        img,
        strength,
        unit,
        instructions,
        condition,
        type,
        name,
        ProfileID,
        CreatorProfile:viewerProfile._id,
        SchedulerType:JSON.parse(Scheduler).ScheduleType,
        
      }
      // create Scheduler 
      let jsonScheduler=JSON.parse(Scheduler)
     // check if no end date is provided then make GenerateAutoOccurrence to true
      if(!jsonScheduler.EndDate&&jsonScheduler.ScheduleType!="1"){
        jsonScheduler.GenerateAutoOccurrence=true
      }
     // validate Scheduler 
     const ValidateScheduler= await CreateNewScheduler(jsonScheduler,newMed,id,ProfileID,viewerProfile,req,res)

      console.log("ValidateScheduler **************",ValidateScheduler)
      console.log("jsonScheduler **************",ValidateScheduler)
      // create Occurrences
    const newScheduler= await CreateOccurrences(jsonScheduler,ValidateScheduler,id,newMed,MedInfo,ProfileID,viewerProfile,req,res)
     
  
      // save med and Scheduler
  
      newMed.Scheduler=newScheduler._id
      await newScheduler.save()
      await newMed.save()
  
       // give the med creator full access for that med
       // if the med creator is the parent make Refile and doses true
       if(profile.Owner.User==id){
        if(viewer){
          viewer.CanReadSpacificMeds.push({
            Med:newMed._id,
            Refile:true,
            Doses:true
           })
        }
        
       }else{
        if(viewer){
          viewer.CanReadSpacificMeds.push({
            Med:newMed._id
           })
           await viewer.save()
        }
        
       }
     
      
    
    
  
      const editedMed={
        //deep clone newMed object
        ...JSON.parse(JSON.stringify(newMed)),
        Scheduler:JSON.parse(JSON.stringify(newScheduler))
      }
  
     const responseData={
        med:editedMed,
        scheduler:newScheduler


  
     }
      // return successful response
      return successResMsg(res, 200, {message:req.t("med_created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log("error is ",err)
      return errorResMsg(res, 500, err);
    }
  };
  
    

/**
 * edit med
 * 
 * @function
 * @memberof controllers
 * @memberof Medication
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.name - med name
 * @param {string} req.body.type - med type
 * @param {string} req.body.strength - med strength
 * @param {string} req.body.unit - med unit
 * @param {string} req.body.quantity - med quantity
 * @param {string} req.body.instructions - instructions
 * @param {string} req.body.condition - condition
 * @param {string} req.file.img - img
 * @param {string} req.body.ProfileID - ProfileID
 * @param {Object} req.body.externalInfo - externalInfo is an object which contains the med information which is returned form search api{
 * @param {string} req.body.MedId - MedID

 * "DrugCode":"H21-5135-05410-01",
    etc...
 * 
 * }
 * @param {Object} req.body.Scheduler - the med scheduler object 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * @throws {Error} if the MedID is not valid
 * 
 * 
 * @returns {Object} - Returns edited med
 * @description 
 *   this api is used to edit med
 * if the Scheduler is changed then 
 * -all the future doses will be deleted started from today if its status is not taken or rejected
 * -new doses will be generated based on the Scheduler type
 * 
       
 * 
 */


  exports.EditMed=async (req, res) => {
  
 
    try {
  
      const {id} =req.id
      let {
        MedId,
        name,
        strength,
        description,
        unit,
        quantity,
        instructions,
        condition,
        externalInfo,
        Scheduler,
        type,
        ProfileID,
        Refillable,
        RefileLevel,
        Ringtone,
        KeepOldImg
      }=req.body
  
  
       /*
      
      check permission 
      
      */
      const authorized =await CheckRelationShipBetweenCareGiverAndDependent(ProfileID,id)
      if(!authorized){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      const [viewer,profile,viewerProfile]=authorized
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User._id.toString()!==id){
        // check if the user has add med permission
        const hasWritePermissonToAllMeds=viewer.CanWriteMeds;
        // check CanReadSpacificMeds array inside viewer for the CanWrite permission for that MedID
        const hasWritePermissonToThatMed=viewer.CanReadSpacificMeds.find((med)=>{
          if(med.Med.toString()===MedId.toString()){
            return med.CanWrite
          }
        }) 
        if(!(hasWritePermissonToAllMeds||hasWritePermissonToThatMed)){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }

      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanEditMeds')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      //case the owner dont has write permission
      // if(profile.Owner.User._id.toString()===id&&!profile.Owner.Permissions.write){
      //   return errorResMsg(res, 401, req.t("Unauthorized"));
      // }
  
  
      if(!MedId){
        return errorResMsg(res, 400, req.t("Medication_id_required"));
      }
      const oldMed=await UserMedication.findById(MedId);
      if(!oldMed){
        return errorResMsg(res, 404, req.t("Medication_not_found"));
      }
      let img=null;
      if(req.file){
         // store the image
      img = await UploadFileToAzureBlob(req.file)
        }
     
  
        // check if the caller is thas the permssion to edit
        // for now the creator who has the right to edit
  
  
  
        // edit medication
       const editedMed= await UserMedication.findByIdAndUpdate(MedId,{
          img:KeepOldImg==='true'?oldMed.img:img,
          name:name||oldMed.name,
          strength:strength||oldMed.strength,
          description:description||oldMed.description,
          unit:unit||oldMed.unit,
          quantity:quantity||oldMed.quantity,
          instructions:instructions||oldMed.instructions,
          condition:condition||oldMed.condition,
          externalInfo:externalInfo?JSON.parse(externalInfo||null):null||oldMed.externalInfo,
          type:type||oldMed.type,
          EditedBy:viewerProfile._id,
          Refile:{
            Refillable:Refillable||oldMed.Refile.Refillable,
            RefileLevel:RefileLevel||oldMed.Refile.RefileLevel
          },
          Ringtone:Ringtone||oldMed.Ringtone
        },{new:true})
        newMed=editedMed
        // generate MedInfo snapshot
        const MedInfo={
          img:editedMed.img,
          strength:editedMed.strength,
          unit:editedMed.unit,
          instructions:editedMed.instructions,
          condition:editedMed.condition,
          type:editedMed.type,
          name:editedMed.name,
          EditedBy:viewerProfile._id,
          CreatorProfile:editedMed.CreatorProfile,
         
  
        }
        console.log("MedInfo",MedInfo)
         const resultaaa=await Occurrence.updateMany({
          Medication:editedMed._id.toString(),
        },{
         $set: { MedInfo: MedInfo } 
        })
        console.log("result",resultaaa)
        // if nod edit for schdule will return
  
        if(!Scheduler){
          return successResMsg(res, 200, {message:req.t("Medication_updated"),data:editedMed});
        }
        
        // check if the Scheduler sent with the request is the same as the one in the database
        const SchedulerId=editedMed.Scheduler._id
  
        // edit schdule
      const OldScheduler = await SchedulerSchema.findById(SchedulerId)
      console.log("Scheduler ",Scheduler)
      const jsonScheduler=JSON.parse(Scheduler)
      console.log("OldScheduler",OldScheduler.dosage)
      console.log("jsonScheduler",jsonScheduler.dosage)
      if(!OldScheduler){
        return errorResMsg(res, 404, req.t("Scheduler_not_found"));
      }
     
      const isTheSame=await CompareOldSchedulerWithTheNewScheduler(jsonScheduler,OldScheduler)
      if(isTheSame){
        console.log("is the same runs")
        return successResMsg(res, 200, {message:req.t("Medication_updated"),data:editedMed});
      }
      // in case that the dose is in the past and is taken or confirmed the dose will be the same and the new Occurrence will be generated from the next day
      // in case that the dose is in the past and is not taken or confirmed the dose will be edited and the new Occurrence will start the next day

      const endOfYesterday = new Date();
      endOfYesterday.setDate(endOfYesterday.getDate() - 1);
      endOfYesterday.setHours(23, 59, 59, 999);

      // delete all the future Occurrences including today if its not 2 or 4
      console.log("SchedulerId",SchedulerId)
     const deleted= await Occurrence.deleteMany({
      Medication:editedMed._id.toString(),
      PlannedDateTime:{$gte:endOfYesterday},
       Status: { $in: [0, 1, 3, 5] }})
     console.log("deleted",deleted) 
    //make the Scheduler as archived 
    const archived=await SchedulerSchema.findByIdAndUpdate(SchedulerId,{
      Archived:true
    },{new:true})
      
    // add the archived scheduler to med archived history

    editedMed.SchedulerHistory.push(archived._id);
    
    //generate new Scheduler

      // create Scheduler 
     // check if no end date is provided then make GenerateAutoOccurrence to true
      if(!jsonScheduler.EndDate&&jsonScheduler.ScheduleType!="1"){
        jsonScheduler.GenerateAutoOccurrence=true
      }
     // validate Scheduler 
     const ValidateScheduler= await CreateNewScheduler(jsonScheduler,newMed,id,ProfileID,viewerProfile,req,res)


      // create Occurrences
    const newScheduler= await CreateOccurrences(jsonScheduler,ValidateScheduler,id,newMed,MedInfo,ProfileID,viewerProfile,req,res,true)
    
    // delete the new dose if there is a dose in that time
    // get doses of today that is taken or rejected
    // end of today
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const doses=await Occurrence.find({
      Medication:editedMed._id.toString(),
      PlannedDateTime:{$gte:endOfYesterday,$lte:endOfToday},
      Status: { $in: [2,4] }

    })
     for await(const singleDose of doses){
      await Occurrence.deleteMany({
        Medication:editedMed._id.toString(),
        PlannedDateTime:singleDose.PlannedDateTime,
        Status: { $in: [0, 1, 3, 5] }
      })

    }
  
      // save med and Scheduler
  
      editedMed.Scheduler=newScheduler._id
      await newScheduler.save()
     await editedMed.save()
  
       // give the med creator full access for that med
       // if the med creator is the parent make Refile and doses true
       if(profile.Owner.User==id){
        if(viewer){
          viewer.CanReadSpacificMeds.push({
            Med:newMed._id,
            Refile:true,
            Doses:true
           })
        }
        
       }else{
        if(viewer){
          viewer.CanReadSpacificMeds.push({
            Med:newMed._id
           })
           await viewer.save()
        }
        
       }
     
      
      const responseData=await UserMedication.findById(editedMed._id)
      .populate("Scheduler")

     
      // return successful response
      return successResMsg(res, 200, {message:req.t("Scheduler_Updated"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };



/**
 * get medication
 * 
 * @function
 * @memberof controllers
 * @memberof Medication
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {string} req.query.ProfileID - ProfileID
 

 * "DrugCode":"H21-5135-05410-01",
    etc...
 * 
 * }
 * @param {Object} req.body.Scheduler - the med scheduler object 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * 
 * @returns {Object} - Returns array of med
 * @description 
 *       *return all user Medication if he is the profile owner
    *   return all meds that he has a permission to view for that profile id
       
       
 * 
 */



  exports.getMedication=async (req, res) => {

    /** 
     *return all user Medication if he is the profile owner
    *   return all meds that he has a permission to view for that profile id
     * 
     */
    try {
  
      const {id} =req.id
      const {ProfileID}=req.query
  
  
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
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false

      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
        //case the owner dont has write permission
        // if(profile.Owner.toString()===id&&!profile.Permissions.read){
        //   return errorResMsg(res, 401, req.t("Unauthorized"));
        // }
        let hasGeneralReadPermissions;
        let hasSpacificReadPermissions;
        if(profile.Owner.User._id.toString()===id){
          hasGeneralReadPermissions=true
        }else{
           hasGeneralReadPermissions=viewer.CanReadAllMeds;
           hasSpacificReadPermissions=viewer.CanReadSpacificMeds.map(elem=>{
            if(elem.CanRead){
              return elem.Med
            }
          });
        }
      
    
     
   
  
    // case general permission
    if(hasGeneralReadPermissions){
      const Medication =await UserMedication.find({
        ProfileID,
        isDeleted:false
  
      })
      .populate("Scheduler")
      
      const editedMedications=[]
      for await(const med of Medication){
        const doses=await Occurrence.find({
          Medication:med._id.toString(),
          Scheduler:med.Scheduler._id,
          PlannedDateTime:{$gte:new Date()},
          isSuspended:true
        })
        if(doses.length>0){
          
         
          editedMedications.push({
            ...med._doc,
            hasSuspendedDoses:true
          })
        }else{
         
          editedMedications.push({
            
              ...med._doc,
              hasSuspendedDoses:false
            
          })
        }

      }

      
      
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:editedMedications});
  
    }else if(hasSpacificReadPermissions.length>0){
      // case spacific permission
      const Medication =await UserMedication.find({
        ProfileID,
        _id:{$in:hasSpacificReadPermissions},
        isDeleted:false
      })
      .populate("Scheduler")

      const editedMedications=[]
      for await(const med of Medication){
        const doses=await Occurrence.find({
          Medication:med._id.toString(),
          Scheduler:med.Scheduler._id,
          PlannedDateTime:{$gte:new Date()},
          isSuspended:true
        })
        if(doses.length>0){
          
          
          editedMedications.push({
            
            ...med._doc,
            hasSuspendedDoses:true
          
        })
        }else{
          
          editedMedications.push({
            
            ...med._doc,
            hasSuspendedDoses:false
          
        })
        }

      }


      
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:editedMedications});
    }else{
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
  
     
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  


/**
 * delete medication
 * 
 * @function
 * @memberof controllers
 * @memberof Medication
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {string} req.body.ProfileID - ProfileID
 * @param {string} req.body.MedId - ProfileID
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * @throws {Error} if the MedID is not valid
 * 
 * 
 * @returns {Object} - Returns edited med
 * @description 
 *     delete all cycle
     * -this api sholud be called when user needs to delete medicatation cycle
     * -the caller must be the med creator
     * -medId and schdule id is required
     * -that data to be edit
     * ********************************
     * logic
     * ********************************
     * 1- make sure that the caller is the med creator
     * 2- make sure that the med id and shcdule id is valid
     * 3- flag the med and Scheduler as deleted
     * 4- delete all the future doses
     * 
     * 
     * 
     *
       
       
 * 
 */


  exports.deleteMedicationCycle=async (req, res) => {

    /** delete all cycle
     * -this api sholud be called when user needs to delete medicatation cycle
     * -the caller must be the med creator
     * -medId and schdule id is required
     * -that data to be edit
     * ********************************
     * logic
     * ********************************
     * 1- make sure that the caller is the med creator
     * 2- make sure that the med id and shcdule id is valid
     * 3- flag the med and Scheduler as deleted
     * 4- delete all the future doses
     * 
     * 
     * 
     */
    try {
  
      const {id} =req.id
      let {
      MedId,
      ProfileID
      }=req.body
  
      // check for permison
      const Medication=await UserMedication.findById(MedId)
      if(!Medication){
        return errorResMsg(res, 400, req.t("Medication_not_found"));
      }
  
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
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID,
       IsDeleted:false
      })
  
      if(!viewer&&profile.Owner.User._id.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User._id.toString()!=id){
        // check if the user has add med permission
        const hasWritePermissonToThatMed=viewer.CanWriteMeds;
        // check CanReadSpacificMeds array inside viewer for the CanWrite permission for that MedID
        const hasWritePermissonToThatDose=viewer.CanReadSpacificMeds.find((med)=>{
          if(med.Med.toString()===MedId){
            return med.CanWrite
          }
        }) 
        if(!(hasWritePermissonToThatDose||hasWritePermissonToThatMed)){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        
      }

      if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanDeleteMeds')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }
      //case the owner dont has write permission
      // if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
      //   return errorResMsg(res, 401, req.t("Unauthorized"));
      // }
  
  
  
     
      const Scheduler =await SchedulerSchema.findOne({medication:MedId})
  
      // delete all future occurrences
      await Occurrence.deleteMany({Medication:MedId,PlannedDateTime:{$gt:new Date()}})
      // update the old ocuurences to be suspended
      await Occurrence.updateMany({Medication:MedId,PlannedDateTime:{$lte:new Date()}},{ IsDeleted:true})
      // update medication deleted flag
      console.log(Scheduler)
      Medication.isDeleted=true;
      Scheduler.isDeleted=true;
      
      await Medication.save()
      await Scheduler.save()
  
      
      // return successful response
      return successResMsg(res, 200, {message:req.t("Medication_Cycle_Deleted")});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  

  
  exports.CreateNewMedFhir = async (req, res) => {
 
    try {
  
      const {id} =req.id
      const {
        ProfileID,
        Prescription
      
      }=req.body
      

     
    
      const authorized =await CheckRelationShipBetweenCareGiverAndDependent(ProfileID,id)
      if(!authorized){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      const [viewer,profile,viewerProfile]=authorized


       // check if the user is the owner and has write permission or can add meds
   
       if(profile.Owner.User._id.toString()!==id){
         // check if the user has add med permission
         const hasAddMedPermissonToMeds=viewer.CanAddMeds;
   
         if(!hasAddMedPermissonToMeds){
           return errorResMsg(res, 401, req.t("Unauthorized"));
         }
         
       }

       if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanAddMeds')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }

      const DeepClonedPrescription = JSON.parse(JSON.stringify(Prescription))
      //generate dose Occurrence based on dosageInstruction in DeepClonedPrescription
      // get med information 
      const medInfo = await getMedInfoFromFhirPrescription(DeepClonedPrescription)
      const doseInfo =await getDoseInfoFromFhirPrescription(DeepClonedPrescription)

      console.log("medInfo",doseInfo)
     
  

     
  
     
      // return successful response
      return successResMsg(res, 200, {message:req.t("med_created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log("error is ",err)
      return errorResMsg(res, 500, err);
    }
  };
    