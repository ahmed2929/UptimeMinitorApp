const express = require("express");
const router = express.Router();
const generalController = require("../Controller/Users/general/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization


router.put(
    "/changeLanguage",
    validation.changeLanguage(),
    validation.validate,
    IsAuth(),
    generalController.ChangeUserDefaultLang
);


router.get(
    "/search",
   
    generalController.SearchForMed
);


router.get(
    "/notifications",
    IsAuth(),
    generalController.Notification
);
router.post(
    "/make/notification/seen",
    IsAuth(),
    generalController.MakeNotificationSeen
);




module.exports = router;







  