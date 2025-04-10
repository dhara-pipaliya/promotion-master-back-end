const ProposalController = require('../../controller/proposal.controller');
var router = require("express").Router();
const validate = require('../../../middleware/validation/proposal.validation');


router.post("/apply", validate.addToCampaignValidate, ProposalController.applyToCampaign);

router.post("/cancel", validate.addToCampaignValidate, ProposalController.cancelPropsal);

router.post("/acceptSmi", validate.acceptDeclineSmiValidate, ProposalController.acceptSmi);

router.post("/declineSmi", validate.acceptDeclineSmiValidate, ProposalController.declineSmi);

router.post("/acceptCompletion", ProposalController.accepteCompletionStatus);

router.get("/getProposalOfSmi", ProposalController.getAllProposalOfSMI);

router.get("/myProposal", ProposalController.acceptedProposalSMI);

router.get("/", ProposalController.getAll);

router.get("/:id", ProposalController.getProposalById);

router.put("/update", validate.updateValidate, ProposalController.updateProposal);

router.post("/complete", validate.updateValidate, ProposalController.completeProposal);

// router.get("/confirm/:id/:payment_id", ProposalController.confirmProposalPayment)

module.exports = router;