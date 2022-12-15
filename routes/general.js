const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/general/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization




router.put(
    "/changeLanguage",
    validation.changeLanguage(),
    validation.validate,
    IsAuth(),
    userController.ChangeUserDefultLang
);




module.exports = router;