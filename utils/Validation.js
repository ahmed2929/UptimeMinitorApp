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

exports.CreateCheck = () => {
    return [
        body("name").notEmpty().withMessage("name is required"),
        body("url").notEmpty().isURL().withMessage("url is required"),
        body("protocol").isIn(['http','https','TCP']),
        body("ignoreSSL").isBoolean(),
        body("path").optional().isString(),
        body("port").optional().isInt({ min: 0, max: 65535 }),
        body("webhook").optional().isURL(),
        body("timeout").optional().isNumeric(),
        body("interval").optional().isNumeric(),
        body("threshold").optional().isNumeric(),
        body("authentication").optional().isObject(),
        body("httpHeaders").optional().isObject(),
        body("assert").optional().isObject(),
        check("assert.status").optional().isNumeric(),
        body("tags").optional().isArray(),
        
    ]
}

exports.EditCheck = () => {
    return [
        body("CheckID").notEmpty().isMongoId(),
        body("name").optional().isString(),
        body("protocol").optional().isIn(['http','https','TCP']),
        body("path").optional().isString(),
        body("port").optional().isInt({ min: 0, max: 65535 }),
        body("webhook").optional().isURL(),
        body("timeout").optional().isNumeric(),
        body("interval").optional().isNumeric(),
        body("threshold").optional().isNumeric(),
        body("authentication").optional().isObject(),
        body("httpHeaders").optional().isObject(),
        body("assert").optional().isObject(),
        check("assert.status").optional().isNumeric(),
        body("ignoreSSL").optional().isBoolean(),
        body("tags").optional().isArray(),
        

        

        
        


       
        
    ]
}

exports.DeleteCheck = () => {
    return [
        body("CheckID").notEmpty().withMessage("CheckID is required"),
       
        
    ]
}

exports.ReportCheck = () => {
    return [
        body("ReportID").notEmpty().withMessage("ReportID is required"),
       
        
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