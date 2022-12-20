const express = require("express");
const router = express.Router();
const userController = require("../Controller/Users/general/index");
const validation = require("../utils/Validation");
const IsAuth  =require('../utils/Authorization').authorization
const upload =require("../config/multerConfig")



router.post(
    "/create/new/med",
    upload.single("img"),
    IsAuth(),
    userController.CreateNewMed
);

router.put(
    "/edit/schduler",
    IsAuth(),
    userController.EditSchduler
);

router.put(
    "/changeLanguage",
    validation.changeLanguage(),
    validation.validate,
    IsAuth(),
    userController.ChangeUserDefultLang
);

router.get(
    "/search",
    userController.SerachForMed
);



module.exports = router;