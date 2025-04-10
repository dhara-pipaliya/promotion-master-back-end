const Joi = require('joi');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

//campaign create validation
const createValidation = Joi.object().keys({
    campaign_name: Joi.string().required().error(new Error('campaign_name is required!')),
    campaign_price: Joi.string().required().error(new Error('campaign_price is required!')),
    // expiration: Joi.string().required().error(new Error('expiration is required!')),
    industry: Joi.string().required().error(new Error('industry is required!')),
}).unknown();


function createValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), createValidation, (error, result) => {
        if (error) {
            return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
        } else {
            return next();
        }
    });
}


//campaign update validation
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


function IDparamRequiredValidation(req, res, next) {
    if (req.params && req.params.hasOwnProperty('id')) {
        next();
    } else {
        return res.status(httpStatus.OK)
            .json(new APIResponse(null, 'id param not found', httpStatus.BAD_REQUEST));
    }
}

module.exports = {
    createValidate,
    updateValidate,
    IDparamRequiredValidation
}