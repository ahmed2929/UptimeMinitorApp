const User = require("../../../DB/Schema/User");
const MedRecommendation = require("../../../DB/Schema/MedRecommendation");
const SchdulerSchema = require("../../../DB/Schema/Schduler");
const Report = require("../../../DB/Schema/Report");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const {UploadFileToAzureBlob,GenerateOccurances,GenerateOccurancesWithDays} =require("../../../utils/HelperFunctions")
const DateTime =require("luxon")
const fs = require('fs');
const Occurance = require("../../../DB/Schema/Occurances");
const mongoose = require("mongoose");
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");
const { json } = require("body-parser");




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

      const regex = new RegExp(escapeRegex(req.query.name), 'gi');
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
      type
    }=req.body

    // store the image
    const img = await UploadFileToAzureBlob(req.file)
   

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
      type

    })
    // create schduler 
    jsonSchduler=JSON.parse(Schduler)

    if(!jsonSchduler.EndDate){
      var result = new Date(jsonSchduler.StartDate);
      result.setMonth(result.getMonth() + 3);
      jsonSchduler.EndDate=result
      
    }


    const newSchduler = new SchdulerSchema({
      medication:newMed._id,
      user:id,
      ...jsonSchduler

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
      OccrurencePattern=jsonSchduler.DaysInterval
    }
    // generate occurences data

    const occuraces=[]
    for(const doseElement of jsonSchduler.dosage){

      const OccurancesData={
        PlannedDose:doseElement.dose
      }
      const start=new Date(doseElement.DateTime)
      
      if(!jsonSchduler.EndDate){

        var result = new Date(baseDate);
        result.setMonth(result.getMonth() + 3);

        end=result
      }else{
        end=new Date(jsonSchduler.EndDate)

      }
   
      
      const newOccurances=await GenerateOccurances(id,newMed._id,newSchduler._id,OccrurencePattern,start,end,OccurancesData)
      occuraces.push(...newOccurances)


    };

    // write occurences to database
    await Occurance.insertMany(occuraces)


 
    

    }else if (jsonSchduler.ScheduleType=='0'){

      // case user choose spacic days
      const occuraces=[]
    for(const doseElement of jsonSchduler.dosage){

      const OccurancesData={
        PlannedDose:doseElement.dose
      }
      const start=new Date(doseElement.DateTime)
      
     
        end=new Date(jsonSchduler.EndDate)

      

      const intervalDays=jsonSchduler.DpacifcDays
      
      const newOccurances=await GenerateOccurancesWithDays(id,newMed._id,newSchduler._id,intervalDays,start,end,OccurancesData)
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

   
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("med_created")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};

exports.EditMed=async (req, res) => {
 
  try {

    const {id} =req.id
    const {
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
      const oldMed=await UserMedcation.findById(MedId);
      if(!oldMed){
        return errorResMsg(res, 404, req.t("schduler_not_found"));
      }
      if(oldMed.user.toString()!==id){
        return errorResMsg(res, 401, req.t("Unauthorized"));
      }
      await UserMedcation.findOneAndUpdate(MedId,{
        img:img||oldMed.img,
        name:name||oldMed.name,
        strenth:strenth||oldMed.strenth,
        description:description||oldMed.description,
        unit:unit||oldMed.unit,
        quantity:quantity||oldMed.quantity,
        instructions:instructions||oldMed.instructions,
        condition:condition||oldMed.condition,
        externalInfo:JSON.parse(externalInfo)||oldMed.externalInfo,
        Schduler:JSON.parse(Schduler)||oldMed.Schduler,
        type:type||oldMed.type
      })


    const OldSchduler = await SchdulerSchema.findById(SchdulerId)
    if(!OldSchduler){
      return errorResMsg(res, 404, req.t("schduler_not_found"));
    }
    if(OldSchduler.user.toString()!==id){
      return errorResMsg(res, 401, req.t("Unauthorized"));
    }
    // saved old schduler into history array and update the new one
   await SchdulerSchema.findByIdAndUpdate(SchdulerId,{
      ...SchdulerData,
      history:[...OldSchduler.history,OldSchduler]
    })
    

   
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("Schdule_Updated")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};