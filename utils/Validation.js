const {
    body,
    param,
    validationResult,
    check
} = require('express-validator');

exports.signUpValidationRules = () => {
    return [
        body("email").notEmpty().isEmail().normalizeEmail().withMessage("Email is required"),
        body("password").notEmpty().isLength({
            min: 5
        }).withMessage("Password must have at least 5 characters"),
        body("firstName").notEmpty().isLength({max:15}).withMessage("max length 15 characters"),
        body("lastName").notEmpty().isLength({max:15}).withMessage("max length 15 characters"),
        body("mobileNumber.countryCode").notEmpty().isLength({max:5}).withMessage("invalid country code"),
        body("mobileNumber.phoneNumber").notEmpty().isLength({max:15}).isNumeric().withMessage("invalid phone number")

    ]
}



exports.loginValidationRules = () => {
    return [
        body("email").notEmpty().isEmail().normalizeEmail().withMessage("Email is required"),
        body("password").notEmpty().withMessage("Password is Required")
    ]
}



exports.virifyAccount = () => {
    return [
        body("verfiycode").notEmpty().withMessage("verification code is required"),
    ]
}

exports.SendRestPasswordCode = () => {
    return [
        body("email").notEmpty().isEmail().normalizeEmail().withMessage("invalid email")
    ]
}

exports.GenerateResetPasswordToken = () => {
    return [
       
        body("email").notEmpty().withMessage("email is required").isEmail().normalizeEmail().withMessage("invalid email"),
        body("code").notEmpty().withMessage("code is required")
        
    ]
}

exports.restpassword = () => {
    return [
        body("NewPassword").isLength({
            min: 5
        }).withMessage("Password must have at least 5 characters"),
       
        
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
            [err.param]: err.msg
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