const User = require("../../../DB/Schema/User");
const MedRecommendation = require("../../../DB/Schema/MedRecommendation");
const SchdulerSchema = require("../../../DB/Schema/Schduler");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const {UploadFileToAzureBlob,GenerateOccurances,GenerateOccurancesWithDays} =require("../../../utils/HelperFunctions")
const Occurance = require("../../../DB/Schema/Occurances");
const mongoose = require("mongoose");
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const Symptom = require("../../../DB/Schema/Symptoms");
const Profile = require("../../../DB/Schema/Profile")
const Permissions = require("../../../DB/Schema/Permissions")



function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// change user lang
exports.ChangeUserDefultLang = async (req, res) => {
 
  try {

    const {lang}=req.body
    const {id} =req.id
    // get user with email
    const user = await User.findById(id);
    user.lang=lang;
    await user.save()

    // return succesfull response
    return successResMsg(res, 200, {message:req.t("lang_has_changed")});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.SerachForMed = async (req, res) => {
 
  try {

    let results=[];
    if (req.query.name) {
     
      // autocomplete search ?

      const regex = new RegExp(escapeRegex(req.query.name), 'i');
      results = await MedRecommendation.find({
        $or:[{PackageName:regex},{GenericName:regex}]
       
        
      }).limit(5);
    } 
    // return succesfull response
    return successResMsg(res, 200, {data:results});
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

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
    }=req.body

     /*
    
    check permission will only allow if the id is the Owner id 
    and has a write permission Or
     in Viewers array and has write permission ?
    
    */
     const profile =await Profile.findById(ProfileID)
     if(!profile){
       return errorResMsg(res, 400, req.t("Profile_not_found"));
     }
 
     const permissions=await Permissions.findOne({
       Profile:ProfileID,
     })
     if(!permissions){
       return errorResMsg(res, 400, req.t("Permisson_not_found"));
      }
 
     // check if the user is the owner and has write permission or has a write permission
 
     if(profile.Owner.User.toString()!==id){
       // check if the user is in viewers array and CanWriteMeds is true
       const hasWritePermissonToMeds=profile.Viewers.find((viewer)=>{
         return viewer.User.toString()===id&&viewer.CanWriteMeds
       })
 
       if(!hasWritePermissonToMeds){
         return errorResMsg(res, 401, req.t("Unauthorized"));
       }
       
     }
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
      ProfileID

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
      ProfileID
    }
    // create schduler 
    jsonSchduler=JSON.parse(Schduler)

    // validate schdule data
    if(!jsonSchduler.StartDate){
      return errorResMsg(res, 400, req.t("start_date_required"));
    }
    // check if StartDate in the past 
    const DateTime = new Date()
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
      ProfileID

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



    }else if(jsonSchduler.ScheduleType=='1'){
      // as needed
      newSchduler.AsNeeded=true

    }

    // save med and schduler

    newMed.Schduler=newSchduler._id
    await newSchduler.save()
    await newMed.save()

      // who has the right to view that symtom
    // symtom creator
    // profile owner
    // profile viewers
    // permissions.Medcations.push({
    //   Med:newMed._id,
    //   User:id,
    // })
    // // profile owner
    // permissions.Medcations.push({
    //   Med:newMed._id,
    //   User:profile.Owner.User._id,
    // })
 
    profile.Viewers.forEach((viewer)=>{
      permissions.Medcations.push({
        Med:newMed._id,
        User:viewer.User._id,
        Permissions:{
          write:viewer.CanWriteSymptoms
        }
      })
    })
  


  
    await permissions.save()




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

exports.EditMed=async (req, res) => {

  /** edit med and schdule api
   * -this api sholud be called when user needs to edit med or its schdule
   * -the caller must be the med creator or has a permission
   * -medId and schdule id is required
   * -that data to be edit
   * ********************************
   * logic
   * ********************************
   * 1- make sure that the caller is the med creator
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
      type
    }=req.body

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


      if(oldMed.user.toString()!==id){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }

      // edit medication
     const editedMed= await UserMedcation.findOneAndUpdate(MedId,{
        img:img||oldMed.img,
        name:name||oldMed.name,
        strenth:strenth||oldMed.strenth,
        description:description||oldMed.description,
        unit:unit||oldMed.unit,
        quantity:quantity||oldMed.quantity,
        instructions:instructions||oldMed.instructions,
        condition:condition||oldMed.condition,
        externalInfo:JSON.parse(externalInfo)||oldMed.externalInfo,
        type:type||oldMed.type
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

    // check if the caller is thas the permssion to edit (will be edited)
    if(OldSchduler.User.toString()!==id){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
    console.log("schduler ",Schduler)
    const jsonSchduler=JSON.parse(Schduler)



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

exports.EditSingleDose=async (req, res) => {

  /** edit singleDose
   * -this api sholud be called when user needs to edit singleDose
   * -the caller must be the med creator or has a permition
   * occuraceId is required
   * - data to be edit
   * ********************************
   * logic
   * ********************************
   * 1- make sure that the caller is the med creator
   * 2- make sure that the med id and shcdule id is valid
   * 3- retrive the ocuurence and edit
   * 
   * 
   * 
   */
  try {

    const {id} =req.id
    let {
    occuraceId,
    MedInfo,
    PlannedDateTime,
    PlannedDose,
    }=req.body

    // check for permison
    const oldOccurance=await Occurance.findById(occuraceId)
    if(oldOccurance.user.toString()!==id){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
    // update 
    oldOccurance.PlannedDateTime=PlannedDateTime||oldOccurance.PlannedDateTime
    oldOccurance.PlannedDose=PlannedDose||oldOccurance.PlannedDose
    oldOccurance.MedInfo={
      strenth:MedInfo.strenth||oldOccurance.MedInfo.strenth,
      unit:MedInfo.unit||oldOccurance.MedInfo.unit,
      quantity:MedInfo.quantity||oldOccurance.MedInfo.quantity,
      instructions:MedInfo.instructions||oldOccurance.MedInfo.instructions,
      condition:MedInfo.condition||oldOccurance.MedInfo.condition,
      type:MedInfo.type||oldOccurance.MedInfo.type,
      name:MedInfo.name||oldOccurance.MedInfo.name,

      
    }
    await oldOccurance.save()
    
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Occurance_Updated")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

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
    MedId
    }=req.body

    // check for permison
    const Medication=await UserMedcation.findById(MedId)
    if(!Medication){
      return errorResMsg(res, 400, req.t("Medication_not_found"));
    }
    if(Medication.user.toString()!==id){
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

exports.SuspendDoses=async (req, res) => {

  /** suspend doses form date to date
   * ********************************
   * logic
   * ********************************
   * -1 retrive all occurences form date to date
   * -2 flage it as suspended
   * 
   * 
   */
  try {

    const {id} =req.id
    let {
    SchdulerId,
    StartDate,
    EndDate
    }=req.body

    // check for permison
    const schduler =await SchdulerSchema.findById(SchdulerId)
    if(!schduler){
      return errorResMsg(res, 400, req.t("Schduler_not_found"));
    }
    if(schduler.User.toString()!==id){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
    
    //retrive all the occurences between two dates and mark them as suspended

    await Occurance.updateMany({
      Schduler:SchdulerId,
      PlannedDateTime:{$gte:StartDate,$lte:EndDate},
    
    },{
      isSuspended:true
    })
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Dose_suspended")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.ChangeDoseStatus=async (req, res) => {

  /** change dose status
   * ********************************
   * logic
   * ********************************
   * -1 get dose by id
   * -2 change its status to the new one
   * **********
   *  0: Status mean it's not yet active (future dose), --defult
   *  1: Status mean it's in Transit (time is here , not yet 60 mins passed), --server action
   *  2: status code means it's taken. , --action by user
   *  3: it's ignored (60 minutes passed no action) --server action
   *  4: status means its rejected
   * 
   */
  try {

    const {id} =req.id
    let {
    OccuranceId,
    Status
    }=req.body

    // check for permison
    const dose =await Occurance.findById(OccuranceId)
    if(!dose){
      return errorResMsg(res, 400, req.t("Dose_not_found"));
    }
    if(dose.user.toString()!==id){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    } 
    console.log(Status)
    if(!(Status==2||Status==4)){
      return errorResMsg(res, 400, req.t("Invalid_status"));
    }

    // edit quantaty
    if(Status==2){
      const Medication=await UserMedcation.findById(dose.Medication)
      Medication.quantity=Medication.quantity-dose.PlannedDose
      await Medication.save()
    }
    // change dose status
    
   dose.Status=Status
    await dose.save()

    

    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Dose_Status_Changed")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};


exports.getDoses=async (req, res) => {

  /** 
   * return doses with a spacic date
   * if no date is provided the defult is today
   * returns not suspended dosages
   * 
   */
  try {

    const {id} =req.id
    let {
    date
    }=req.query

    // get occurances which equal today
    if(!date){
      date=new Date()
    }
    const queryDate =new Date(+date)
  
     let nextDay=new Date(+date)
    nextDay= new Date(nextDay.setDate(nextDay.getDate()+1))
    
    console.log(nextDay,queryDate)

    const doses =await Occurance.find({
      user:id,
      PlannedDateTime:{$gte:queryDate,$lt:nextDay},
      isSuspended:false

    }).select(
      "PlannedDateTime PlannedDose Status Medication Schduler MedInfo _id"
    )
    
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Success"),data:doses});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.getMedication=async (req, res) => {

  /** 
   *return all user mediction 
   * 
   */
  try {

    const {id} =req.id
    const Medication =await UserMedcation.find({
      user:id,

    })
    .populate("Schduler")
    
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Success"),data:Medication});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};


exports.CreateSymtom = async (req, res) => {
 
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
    const profile =await Profile.findById(ProfileID)
    if(!profile){
      return errorResMsg(res, 400, req.t("Profile_not_found"));
    }

    const permissions=await Permissions.findOne({
      Profile:ProfileID,
    })
    if(!permissions){
      return errorResMsg(res, 400, req.t("Permisson_not_found"));
     }

    // check if the user is the owner and has write permission or has a write permission

    if(profile.Owner.User.toString()!==id){
      // check if the user is in viewers array and CanWriteSymptoms is true
      const hasWritePermissonToSymtoms=profile.Viewers.find((viewer)=>{
        return viewer.User.toString()===id&&viewer.CanWriteSymptoms
      })

      if(!hasWritePermissonToSymtoms){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
      
    }
    if(profile.Owner.toString()===id&&!profile.Owner.Permissions.write){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }



    let img
    // store the image to aure
    if(req.files.img[0]){
       img = await UploadFileToAzureBlob(req.files.img[0])
    }
    // store voice record to auzre
    let voice
    if(req.files.voice[0]){
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
      VoiceRecord:voice

    })
    await newSymton.save()
    // who has the right to view that symtom
    // symtom creator
    // profile owner
    // profile viewers
    // permissions.Symptoms.push({
    //   Symptom:newSymton._id,
    //   User:id,
    // })
    // // profile owner
    // permissions.Symptoms.push({
    //   Symptom:newSymton._id,
    //   User:profile.Owner.User._id,
    // })
    // profile viewers
    profile.Viewers.forEach((viewer)=>{
      permissions.Symptoms.push({
        Symptom:newSymton._id,
        User:viewer.User._id,
        Permissions:{
          write:viewer.CanWriteSymptoms
        }
      })
    })
  
    await permissions.save()
    const responseData={
      img:newSymton.img,
      voice,
      Severity,
      Type,
      Description,
      StartedIn,
      
    }
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("symtom_created"),data:responseData});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};