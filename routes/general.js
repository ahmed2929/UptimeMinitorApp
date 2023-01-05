const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/general/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")



router.post(
    "/create/new/med",
    upload.single("img"),
    validation.CreateNewMed(),
    validation.validate,
    IsAuth(),
    userController.CreateNewMed
);

router.put(
    "/edit/med",
    upload.single("img"),
    IsAuth(),
    userController.EditMed
);

router.put(
    "/edit/dose",
    validation.EditSingleDoseValidation(),
    validation.validate,
    IsAuth(),
    userController.EditSingleDose
);

router.delete(
    "/delete/midication/cycle",
    IsAuth(),
    userController.deletMedictionCycle
);

router.post(
    "/suspend/dose",
    validation.SuspendDoseFromDateToDate(),
    validation.validate,
    IsAuth(),
    userController.SuspendDoses
);


router.put(
    "/changeLanguage",
    validation.changeLanguage(),
    validation.validate,
    IsAuth(),
    userController.ChangeUserDefultLang
);

router.put(
    "/change/dose/status",
    validation.ChangeDoseStatus(),
    validation.validate,
    IsAuth(),
    userController.ChangeDoseStatus
);

router.get(
    "/doses",
    IsAuth(),
    userController.getDoses
);

router.get(
    "/medications",
    IsAuth(),
    userController.getMedication
);



router.get(
    "/search",
    userController.SerachForMed
);

router.post(
    "/create/new/symtom",
    upload.fields([{name:"img",maxCount:1},{name:"voice",maxCount:1}]),
    IsAuth(),
    userController.CreateSymtom
);

router.get(
    "/symtoms",
    IsAuth(),
    userController.getSymtoms
);




module.exports = router;







  