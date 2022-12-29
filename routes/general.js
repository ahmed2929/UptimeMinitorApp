const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/general/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")



router.post(
    "/create/new/med",
    upload.single("img"),
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



module.exports = router;







  