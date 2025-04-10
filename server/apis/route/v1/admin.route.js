var router = require("express").Router();
const adminController = require('../../controller/admin.controller')
const validate = require('../../../middleware/validation/setting.validation')


// router.post("/users", validate.TypeparamRequiredValidation, (...args) => adminController.getAllUsers(...args));
router.post("/users", (...args) => adminController.getAllUsers(...args));

router.post("/campaigns", (...args) => adminController.getAllCampaign(...args));

router.get("/getSettings", adminController.getSettings);

router.post("/updateSettings", validate.updateValidate, adminController.updateSettings);

router.post("/login", adminController.login)

module.exports = router;