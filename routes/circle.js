const express = require("express");
const router = express.Router();
const CicleController = require("../Controller/Users/Circle/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")



router.post(
    "/create/dependent/A",
    upload.single("img"),
    IsAuth(),
    CicleController.CreateDependetA
);

router.post(
    "/create/dependent/B",
    upload.single("img"),
    IsAuth(),
    CicleController.CreateDependetB
);

router.post(
    "/change/invitation/status",
    IsAuth(),
    CicleController.ChangeInvitationStatus
);

router.post(
    "/add/caregiver",
    IsAuth(),
    CicleController.AddCareGiver
);

router.post(
    "/change/dependent/request",
    IsAuth(),
    CicleController.ChangeInvitationStatusToAcceptDependent
);

router.get(
    "/invitation",
    IsAuth(),
    CicleController.getInvitations
);
router.get(
    "/dependent",
    IsAuth(),
    CicleController.Dependents
);
router.get(
    "/caregiver",
    IsAuth(),
    CicleController.CareGiver
);




module.exports = router;







  