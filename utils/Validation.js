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

exports.resendAcctivationCodeValidationRules = () => {
    return [
        body("email").notEmpty().withMessage("Email_is_required").isEmail().withMessage("Email_is_not_valid").normalizeEmail().withMessage("Email_is_required")
    ]
}



exports.virifyAccount = () => {
    return [
        body("verifyCode").notEmpty().withMessage("verifyCode_is_required"),
        body("email").notEmpty().withMessage("Email_is_required").isEmail().withMessage("Email_is_not_valid").normalizeEmail().withMessage("Email_is_required")

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



exports.ChangeDoseStatus = () => {
    return [
        check("OccurrenceId").isMongoId().withMessage("invalid_ID"),
        check("Status")
        .exists()  // Make sure the field exists
        .isInt()  // Make sure it's an integer
        .isIn([2, 4])  // Make sure it's equal to 2 or 4
        .withMessage("status_is_invalid")
       

    ]
}

exports.SuspendDoseFromDateToDate = () => {
    return [
        check("SchedulerId").isMongoId().withMessage("invalid_ID"),
        check("StartDate")
        .exists()  // Make sure the field exists
        .isNumeric()  // Make sure it's a numeric value
        .isInt()  // Make sure it's an integer
        .custom((value) => {
          // Check if the value is in the future
          const now = Date.now();
          const StartDateValue=new Date(+value).getTime()
          if (StartDateValue <= now) {
            console.log("invalid_start_date")

            return false
          }
          return true;
        })
        .withMessage("invalid_start_date"),
        check("EndDate")
        .exists()  // Make sure the field exists
        .isNumeric()  // Make sure it's a numeric value
        .isInt()  // Make sure it's an integer
        .custom((value, { req }) => {
            // Check if the value is in the future
            const now = Date.now();
            const EndDateValue=new Date(+value).getTime()
            if (EndDateValue <= now) {
                throw new Error('End date must be in the future');
               
            }

            const startDate = req.body.StartDate;
            console.log(startDate,value)
                if (+value <= +startDate) {
                    
                    throw new Error('End date must be greater than start date');
                }
                return true;

            
        })
        .withMessage("invalid_end_date")
       

    ]
}

exports.EditSingleDoseValidation = () => {
    return [
     // Validate the occurrenceId field
     check('OccurrenceId')
     .exists()  // Make sure the field exists
     .isMongoId()
     .withMessage("invalid_ID"), // Make sure it's a valid Mongoose ID

   // Make the MedInfo field optional
   check('MedInfo')
     .optional()  // The field is optional
     .custom((value) => {
       // Validate the MedInfo field if it's present
       if (value) {
         // Make the properties of the MedInfo object optional
         check('MedInfo.unit').optional(),
         check('MedInfo.instructions').optional(),
         check('MedInfo.condition').optional(),
         check('MedInfo.type').optional(),
         check('MedInfo.name').optional(),

         check('MedInfo.strength')
           .optional()
           .isInt()
           .custom((strength) => {
            console.log(strength)
             if(strength){
                 if (strength < 1) {
                     throw new Error('strength must be greater than 0');
                   }
             }
             
             return true;
           })
           
         // Validate the quantity field if it's present
         check('MedInfo.quantity')
           .optional()
           .isInt()
           .custom((quantity) => {
             if (quantity < 1) {
               throw new Error('Quantity must be greater than 0');
             }
             return true;
           })
       }
       return true;
     }).withMessage("validation_faild_in_MedInfo"),

   // Make the PlannedDateTime field optional
   check('PlannedDateTime')
     .optional()  // The field is optional
     .isNumeric()  // Make sure it's a numeric value
     .isInt()
     .withMessage("invalid_date"),  // Make sure it's valid date
// Make the PlannedDose field optional
check('PlannedDose')
  .optional()  // The field is optional
  .isInt()
  .custom((PlannedDose) => {
    console.log(PlannedDose)
    if(PlannedDose<1){
        if (PlannedDose <1) {
            throw new Error('PlannedDose must be greater than 0');
          }
    }
   
    return true;
  }).withMessage("invalid_dose")


    ]
}

exports.CreateNewMed = () => {
    return [
        // Validate the name field
 check('name')
 .optional()  // Make sure the field exists
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the type field
check('type')
 .optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the strength field
check('strength')
.optional()
 .isInt()  // Make sure it's an integer
 ,

// Validate the unit field
check('unit')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the quantity field
check('quantity')
.optional()
 .isInt()  // Make sure it's an integer
,

// Validate the instructions field
check('instructions')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the condition field
check('condition')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the Scheduler field

check('Scheduler')
    .exists()
    .withMessage("Scheduler missed")  // Make sure the field exists
    // .custom((Scheduler) => {
    //     //console.log(Scheduler)
    //   // Validate the StartDate field
    //   check('Scheduler.StartDate')
    //     .exists()  // Make sure the field exists
    //     .isInt()  // Make sure it's an integer
    //     .custom((StartDate) => {
    //       if (StartDate <= 0) {
    //         throw new Error('StartDate must be a positive integer');
    //       }
    //       return true;
    //     })

    //   // Validate the EndDate field
    //   check('Scheduler.EndDate')
    //     .exists()  // Make sure the field exists
    //     .isInt()  // Make sure it's an integer
    //     .custom((EndDate) => {
    //       if (EndDate <= 0) {
    //         throw new Error('EndDate must be a positive integer');
    //       }
    //       return true;
    //     }),

   

    //   // Validate the ScheduleType field
    //   check('Scheduler.ScheduleType')
    //     .exists()  // Make sure the field exists
    //     .isString()  // Make sure it's a string
    //     .custom((ScheduleType) => {
    //         console.log(ScheduleType)
    //       if (ScheduleType !== "0" && ScheduleType !== "1"&& ScheduleType !== "2"&& ScheduleType !== "3") {
    //         throw new Error('Invalid ScheduleType');
    //       }
    //       return true;
    //     }),

    //   // Validate the DaysInterval field if the ScheduleType is "1"
    //   check('Scheduler.DaysInterval')
    //     .optional()  // The field is optional
    //     .isInt()  // Make sure it's an integer
    //     .custom((DaysInterval, { req }) => {
    //       if (req.body.Scheduler.ScheduleType === "1" && (!DaysInterval || DaysInterval < 2)) {
    //         throw new Error('DaysInterval must be a positive integer');
    //       }
    //       return true;
    //     }),

    //   // Validate the SpecificDays field if the ScheduleType is "0"
    //   check('Scheduler.SpecificDays')
    //   .optional()  // The field is optional
    //   .isArray()  // Make sure it's an array
    //   .custom((SpecificDays, { req }) => {
    //     if (req.body.Scheduler.ScheduleType === "0" && (!SpecificDays || SpecificDays.length === 0)) {
    //       throw new Error('SpecificDays must not be empty');
    //     }
    //     return true;
    //   }),
    //   check('Scheduler.dosage')
    //   .exists()  // Make sure the field exists
    //   .isArray()  // Make sure it's an array
    //   .custom((dosage) => {
    //     if(dosage.length>0){
    //          // Validate each element of the dosage array
    //     for (let i = 0; i < dosage.length; i++) {
    //         // Validate the DateTime field
    //         check(`Scheduler.dosage[${i}].DateTime`)
    //           .exists()  // Make sure the field exists
    //           .isInt()  // Make sure it's an integer
    //           .custom((DateTime) => {
    //             if (DateTime < 1) {
    //               throw new Error('DateTime must be a positive integer');
    //             }
    //             return true;
    //           })
    //       }
    //     }
       

    //     return true;
    //   })

      
      
    
    // })

    ]
}

exports.EditMed = () => {
    return [
        // Validate the name field
 check('name')
 .optional()  // Make sure the field exists
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the type field
check('type')
 .optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the strength field
check('strength')
.optional()
 .isInt()  // Make sure it's an integer
 .custom((strength) => {
   if (strength < 1) {
     throw new Error('strength must be greater than 1 or equals');
   }
   return true;
 }),

// Validate the unit field
check('unit')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the quantity field
check('quantity')
.optional()
 .isInt()  // Make sure it's an integer
 .custom((quantity) => {
   if (quantity < 1) {
     throw new Error('quantity must be greater than or equals 1');
   }
   return true;
 }),

// Validate the instructions field
check('instructions')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the condition field
check('condition')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the Scheduler field

 

    ]
}

exports.CreateNewSymptom = () => {
    return [
        // Validate the name field
 check('ProfileID')
 .exists()  // Make sure the field exists
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the type field
check('Type')
 .exists()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the strength field
// Validate the unit field
check('StartedIn')
.exists()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the quantity field
check('StartedIn')
.exists()
 .isInt()  // Make sure it's an integer
 .custom((quantity) => {
   if (quantity < 1) {
     throw new Error('quantity must be greater than or equals 1');
   }
   return true;
 }),



    ]
}

exports.EditSymptom = () => {
    return [
        // Validate the name field
 check('ProfileID')
 .exists()  // Make sure the field exists
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the type field
check('Type')
 .optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty

// Validate the strength field


// Validate the unit field
check('StartedIn')
.optional()
 .isString()  // Make sure it's a string
 .notEmpty(),  // Make sure it's not empty


// Validate the instructions field

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