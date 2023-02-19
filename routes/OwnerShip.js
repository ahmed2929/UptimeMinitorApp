const express = require("express");
const router = express.Router();
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")
const OwnerShipController =require("../Controller/Users/OwnerShip/index")



router.put(
    "/set/dependent/a/password",
    IsAuth(),
    OwnerShipController.SetDependentAPassword
)

router.put(
    "/change/ownership/dependent/a",
    IsAuth(),
    OwnerShipController.ChangeOwnerShipToDependentA
)


router.post(
    "/verify/change/ownership",
    IsAuth(),
    OwnerShipController.verifyChangeOwnerShipToDependentA
)

router.post(
    "/resend/activation/otp/for/dependent/a",
    IsAuth(),
    OwnerShipController.ResendActivationOPTForTempEmail
),




module.exports = router;
