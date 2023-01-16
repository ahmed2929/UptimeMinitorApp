const express = require("express");
const router = express.Router();
const AutomatedCrones =require("../../Controller/AutomatedCrones/index")

router.post(
    "/change/dose/to/transit",
    AutomatedCrones.ChangeDosesStatusFrom_0_to_1
);

module.exports = router;