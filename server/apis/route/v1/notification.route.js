const NotificationController = require('../../controller/notification.controller');
var router = require("express").Router();
const validate = require('../../../middleware/validation/proposal.validation');


router.get("/", NotificationController.getAll);

module.exports = router;