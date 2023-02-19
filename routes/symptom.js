const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const SymptomController =require("../Controller/Users/Symptom/index")





router.post(
    "/create",
    upload.fields([{name:"img",maxCount:1},{name:"voice",maxCount:1}]),
    validation.CreateNewSymptom(),
    validation.validate,
    IsAuth(),
    SymptomController.CreateSymptom
);

router.put(
    "/edit",
    upload.fields([{name:"img",maxCount:1},{name:"voice",maxCount:1}]),
    IsAuth(),
    SymptomController.EditSymptom
)

router.delete(
    "/delete",
    IsAuth(),
    SymptomController.DeleteSymptom
)


router.get(
    "/",
    IsAuth(),
    SymptomController.getSymptoms
);
router.get(
    "/all",
    IsAuth(),
    SymptomController.getAllSymptoms
);

module.exports = router;
