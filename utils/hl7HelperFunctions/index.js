const SchedulerSchema = require("../../DB/Schema/Scheduler");
const UserMedication = require("../../DB/Schema/UserMedication");
const {UploadFileToAzureBlob,GenerateOccurrences,GenerateOccurrencesWithDays,CheckRelationShipBetweenCareGiverAndDependent,CompareOldSchedulerWithTheNewScheduler,CheckProfilePermissions} =require("../HelperFunctions")
const Occurrence = require("../../DB/Schema/Occurrences");
const Viewer =require("../../DB/Schema/Viewers")
const mongoose = require("mongoose");
const Profile =require("../../DB/Schema/Profile")
const {CreateNewScheduler,CreateOccurrences,getMedInfoFromFhirPrescription,getDoseInfoFromFhirPrescription,createMedicationFromFhirPrescription,generateOccurrencesFhir,createSchedulerFromFhirPrescription,generateOccurrencesFhirWithSpecificTimes} =require("../ControllerHelpers")
const {
  successResMsg,
  errorResMsg
} = require("../ResponseHelpers");
const ePrescription =require("../../DB/Schema/ePrescription")



async function generateOccurrencesBasedOnFhirScheduler(ValidateScheduler, Scheduler, ProfileID, MedInfo, newMed, profile, id, viewer) {
    const occurrences = [];
    ValidateScheduler.fhir = true;
    ValidateScheduler.fhirData = JSON.parse(JSON.stringify(Scheduler.fhirData));
    if(!ValidateScheduler.AsNeeded){
      for await (const dose of ValidateScheduler.fhirData.dosageInstruction) {
        const { startDate, endDate } = getStartAndEndDate(dose.timing.repeat,dose);
        dose.timing.repeat.boundsPeriod = {
          start: startDate,
          end: endDate
        };
        const result = await generateOccurrencesForDose(startDate, endDate, dose, ProfileID, MedInfo, newMed._id, JSON.parse(JSON.stringify(Scheduler.fhirData)));
        occurrences.push(...result);
  
      }
      const { firstDoseStartDate, lastDoseEndDate } = getFirstAndLastDoseDates(ValidateScheduler.fhirData.dosageInstruction);
      ValidateScheduler.StartDate = firstDoseStartDate;
      ValidateScheduler.EndDate = lastDoseEndDate;
    }else{
      ValidateScheduler.StartDate = ValidateScheduler.StartDate?ValidateScheduler.StartDate:new Date();
    }
  
     
    await insertOccurrences(occurrences);
    await updateMedAndScheduler(ValidateScheduler, newMed);
    await addMedAccessPermissions(viewer, id, newMed, profile);
  }
  
  function getStartAndEndDate(repeat,dose) {
    let startDate;
    let endDate;
  
    if (repeat.boundsPeriod && repeat.boundsPeriod.start ) {
      startDate = new Date(+repeat.boundsPeriod.start);
  
    if(repeat.boundsPeriod.end){
      endDate = new Date(+repeat.boundsPeriod.end);
    }else{
      endDate = new Date();
      endDate.setDate(startDate.getDate() + 90);
      dose.GenerateAutoOccurrence=true
  
    }
    } else if (repeat.boundsDuration&&repeat.boundsDuration.value) {
      startDate = new Date();
      endDate = new Date();
      endDate.setDate(startDate.getDate() + repeat.boundsDuration.value);//only days 
    } else {
      startDate = new Date();
      endDate = new Date();
      endDate.setDate(startDate.getDate() + 90);
      dose.GenerateAutoOccurrence=true
    }
  
    if (endDate < startDate) {
      throw new Error("Invalid dates: endDate is before startDate.");
    }
  
    return { startDate, endDate };
  }
  
  function getFirstAndLastDoseDates(dosageInstruction) {
    const firstDoseStartDate = dosageInstruction[0].timing.repeat.boundsPeriod.start;
    const lastDoseEndDate = dosageInstruction[dosageInstruction.length - 1].timing.repeat.boundsPeriod.end;
    return { firstDoseStartDate, lastDoseEndDate };
  }
  
  async function generateOccurrencesForDose(startDate, endDate, dose, ProfileID, MedInfo, newMedId, fhirData) {
    return await generateOccurrencesFhir(startDate, endDate, dose, ProfileID, MedInfo, newMedId, JSON.parse(JSON.stringify(fhirData)));
  }
  
  async function insertOccurrences(occurrences) {
    await Occurrence.insertMany(occurrences);
  }
  
  async function updateMedAndScheduler(ValidateScheduler, newMed) {
    newMed.Scheduler = ValidateScheduler._id;
    await ValidateScheduler.save();
    await newMed.save();
  }
  
  async function addMedAccessPermissions(viewer, id, newMed, profile) {
    if (viewer) {
      if (profile.Owner.User == id) {
        viewer.CanReadSpacificMeds.push({
          Med: newMed._id,
          Refile: true,
          Doses: true
        });
      } else {
        viewer.CanReadSpacificMeds.push({
          Med: newMed._id
        });
        await viewer.save();
      }
    }
  }

  
  module.exports={
    generateOccurrencesBasedOnFhirScheduler
}