var router = require("express").Router();
const paymentController = require("../../controller/payment.controller")

router.post("/authorize", paymentController.initiateStripeOauth)

router.get("/token/validate", paymentController.validateTokenFromStripe)

router.post("/proceed", paymentController.proceedPayment)

router.post("/proceedToSMI", paymentController.proceedPaymentToSMI)

module.exports = router;