const RatingController = require('../../controller/rating.controller');
var router = require("express").Router();
const validate = require('../../../middleware/validation/rating.validation');


router.post("/rateToCampaign", validate.addToCampaignValidate, RatingController.addToCampaign);

router.post("/rateToSMI", validate.addToSMIValidate, RatingController.addToSMI);

router.get("/AllSmiRate", RatingController.getAllSMI);

router.get("/AllCampaignRate", RatingController.getAllCampaign);

// router.put("/updateCampaign", validate.addToCampaignValidate, RatingController.updateCompaignRating);

// router.put("/updateSMI", validate.addToSMIValidate, RatingController.updateSMIRating);



module.exports = router;