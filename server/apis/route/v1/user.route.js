const UserController = require('../../controller/user.controller');
var router = require("express").Router();
const APIResponse = require('../../../helpers/APIResponse');
const httpStatus = require('http-status');
const Joi = require('joi');
const validate = require('../../../middleware/validation/user.validation');
const uploadImage = require('../../../helpers/imageHelper');

router.post("/signup", validate.signUpValidate, UserController.signUp);

router.post("/login", validate.loginValidate, UserController.login);

router.post("/socialLogin",  UserController.socialLogin);

router.post("/logout", UserController.logout);

// router.post("/socialmedia", UserController.socialMedia);

router.get("/influencer", UserController.getAllInfluencer);

router.get("/homepage", UserController.homePage);

router.get("/businessHomePage", UserController.homePageForBusiness);

router.get("/businessman", UserController.getAllBusinessMan);

router.get("/", UserController.getAll);

router.post("/setFavourite/:id", validate.IDparamRequiredValidation, UserController.setFavourite);

router.post("/unFavourite/:id", validate.IDparamRequiredValidation, UserController.unFavourite);

router.post("/OTP", validate.passwordOtpValidate, UserController.forgotPasswordOTP);

router.post("/forgotPassword", validate.forgotpasswordValidate, UserController.forgotPassword);

router.get("/:id", validate.IDparamRequiredValidation, UserController.getById);

router.put("/", uploadImage.fields([{ name: 'profile', maxCount: 1 }]), validate.updateValidate, UserController.update);

router.put("/resetPassword", validate.resetPasswordValidate, UserController.changePassword);

router.delete("/:id", validate.IDparamRequiredValidation, UserController.delete);



module.exports = router;