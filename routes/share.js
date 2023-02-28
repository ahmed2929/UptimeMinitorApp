const express = require("express");
const router = express.Router();
const LinkController = require("../Controller/Share/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization



router.post(
    "/generate/symptom/shareable/link",
    IsAuth(),
    LinkController.GenerateSharableSymptomLink
);




module.exports = router;







  