const CommonController = require('../../controller/common.controller');
const router = require("express").Router();


router.get("/search", CommonController.search);

module.exports = router;