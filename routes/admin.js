const express = require("express");
const router = express.Router();
const adminController = require("../Controller/Admin/general");
const upload =require("../config/multerConfig")
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization


router.post(
    "/addMed/file/us",
    upload.single("medfile"),
    adminController.AddMedRecommendationUS
);

router.post(
    "/addMed/file",
    upload.single("medfile"),
    adminController.AddMedRecommendation
);



router.post(
    "/generate/access/key",
    adminController.GenerateApiKeysAndSecrets
);





module.exports = router;