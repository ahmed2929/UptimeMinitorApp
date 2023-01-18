const express = require("express");
const router = express.Router();
const IsAuth  =require('../utils/Authorization').authorization
const ReportController =require("../Controller/Users/Reports/index")


router.get(
    "/",
    IsAuth(),
    ReportController.getReport
);

router.get(
    "/single/med/report",
    IsAuth(),
    ReportController.getReportSingleMed
);





module.exports = router;







  