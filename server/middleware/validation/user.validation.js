const Joi = require('joi');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

// function passwordRegex(password) {
//   // 1 uppercase, 1 lowercase, 1 number, min 8 characters
//   let passwordRegex = RegExp('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/');

//   if (!passwordRegex.test(password)) {
//     return false
//   }
//   return true;
// }

//user signup validation
const signUpValidation = Joi.object().keys({
  email: Joi.string().required().error(new Error('email is required!')),
  // first_name: Joi.string().required().error(new Error('first_name is required!')),
  user_name: Joi.string().required().error(new Error('user_name is required!')),
  user_role: Joi.string().required().error(new Error('user_role is required!')),
  password: Joi.string().min(8).required().error(new Error('minimum 8 Character is required!')),
  // confirm_password: Joi.string().required().error(new Error('confirm_password is required!'))
}).unknown();


function signUpValidate(req, res, next) {
  const Data = req.body;

  // if (!passwordRegex(req.body.password)) {
  //   return res.status(httpStatus.OK).json(new APIResponse(null, 'password must contain at least 8 characters, consisting of at least 1 uppercase letter, 1 lowercase letter and 1 number', httpStatus.BAD_REQUEST));
  // }

  Joi.validate((Data), signUpValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}


//user login validation
const loginValidation = Joi.object().keys({
  // email: Joi.string().required().error(new Error('email is required!')),
  user_name: Joi.string().required().error(new Error('user_name is required!')),
  password: Joi.string().required().error(new Error('password is required!'))
}).unknown();

function loginValidate(req, res, next) {
  const Data = req.body;
  Joi.validate((Data), loginValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}

//user login validation
const socialLoginValidation = Joi.object().keys({
  email: Joi.string().required().error(new Error('email is required!')),
  user_name: Joi.string().required().error(new Error('user_name is required!')),
  user_role: Joi.string().required().error(new Error('user_role is required!')),
  signin_provider: Joi.string().required().error(new Error('signin_provider is required!')),
}).unknown();

function socialLoginValidate(req, res, next) {
  const Data = req.body;
  Joi.validate((Data), socialLoginValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}


//user update validation
const updateValidation = Joi.object().keys({
  _id: Joi.string().required().error(new Error('_id is required!'))
}).unknown();

function updateValidate(req, res, next) {
  const Data = req.body;
  Joi.validate((Data), updateValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}


//user reset password validation
const resetPasswordValidation = Joi.object().keys({
  user_role: Joi.string().required().error(new Error('user_role is required!')),
  old_password: Joi.string().required().error(new Error('old_password is required!')),
  new_password: Joi.string().min(8).required().error(new Error('new_password is required!')),
  confirm_new_password: Joi.string().required().error(new Error('confirm_new_password is required!'))
}).unknown();

function resetPasswordValidate(req, res, next) {
  const Data = req.body;

  // if (!passwordRegex(req.body.new_password)) {
  //   return res.status(httpStatus.OK).json(new APIResponse(null, 'password must contain at least 8 characters, consisting of at least 1 uppercase letter, 1 lowercase letter and 1 number', httpStatus.BAD_REQUEST));
  // }


  Joi.validate((Data), resetPasswordValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}

//user forgot password otp validation
const passwordOtpValidation = Joi.object().keys({
  email: Joi.string().required().error(new Error('email is required!')),
  user_role: Joi.string().required().error(new Error('user_role is required!')),
}).unknown();

function passwordOtpValidate(req, res, next) {
  const Data = req.body;
  Joi.validate((Data), passwordOtpValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}

//user forgot password otp validation
const forgotPasswordValidation = Joi.object().keys({
  email: Joi.string().required().error(new Error('email is required!')),
  user_role: Joi.string().required().error(new Error('user_role is required!')),
  password: Joi.string().min(8).required().error(new Error('password is required!')),
  confirm_password: Joi.string().required().error(new Error('confirm_password is required!')),
  otp: Joi.number().required().error(new Error('otp is required!'))
}).unknown();

function forgotpasswordValidate(req, res, next) {
  const Data = req.body;

  // if (!passwordRegex(req.body.password)) {
  //   return res.status(httpStatus.OK).json(new APIResponse(null, 'password must contain at least 8 characters, consisting of at least 1 uppercase letter, 1 lowercase letter and 1 number', httpStatus.BAD_REQUEST));
  // }

  Joi.validate((Data), forgotPasswordValidation, (error, result) => {
    if (error) {
      return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
    } else {
      return next();
    }
  });
}

function IDparamRequiredValidation(req, res, next) {
  if (req.params && req.params.hasOwnProperty('id')) {
    next();
  } else {
    return res.status(httpStatus.OK)
      .json(new APIResponse(null, 'id param not found', httpStatus.BAD_REQUEST));
  }
}

module.exports = {
  signUpValidate,
  loginValidate,
  updateValidate,
  IDparamRequiredValidation,
  resetPasswordValidate,
  forgotpasswordValidate,
  passwordOtpValidate
}