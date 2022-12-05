const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/Authontication/index");
const validation = require("../utils/Validation");
const IsAuth =require('../utils/Authorization').authorization


router.post(
    "/signup",
    validation.signUpValidationRules(),
    validation.validate,
    userController.signUp
);

router.post(
    "/login",
    validation.loginValidationRules(),
    validation.validate,
    userController.logIn
);

router.post(
    "/verifyaccount",
    validation.virifyAccount(),
    validation.validate,
    IsAuth(),
    userController.VerifyAccount
);

module.exports = router;