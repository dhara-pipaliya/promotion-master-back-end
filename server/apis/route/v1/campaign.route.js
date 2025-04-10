const CampaignController = require('../../controller/campaign.controller');
var router = require("express").Router();
const validate = require('../../../middleware/validation/campaign.validator');
const uploadImage = require('../../../helpers/imageHelper');

router.post("/create", uploadImage.single('image'), validate.createValidate, CampaignController.add);

router.get("/", CampaignController.getAll);

router.get("/proposals", CampaignController.getAllProposalsBusiness);

router.get("/myCampaigns", CampaignController.getAllbyBusinessMan);

router.get("/myCampaignsOfSMI", CampaignController.getAllBySMI);

router.get("/:id", validate.IDparamRequiredValidation, CampaignController.getById);

// router.put("/accept/:id", validate.IDparamRequiredValidation, CampaignController.acceptDailyPrice);

// router.put("/decline/:id", validate.IDparamRequiredValidation, CampaignController.declineDailyPrice);

router.post("/inviteSmi/:id", validate.IDparamRequiredValidation, CampaignController.inviteToCampaign);

router.put("/", uploadImage.single('image'), validate.updateValidate, CampaignController.update);

router.delete("/:id", validate.IDparamRequiredValidation, CampaignController.delete);

router.get("/confirm/:id/:payment_id", CampaignController.confirmCampaignPayment)

module.exports = router;