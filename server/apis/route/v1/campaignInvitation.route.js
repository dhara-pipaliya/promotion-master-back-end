const CampaignInvitationController = require('../../controller/campaignInvitation.controller');
var router = require("express").Router();
const validate = require('../../../middleware/validation/campaignInvitation.validator');


router.post("/add",validate.invitationValidate,CampaignInvitationController.addToCampaign);

router.post("/remove",validate.invitationValidate,CampaignInvitationController.removeFromCampaign);

router.post("/accept",validate.invitationValidate,CampaignInvitationController.acceptInvitation);

router.post("/declined",validate.invitationValidate,CampaignInvitationController.declinedInvitation);

router.get("/", CampaignInvitationController.getAll);

router.get("/:id", validate.IDparamRequiredValidation, CampaignInvitationController.getById);


module.exports = router;