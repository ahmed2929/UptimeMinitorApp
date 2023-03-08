const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const BloodGlucoseController =require("../Controller/Measurements/BloodGlucose/index")
const BloodPressureController =require("../Controller/Measurements/BloodPressure/index")


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
    upload.fields([{name:"voice",maxCount:1}]),
    IsAuth(),
    BloodGlucoseController.BloodGlucoseMeasurement
);

router.put(
    "/Edit/BloodGlucose",
    upload.fields([{name:"voice",maxCount:1}]),
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

///////////////////////////////////////////BloodPressure////////////////////////////////

router.get(
    "/BloodPressure/get/Scheduler",
    IsAuth(),
    BloodPressureController.getBloodPressureMeasurementScheduler
);


router.post(
    "/BloodPressure/Create/Scheduler",
    IsAuth(),
    BloodPressureController.CreateNewBloodPressureMeasurementScheduler
);

router.put(
    "/BloodPressure/Edit/Scheduler",
    IsAuth(),
    BloodPressureController.EditBloodPressureMeasurementScheduler
)

router.delete(
    "/BloodPressure/Delete/Scheduler",
    IsAuth(),
    BloodPressureController.DeleteBloodPressureMeasurementScheduler
)

router.post(
    "/add/BloodPressure",
    upload.fields([{name:"voice",maxCount:1}]),
    IsAuth(),
    BloodPressureController.BloodPressureMeasurement
);

router.put(
    "/Edit/BloodPressure",
    upload.fields([{name:"voice",maxCount:1}]),
    IsAuth(),
    BloodPressureController.EditBloodPressureMeasurement
)

router.delete(
    "/Delete/BloodPressure",
    IsAuth(),
    BloodPressureController.DeleteBloodPressureMeasurement
)
router.get(
    "/BloodPressure/all",
    IsAuth(),
    BloodPressureController.getAllBloodPressureMeasurement
);

router.get(
    "/BloodPressure",
    IsAuth(),
    BloodPressureController.getBloodPressureMeasurement
);

module.exports = router;
