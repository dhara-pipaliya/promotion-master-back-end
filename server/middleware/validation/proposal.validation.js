const Joi = require('joi');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

//proposal create validation
const addToCampaignValidaton = Joi.object().keys({
    campaign: Joi.string().required().error(new Error('campaign is required!')),
}).unknown();


function addToCampaignValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), addToCampaignValidaton, (error, result) => {
        if (error) {
            return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
        } else {
            return next();
        }
    });
}

//update validate
const updateValidaton = Joi.object().keys({
    _id: Joi.string().required().error(new Error('proposalId as _id is required!')),
}).unknown();


function updateValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), updateValidaton, (error, result) => {
        if (error) {
            return res.status(httpStatus.OK).json(new APIResponse(null, error.message, httpStatus.BAD_REQUEST));
        } else {
            return next();
        }
    });
}


//proposal accept validation
const acceptDeclineSmiValidation = Joi.object().keys({
    proposal_id: Joi.string().required().error(new Error('proposal_id is required!'))
}).unknown();

function acceptDeclineSmiValidate(req, res, next) {
    const Data = req.body;
    Joi.validate((Data), acceptDeclineSmiValidation, (error, result) => {
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
    acceptDeclineSmiValidate,
    updateValidate,
    IDparamRequiredValidation
}