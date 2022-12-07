const express = require("express");
const router = express.Router();
const CheckController = require("../Controller/Checks/index");
const validation = require("../utils/Validation");
const IsAuth =require('../utils/Authorization').authorization


router.post(
    "/createcheck",
    validation.CreateCheck(),
    validation.validate,
    IsAuth(),
    CheckController.CreateNewCheck
);

router.put(
    "/edit",
    validation.EditCheck(),
    validation.validate,
    IsAuth(),
    CheckController.EditCheck
);

router.delete(
    "/delete",
    validation.DeleteCheck(),
    validation.validate,
    IsAuth(),
    CheckController.deleteCheck
);

router.get(
    "/:id",
    validation.validate,
    IsAuth(),
    CheckController.getCheck
);


module.exports = router;