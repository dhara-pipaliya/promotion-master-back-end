const Joi = require('joi');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

//rating create validation
const addtoCampaignValidation = Joi.object().keys({
    campaign_id: Joi.string().required().error(new Error('campaign_id is required!')),
    proposal_id: Joi.string().required().error(new Error('proposal_id is required!')),
    rating: Joi.number().min(1).max(5).required().error(new Error('rating is required!')),
    review: Joi.string().required().error(new Error('review is required!')),
}).unknown();


function addToCampaignValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), addtoCampaignValidation, (error, result) => {
        if (error) {
            return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
        } else {
            return next();
        }
    });
}

//rating create validation
const addtoSMIValidation = Joi.object().keys({
    smi: Joi.string().required().error(new Error('smi is required!')),
    campaign_id: Joi.string().required().error(new Error('campaign_id is required!')),
    rating: Joi.number().min(1).max(5).required().error(new Error('rating is required!')),
    review: Joi.string().required().error(new Error('review is required!')),
}).unknown();


function addToSMIValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), addtoSMIValidation, (error, result) => {
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
    addToCampaignValidate,
    addToSMIValidate,
    IDparamRequiredValidation
}