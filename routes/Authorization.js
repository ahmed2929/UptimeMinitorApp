/**
 * @file routes/Authorization.js
 * @namespace Auth
 * @namespace routes
 * 
 */

const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/Authorization/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const authorizeRefreshToken  =require('../utils/Authorization').authorizeRefreshToken


/**
 * create a new user
 * signup
 *
 * @route POST /auth/signup
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */

router.post(
    "/signup",
    validation.signUpValidationRules(),
    validation.validate,
    userController.signUp
);

/**
 * 
 * login existing user
 *
 * @route POST /auth/login
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */

router.post(
    "/login",
    validation.loginValidationRules(),
    validation.validate,
    userController.logIn
);
router.post(
    "/logout",
    IsAuth(),
    userController.logOut
);


/**
 * 
 * verify user account 
 *
 * @route POST /auth/verifyaccount
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */


router.post(
    "/verifyaccount",
    validation.virifyAccount(),
    validation.validate,
    userController.VerifyAccount
);

/**
 * 
 * resend activation code to the user
 *
 * @route POST /auth/resend/activation/code
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */


router.post(
    "/resend/activation/code",
    validation.resendAcctivationCodeValidationRules(),
    validation.validate,
    userController.ResendVerificationCode
);


/**
 * 
 * generate new access token to the user from his refresh token
 *
 * @route POST /auth/generate/access/token
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */


router.post(
    "/generate/access/token",
    authorizeRefreshToken(),
    userController.GenerateAccessToken
);


/**
 * 
 * send otp code to the user to rest password
 *
 * @route POST /auth/send/restpassword/code
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */


router.post(
    "/send/restpassword/code",
    validation.SendRestPasswordCode(),
    validation.validate,
    userController.SendRestPasswordCode
);

/**
 * 
 * takes otp code which sent via email with the user email and return token to rest password
 *
 * @route POST /auth/generate/restpassword/token
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */


router.post(
    "/generate/restpassword/token",
    validation.GenerateResetPasswordToken(),
    validation.validate,
    userController.GenerateAccessResetPasswordToken
);


/**
 * 
 * take user new password
 *
 * @route put /auth/resetpassword
 * @memberof routes
 * @memberof Auth
 * @method
 *
 */


router.put(
    "/resetpassword",
    validation.restpassword(),
    validation.validate,
    IsAuth(),
    userController.ResetPassword
);

router.get(
    "/get/profile/info",
    IsAuth(),
    userController.getUserProfileInfo
);



module.exports = router;