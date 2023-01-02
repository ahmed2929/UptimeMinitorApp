const express = require("express");
const router = express.Router();
const CicleController = require("../Controller/Users/Circle/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")



router.post(
    "/create/dependent/A",
    upload.single("img"),
    IsAuth(),
    CicleController.CreateDependetA
);

router.post(
    "/create/dependent/B",
    upload.single("img"),
    IsAuth(),
    CicleController.CreateDependetB
);




module.exports = router;







  