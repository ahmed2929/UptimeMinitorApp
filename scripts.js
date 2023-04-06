const Viewer =require("./DB/Schema/Viewers")
const mongoose =require("mongoose")
/**
 * im adding new filds to viewer collection but those filds values is bolean and its value will be based on an old fild in the schema
 * based on the following rules 
 * if CanWriteMeds = true will add CanDeleteAllMeds,CanEditAllMeds and set them to true else will add them and set them to false
 * if CanWriteSymptoms =true will add CanDeleteSymptoms,CanEditSymptoms,CanAddSymptoms and set them to true else will add them and set them to false
 * will add CanSuspendDoses and set them to true
 * if CanWriteDoses =true will add CanAddNewDose,CanEditDoses,CanChangeDoseStatus and set them to true else will add them and set them to false
* add +CanShareAllMeds,CanShareAllSymptoms,CanShareAllDoses,CanShareAllInfo and set them to false
*inside every document there will be an array called CanReadSpacificMeds the objects inside this array if CanWrite = true will add CanEdit,CanDelete and set them to true else will add them and set them to false
*add the following fileds CanShareMedInfo,CanShareDosesInfo and set them to false
 */
//Connect to DB

/// update permissions 
Viewer.find({_id:mongoose.Types.ObjectId("642966e7b85357b7116c56aa")}, function(err, viewers) {
  if (err) {
    console.log(err);
  } else {
    viewers.forEach(function(viewer) {
      viewer.CanDeleteAllMeds = viewer.CanWriteMeds === true ? true : false;
      viewer.CanEditAllMeds = viewer.CanWriteMeds === true ? true : false;
      viewer.CanDeleteSymptoms = viewer.CanWriteSymptoms === true ? true : false;
      viewer.CanEditSymptoms = viewer.CanWriteSymptoms === true ? true : false;
      viewer.CanAddSymptoms = viewer.CanWriteSymptoms === true ? true : false;
      viewer.CanSuspendDoses = true;
      viewer.CanAddNewDose = viewer.CanWriteDoses === true ? true : false;
      viewer.CanEditDoses = viewer.CanWriteDoses === true ? true : false;
      viewer.CanChangeDoseStatus = viewer.CanWriteDoses === true ? true : false;
      viewer.CanShareAllMeds = false;
      viewer.CanShareAllSymptoms = false;
      viewer.CanShareAllDoses = false;
      viewer.CanShareAllInfo = false;

    
        for (let i = 0; i < viewer.CanReadSpacificMeds.length; i++) {
          if (viewer.CanReadSpacificMeds[i].CanWrite === true) {
            viewer.CanReadSpacificMeds[i].CanEdit = true;
            viewer.CanReadSpacificMeds[i].CanDelete = true;
          }else{
              viewer.CanReadSpacificMeds[i].CanEdit = false;
              viewer.CanReadSpacificMeds[i].CanDelete = false;
          }
          viewer.CanReadSpacificMeds[i].CanShareMedInfo=false
          viewer.CanReadSpacificMeds[i].CanShareDosesInfo=false
         
        }
      

      viewer.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
});

// update notification

Viewer.find({_id:mongoose.Types.ObjectId("642966e7b85357b7116c56aa")}, function(err, viewers) {
  if (err) {
    console.log(err);
  } else {
    viewers.forEach(function(viewer) {
      viewer.NotificationSettings.DoseNotify30m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.DoseNotify60m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.MedRefile = viewer.notify === true ? true : false;
      viewer.NotificationSettings.NewSymptom = viewer.notify === true ? true : false;
      viewer.NotificationSettings.NewBloodGlucoseReading = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodGlucoseReminder30m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodGlucoseReminder60m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.NewBloodPressureReading = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodPressureReminder30m = viewer.notify === true ? true : false;
      viewer.NotificationSettings.BloodPressureReminder60m = viewer.notify === true ? true : false;
      viewer.save(function(err) {
        if (err) {
          console.log(err);
        }
      });
    });
  }
});
