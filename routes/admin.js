const express = require("express");
const router = express.Router();
const adminController = require("../Controller/Admin/general/index");
const adminAuthController =require("../Controller/Admin/Auth/index")
const upload =require("../config/multerConfig")
const IsAuth  =require('../utils/Authorization').authorizationAdmin
const authorizeRefreshToken  =require('../utils/Authorization').authorizeRefreshTokenAdmin



//Auth
router.post("/auth/login", adminAuthController.logIn);
router.post("/auth/register", adminAuthController.signUp);
router.post("/auth/send/restpassword/code", adminAuthController.SendRestPasswordCode);
router.post("/auth/generate/restpassword/token", adminAuthController.GenerateAccessResetPasswordToken);
router.post("/auth/generate/access/token",authorizeRefreshToken(),adminAuthController.GenerateAccessToken);
router.put("/auth/resetpassword", IsAuth(),adminAuthController.ResetPassword);

// Statics
router.get("/general/statics", IsAuth(),adminController.Statics);





// general
router.post(
    "/general/addMed/file/us",
    upload.single("medfile"),
    IsAuth()
    ,
    adminController.AddMedRecommendationUS
);

router.post(
    "/general/addMed/file",
    upload.single("medfile"),
    IsAuth()
    ,
    adminController.AddMedRecommendation
);



router.post(
    "/general/generate/access/key",
    IsAuth()
    ,
    adminController.GenerateApiKeysAndSecrets
);


router.get(
    "/general/get/feedbacks",
    IsAuth()
    ,
    adminController.GetFeedBacks
);

router.post(
    "/general/send/notifications/to/all/users",
    IsAuth()
    ,
    adminController.SendNotificationToAllUsers
);



module.exports = router;