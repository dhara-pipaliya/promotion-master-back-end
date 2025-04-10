"use strict";
const { Campaign } = require("../model/campaign.model");
const { Proposal } = require('../model/proposal.model')
const { CampaignInvitation } = require('../model/campaignInvitation.model')
const { Notification } = require("../model/notification.model");
const { User } = require("../model/user.model");
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const { sendPushNotification, sendToMulti } = require('../../helpers/pushNotifications');
const emailHelper = require('../../helpers/emailHelper');
const { getBusinessPrice, getSMIPrice, salesTaxFee, stripeFee, totalStripeFee, commission } = require('../../helpers/utils');
const { getPaginateQuery } = require('../../helpers/utils');
const stripe = require('stripe')('sk_test_51IC6MVC79xcHe3tCP5OK2l4Zb2NQx7ls93MFD1XFm6MoN49iFlhIMEutwiT0yWtRrQ3qN48BbIElduQcc0shjHTB005fBhnRRk')

class CampaignController {

    // add Campaign
    async add(req, res) {
        try {
            if (req.user.user_role == 'BUSINESS') {


                let image_url = '';
                if (req.file) {
                    image_url = req.file.path;
                }
                let price = {
                    campaign_price: req.body.campaign_price,
                    business_price: getBusinessPrice(Number(req.body.campaign_price)).toFixed(2),
                    smi_price: getSMIPrice(Number(req.body.campaign_price)).toFixed(2),
                    sales_tax: salesTaxFee(Number(req.body.campaign_price)).toFixed(2),
                    stripe_fee: stripeFee(Number(req.body.campaign_price)).toFixed(2),
                    total_stripe_fee: totalStripeFee(Number(req.body.campaign_price)).toFixed(2),
                    commission: commission(Number(req.body.campaign_price)).toFixed(2)
                }


                let campaign = new Campaign({
                    campaign_name: req.body.campaign_name,
                    zip: req.body.zip || '',
                    creator: req.user.id,
                    image: image_url,
                    campaign_instruction: req.body.instruction || '',
                    campaign_links: req.body.campaign_links || '',
                    price: price,
                    // campaign_price: req.body.campaign_price,
                    // business_price: getBusinessPrice(Number(req.body.campaign_price)).toFixed(2),
                    // smi_price: getSMIPrice(Number(req.body.campaign_price)).toFixed(2),
                    // expiration: req.body.expiration,
                    // invited_smi: guests,
                    industry: req.body.industry
                });
                let response = await campaign.save();

                if (response) {
                    let owner = await User.findById(req.user.id);
                    owner.my_campaign.push(response._id)
                    owner = await owner.save();

                    // let data = {
                    //     token: owner.device_token,
                    //     payload: {
                    //         notification: {
                    //             title: "Your Campaign Price",
                    //             body: `Your Campaign Price is ${response.business_price}`,
                    //         }
                    //     }
                    // };
                    // let notify = await sendPushNotification(data);
                    // if (notify) {
                    //     let notificationData = {
                    //         sent_by: req.user.id,
                    //         sent_to: req.user.id,
                    //         notification_type: "CAMPAIGN_PRICE"
                    //     }
                    //     const notification = new Notification(notificationData);
                    //     await notification.save();

                    //     let mailData = {
                    //         BusinessPrice: response.business_price
                    //     }

                    //     await emailHelper.sendMail(req.user.email.trim(), 'Account Verification', 'campaign-price.html', mailData);
                    // }
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign saved successfully', httpStatus.OK));
                }


                return res.status(httpStatus.OK).json(new APIResponse({}, 'getting error in add campaign', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not eligible for create Compaign', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding Campaign', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //accept daily price
    // async acceptDailyPrice(req, res) {
    //     let id = req.params.id;

    //     try {
    //         if (req.user.user_role == 'BUSINESS') {
    //             let response = await Campaign.findById(id);
    //             if (response.price_status === 'ACCEPTED') {
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign Price Already Accepted', httpStatus.BAD_REQUEST));
    //             }
    //             if (response.price_status === 'DECLINED') {
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'You Declined This Campaign Price', httpStatus.BAD_REQUEST));
    //             }

    //             if (response) {
    //                 response.price_status = 'ACCEPTED',
    //                     response.visible = true
    //                 response = await response.save();
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign Price Accepted Successfully', httpStatus.OK));
    //             }
    //             return res.status(httpStatus.OK).json(new APIResponse(response, 'There is no Campaign With This Id', httpStatus.BAD_REQUEST));
    //         }
    //         return res.status(httpStatus.OK).json(new APIResponse({}, 'You Are Not Eligible For Accpet CompaignPrice', httpStatus.BAD_REQUEST));
    //     } catch (error) {
    //         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error in accept campaign price', httpStatus.INTERNAL_SERVER_ERROR, error));
    //     }
    // }

    //decline daily price
    // async declineDailyPrice(req, res) {
    //     let id = req.params.id;

    //     try {
    //         if (req.user.user_role == 'BUSINESS') {
    //             let response = await Campaign.findById(id);
    //             if (response.price_status === 'DECLINED') {
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign Price Already Declined', httpStatus.BAD_REQUEST));
    //             }
    //             if (response.price_status === 'ACCEPTED') {
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'You Accepted This Campaign Price', httpStatus.BAD_REQUEST));
    //             }

    //             if (response) {
    //                 response.price_status = 'DECLINED',
    //                     response.visible = true
    //                 response = await response.save();
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign Price Declined Successfully', httpStatus.OK));
    //             }
    //             return res.status(httpStatus.OK).json(new APIResponse(response, 'There is no Campaign With This Id', httpStatus.BAD_REQUEST));
    //         }
    //         return res.status(httpStatus.OK).json(new APIResponse({}, 'You Are Not Eligible For Decline CompaignPrice', httpStatus.BAD_REQUEST));
    //     } catch (error) {
    //         return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error in declined campaign price', httpStatus.INTERNAL_SERVER_ERROR, error));
    //     }
    // }

    //invite to campaign
    async inviteToCampaign(req, res) {
        let id = req.params.id;

        try {
            if (req.user.user_role == 'BUSINESS') {
                let response = await Campaign.findById(id);
                if (response.price_status === 'DECLINED') {
                    return res.status(httpStatus.OK).json(new APIResponse({}, 'You Cannot invite SMI For Your Campaign ', httpStatus.BAD_REQUEST));
                }

                if (response) {
                    let guests = []
                    if (req.body.invite_smi) {
                        guests = req.body.invite_smi.split(",");
                    }

                    response.invited_smi = guests
                    response = await response.save();

                    let promise = [];
                    let tokens = [];
                    if (response && guests && guests.length) {
                        for (const smi of guests) {
                            let owner = await User.findById(smi);
                            tokens.push(owner.device_token)
                            promise.push(CampaignInvitation.create({
                                campaign_id: response._id,
                                user_id: smi,
                                invited_by: req.user.id,
                                invitation_status: 'RESPONSE_WAITING',
                            }));

                            promise.push(Notification.create({
                                sent_by: req.user.id,
                                sent_to: smi,
                                campaign_name: response.campaign_name,
                                notification_message: `You Are Invited to ${response.campaign_name} Campaign`,
                                notification_type: "CAMPAIGN_INVITATION"
                            }))

                            let mailData = {
                                campaign: response.campaign_name
                            }
                            promise.push(emailHelper.sendMail(owner.email.trim(), 'Account Verification', 'campaign-invitation.html', mailData))
                        }
                    }

                    let message = {
                        tokens: tokens,
                        payload: {
                            notification: {
                                title: "Campaign Invitation",
                                body: `You Are Invited to ${response.campaign_name} Campaign`,
                            }
                        }
                    };

                    await sendToMulti(message);
                    await Promise.all(promise);

                    return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign updated Successfully and Invitation sent to the smi', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse({}, 'There is no Campaign With This Id', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'You Are Not Eligible For Decline CompaignPrice', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error in declined campaign price', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //Campaign get by id
    async getById(req, res) {
        let id = req.params.id;

        try {
            let response = await Campaign.findById(id).lean().exec();
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'Campaign with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error getting Campaign', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all Campaign
    async getAll(req, res) {
        try {
            let response = await Campaign.find({ is_deleted: false, visible: true, price_status: "ACCEPTED" }).sort({updatedAt: -1}).populate('invited_smi').populate({
                path: 'proposals',
                match: { smi: req.user.id }
            }).lean().exec();
            response = response.map((data) => {
                if (data.proposals && data.proposals.length && data.proposals[0].invitation_status === "RESPONSE_WAITING") {
                    data.status = "Applied"
                }
                if (data.proposals && data.proposals.length && data.proposals[0].invitation_status === "ACCEPTED") {
                    data.status = "Accepted"
                }
                if (data.proposals && data.proposals.length && data.proposals[0].is_completed === true) {
                    data.status = "Completed"
                }
                return data;
            })

            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Campaigns fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Campaigns', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async getAllProposalsBusiness(req, res) {
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            const response = {
                data: [],
                totalCount: 0
            };
            const queryFilter = {
                creator: req.user.id,
                is_deleted: false,
                visible: true,
                price_status: "ACCEPTED",
                proposals: { $ne: [] }
            };

            response.totalCount = await Campaign.countDocuments(queryFilter).exec();
            // campaign = campaign.map((data) => {
            //     if (data.proposals && data.proposals.length) {
            //         return data;
            //     }
            //     // return data;
            // })
            // campaign = campaign.filter((el) => {
            //     return el != null;
            // });

            // console.log("=======", campaign);

            // if (page === '1') {
            //     response.totalCount = await Campaign.countDocuments(queryFilter);
            // }
            // response.totalCount = campaign.length ? campaign.length : 0


            response.data = await Campaign.find(queryFilter).sort({updatedAt: -1}).skip(paginationQuery.skip).limit(paginationQuery.limit).populate('invited_smi').populate({
                path: 'proposals',
                populate: {
                    path: 'smi',
                    model: 'User',
                    select: 'first_name last_name business_zipcode stars image'
                }
                // match: { smi: req.user.id }
            }).lean().exec();
            // response.data = response.data.map((data) => {
            //     if (data.proposals && data.proposals.length) {
            //         return data;
            //     }
            //     // return data;
            // })

            // response.data = response.data.filter(function (el) {
            //     return el != null;
            // });

            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Campaigns fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Campaigns', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async getAllBySMI(req, res) {
        // let { limit, skip } = req.query;
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            let proposalRes = await Proposal.find({is_deleted: false, smi: {$eq: req.user.id}},{_id:true}).lean().exec()
            let appliedProp = proposalRes.map(id => (id._id))
            let resp = await Campaign.find({ is_deleted: false, visible: true, price_status: "ACCEPTED", hired: { $ne: true }, proposals: {$nin: appliedProp}}).countDocuments().lean().exec();
            let response = await Campaign.find({ is_deleted: false, visible: true, price_status: "ACCEPTED", hired: { $ne: true }, proposals: {$nin: appliedProp} }).sort({updatedAt: -1}).populate('invited_smi').skip(paginationQuery.skip).limit(paginationQuery.limit).lean().exec();
            // response = JSON.parse(JSON.stringify(response))
            // response = response.map((data) => {
            //     if (!data.proposals.length) {
            //         return data;
            //     }
            //     // return data;
            // })

            // response = response.filter(function (el) {
            //     return el != null;
            // });

            let data = {
                campaigns: [],
                count: 0
            }

            data.campaigns = response
            data.count = resp

            return res.status(httpStatus.OK)
                .json(new APIResponse(data, 'Campaigns fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Campaigns', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all Campaign
    async getAllbyBusinessMan(req, res) {
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            const response = {
                data: [],
                totalCount: 0
            };
            const queryFilter = {
                creator: req.user.id, is_deleted: false, visible: true
            };

            // if (page === '1') {
            //     response.totalCount = await Campaign.countDocuments(queryFilter);
            // }

            let count = await Campaign.countDocuments(queryFilter).lean().exec();

            response.totalCount = count


            response.data = await Campaign.find(queryFilter).sort({updatedAt: -1}).skip(paginationQuery.skip).limit(paginationQuery.limit)
                .populate('invited_smi')
                .populate({
                    path: 'proposals',
                    populate: {
                        path: 'smi',
                    }
                }).lean().exec();
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Campaigns fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Campaigns', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //update Campaign 
    async update(req, res) {
        try {
            if (req.user.user_role == 'BUSINESS') {

                let guests = []
                if (req.body.invite_smi) {
                    guests = req.body.invite_smi.split(",");
                }

                if (req.body.campaign_price) {
                    let price = {
                        campaign_price: req.body.campaign_price,
                        business_price: getBusinessPrice(Number(req.body.campaign_price)).toFixed(2),
                        smi_price: getSMIPrice(Number(req.body.campaign_price)).toFixed(2),
                        sales_tax: salesTaxFee(Number(req.body.campaign_price)).toFixed(2),
                        stripe_fee: stripeFee(Number(req.body.campaign_price)).toFixed(2),
                        total_stripe_fee: totalStripeFee(Number(req.body.campaign_price)).toFixed(2),
                        commission: commission(Number(req.body.campaign_price)).toFixed(2)
                    }

                    req.body.price = price
                }

                let campaign = await Campaign.findById(req.body._id).exec();

                let promise = [];
                let oldGuest = [];
                if (campaign && campaign.invited_smi && campaign.invited_smi.length && guests.length) {
                    guests.map((smi) => {
                        if (campaign.invited_smi.map(x => x).indexOf(smi) != -1) {
                            oldGuest.push(smi)
                        }
                    })
                }

                let removedGuest = [];
                if (campaign && campaign.invited_smi && campaign.invited_smi.length && oldGuest) {

                    for (let [index, smi] of Object.entries(campaign.invited_smi)) {
                        if (oldGuest.map(x => x).indexOf(`${smi}`) == -1) {
                            removedGuest.push(smi)
                            campaign.invited_smi.splice(0, 1)
                            await campaign.save()
                            promise.push(CampaignInvitation.findOneAndDelete({ user_id: smi }))
                        }
                    }
                }

                let newGuest = []
                let tokens = [];
                if (campaign && guests && guests.length && oldGuest) {

                    for (const smi of guests) {
                        if (oldGuest.map(x => x).indexOf(smi) == -1) {
                            newGuest.push(smi)
                            campaign.invited_smi.push(smi)
                            await campaign.save()
                            let owner = await User.findById(smi);
                            tokens.push(owner.device_token)
                            promise.push(CampaignInvitation.create({
                                campaign_id: campaign._id,
                                user_id: smi,
                                invited_by: req.user.id,
                                invitation_status: 'RESPONSE_WAITING',
                            }));
                        }
                    }
                }

                await Promise.all(promise);

                let message = {
                    tokens: tokens,
                    payload: {
                        notification: {
                            title: "Campaign Invitation",
                            body: `You Are Invited to ${campaign.campaign_name} Campaign`,
                        }
                    }
                };

                await sendToMulti(message);

                if (req.file) {
                    req.body.image = req.file.path
                }

                // if (req.body.active) {
                //     req.body.active = req.body.active
                // }

                delete req.body.invite_smi
                const response = await Campaign.update(req.body);
                if (response) {
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'Campaign updated successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse({}, 'Campaign with the specified ID does not exists', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not authorize to update this campaign', httpStatus.BAD_REQUEST));
        } catch (e) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error updating Campaign', httpStatus.INTERNAL_SERVER_ERROR, e));
        }
    }

    //delete Campaign by id
    async delete(req, res) {
        let id = req.params.id;
        try {
            let response = await Campaign.delete(id);
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse({}, 'Campaign deleted successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'Campaign with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error deleting Campaign', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async confirmCampaignPayment (req, res) {
        const { id, payment_id } = req.params;
        try {
            if (!id) {
                return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'No valid campaign ID found', httpStatus.OK));
            }
            let chargeDetails = await stripe.charges.list({
                payment_intent: payment_id,
              });
              let response
              if (chargeDetails.data[0].status) {
                    response = await Campaign.update({ _id: id, paymentConfirmed: true, payment_id: chargeDetails.data[0].id }).lean().exec();
              }
            if (response && response.paymentConfirmed) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Payment Confirmed Successfully', httpStatus.OK));
            } else {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Error while confirming Payment', httpStatus.OK));
            }

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error while confirming Payment', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

}

module.exports = new CampaignController();