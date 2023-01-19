const express = require("express");
const router = express.Router();
const CircleController = require("../Controller/Users/Circle/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")



router.post(
    "/create/dependent/A",
    upload.single("img"),
    IsAuth(),
    CircleController.CreateDependentA
);

router.post(
    "/create/dependent/B",
    upload.single("img"),
    IsAuth(),
    CircleController.CreateDependentB
);

router.post(
    "/change/invitation/status",
    IsAuth(),
    CircleController.ChangeInvitationStatus
);

router.post(
    "/add/caregiver",
    IsAuth(),
    CircleController.AddCareGiver
);

router.post(
    "/change/dependent/request",
    IsAuth(),
    CircleController.ChangeInvitationStatusToAcceptDependent
);

router.get(
    "/invitation",
    IsAuth(),
    CircleController.getInvitations
);
router.get(
    "/dependent",
    IsAuth(),
    CircleController.Dependents
);
router.get(
    "/caregiver",
    IsAuth(),
    CircleController.CareGiver
);

router.put(
    "/edit/caregiver/Permissions",
    IsAuth(),
    CircleController.EditCareGiverPermissions
)

router.delete(
    "/delete/caregiver/Permissions",
    IsAuth(),
    CircleController.DeleteCareGiverPermissions
)

router.delete(
    "/delete/dependent",
    IsAuth(),
    CircleController.DeleteDependent
)

router.delete(
    "/delete/invitation",
    IsAuth(),
    CircleController.DeleteInvitation
)



module.exports = router;







  