/**
 * @file controller/ePrescription/index.js
 * @namespace controllers
 * @namespace ePrescription
 * 
 */


const SchedulerSchema = require("../../DB/Schema/Scheduler");
const UserMedication = require("../../DB/Schema/UserMedication");
const {UploadFileToAzureBlob,GenerateOccurrences,GenerateOccurrencesWithDays,CheckRelationShipBetweenCareGiverAndDependent,CompareOldSchedulerWithTheNewScheduler,CheckProfilePermissions} =require("../../utils/HelperFunctions")
const Occurrence = require("../../DB/Schema/Occurrences");
const Viewer =require("../../DB/Schema/Viewers")
const mongoose = require("mongoose");
const Profile =require("../../DB/Schema/Profile")
const {CreateNewScheduler,CreateOccurrences,getMedInfoFromFhirPrescription,getDoseInfoFromFhirPrescription,createMedicationFromFhirPrescription,generateOccurrencesFhir,createSchedulerFromFhirPrescription,generateOccurrencesFhirWithSpecificTimes} =require("../../utils/ControllerHelpers")
const {
  successResMsg,
  errorResMsg
} = require("../../utils/ResponseHelpers");
const ePrescription =require("../../DB/Schema/ePrescription")
const {generateOccurrencesBasedOnFhirScheduler} =require('../../utils/hl7HelperFunctions/index')


// async function generateOccurrencesBasedOnFhirScheduler(ValidateScheduler, Scheduler, ProfileID, MedInfo, newMed, profile, id, viewer) {
//   const occurrences = [];
//   ValidateScheduler.fhir = true;
//   ValidateScheduler.fhirData = JSON.parse(JSON.stringify(Scheduler.fhirData));
//   for await (const dose of JSON.parse(JSON.stringify(Scheduler.fhirData.dosageInstruction))) {
//     let startDate;
//     let endDate;
//     if (dose.timing.repeat.boundsPeriod) {
//       startDate = new Date(+dose.timing.repeat.boundsPeriod.start);
//       endDate = new Date(+dose.timing.repeat.boundsPeriod.end);

//     } else if (dose.timing.repeat.boundsDuration) {
//       startDate = new Date();
//       endDate = new Date();
//       endDate.setDate(startDate.getDate() + dose.timing.repeat.boundsDuration.value);
//     } else {
//       // startDate = new Date()
//       // endDate = new Date()
//       // endDate.setDate(startDate.getDate() + 90)
//     }
//     if (!ValidateScheduler.AsNeeded) {
//       dose.timing.repeat.boundsPeriod = {
//         start: startDate,
//         end: endDate
//       };
//       //Generate occurrences
//       const result = await generateOccurrencesFhir(startDate, endDate, dose, ProfileID, MedInfo, newMed._id, JSON.parse(JSON.stringify(Scheduler.fhirData)));
//       occurrences.push(...result);

//     }



//   }
//   // ValidateScheduler.StartDate will be the start of the first element in the Scheduler.fhirData.dosageInstruction
//   // get first element in Scheduler.fhirData.dosageInstruction
//   if (!ValidateScheduler.AsNeeded) {
//     const firstDoseStartDate = ValidateScheduler.fhirData.dosageInstruction[0].timing.repeat.boundsPeriod.start;
//     const lastDoseEndDate = ValidateScheduler.fhirData.dosageInstruction[ValidateScheduler.fhirData.dosageInstruction.length - 1].timing.repeat.boundsPeriod.end;
//     ValidateScheduler.StartDate = firstDoseStartDate;
//     ValidateScheduler.EndDate = lastDoseEndDate;
//   } else {
//     ValidateScheduler.StartDate = new Date();
//   }



//   await Occurrence.insertMany(occurrences);
//   newMed.Scheduler = ValidateScheduler._id;
//   await ValidateScheduler.save();
//   await newMed.save();

//   // give the med creator full access for that med
//   // if the med creator is the parent make Refile and doses true
//   if (profile.Owner.User == id) {
//     if (viewer) {
//       viewer.CanReadSpacificMeds.push({
//         Med: newMed._id,
//         Refile: true,
//         Doses: true
//       });
//     }

//   } else {
//     if (viewer) {
//       viewer.CanReadSpacificMeds.push({
//         Med: newMed._id
//       });
//       await viewer.save();
//     }

