/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Medication
 * 
 */


const SchedulerSchema = require("../../../DB/Schema/Scheduler");
const UserMedication = require("../../../DB/Schema/UserMedication");
const {UploadFileToAzureBlob,GenerateOccurrences,GenerateOccurrencesWithDays,CheckRelationShipBetweenCareGiverAndDependent} =require("../../../utils/HelperFunctions")
const Occurrence = require("../../../DB/Schema/Occurrences");
const Viewer =require("../../../DB/Schema/Viewers")
const mongoose = require("mongoose");
const Profile =require("../../../DB/Schema/Profile")
const {CreateNewScheduler,CreateOccurrences} =require("../../../utils/ControllerHelpers")
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
        Refilelable,
        RefileLevel
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
   
       if(profile.Owner.User.toString()!==id){
         // check if the user has add med permission
         const hasAddMedPermissonToMeds=viewer.CanAddMeds;
   
         if(!hasAddMedPermissonToMeds){
           return errorResMsg(res, 401, req.t("Unauthorized"));
         }
         
       }
       //case the owner does not has write permission
       if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
         return errorResMsg(res, 401, req.t("Unauthorized"));
       }
   
     
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
        externalInfo:JSON.parse(externalInfo),
        type,
        ProfileID,
        CreatorProfile:viewerProfile._id,
        Refile:{
          Refilelable,
          RefileLevel
        }
        
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
     
     // validate Scheduler 
     const ValidateScheduler= await CreateNewScheduler(jsonScheduler,newMed,id,ProfileID,viewerProfile,req,res)


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
     
      
    
  
  
  
  
     const responseData={
        med:newMed,
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
 *      edit med and schdule api
     * -this api sholud be called when user needs to edit med or its schdule
     * -the caller must be the med creator or has a permission
     * -medId and schdule id is required
     * -that data to be edit
     * ********************************
     * logic
     * ********************************
     * 1- make sure that the caller is the med creator or has a permission
     * 2- make sure that the med id and shcdule id is valid
     * 3- retrive the med and edit it 
     * 4- retrive the schdule and edit it
     * 5- edit all the future Occurrence if it changed
     * 
     * 
     * 
     *
       
       
 * 
 */


  exports.EditMed=async (req, res) => {
  
    /** edit med and schdule api
     * -this api sholud be called when user needs to edit med or its schdule
     * -the caller must be the med creator or has a permission
     * -medId and schdule id is required
     * -that data to be edit
     * ********************************
     * logic
     * ********************************
     * 1- make sure that the caller is the med creator or has a permission
     * 2- make sure that the med id and shcdule id is valid
     * 3- retrive the med and edit it 
     * 4- retrive the schdule and edit it
     * 5- edit all the future Occurrence if it changed
     * 
     * 
     * 
     */
    try {
  
      const {id} =req.id
      let {
        img,
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
        Refilelable,
        RefileLevel
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
  
      if(profile.Owner.User.toString()!==id){
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
      //case the owner dont has write permission
      if(profile.Owner.User.toString()===id&&!profile.Owner.Permissions.write){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
  
  
  
  
      if(req.file){
         // store the image
      img = await UploadFileToAzureBlob(req.file)
        }
        if(!MedId){
          return errorResMsg(res, 400, req.t("Medication_id_required"));
        }
        const oldMed=await UserMedication.findById(MedId);
        if(!oldMed){
          return errorResMsg(res, 404, req.t("Medication_not_found"));
        }
  
        // check if the caller is thas the permssion to edit
        // for now the creator who has the right to edit
  
  
  
        // edit medication
       const editedMed= await UserMedication.findByIdAndUpdate(MedId,{
          img:img||oldMed.img,
          name:name||oldMed.name,
          strength:strength||oldMed.strength,
          description:description||oldMed.description,
          unit:unit||oldMed.unit,
          quantity:quantity||oldMed.quantity,
          instructions:instructions||oldMed.instructions,
          condition:condition||oldMed.condition,
          externalInfo:externalInfo?JSON.parse(externalInfo):null||oldMed.externalInfo,
          type:type||oldMed.type,
          EditedBy:viewerProfile._id,
          Refile:{
            Refilelable:Refilelable||oldMed.Refile.Refilelable,
            RefileLevel:RefileLevel||oldMed.Refile.RefileLevel
          }
        },{new:true})
        newMed=editedMed
        // genrate MedInfo snapshot
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
  
  
  
       const SchedulerId=editedMed.Scheduler._id
  
        // edit schdule
      const OldScheduler = await SchedulerSchema.findById(SchedulerId)
      if(!OldScheduler){
        return errorResMsg(res, 404, req.t("Scheduler_not_found"));
      }
     
      // delete all the future Occurrences
      console.log("SchedulerId",SchedulerId)
     const deleted= await Occurrence.deleteMany({Medication:editedMed._id.toString(),PlannedDateTime:{$gte:new Date().toISOString()}})
     console.log("deleted",deleted) 
    
      console.log("Scheduler ",Scheduler)
      const jsonScheduler=JSON.parse(Scheduler)
  
      MedInfo.ScheduleType= jsonScheduler.ScheduleType
  
      // validate schdule data
      // check if StartDate in the past 
      const DateTime = new Date()
      // if((+jsonScheduler.StartDate)<DateTime.getTime()){
      //   return errorResMsg(res, 400, req.t("start_date_in_the_past"));
      // }
  
      // validate schdule if exist
  
      if(jsonScheduler.ScheduleType){
        if(jsonScheduler.ScheduleType!="1"&&jsonScheduler.ScheduleType!="2"&&
        jsonScheduler.ScheduleType!="3"&&jsonScheduler.ScheduleType!="0"){
          return errorResMsg(res, 400, req.t("invalid_schedule_type"));
        }
      }
  
    
  
      // if(jsonScheduler.EndDate){
      //   // if((+jsonScheduler.EndDate)<DateTime.getTime()){
      //   //   return errorResMsg(res, 400, req.t("end_date_in_the_past"));
      //   // }
  
      //   if((+jsonScheduler.EndDate)<(+OldScheduler.StartDate)){
      //     return errorResMsg(res, 400, req.t("end_date_before_start_date"));
      //   }
        
  
      // }
  // validate dose if its not as needed
      if(jsonScheduler.ScheduleType){
        if(jsonScheduler.ScheduleType!="1"){
          if(!jsonScheduler.dosage){
            return errorResMsg(res, 400, req.t("no_dosage_provided"));
          }
          if(jsonScheduler.dosage.length===0){
            return errorResMsg(res, 400, req.t("no_dosage_provided"));
          }
          jsonScheduler.dosage.forEach(dose => {
    
            if(dose.dose<1){
              return errorResMsg(res, 400, req.t("invalid_dose"));
            }
            // if(+(dose.DateTime)<DateTime.getTime()){
            //   return errorResMsg(res, 400, req.t("dose_date_in_the_past"));
            // }
    
          });
    
        }
  
  
      // validate specific days if its not as needed
      if(jsonScheduler.ScheduleType=="0"){
        if(!jsonScheduler.SpecificDays){
          return errorResMsg(res, 400, req.t("no_specific_days_provided"));
        }
        if(jsonScheduler.SpecificDays.length===0){
          return errorResMsg(res, 400, req.t("no_specific_days_provided"));
        }
  
      }
      // validate occurrence pattern if its not as needed
      if(jsonScheduler.ScheduleType=="3"){
        if(!jsonScheduler.DaysInterval){
          return errorResMsg(res, 400, req.t("invalid_occurrence_pattern"));
        }
        if(jsonScheduler.DaysInterval<2){
          return errorResMsg(res, 400, req.t("invalid_occurrence_pattern"));
        }
  
      }
      }
     
  
  
      // saved old Scheduler into history array and update the new one
      console.log("jsonScheduler.startDate",new Date(jsonScheduler.StartDate))
     const newScheduler=jsonScheduler
      console.log("newScheduler.startDate",new Date(newScheduler.StartDate))
        var endAfter3Month = new Date(newScheduler.StartDate);
        endAfter3Month .setMonth(endAfter3Month .getMonth() + 3);
        newScheduler.EndDate=jsonScheduler.EndDate||endAfter3Month
      

      
     // create new Occurrences
  
       // get get start and end date
       let startDate=jsonScheduler.StartDate
       let endDate=jsonScheduler.EndDate
       let occurrencePattern;
       if(!startDate){
         return errorResMsg(res, 400, req.t("start_date_required"));
         
       }
     
       // get schule senario 
       if(!jsonScheduler.ScheduleType){
         return errorResMsg(res, 400, req.t("Scheduler_type_required"));
         
       }
       // get occurrence pattern
       // the fowllowing code must rurns in case 2 and 3 only
       if(jsonScheduler.ScheduleType=='2'||jsonScheduler.ScheduleType=='3'){
   
       //case every day
       if(jsonScheduler.ScheduleType=='2'){ 
         occurrencePattern=1
       }else if(jsonScheduler.ScheduleType=='3'){ //case days interval
         occurrencePattern=jsonScheduler.DaysInterval
       }
       // generate occurrences data
   
       const occurrences=[]
       for(const doseElement of jsonScheduler.dosage){
   
         const OccurrencesData={
           PlannedDose:doseElement.dose,
           ProfileID
         }
         const start=new Date(doseElement.DateTime)
         
         if(!newScheduler.EndDate){
   
           var result = new Date(newScheduler.StartDate);
           result.setMonth(result.getMonth() + 3);
   
           end=result
         }else{
           end=new Date(newScheduler.EndDate)
   
         }
         
         
         const newOccurrences=await GenerateOccurrences(id,editedMed._id,MedInfo,newScheduler._id,occurrencePattern,start,end,OccurrencesData)
         occurrences.push(...newOccurrences)
   
   
       };
   
       // write occurrences to database
       await Occurrence.insertMany(occurrences)
   
   
    
       
   
       }else if (jsonScheduler.ScheduleType=='0'){
   
         // case user choose spacic days
         const occurrences=[]
       for(const doseElement of jsonScheduler.dosage){
   
         const OccurrencesData={
           PlannedDose:doseElement.dose,
            ProfileID
         }
         const start=new Date(doseElement.DateTime)
         
         let  end=newScheduler.EndDate
   
         
   
         const intervalDays=jsonScheduler.SpecificDays
         
         const newOccurrences=await GenerateOccurrencesWithDays(id,editedMed._id,MedInfo,newScheduler._id,intervalDays,start,end,OccurrencesData)
         occurrences.push(...newOccurrences)
   
   
       };
   
       // write occurrences to database
       await Occurrence.insertMany(occurrences)
   
   
       }
  
       
     console.log("newScheduler",)
  
    const resulta= await SchedulerSchema.findByIdAndUpdate(SchedulerId,{
        ...newScheduler,
        StartDate:new Date(newScheduler.StartDate)
      })
       
      console.log("result",resulta)
     
  
     
      // return successful response
      return successResMsg(res, 200, {message:req.t("Scheduler_Updated")});
      
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
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
  
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
        //case the owner dont has write permission
        if(profile.Owner.toString()===id&&!profile.Owner.Permissions.read){
          return errorResMsg(res, 401, req.t("Unauthorized"));
        }
        let hasGeneralReadPermissions;
        let hasSpacificReadPermissions;
        if(profile.Owner.User.toString()===id){
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
        ProfileID
  
      })
      .populate("Scheduler")
      
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:Medication});
  
    }else if(hasSpacificReadPermissions.length>0){
      // case spacific permission
      const Medication =await UserMedication.find({
        ProfileID,
        _id:{$in:hasSpacificReadPermissions}
      })
      .populate("Scheduler")


      
      // return successful response
      return successResMsg(res, 200, {message:req.t("Success"),data:Medication});
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
  
      // get the viewer permissions
      const viewerProfile =await Profile.findOne({
      "Owner.User":id
      })
      
      if(!viewerProfile){
         return errorResMsg(res, 400, req.t("Profile_not_found"));
      }
  
      const viewer =await Viewer.findOne({
       ViewerProfile:viewerProfile._id,
       DependentProfile:ProfileID
      })
  
      if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
      // check if the user is the owner and has write permission or can add meds
  
      if(profile.Owner.User.toString()!=id){
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
      //case the owner dont has write permission
      if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
  
  
  
     
      const Scheduler =await SchedulerSchema.findOne({medication:MedId})
  
      // delete all future occurrences
      await Occurrence.deleteMany({Medication:MedId,PlannedDateTime:{$gt:new Date()}})
  
      // update medication deleted flage
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
  

  