const { check } = require("express-validator");
const Report =require("../../DB/Schema/Report");
const ObjectId = require('mongoose').Types.ObjectId;
const {errorResMsg,successResMsg} =require("../../utils/ResponseHelpers");

exports.getReport = async(req, res, next) => {
    //check if user is the check owner
    try {
      const tage =req.query.tage
      const ReportID=req.params.ReportID;
      if(ReportID!='all'&&!ObjectId.isValid(ReportID)){
        return errorResMsg(res,422,"invalid query") 
      }
      const userID =req.id.id;
      if(ReportID!='all'){
        
      const report=await Report.findById(ObjectId(ReportID))
      if(!report){
       return errorResMsg(res,422,"report not found")
      }
      if(report.owner.toString()!=userID.toString()){
       return errorResMsg(res,401,"Unauthorized request ")
      }
    
     return successResMsg(res,200,report)
    
    
        }
        if(tage){
          const reports = await Report.find()
        .populate('check','tags')
        .lean()
        const filtedAray =reports.filter((elemet=>{
          return elemet.check.tags.includes(tage) 
        }))
       return successResMsg(res,200,filtedAray)
        }

        const reports = await Report.find()
    
       return successResMsg(res,200,reports)
        

    } catch (error) {

      console.log(error)
    }
  
  
  
    
     
  };