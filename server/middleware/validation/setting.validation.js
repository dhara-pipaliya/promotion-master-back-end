const Joi = require('joi');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

// Settings create validation
const createValidation = Joi.object().keys({
    smtp_email: Joi.string().required().error(new Error('smtp_email is required!')),
    smtp_password: Joi.string().required().error(new Error('smtp_password is required!')),
    smtp_host: Joi.string().required().error(new Error('smtp_host is required!')),
    stripe_access_key: Joi.string().required().error(new Error('stripe_access_key is required!')),
    stripe_secret_key: Joi.string().required().error(new Error('stripe_secret_key is required!'))
}).unknown();

function createValidate(req, res, next) {
    const data = req.body;
    Joi.validate((data), createValidation, (error, result) => {
        if (error) {
            return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
        } else {
            return next();
        }
    });
}

//setting update validation
const updateValidation = Joi.object().keys({
    _id: Joi.string().required().error(new Error('_id is required!'))
  }).unknown();
  
  function updateValidate(req, res, next) {
    const data = req.body;
    Joi.validate((data), updateValidation, (error, result) => {
      if (error) {
        return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
      } else {
        return next();
      }
    });
  }

module.exports = {
    createValidate,
    updateValidate,
}