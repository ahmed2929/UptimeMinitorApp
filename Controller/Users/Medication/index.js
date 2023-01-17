/**
 * @file controller/general/index.js
 * @namespace controllers
 * @namespace Medication
 * 
 */


const SchdulerSchema = require("../../../DB/Schema/Schduler");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const {UploadFileToAzureBlob,GenerateOccurances,GenerateOccurancesWithDays} =require("../../../utils/HelperFunctions")
const Occurance = require("../../../DB/Schema/Occurances");
const Viewer =require("../../../DB/Schema/Viewers")
const mongoose = require("mongoose");
const Profile =require("../../../DB/Schema/Profile")
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");



/**
 * Creates a new dependent user
 * 
 * @function
 * @memberof controllers
 * @memberof Medication
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.name - med name
 * @param {string} req.body.type - med type
 * @param {string} req.body.strenth - med strenth
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
 * @param {Object} req.body.Schduler - the med scheduler object 
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
  "StartDate": 1671695330693,
  "EndDate": 1674664200000,
  "AsNeeded": false,
  "ScheduleType": "0",
  "DaysInterval": null,
  "DpacifcDays": [
    "Thursday",
    "Friday",
    "Saturday"
  ],
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

   // create Occurances
      *
       *  -date and time are represinted in ms format
       *  -med take time is extracted from startDate ms 
       * -start date must be provided , the api consumer must provide startdate with the choosen time
       * -if then no endDate then the defult is date.now()+3 monthes
       * -the defult pattern is every day with occurence pattern 1 means everyday (case 1)
       * -if the user proviced occurence pattern n(2,3,4 ...etc) means the generated occurences evry n days (case 2)
       * -case 3 when user choose spacifc days to run the interval
       * - for case 1 and 2 run GenerateOccurances function wich takes (userID,medId,SchdulerId,OccrurencePattern,startDate,endDate,OccurancesData) as
       * parametars and returns array of objects wich reprisints occurence valid object
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
        strenth,
        description,
        unit,
        quantity,
        instructions,
        condition,
        externalInfo,
        Schduler,
        type,
        ProfileID,
        Refillable,
        RefileLevel
      }=req.body
  
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
        DependentProfile:ProfileID
       })
       if(!viewer&&profile.Owner.User.toString()!==id){
        return errorResMsg(res, 400, req.t("Unauthorized"));
      }
  
        
       // check if the user is the owner and has write permission or can add meds
   
       if(profile.Owner.User.toString()!==id){
         // check if the user has add med permission
         const hasAddMedPermissonToMeds=viewer.CanAddMeds;
   
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
      if(req.file){
         img = await UploadFileToAzureBlob(req.file)
      }
      
     
  
      // create new med
      const newMed = new UserMedcation({
        img,
        user:mongoose.Types.ObjectId(id),
        name,
        strenth,
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
          Refillable,
          RefileLevel
        }
        
      })
    
      
      // generate medIfo snapshot
      const MedInfo={
        img,
        strenth,
        unit,
        instructions,
        condition,
        type,
        name,
        ProfileID,
        CreatorProfile:viewerProfile._id,
        SchudleType:JSON.parse(Schduler).ScheduleType,
      }
      // create schduler 
      jsonSchduler=JSON.parse(Schduler)
  
      // validate schdule data
      if(!jsonSchduler.StartDate){
        return errorResMsg(res, 400, req.t("start_date_required"));
      }
      // check if StartDate in the past 
      
      let DateTime = new Date((new Date()).getTime() - (60*60*24*1000))
      //DateTime.setDate(DateTime.getDate() - 1);
      console.log(DateTime , new Date(+jsonSchduler.StartDate))
      if((+jsonSchduler.StartDate)<DateTime.getTime()){
        return errorResMsg(res, 400, req.t("start_date_in_the_past"));
      }
      if(jsonSchduler.ScheduleType!="1"&&jsonSchduler.ScheduleType!="2"&&
        jsonSchduler.ScheduleType!="3"&&jsonSchduler.ScheduleType!="0"){
          return errorResMsg(res, 400, req.t("invalid_schedule_type"));
        }
  
      if(jsonSchduler.EndDate){
        if((+jsonSchduler.EndDate)<DateTime.getTime()){
          return errorResMsg(res, 400, req.t("end_date_in_the_past"));
        }
  
        if((+jsonSchduler.EndDate)<(+jsonSchduler.StartDate)){
          return errorResMsg(res, 400, req.t("end_date_before_start_date"));
        }
  
  
      }
  // validate dose if its not as needed
      if(jsonSchduler.ScheduleType!="1"){
        if(!jsonSchduler.dosage){
          return errorResMsg(res, 400, req.t("no_dosage_provided"));
        }
        if(jsonSchduler.dosage.length===0){
          return errorResMsg(res, 400, req.t("no_dosage_provided"));
        }
        jsonSchduler.dosage.forEach(dose => {
  
          if(dose.dose<1){
            return errorResMsg(res, 400, req.t("invalid_dose"));
          }
          if(+(dose.DateTime)<DateTime.getTime()){
            return errorResMsg(res, 400, req.t("dose_date_in_the_past"));
          }
  
        });
  
      }
      // validate specific days if its not as needed
      if(jsonSchduler.ScheduleType=="0"){
        if(!jsonSchduler.SpecificDays){
          return errorResMsg(res, 400, req.t("no_specific_days_provided"));
        }
        if(jsonSchduler.SpecificDays.length===0){
          return errorResMsg(res, 400, req.t("no_specific_days_provided"));
        }
  
      }
      // validate occurence pattern if its not as needed
      if(jsonSchduler.ScheduleType=="3"){
        if(!jsonSchduler.DaysInterval){
          return errorResMsg(res, 400, req.t("invalid_occurence_pattern"));
        }
        if(jsonSchduler.DaysInterval<2){
          return errorResMsg(res, 400, req.t("invalid_occurence_pattern"));
        }
  
      }
  
  
      if(!jsonSchduler.EndDate){
        var result = new Date(jsonSchduler.StartDate);
        result.setMonth(result.getMonth() + 3);
        jsonSchduler.EndDate=result
        
      }
  
  
      const newSchduler = new SchdulerSchema({
        medication:newMed._id,
        User:id,
        ...jsonSchduler
        ,
        ProfileID,
        CreatorProfile:viewerProfile._id
  
      })
  
      // create Occurances
      /**
       *  -date and time are represinted in ms format
       *  -med take time is extracted from startDate ms 
       * -start date must be provided , the api consumer must provide startdate with the choosen time
       * -if then no endDate then the defult is date.now()+3 monthes
       * -the defult pattern is every day with occurence pattern 1 means everyday (case 1)
       * -if the user proviced occurence pattern n(2,3,4 ...etc) means the generated occurences evry n days (case 2)
       * -case 3 when user choose spacifc days to run the interval
       * - for case 1 and 2 run GenerateOccurances function wich takes (userID,medId,SchdulerId,OccrurencePattern,startDate,endDate,OccurancesData) as
       * parametars and returns array of objects wich reprisints occurence valid object
       * - then write the ocuurences in the database
       * 
       * 
       */
  
      // get get start and end date
      let startDate=jsonSchduler.StartDate
      let endDate=jsonSchduler.EndDate
      let OccrurencePattern;
      if(!startDate){
        return errorResMsg(res, 400, req.t("start_date_required"));
        
      }
    
      // get schule senario 
      if(!jsonSchduler.ScheduleType){
        return errorResMsg(res, 400, req.t("schduler_type_required"));
        
      }
      // get occurence pattern
      // the fowllowing code must rurns in case 2 and 3 only
      if(jsonSchduler.ScheduleType=='2'||jsonSchduler.ScheduleType=='3'){
  
      //case every day
      if(jsonSchduler.ScheduleType=='2'){ 
        OccrurencePattern=1
      }else if(jsonSchduler.ScheduleType=='3'){ //case days interval
        OccrurencePattern= Number(jsonSchduler.DaysInterval)
      }
      // generate occurences data
  
      const occuraces=[]
      for(const doseElement of jsonSchduler.dosage){
  
        const OccurancesData={
          PlannedDose:doseElement.dose,
          ProfileID
        }
        const start=new Date(doseElement.DateTime)
        
        if(!jsonSchduler.EndDate){
  
          var result = new Date(baseDate);
          result.setMonth(result.getMonth() + 3);
  
          end=result
        }else{
          end=new Date(jsonSchduler.EndDate)
  
        }
     
        
        const newOccurances=await GenerateOccurances(id,newMed._id,MedInfo,newSchduler._id,OccrurencePattern,start,end,OccurancesData)
        occuraces.push(...newOccurances)
  
  
      };
  
      // write occurences to database
      await Occurance.insertMany(occuraces)
  
  
   
      
  
      }else if (jsonSchduler.ScheduleType=='0'){
  
        // case user choose spacic days
        const occuraces=[]
      for(const doseElement of jsonSchduler.dosage){
  
        const OccurancesData={
          PlannedDose:doseElement.dose,
          ProfileID,
          CreatorProfile:viewerProfile._id
        }
        const start=new Date(doseElement.DateTime)
        
       
          end=new Date(jsonSchduler.EndDate)
  
        
  
        const intervalDays=jsonSchduler.SpecificDays
        
        const newOccurances=await GenerateOccurancesWithDays(id,newMed._id,MedInfo,newSchduler._id,intervalDays,start,end,OccurancesData)
        occuraces.push(...newOccurances)
  
  
      };
  
      // write occurences to database
      await Occurance.insertMany(occuraces)
  
  
  
      }else if(jsonSchduler.ScheduleType=='1'){
        // as needed
        newSchduler.AsNeeded=true
  
      }
  
      // save med and schduler
  
      newMed.Schduler=newSchduler._id
      await newSchduler.save()
      await newMed.save()
  
       // give the med creator full access for that med
       // if the med creator is the parent make refil and doses true
       if(profile.Owner.User==id){
        if(viewer){
          viewer.CanReadSpacificMeds.push({
            Med:newMed._id,
            Refil:true,
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
      img,
      strenth,
      unit,
      instructions,
      condition,
      type,
      name,
      quantity,
      description,
      _id:newMed._id,
      Schduler:{
        _id:newSchduler._id,
        ...jsonSchduler
      },
      ProfileID
  
     }
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("med_created"),data:responseData});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  
    

/**
 * Creates a new dependent user
 * 
 * @function
 * @memberof controllers
 * @memberof Medication
 * @param {Object} req - Express request object
 * @param {Object} req.id - user id extracted from authorization header
 * @param {Object} req.body - request body
 * @param {string} req.body.name - med name
 * @param {string} req.body.type - med type
 * @param {string} req.body.strenth - med strenth
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
 * @param {Object} req.body.Schduler - the med scheduler object 
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
     * 5- edit all the future occurance if it changed
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
     * 5- edit all the future occurance if it changed
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
        strenth,
        description,
        unit,
        quantity,
        instructions,
        condition,
        externalInfo,
        Schduler,
        type,
        ProfileID,
        Refillable,
        RefileLevel
      }=req.body
  
  
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
        const oldMed=await UserMedcation.findById(MedId);
        if(!oldMed){
          return errorResMsg(res, 404, req.t("Medication_not_found"));
        }
  
        // check if the caller is thas the permssion to edit
        // for now the creator who has the right to edit
  
  
  
        // edit medication
       const editedMed= await UserMedcation.findByIdAndUpdate(MedId,{
          img:img||oldMed.img,
          name:name||oldMed.name,
          strenth:strenth||oldMed.strenth,
          description:description||oldMed.description,
          unit:unit||oldMed.unit,
          quantity:quantity||oldMed.quantity,
          instructions:instructions||oldMed.instructions,
          condition:condition||oldMed.condition,
          externalInfo:JSON.parse(externalInfo)||oldMed.externalInfo,
          type:type||oldMed.type,
          EditedBy:viewerProfile._id,
          Refile:{
            Refillable:RefileLevel||oldMed.Refile.RefileLevel,
            RefileLevel:RefileLevel||oldMed.Refile.RefileLevel
          }
        })
        newMed=editedMed
        // genrate MedInfo snapshot
        const MedInfo={
          img:editedMed.img,
          strenth:editedMed.strenth,
          unit:editedMed.unit,
          instructions:editedMed.instructions,
          condition:editedMed.condition,
          type:editedMed.type,
          name:editedMed.name,
          EditedBy:viewerProfile._id,
          CreatorProfile:editedMed.CreatorProfile,
         
  
        }
        // if nod edit for schdule will return
  
        if(!Schduler){
          return successResMsg(res, 200, {message:req.t("Medication_updated")});
        }
  
  
  
       const SchdulerId=editedMed.Schduler._id
  
        // edit schdule
      const OldSchduler = await SchdulerSchema.findById(SchdulerId)
      if(!OldSchduler){
        return errorResMsg(res, 404, req.t("schduler_not_found"));
      }
  
    
      console.log("schduler ",Schduler)
      const jsonSchduler=JSON.parse(Schduler)
  
      MedInfo.ScheduleType= jsonSchduler.ScheduleType
  
      // validate schdule data
      // check if StartDate in the past 
      const DateTime = new Date()
      if((+jsonSchduler.StartDate)<DateTime.getTime()){
        return errorResMsg(res, 400, req.t("start_date_in_the_past"));
      }
  
      // validate schdule if exist
  
      if(jsonSchduler.ScheduleType){
        if(jsonSchduler.ScheduleType!="1"&&jsonSchduler.ScheduleType!="2"&&
        jsonSchduler.ScheduleType!="3"&&jsonSchduler.ScheduleType!="0"){
          return errorResMsg(res, 400, req.t("invalid_schedule_type"));
        }
      }
  
    
  
      if(jsonSchduler.EndDate){
        if((+jsonSchduler.EndDate)<DateTime.getTime()){
          return errorResMsg(res, 400, req.t("end_date_in_the_past"));
        }
  
        if((+jsonSchduler.EndDate)<(+OldSchduler.StartDate)){
          return errorResMsg(res, 400, req.t("end_date_before_start_date"));
        }
  
  
      }
  // validate dose if its not as needed
      if(jsonSchduler.ScheduleType){
        if(jsonSchduler.ScheduleType!="1"){
          if(!jsonSchduler.dosage){
            return errorResMsg(res, 400, req.t("no_dosage_provided"));
          }
          if(jsonSchduler.dosage.length===0){
            return errorResMsg(res, 400, req.t("no_dosage_provided"));
          }
          jsonSchduler.dosage.forEach(dose => {
    
            if(dose.dose<1){
              return errorResMsg(res, 400, req.t("invalid_dose"));
            }
            if(+(dose.DateTime)<DateTime.getTime()){
              return errorResMsg(res, 400, req.t("dose_date_in_the_past"));
            }
    
          });
    
        }
  
  
      // validate specific days if its not as needed
      if(jsonSchduler.ScheduleType=="0"){
        if(!jsonSchduler.SpecificDays){
          return errorResMsg(res, 400, req.t("no_specific_days_provided"));
        }
        if(jsonSchduler.SpecificDays.length===0){
          return errorResMsg(res, 400, req.t("no_specific_days_provided"));
        }
  
      }
      // validate occurence pattern if its not as needed
      if(jsonSchduler.ScheduleType=="3"){
        if(!jsonSchduler.DaysInterval){
          return errorResMsg(res, 400, req.t("invalid_occurence_pattern"));
        }
        if(jsonSchduler.DaysInterval<2){
          return errorResMsg(res, 400, req.t("invalid_occurence_pattern"));
        }
  
      }
      }
     
  
  
      // saved old schduler into history array and update the new one
     const newSchduler=await SchdulerSchema.findByIdAndUpdate(SchdulerId,{
        ...jsonSchduler,
        history:[...OldSchduler.history,OldSchduler]
      })
  
      // delete all the future occurances
     const deleted= await Occurance.deleteMany({Schduler:SchdulerId,PlannedDateTime:{$gte:new Date()}})
      console.log("deleted",deleted) 
     // create new occurances
  
       // get get start and end date
       let startDate=jsonSchduler.StartDate
       let endDate=jsonSchduler.EndDate
       let OccrurencePattern;
       if(!startDate){
         return errorResMsg(res, 400, req.t("start_date_required"));
         
       }
     
       // get schule senario 
       if(!jsonSchduler.ScheduleType){
         return errorResMsg(res, 400, req.t("schduler_type_required"));
         
       }
       // get occurence pattern
       // the fowllowing code must rurns in case 2 and 3 only
       if(jsonSchduler.ScheduleType=='2'||jsonSchduler.ScheduleType=='3'){
   
       //case every day
       if(jsonSchduler.ScheduleType=='2'){ 
         OccrurencePattern=1
       }else if(jsonSchduler.ScheduleType=='3'){ //case days interval
         OccrurencePattern=jsonSchduler.DaysInterval
       }
       // generate occurences data
   
       const occuraces=[]
       for(const doseElement of jsonSchduler.dosage){
   
         const OccurancesData={
           PlannedDose:doseElement.dose,
           ProfileID
         }
         const start=new Date(doseElement.DateTime)
         
         if(!jsonSchduler.EndDate){
   
           var result = new Date(baseDate);
           result.setMonth(result.getMonth() + 3);
   
           end=result
         }else{
           end=new Date(jsonSchduler.EndDate)
   
         }
      
         
         const newOccurances=await GenerateOccurances(id,newMed._id,MedInfo,newSchduler._id,OccrurencePattern,start,end,OccurancesData)
         occuraces.push(...newOccurances)
   
   
       };
   
       // write occurences to database
       await Occurance.insertMany(occuraces)
   
   
    
       
   
       }else if (jsonSchduler.ScheduleType=='0'){
   
         // case user choose spacic days
         const occuraces=[]
       for(const doseElement of jsonSchduler.dosage){
   
         const OccurancesData={
           PlannedDose:doseElement.dose,
            ProfileID
         }
         const start=new Date(doseElement.DateTime)
         
        
           end=new Date(jsonSchduler.EndDate)
   
         
   
         const intervalDays=jsonSchduler.SpecificDays
         
         const newOccurances=await GenerateOccurancesWithDays(id,newMed._id,MedInfo,newSchduler._id,intervalDays,start,end,OccurancesData)
         occuraces.push(...newOccurances)
   
   
       };
   
       // write occurences to database
       await Occurance.insertMany(occuraces)
   
   
       }
  
  
  
  
      
  
     
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("Schdule_Updated")});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };



/**
 * Creates a new dependent user
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
 * @param {Object} req.body.Schduler - the med scheduler object 
 * @param {Object} res - Express response object
 * 
 * @throws {Error} if the user does not have a profile
 * @throws {Error} if the user is not the owner of the profile or has a permission
 * 
 * 
 * 
 * @returns {Object} - Returns array of med
 * @description 
 *       *return all user mediction if he is the profile owner
    *   return all meds that he has a permission to view for that profile id
       
       
 * 
 */



  exports.getMedication=async (req, res) => {

    /** 
     *return all user mediction if he is the profile owner
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
      const Medication =await UserMedcation.find({
        ProfileID
  
      })
      .populate("Schduler")
      
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("Success"),data:Medication});
  
    }else if(hasSpacificReadPermissions.length>0){
      // case spacific permission
      const Medication =await UserMedcation.find({
        ProfileID,
        _id:{$in:hasSpacificReadPermissions}
      })
      .populate("Schduler")
      
      // return succesfull response
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
 * Creates a new dependent user
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
     * 3- flag the med and schduler as deleted
     * 4- delete all the future doses
     * 
     * 
     * 
     *
       
       
 * 
 */


  exports.deletMedictionCycle=async (req, res) => {

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
     * 3- flag the med and schduler as deleted
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
      const Medication=await UserMedcation.findById(MedId)
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
  
  
  
     
      const schduler =await SchdulerSchema.findOne({medication:MedId})
  
      // delete all future occurences
      await Occurance.deleteMany({Medication:MedId,PlannedDateTime:{$gt:new Date()}})
  
      // update medication deleted flage
      Medication.isDeleted=true;
      schduler.isDeleted=true;
  
      await Medication.save()
      await schduler.save()
  
      
      // return succesfull response
      return successResMsg(res, 200, {message:req.t("Medication_Cycle_Deleted")});
      
    } catch (err) {
      // return error response
      console.log(err)
      return errorResMsg(res, 500, err);
    }
  };
  