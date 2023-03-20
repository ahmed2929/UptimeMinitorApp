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
    IsAuth(),
    DosesController.SuspendDoses
);
router.get(
    "/active/Suspension",
    IsAuth(),
    DosesController.GetSuspension
);
router.put(
    "/edit/Suspension",
    IsAuth(),
    DosesController.EditSuspension
);
router.post(
    "/unsuspend",
    IsAuth(),
    DosesController.UnSuspend
);


router.post(
    "/take/non/scheduled/dose",
    IsAuth(),
    DosesController.TakeAsNeededDose
)

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
