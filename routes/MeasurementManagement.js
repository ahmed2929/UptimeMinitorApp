const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const BloodGlucoseController =require("../Controller/Measurements/BloodGlucose/index")

router.get(
    "/BloodGlucose/get/Scheduler",
    IsAuth(),
    BloodGlucoseController.getBloodGlucoseMeasurementScheduler
);


router.post(
    "/BloodGlucose/Create/Scheduler",
    IsAuth(),
    BloodGlucoseController.CreateNewBloodGlucoseMeasurementScheduler
);

router.put(
    "/BloodGlucose/Edit/Scheduler",
    IsAuth(),
    BloodGlucoseController.EditBloodGlucoseMeasurementScheduler
)

router.delete(
    "/BloodGlucose/Delete/Scheduler",
    IsAuth(),
    BloodGlucoseController.DeleteGlucoseMeasurementScheduler
)

router.post(
    "/add/BloodGlucose",
    IsAuth(),
    BloodGlucoseController.BloodGlucoseMeasurement
);

router.put(
    "/Edit/BloodGlucose",
    IsAuth(),
    BloodGlucoseController.EditBloodGlucoseMeasurement
)

router.delete(
    "/Delete/BloodGlucose",
    IsAuth(),
    BloodGlucoseController.DeleteBloodGlucoseMeasurement
)
router.get(
    "/BloodGlucose/all",
    IsAuth(),
    BloodGlucoseController.getAllBloodGlucoseMeasurement
);

router.get(
    "/BloodGlucose",
    IsAuth(),
    BloodGlucoseController.getBloodGlucoseMeasurement
);

module.exports = router;
