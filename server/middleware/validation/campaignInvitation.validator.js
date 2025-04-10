const Joi = require('joi');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

//campaign create validation
const addAndRemoveValidation = Joi.object().keys({
    campaign_id: Joi.string().required().error(new Error('campaign_id is required!')),
    user_id: Joi.string().required().error(new Error('user_id is required!')),
}).unknown();


function invitationValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), addAndRemoveValidation, (error, result) => {
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
    invitationValidate,
    IDparamRequiredValidation
}