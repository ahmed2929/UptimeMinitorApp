const User = require("../../../DB/Schema/User");
const MedRecommendation = require("../../../DB/Schema/MedRecommendation");
const SchdulerSchema = require("../../../DB/Schema/Schduler");
const Report = require("../../../DB/Schema/Report");
const UserMedcation = require("../../../DB/Schema/UserMedcation");
const {UploadFileToAzureBlob} =require("../../../utils/HelperFunctions")
const fs = require('fs');
const mongoose = require("mongoose");
const {
  successResMsg,
  errorResMsg
} = require("../../../utils/ResponseHelpers");




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
    const newSchduler = new SchdulerSchema({
      medication:newMed._id,
      user:id,
      ...jsonSchduler

    })
    // create Occurances

    // fuction to create new Occurances takes the schduler and the med and user and return array of valid mongo occrurences schema
    const newReport = new Report({
      medication:newMed._id,
      user:id,
      schduler:newSchduler._id,
      amount:quantity

    })
    newMed.Schduler=newSchduler._id
    await newSchduler.save()
    await newReport.save()
    await newMed.save()


    
    
   
    // return succesfull response
    return successResMsg(res, 200, {message:req.t("med_created")});
    
  } catch (err) {
    // return error response
    console.log(err)
    return errorResMsg(res, 500, err);
  }
};
exports.EditSchduler= async (req, res) => {
 
  try {

    const {id} =req.id
    const {
      SchdulerData,
      SchdulerId
    }=req.body

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