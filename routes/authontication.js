const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/Authontication/index");
const validation = require("../utils/Validation");



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


module.exports = router;