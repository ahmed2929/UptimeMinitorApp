const SchedulerSchema = require("../DB/Schema//Scheduler");
const UserMedication = require("../DB/Schema/UserMedication");
const {UploadFileToAzureBlob,GenerateOccurrences,GenerateOccurrencesWithDays,CheckRelationShipBetweenCareGiverAndDependent,GenerateMeasurementOccurrences,GenerateMeasurementOccurrencesWithDays} =require("./HelperFunctions")
const Occurrence = require("../DB/Schema/Occurrences");
const Viewer =require("../DB/Schema/Viewers")
const mongoose = require("mongoose");
const Profile =require("../DB/Schema/Profile")
const MeasurementScheduler =require("../DB/Schema/MeasurementScheduler")
const BloodGlucose =require("../DB/Schema/BloodGlucoseManualMeasurement")
const BloodPressure =require("../DB/Schema/BloodPressureManualMeasurement")
const {
  successResMsg,
  errorResMsg
} = require("./ResponseHelpers");


const CreateNewScheduler=async(jsonScheduler,newMed,id,ProfileID,viewerProfile,req,res)=>{
    try {

        // validate schedule data
 if(!jsonScheduler.StartDate){
    return errorResMsg(res, 400, req.t("start_date_required"));
  }
  // check if StartDate in the past 
  
  let DateTime = new Date((new Date()).getTime() - (60*60*24*1000))
  //DateTime.setDate(DateTime.getDate() - 1);
  console.log(DateTime , new Date(+jsonScheduler.StartDate))
  // if((+jsonScheduler.StartDate)<DateTime.getTime()){
  //   return errorResMsg(res, 400, req.t("start_date_in_the_past"));
  // }
  if(jsonScheduler.ScheduleType!="1"&&jsonScheduler.ScheduleType!="2"&&
    jsonScheduler.ScheduleType!="3"&&jsonScheduler.ScheduleType.toString()!="0"){
      return errorResMsg(res, 400, req.t("invalid_schedule_type"));
    }

  if(jsonScheduler.EndDate){
    // if((+jsonScheduler.EndDate)<DateTime.getTime()){
    //   return errorResMsg(res, 400, req.t("end_date_in_the_past"));
    // }

    if((+jsonScheduler.EndDate)<(+jsonScheduler.StartDate)){
      return errorResMsg(res, 400, req.t("end_date_before_start_date"));
    }


  }
// validate dose if its not as needed
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


  if(!jsonScheduler.EndDate){
    if(new Date(jsonScheduler.StartDate)<new Date()){
      var result = new Date();
      result.setMonth(result.getMonth() + 3);
      jsonScheduler.EndDate=result  
    }else{
      var result = new Date(jsonScheduler.StartDate);
      result.setMonth(result.getMonth() + 3);
      jsonScheduler.EndDate=result
    }
  
    
  }


  const newScheduler = new SchedulerSchema({
    medication:newMed._id,
    User:id,
    ...jsonScheduler
    ,
    ProfileID,
    CreatorProfile:viewerProfile._id

  })
  return newScheduler




    } catch (error) {
        console.log(error)
        return errorResMsg(res, 500, req.t("internal_server_error"));
    }
 
  




}


