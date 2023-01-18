const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const DosesController =require("../Controller/Users/Doses/index")


router.put(
    "/edit",
    validation.EditSingleDoseValidation(),
    validation.validate,
    IsAuth(),
    DosesController.EditSingleDose
);

router.post(
    "/suspend",
    validation.SuspendDoseFromDateToDate(),
    validation.validate,
    IsAuth(),
    DosesController.SuspendDoses
);

router.put(
    "/change/status",
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
    "/all",
    IsAuth(),
    DosesController.getAllDoses
);

module.exports = router;
