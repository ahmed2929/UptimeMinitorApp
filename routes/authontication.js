const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/Authontication/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const authorizeRefreshToken  =require('../utils/Authorization').authorizeRefreshToken


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

router.post(
    "/resend/activation/code",
    IsAuth(),
    userController.ResendVirificationCode
);

router.post(
    "/generate/access/token",
    authorizeRefreshToken(),
    userController.GenerateAccessToken
);

router.post(
    "/send/restpassword/code",
    validation.SendRestPasswordCode(),
    validation.validate,
    userController.SendRestPasswordCode
);

router.post(
    "/generate/restpassword/token",
    validation.GenerateResetPasswordToken(),
    validation.validate,
    userController.GenerateAccessResetPasswordToken
);

router.put(
    "/resetpassword",
    validation.restpassword(),
    validation.validate,
    IsAuth(),
    userController.ResetPassword
);




module.exports = router;