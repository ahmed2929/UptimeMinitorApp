const express = require("express");
const router = express.Router();
const ReportController = require("../Controller/Report/index");
const validation = require("../utils/Validation");
const IsAuth =require('../utils/Authorization').authorization


router.get(
    "/:ReportID",
    IsAuth(),
    ReportController.getReport
);




module.exports = router;