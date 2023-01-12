const express = require("express");
const router = express.Router();
const generalController = require("../Controller/Users/general/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const MedicationController =require("../Controller/Users/Medication/index")
const DosesController =require("../Controller/Users/Doses/index")
const SymptomController =require("../Controller/Users/Symptom/index")
const ReportController =require("../Controller/Users/Reports/index")
router.post(
    "/create/new/med",
    upload.single("img"),
    validation.CreateNewMed(),
    validation.validate,
    IsAuth(),
    MedicationController.CreateNewMed
);

router.put(
    "/edit/med",
    upload.single("img"),
    IsAuth(),
    MedicationController.EditMed
);

router.put(
    "/edit/dose",
    validation.EditSingleDoseValidation(),
    validation.validate,
    IsAuth(),
    DosesController.EditSingleDose
);

router.delete(
    "/delete/midication/cycle",
    IsAuth(),
    MedicationController.deletMedictionCycle
);

router.post(
    "/suspend/dose",
    validation.SuspendDoseFromDateToDate(),
    validation.validate,
    IsAuth(),
    DosesController.SuspendDoses
);


router.put(
    "/changeLanguage",
    validation.changeLanguage(),
    validation.validate,
    IsAuth(),
    generalController.ChangeUserDefaultLang
);

router.put(
    "/change/dose/status",
    validation.ChangeDoseStatus(),
    validation.validate,
    IsAuth(),
    DosesController.ChangeDoseStatus
);

router.get(
    "/doses",
    IsAuth(),
    DosesController.getDoses
);

router.get(
    "/medications",
    IsAuth(),
    MedicationController.getMedication
);



router.get(
    "/search",
    generalController.SearchForMed
);

router.post(
    "/create/new/symtom",
    upload.fields([{name:"img",maxCount:1},{name:"voice",maxCount:1}]),
    IsAuth(),
    SymptomController.CreateSymptom
);

router.get(
    "/symtoms",
    IsAuth(),
    SymptomController.getSymptoms
);

router.get(
    "/report",
    IsAuth(),
    ReportController.getReport
);

router.get(
    "/single/med/report",
    IsAuth(),
    ReportController.getReportSingleMed
);

router.get(
    "/doses/all",
    IsAuth(),
    DosesController.getAllDoses
);




module.exports = router;







  