//   }
// }






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
 
       
       
 * 
 */

   exports.CreateEPrescription = async (req, res) => {
 
    try {
  
      const {id} =req.id
      let {
        Medications,
        ProfileID
      }=req.body
      console.log("requestBody **************",req.body)
      console.log("requestBody.Scheduler **************",req.body.Scheduler)
      console.log("requestFiles **************",req.file)
      
      Medications=JSON.parse(Medications)
      
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
         const hasAddMedPermissonToMeds=viewer.CanAddEPrescriptions;
   
         if(!hasAddMedPermissonToMeds){
           return errorResMsg(res, 401, req.t("Unauthorized"));
         }
         
       }

       if(profile.Owner.User._id.toString() === id){
        if(!CheckProfilePermissions(profile,'CanAddEPrescriptions')){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
      }


      //create ePrescription
        const newEPrescription = new ePrescription({
            ProfileID,
            CreatorProfile:viewerProfile._id
        })

      /// create medications

      let index=0;
      for await (const medication of Medications){
      


        let {name,Scheduler,description,strength,unit,quantity,instructions,condition,externalInfo,type,Refillable,RefileLevel,Ringtone}=medication
      
        if(strength==='null'){
            strength=null
          }
          if(unit==='null'){
            unit=null
          }
    
     
      let img
      const imgIndex =req.files.findIndex(({fieldname})=>fieldname===`img${index}`)
      // store the image to azure
      if(req.files[imgIndex]){
         img = await UploadFileToAzureBlob(req.files[imgIndex])
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
        Ringtone,
        ePrescriptionID:newEPrescription._id,
        fhir:true,

        
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
        SchedulerType:Scheduler.ScheduleType,
        
      }
 
     // check if no end date is provided then make GenerateAutoOccurrence to true
      if(!Scheduler.EndDate&&Scheduler.ScheduleType!="1"&&Scheduler.ScheduleType!="4"){
        Scheduler.GenerateAutoOccurrence=true
      }

     // validate Scheduler 
     const ValidateScheduler= await CreateNewScheduler(Scheduler,newMed,id,ProfileID,viewerProfile,req,res)

      // in case 4
        if(ValidateScheduler.ScheduleType=="4"){
          
          await generateOccurrencesBasedOnFhirScheduler(ValidateScheduler, Scheduler, ProfileID, MedInfo, newMed, profile, id, viewer);

        }else{
    // create Occurrences
    const newScheduler= await CreateOccurrences(Scheduler,ValidateScheduler,id,newMed,MedInfo,ProfileID,viewerProfile,req,res)
    
  
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
   
        }


          
     index++;
     newEPrescription.Medications.push(newMed._id)



        }




        await newEPrescription.save()
        
        const populatedEPrescription=await ePrescription.findById(newEPrescription._id)
        .populate({
          path:"Medications",
          populate: {
            path: 'Scheduler',
          },
        
      })
      // return successful response
      return successResMsg(res, 200, {message:req.t("ePrescription_created"),data:populatedEPrescription});
      
    } catch (err) {
      // return error response
      console.log("error is ",err)
      return errorResMsg(res, 500, err);
    }

   
  };



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
 
       
       
 * 
 */

    exports.GetEPrescription = async (req, res) => {
 
      try {
    
        const {id} =req.id
        let {
          ProfileID
        }=req.query
        
      
        const authorized =await CheckRelationShipBetweenCareGiverAndDependent(ProfileID,id)
        if(!authorized){
          return errorResMsg(res, 400, req.t("Unauthorized"));
        }
        const [viewer,profile,viewerProfile]=authorized
  
  
         // check if the user is the owner and has write permission or can add meds
     
         if(profile.Owner.User._id.toString()!==id){
           // check if the user has add med permission
           const hasAddMedPermissonToMeds=viewer.CanReadAllEPrescriptions;
     
           if(!hasAddMedPermissonToMeds){
             return errorResMsg(res, 401, req.t("Unauthorized"));
           }
           
         }
  
         if(profile.Owner.User._id.toString() === id){
          if(!CheckProfilePermissions(profile,'CanReadAllEPrescriptions')){
            return errorResMsg(res, 400, req.t("Unauthorized"));
          }
        }
  
  
      
          const populatedEPrescription=await ePrescription.find({
            ProfileID,
            isDeleted:false,
            Archived:false
          })
          .populate({
            path:"Medications",
            populate: {
              path: 'Scheduler',
            },
          
        })
        // return successful response
        return successResMsg(res, 200, {message:req.t("ePrescription_created"),data:populatedEPrescription});
        
      } catch (err) {
        // return error response
        console.log("error is ",err)
        return errorResMsg(res, 500, err);
      }
  
     
    };  

 