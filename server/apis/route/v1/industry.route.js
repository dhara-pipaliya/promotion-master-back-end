const router = require("express").Router();
const industryController = require("../../controller/industry.controller");

router.get('/', industryController.getIndustries);

router.post('/add', industryController.addIndustries);

router.post('/update', industryController.updateIndustry)

router.get('/remove/:id', industryController.removeIndustry);

module.exports = router