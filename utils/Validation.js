const {
    body,
    param,
    validationResult,
    check
} = require('express-validator');

exports.signUpValidationRules = () => {
    return [
        body("email").notEmpty().withMessage("Email_is_required").isEmail().withMessage("Email_is_not_valid").normalizeEmail(),
        body("password").notEmpty().withMessage("Password_is_required").isLength({
            min: 5
        }).withMessage("Password_is_too_short"),
        body("firstName").notEmpty().withMessage('firstName_is_required').isLength({max:15}).withMessage("firstName_max"),
        body("lastName").notEmpty().withMessage('lasttName_is_required').isLength({max:15}).withMessage("lastName_max"),
        body("mobileNumber.countryCode").notEmpty().withMessage("country_code_is_required").isLength({max:5}).withMessage("country_code_invalid"),
        body("mobileNumber.phoneNumber").notEmpty().withMessage("phone_number_is_required").isLength({max:15}).isNumeric().withMessage("phone_number_invalid")

    ]
}



exports.loginValidationRules = () => {
    return [
        body("email").notEmpty().withMessage("Email_is_required").isEmail().withMessage("Email_is_not_valid").normalizeEmail().withMessage("Email_is_required"),
        body("password").notEmpty().withMessage("Password_is_required").isLength({
            min: 5
        }).withMessage("Password_is_too_short")
    ]
}



exports.virifyAccount = () => {
    return [
        body("verfiycode").notEmpty().withMessage("verifyCode_is_required"),
    ]
}

exports.SendRestPasswordCode = () => {
    return [
        body("email").notEmpty().withMessage("Email_is_required").isEmail().withMessage("Email_is_not_valid").normalizeEmail().withMessage("Email_is_required")
    ]
}

exports.GenerateResetPasswordToken = () => {
    return [
       
        body("email").notEmpty().withMessage("Email_is_required").isEmail().withMessage("Email_is_not_valid").normalizeEmail().withMessage("Email_is_required"),
        body("code").notEmpty().withMessage("code is required")
        
    ]
}

exports.restpassword = () => {
    return [
        body("NewPassword").notEmpty().withMessage("Password_is_required").isLength({
            min: 5
        }).withMessage("Password_is_too_short")
       
        
    ]
}


exports.changeLanguage=()=>{
    return [
        body("lang").notEmpty().withMessage("language_is_required").isLength({max:2}).withMessage("language_is_invalid")
    ]
}


exports.validate = (req, res, next) => {
    try {
        const errors = validationResult(req)
        if (errors.isEmpty()) {
            return next()
        }
        const extractedErrors = []
        errors.array().map(err => extractedErrors.push({
            [err.param]: req.t(err.msg)
        }))

        return res.status(422).json({
            errors: extractedErrors,
        })
  
    } catch {
        res.status(401).json({
            error: "Unauthorized",
            status: "error"
        })
    }
}