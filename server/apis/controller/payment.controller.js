"use strict";
const httpStatus = require('http-status');
const querystring = require('querystring');
const APIResponse = require('../../helpers/APIResponse');
const { Account } = require('../model/account.model');
const stripe = require('stripe')('sk_test_51IC6MVC79xcHe3tCP5OK2l4Zb2NQx7ls93MFD1XFm6MoN49iFlhIMEutwiT0yWtRrQ3qN48BbIElduQcc0shjHTB005fBhnRRk')
const { User } = require("../model/user.model");
const { Campaign } = require("../model/campaign.model")
const authorizeUri = 'https://connect.stripe.com/express/oauth/authorize'
const stripeStatesByUserId = {}

class paymentController {

    async initiateStripeOauth(req, res) {
        try {
            // req.session = {}
            // req.session.state = Math.random().toString(36).slice(2);
            const state = Math.random().toString(36).slice(2);
            stripeStatesByUserId[state] = req.user.id

            let parameters = {
                client_id: 'ca_InhvNEwDRDB5t0SGUdX4j9rMPinyQxlC',
                state: state
            }
            parameters = Object.assign(parameters, {
                redirect_url: process.env.SITE_URL + '/api/v1/payment/token/validate',
                'stripe_user[first_name]': req.body.first_name || undefined,
                'stripe_user[last_name]': req.body.last_name || undefined,
                'stripe_user[email]': req.user.email || undefined,
            })
            console.log('Starting Express flow:', parameters);
            const url = { url: authorizeUri + '?' + querystring.stringify(parameters) }
            return res.status(httpStatus.OK)
                .json(new APIResponse(url, 'Authorization initiated successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error in initiating authentication', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async validateTokenFromStripe(req, res) {
        try {
            if (stripeStatesByUserId[req.query.state]) {
                const authorizedData = await stripe.oauth.token({
                    grant_type: 'authorization_code',
                    code: req.query.code
                })
                if (authorizedData.error) {
                    throw (authorizedData.error);
                }
                if (authorizedData.stripe_user_id) {
                    const updatedAccountData = await Account.findOneAndUpdate({
                        user_id: stripeStatesByUserId[req.query.state]
                    }, {
                        $set: {
                            user_id: stripeStatesByUserId[req.query.state],
                            stripe_account_id: authorizedData.stripe_user_id
                        }
                    }, { upsert: true, new: true }).lean().exec()
                    if (updatedAccountData && updatedAccountData.stripe_account_id) {
                        await User.findOneAndUpdate({_id: stripeStatesByUserId[req.query.state]},{accountLinked: true}).lean().exec();
                        // const updatedUserData = await User.update({
                        //     _id: stripeStatesByUserId[req.query.state],
                        //     accountLinked: true
                        // }).lean().exec()
                    }
                }
                delete stripeStatesByUserId[req.query.state]
                res.redirect('https://localhost:3000/my-account?link=true')
                // res.redirect('http://192.168.1.7:3000/my-account?link=true')
            } else {
                return res.redirect('https://localhost:3000/my-account')
                // return res.redirect('http://192.168.1.7:3000/my-account')
            }

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error in validating stripe token', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async proceedPayment(req, res) {
        try {
            const campaignData = await Campaign.findById(req.body.campaign_id).lean().exec();
            // const smiData = await User.findById(req.body.smi_id)
            const accountData = await Account.findOne({ user_id: req.body.smi_id }).lean().exec();
            if (!accountData || !accountData.stripe_account_id) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, "User doesn't have stripe account", httpStatus.OK));
            }
            if (!campaignData.price.business_price) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Campaign price not available', httpStatus.OK));
            }
            const paymentIntent = await stripe.paymentIntents.create({
                payment_method_types: ['card'],
                amount: (campaignData.price.business_price * 100).toFixed(0),
                currency: 'usd',
                // application_fee_amount: ((parseFloat(campaignData.price.business_price) - parseFloat(campaignData.price.smi_price)) * 100).toFixed(0),
                // transfer_data: {
                //     destination: accountData.stripe_account_id,
                // },
                transfer_group: req.body.campaign_id
            })
            const response = {
                client_secret: paymentIntent.client_secret
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Payment intent created successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error in creating payment intent', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async proceedPaymentToSMI(req, res) {
        try {
            const accountData = await Account.findOne({ user_id: req.user.id }).lean().exec();
            const campaignData = await Campaign.findOne({ _id: req.body.campaign_id }, { price: 1, payment_id: 1 }).lean().exec();
            if (!campaignData.price.smi_price) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(accountData, "Campaign doesn't have valid price", httpStatus.OK));
            }

            if (!accountData.stripe_account_id) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, "User doesn't have stripe account", httpStatus.OK));
            }
            const payment = await stripe.transfers.create({
                amount: (campaignData.price.smi_price * 100).toFixed(0),
                currency: 'usd',
                destination: accountData.stripe_account_id,
                source_transaction: campaignData.payment_id,
                transfer_group: req.body.campaign_id ? req.body.campaign_id : '',
            })
            let smiData = await User.findOne({ _id: req.user.id }).lean().exec();
            const newEarning = ((smiData.earnings ? smiData.earnings : 0) + parseFloat(campaignData.price.smi_price)).toFixed(2)
            smiData = await User.findOneAndUpdate({ _id: req.user.id }, { earnings: newEarning }, { new: true }).select('-password').lean().exec();
            return res.status(httpStatus.OK)
                .json(new APIResponse({ user_data: smiData, success: true }, 'Payment done successfully', httpStatus.OK));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error in paying to SMI', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }
}

module.exports = new paymentController()