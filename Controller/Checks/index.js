const jwt = require("jsonwebtoken");
const eventEmitter = require("../../config/EventHandler");
const Check = require("../../DB/Schema/Check");
const Report = require("../../DB/Schema/Report");
const {errorResMsg,successResMsg} =require("../../utils/ResponseHelpers");
const mongoose = require('mongoose');

exports.CreateNewCheck =async (req, res, next) => {
    try {
        const check =await Check.findOne({
            $and: [
              { url: req.body.url },
              { path: req.body.path },
              { owner: req.id.id },
            ],
          }
          )
          if(check){
            return errorResMsg(res,422,"you already created a check for this url")
          }
        
          const NewCheckData={
            owner:mongoose.Types.ObjectId(req.id),
            ...req.body
          }
        
        
          const NewCheck= new Check({
            ...NewCheckData
          })
        await NewCheck.save()
        const newReport = new Report({
            owner:mongoose.Types.ObjectId(req.id),
            check:NewCheck._id
        })
        await newReport.save()
        eventEmitter.emit('CheckCreated',NewCheck)
        return successResMsg(res,201,{message:"check has been created ",data:{id:NewCheck._id}})

    } catch (error) {
        console.log(error)
        next(error)
        
    }

   
  
  
 
    
};

exports.EditCheck = async(req, res, next) => {
  try {
    const {CheckID,name,url,protocol,path,port,timeout,interval,threshold,authentication,httpHeaders,assert,tags,ignoreSSL} =req.body
    const userID=req.id.id
    
  const CheckData= await Check.findById(CheckID);

    if(!CheckData){
        return errorResMsg(res,422,"check not found")
    }
    console.log('logger'.CheckData)
    //console.log('logger'.CheckData.owner.toString() ,userID.toString())
    if(CheckData.owner.toString()!=userID.toString()){
       return errorResMsg(res,401,"Unauthorized request ")
    }
      // send event to edit interval

      //updated value or keep the old

    CheckData.name=name||CheckData.name
    CheckData.url=url||CheckData.url
    CheckData.protocol=protocol||CheckData.protocol
    CheckData.path=path||CheckData.path
    CheckData.port=port||CheckData.port
    CheckData.timeout=timeout||CheckData.timeout
    CheckData.interval=interval||CheckData.interval
    CheckData.threshold=threshold||CheckData.threshold
    CheckData.authentication=authentication||CheckData.authentication
    CheckData.httpHeaders=httpHeaders||CheckData.httpHeaders
    CheckData.assert=assert||CheckData.assert
    CheckData.tags=tags||CheckData.tags
    CheckData.ignoreSSL=ignoreSSL||CheckData.ignoreSSL

    await CheckData.save()
    eventEmitter.emit('CheckUpdated',CheckData)
    successResMsg(res,202,"Check has been updated")
       
  } catch (error) {
    next(error)
  }
 
};

exports.deleteCheck = async(req, res, next) => {
  //check if user is the check owner
  try {
    const {CheckID} =req.body
  const userID =req.id.id
  const check = await Check.findById(CheckID);
  if(!check){
   return errorResMsg(res,422,"check not found")
  }
  if(check.owner.toString()!=userID.toString()){
   return errorResMsg(res,401,"Unauthorized request ")

  }
  await Report.findOneAndDelete({Check:CheckID})
  const deledtedCheck =await Check.findByIdAndDelete(CheckID);
  eventEmitter.emit('CheckDeleted',check)
  successResMsg(res,202,'check has been deleted');
  } catch (error) {
    next(error)
  }
  

 
};

exports.getCheck = async(req, res, next) => {
  //check if user is the check owner
  const CheckID=req.params.id;
  const userID =req.id.id;
  const tage =req.query.tage
  console.log("from check",CheckID,userID,tage)
  if(CheckID!='all'&&!mongoose.Types.ObjectId.isValid(CheckID)){
    return errorResMsg(res,422,"invalid query") 
  }

  if(CheckID!=='all'){
  const check=await Check.findById(CheckID)
  if(!check){
    errorResMsg(res,422,"check not found")
  }
  if(check.owner.toString()!=userID.toString()){
    errorResMsg(res,401,"Unauthorized request ")
  }
  const returnedCheckData={
    ...check
  }
  delete returnedCheckData.owner
  successResMsg(res,200,check,returnedCheckData)


    }

  if(tage){
    const checks = await Check.find()
    .lean()
    const filtedAray =checks.filter((elemet=>{
      return elemet.tags.includes(tage) 
    }))
   return successResMsg(res,200,filtedAray)
  }



    const checks = await Check.find({owner:userID})

    successResMsg(res,200,checks)


  
   
};

