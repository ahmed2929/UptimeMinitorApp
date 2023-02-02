const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const SettingsController =require("../Controller/Users/Settings/index")


router.put(
    "/edit/profile",
    upload.single("img"),
    IsAuth(),
    SettingsController.EditProfile
);

router.put(
    "/change/password",
    IsAuth(),
    SettingsController.ChangePassword
)

router.put(
    "/change/email",
    IsAuth(),
    SettingsController.ChangeEmail
)


router.post(
    "/verify/changedEmail",
    IsAuth(),
    SettingsController.verifyChangedEmail
)

router.post(
    "/resend/activation/otp/for/changedEmail",
    IsAuth(),
    SettingsController.ResendActivationOPTForTempEmail
),

router.delete(
    "/delete/user/account",
    IsAuth(),
    SettingsController.DeleteAccount
),




module.exports = router;
