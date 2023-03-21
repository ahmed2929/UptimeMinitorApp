
const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const MedicationController =require("../Controller/Users/Medication/index")



router.post(
    "/create/new/med",
    upload.single("img"),
    validation.CreateNewMed(),
    validation.validate,
    IsAuth(),
    MedicationController.CreateNewMed
);

router.post(
    "/create/new/med/fhir",
    IsAuth(),
    MedicationController.CreateNewMedFhir
);


router.put(
    "/edit/med",
    upload.single("img"),
    validation.EditMed(),
    validation.validate,
    IsAuth(),
    MedicationController.EditMed
);



router.delete(
    "/delete/medication/cycle",
    IsAuth(),
    MedicationController.deleteMedicationCycle
);


router.get(
    "/",
    IsAuth(),
    MedicationController.getMedication
);
















module.exports = router;