const _ = require('lodash');

// const Respond = require('../../utils/v1/resHander');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');

const { Verification } = require('../model/verification.model');
const { User } = require('../model/user.model');

class VerificationController {

    async verify(req, res) {
        if (!req.query.token) {
            return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'invalid request', httpStatus.BAD_REQUEST));
        }
        let is_valid = 1;
        let token = req.query.token;

        let verification = await Verification.findOne({
            token: token,
            used: false,
        })

        if (!verification) {
            return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'token was used', httpStatus.BAD_REQUEST));
        }

        if (verification) {
            verification =await Verification.verify(verification);
            console.log("==========",verification);
        }

        if (!verification) {
            return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'token was used', httpStatus.BAD_REQUEST));
        }

        // res.render('registerVerification', {
        //     title: 'Verification',
        //     is_valid:is_valid,
        //     app_name: `${process.env.APP_NAME}`,
        //     host_name: `${process.env.APP_PROTOCOL}://${process.env.APP_URL}`,
        // });
        return res.status(httpStatus.OK).json(new APIResponse({}, 'email verified successfully', httpStatus.OK));
       
    }

}

var exports = (module.exports = new VerificationController());