const CreateNewMeasurementScheduler=async(jsonScheduler,ProfileID,viewerProfile,req,res)=>{
  try {

      // validate schedule data
if(!jsonScheduler.StartDate){
  return errorResMsg(res, 400, req.t("start_date_required"));
}
// check if StartDate in the past 

let DateTime = new Date((new Date()).getTime() - (60*60*24*1000))
//DateTime.setDate(DateTime.getDate() - 1);
console.log(DateTime , new Date(+jsonScheduler.StartDate))
// if((+jsonScheduler.StartDate)<DateTime.getTime()){
//   return errorResMsg(res, 400, req.t("start_date_in_the_past"));
// }
if(jsonScheduler.ScheduleType!="2"&&
  jsonScheduler.ScheduleType!="3"&&jsonScheduler.ScheduleType.toString()!="0"){
    return errorResMsg(res, 400, req.t("invalid_schedule_type"));
  }

if(jsonScheduler.EndDate){
  // if((+jsonScheduler.EndDate)<DateTime.getTime()){
  //   return errorResMsg(res, 400, req.t("end_date_in_the_past"));
  // }

  if((+jsonScheduler.EndDate)<(+jsonScheduler.StartDate)){
    return errorResMsg(res, 400, req.t("end_date_before_start_date"));
  }


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


if(!jsonScheduler.EndDate){
  if(new Date(jsonScheduler.StartDate)<new Date()){
    var result = new Date();
    result.setMonth(result.getMonth() + 3);
    jsonScheduler.EndDate=result  
  }else{
    var result = new Date(jsonScheduler.StartDate);
    result.setMonth(result.getMonth() + 3);
    jsonScheduler.EndDate=result
  }

  
}


const newScheduler = new MeasurementScheduler({
    ...jsonScheduler,
    ProfileID,
    CreatorProfile:viewerProfile._id

})
return newScheduler




  } catch (error) {
      console.log(error)
      return errorResMsg(res, 500, req.t("internal_server_error"));
  }






}

const CreateMeasurementsOccurrences=async(jsonScheduler,newScheduler,ProfileID,viewerProfile,req,res,editApi)=>{
  
  // create Occurrences
      /**
       *  -date and time are represented in ms format
       *  -med take time is extracted from startDate ms 
       * -start date must be provided , the api consumer must provide startDate with the chosen time
       * -if then no endDate then the default is date.now()+3 months
       * -the default pattern is every day with occurrence pattern 1 means everyday (case 1)
       * -if the user proviced occurrence pattern n(2,3,4 ...etc) means the generated occurrences evry n days (case 2)
       * -case 3 when user choose spacifc days to run the interval
       * - for case 1 and 2 run GenerateOccurrences function which takes (userID,medId,SchedulerId,occurrencePattern,startDate,endDate,OccurrencesData) as
       * parametars and returns array of objects wich reprisints occurrence valid object
       * - then write the ocuurences in the database
       * 
       * 
       */
  
      // get get start and end date
      try {

        let startDate=newScheduler.StartDate
        let endDate=newScheduler.EndDate
        let occurrencePattern;
        if(!startDate){
          return errorResMsg(res, 400, req.t("start_date_required"));
          
        }
      
        // get Scheduler  
        if(!newScheduler.ScheduleType&&newScheduler.ScheduleType!=0){
          return errorResMsg(res, 400, req.t("Scheduler_type_required"));
          
        }
        // get occurrence pattern
        // the fowllowing code must rurns in case 2 and 3 only
        if(newScheduler.ScheduleType=='2'||newScheduler.ScheduleType=='3'){
    
        //case every day
        if(newScheduler.ScheduleType=='2'){ 
          occurrencePattern=1
        }else if(newScheduler.ScheduleType=='3'){ //case days interval
          occurrencePattern= Number(newScheduler.DaysInterval)
        }
        // generate occurrences data
    
        const occurrences=[]
        
        for await (frequency of newScheduler.frequencies){

          let startDate = new Date(+newScheduler.StartDate);
          let DoseTime = new Date(+frequency.DateTime);
          console.log("StartDate",startDate)
          console.log("json startdate",+newScheduler.StartDate)
          if(editApi){
            const today=new Date()
            today.setHours(0, 0, 0, 0);

            if(startDate<today){
              startDate=today

          let hours = DoseTime.getHours();
          let minutes = DoseTime.getMinutes();
          let seconds = DoseTime.getSeconds();

          startDate.setHours(hours);
          startDate.setMinutes(minutes);
          startDate.setSeconds(seconds);

            }

            }else{
              startDate=new Date(+frequency.DateTime);
            }





          const OccurrencesData={
            ProfileID,
            MeasurementScheduler:newScheduler._id,
            CreatorProfile:viewerProfile._id,
            MeasurementType:newScheduler.MeasurementType,
           
          }
          const start=new Date(startDate)
          let end;
          if(!newScheduler.EndDate){
            var result
            if(new Date(jsonScheduler.StartDate)<new Date()){
               result = new Date();
              result.setMonth(result.getMonth() + 3);
              jsonScheduler.EndDate=result  
            }else{
               result = new Date(jsonScheduler.StartDate);
              result.setMonth(result.getMonth() + 3);
              jsonScheduler.EndDate=result
            }
    
            end=result
          }else{
            end=new Date(newScheduler.EndDate)
    
          }
          
          console.log("start date will be ", start)
          
          const newOccurrences=await GenerateMeasurementOccurrences(occurrencePattern,start,end,OccurrencesData,req,res)
          occurrences.push(...newOccurrences);

        }

           // write occurrences to database
           if(newScheduler.MeasurementType===0){
            await BloodGlucose.insertMany(occurrences)
          }
          else if(newScheduler.MeasurementType===1){
            await BloodPressure.insertMany(occurrences)
          }
  
  
        
        
    
        }else if (newScheduler.ScheduleType=='0'||newScheduler.ScheduleType==0){
    
          // case user choose specific days
          const occurrences=[]
          
          for await (frequency of newScheduler.frequencies){
            let startDate = new Date(+newScheduler.StartDate);
            let DoseTime = new Date(+frequency.DateTime);
            console.log("StartDate",startDate)
            console.log("json startdate",+newScheduler.StartDate)
            if(editApi){
              const today=new Date()
              today.setHours(0, 0, 0, 0);
  
              if(startDate<today){
                startDate=today
  
            let hours = DoseTime.getHours();
            let minutes = DoseTime.getMinutes();
            let seconds = DoseTime.getSeconds();
  
            startDate.setHours(hours);
            startDate.setMinutes(minutes);
            startDate.setSeconds(seconds);
  
              }
  
              }else{
                startDate=new Date(+frequency.DateTime);
              }
  
  
  
  
            const OccurrencesData={
              ProfileID,
              MeasurementScheduler:newScheduler._id,
              CreatorProfile:viewerProfile._id,
              MeasurementType:newScheduler.MeasurementType,
            
            }
            const start=new Date(startDate)
            
            let end;
            if(!newScheduler.EndDate){
              var result
              if(new Date(jsonScheduler.StartDate)<new Date()){
                result = new Date();
               result.setMonth(result.getMonth() + 3);
               jsonScheduler.EndDate=result  
             }else{
                result = new Date(jsonScheduler.StartDate);
               result.setMonth(result.getMonth() + 3);
               jsonScheduler.EndDate=result
             }
   
      
              end=result
            }else{
              end=new Date(newScheduler.EndDate)
      
            }
              EndOfCycle=new Date(end)
      
            
      
            const intervalDays=newScheduler.SpecificDays
            
            const newOccurrences=await GenerateMeasurementOccurrencesWithDays(intervalDays,start,EndOfCycle,OccurrencesData)
            occurrences.push(...newOccurrences)
      
          }

        // write occurrences to database
        if(newScheduler.MeasurementType===0){
          await BloodGlucose.insertMany(occurrences)
        }
        else if(newScheduler.MeasurementType===1){
          await BloodPressure.insertMany(occurrences)
        }

    
    
        }
        // var endAfter3Month = new Date(startDate);
        // endAfter3Month .setMonth(endAfter3Month .getMonth() + 3);
        // newScheduler.EndDate=jsonScheduler.EndDate||endAfter3Month
        return newScheduler;

        
      } catch (error) {
        console.log(error)
        return errorResMsg(res, 500, req.t("internal_server_error"));
      }
   
      
}



const CreateOccurrences=async(jsonScheduler,newScheduler,id,newMed,MedInfo,ProfileID,viewerProfile,req,res,editApi)=>{
  console.log("jsonScheduler",jsonScheduler.dosage) 
  console.log("newScheduler",newScheduler.dosage)  
  // create Occurrences
      /**
       *  -date and time are represented in ms format
       *  -med take time is extracted from startDate ms 
       * -start date must be provided , the api consumer must provide startDate with the chosen time
       * -if then no endDate then the default is date.now()+3 months
       * -the default pattern is every day with occurrence pattern 1 means everyday (case 1)
       * -if the user proviced occurrence pattern n(2,3,4 ...etc) means the generated occurrences evry n days (case 2)
       * -case 3 when user choose spacifc days to run the interval
       * - for case 1 and 2 run GenerateOccurrences function which takes (userID,medId,SchedulerId,occurrencePattern,startDate,endDate,OccurrencesData) as
       * parametars and returns array of objects wich reprisints occurrence valid object
       * - then write the ocuurences in the database
       * 
       * 
       */
  
      // get get start and end date
      try {

        let startDate=newScheduler.StartDate
        let endDate=newScheduler.EndDate
        let occurrencePattern;
        if(!startDate){
          return errorResMsg(res, 400, req.t("start_date_required"));
          
        }
      
        // get scheuler senario 
        if(!newScheduler.ScheduleType&&newScheduler.ScheduleType!=0){
          return errorResMsg(res, 400, req.t("Scheduler_type_required"));
          
        }
        // get occurrence pattern
        // the fowllowing code must rurns in case 2 and 3 only
        if(newScheduler.ScheduleType=='2'||newScheduler.ScheduleType=='3'){
    
        //case every day
        if(newScheduler.ScheduleType=='2'){ 
          occurrencePattern=1
        }else if(newScheduler.ScheduleType=='3'){ //case days interval
          occurrencePattern= Number(newScheduler.DaysInterval)
        }
        // generate occurrences data
    
        const occurrences=[]
        for(const doseElement of newScheduler.dosage){
          
          let startDate = new Date(+newScheduler.StartDate);
          let DoseTime = new Date(+doseElement.DateTime);
          console.log("StartDate",startDate)
          console.log("json startdate",+newScheduler.StartDate)
          if(editApi){
            const today=new Date()
            today.setHours(0, 0, 0, 0);

            if(startDate<today){
              startDate=today

          let hours = DoseTime.getHours();
          let minutes = DoseTime.getMinutes();
          let seconds = DoseTime.getSeconds();

          startDate.setHours(hours);
          startDate.setMinutes(minutes);
          startDate.setSeconds(seconds);

            }

            }else{
              startDate=new Date(+doseElement.DateTime);
            }




          const OccurrencesData={
            PlannedDose:doseElement.dose,
            ProfileID,
            DosageID:doseElement._id,
            Scheduler:newScheduler._id,
            CreatorProfile:viewerProfile._id,
            Ringtone:newMed.Ringtone
          }
          const start=new Date(startDate)
          let end;
          if(!newScheduler.EndDate){
            var result
            if(new Date(jsonScheduler.StartDate)<new Date()){
               result = new Date();
              result.setMonth(result.getMonth() + 3);
              jsonScheduler.EndDate=result  
            }else{
               result = new Date(jsonScheduler.StartDate);
              result.setMonth(result.getMonth() + 3);
              jsonScheduler.EndDate=result
            }
    
            end=result
          }else{
            end=new Date(newScheduler.EndDate)
    
          }
          
          console.log("srart date will be ", start)
          
          const newOccurrences=await GenerateOccurrences(id,newMed._id,MedInfo,newScheduler._id,occurrencePattern,start,end,OccurrencesData,req,res)
          occurrences.push(...newOccurrences);
    
    
        };
    
        // write occurrences to database
        await Occurrence.insertMany(occurrences)
    
    
     
        
    
        }else if (newScheduler.ScheduleType=='0'||newScheduler.ScheduleType==0){
    
          // case user choose specific days
          const occurrences=[]
        for(const doseElement of newScheduler.dosage){
          let startDate = new Date(+newScheduler.StartDate);
          let DoseTime = new Date(+doseElement.DateTime);

          if(editApi){
            const today=new Date()
            today.setHours(0, 0, 0, 0);

            if(startDate<today){
              startDate=today

          let hours = DoseTime.getHours();
          let minutes = DoseTime.getMinutes();
          let seconds = DoseTime.getSeconds();

          startDate.setHours(hours);
          startDate.setMinutes(minutes);
          startDate.setSeconds(seconds);

            }

            }else{
              startDate=new Date(+doseElement.DateTime);
            }

          const OccurrencesData={
            PlannedDose:doseElement.dose,
            ProfileID,
            CreatorProfile:viewerProfile._id,
            DosageID:doseElement._id,
            Scheduler:newScheduler._id,
            Ringtone:newMed.Ringtone
          }
          const start=new Date(startDate)
          
          let end;
          if(!newScheduler.EndDate){
            var result
            if(new Date(jsonScheduler.StartDate)<new Date()){
              result = new Date();
             result.setMonth(result.getMonth() + 3);
             jsonScheduler.EndDate=result  
           }else{
              result = new Date(jsonScheduler.StartDate);
             result.setMonth(result.getMonth() + 3);
             jsonScheduler.EndDate=result
           }
 
    
            end=result
          }else{
            end=new Date(newScheduler.EndDate)
    
          }
            EndOfCycle=new Date(end)
    
          
    
          const intervalDays=newScheduler.SpecificDays
          
          const newOccurrences=await GenerateOccurrencesWithDays(id,newMed._id,MedInfo,newScheduler._id,intervalDays,start,EndOfCycle,OccurrencesData)
          occurrences.push(...newOccurrences)
    
    
        };
    
        // write occurrences to database
        await Occurrence.insertMany(occurrences)
    
    
    
        }else if(newScheduler.ScheduleType=='1'){
          // as needed
          newScheduler.AsNeeded=true
    
        }
        // var endAfter3Month = new Date(startDate);
        // endAfter3Month .setMonth(endAfter3Month .getMonth() + 3);
        // newScheduler.EndDate=jsonScheduler.EndDate||endAfter3Month
        return newScheduler;

        
      } catch (error) {
        console.log(error)
        return errorResMsg(res, 500, req.t("internal_server_error"));
      }
   
      
}


module.exports={
    CreateNewScheduler,
    CreateOccurrences,
    CreateNewMeasurementScheduler,
    CreateMeasurementsOccurrences
}