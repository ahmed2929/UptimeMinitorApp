const express = require("express");
const router = express.Router();
const ePrescription = require("../Controller/ePrescription/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")


router.post(
    "/create",
    upload.any(),
    IsAuth(),
    ePrescription.CreateEPrescription
);


router.get(
    "/",
    upload.any(),
    IsAuth(),
    ePrescription.GetEPrescription
);






module.exports = router;







  