"use strict";
const hash = require('object-hash');
const { Campaign } = require("../model/campaign.model");
const { Proposal } = require('../model/proposal.model')
const { User } = require('../model/user.model');
const { ApplicantCode } = require('../model/applicantCode.model');
const { Notification } = require("../model/notification.model");
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const { sendPushNotification, sendToMulti } = require('../../helpers/pushNotifications');
let emailHelper = require('../../helpers/emailHelper');
const { getPaginateQuery } = require('../../helpers/utils');
const stripe = require('stripe')('sk_test_51IC6MVC79xcHe3tCP5OK2l4Zb2NQx7ls93MFD1XFm6MoN49iFlhIMEutwiT0yWtRrQ3qN48BbIElduQcc0shjHTB005fBhnRRk')


class ProposalController {

    // add to Campaign
    async applyToCampaign(req, res, next) {
        try {
            // const now = new Date();
            if (req.user.user_role == 'BUSINESS') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to applying this Campaign', httpStatus.BAD_REQUEST));
            }

            let campaign = await Campaign.findOne({ _id: req.body.campaign, is_deleted: false }).populate('creator').exec();

            if (campaign.hired) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Already Hired One SMI', httpStatus.BAD_REQUEST));
            }

            if (!campaign) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Campaign is not available with this ID', httpStatus.BAD_REQUEST));
            }

            // if (campaign.expiration <= now) {
            //     return res.status(httpStatus.OK)
            //         .json(new APIResponse({}, 'Campaign is Expired', httpStatus.BAD_REQUEST));
            // }


            let OldProposal = await Proposal.findOne({ campaign: req.body.campaign, smi: req.user.id, is_deleted: false }).lean().exec();
            if (OldProposal) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(OldProposal, 'You Have Already Applied To This Campaign', httpStatus.BAD_REQUEST));
            }

            let proposal = new Proposal({
                campaign: req.body.campaign,
                smi: req.user.id,
                description: req.body.description,
                cover_letter: req.body.cover_letter
            });
            proposal = await proposal.save();

            if (proposal) {
                campaign.proposals.push(proposal._id);
                campaign = await campaign.save();

                let data = {
                    token: campaign.creator.device_token,
                    payload: {
                        notification: {
                            title: "Proposal Request",
                            body: `${req.user.user_name} Want To Join Your Campaign ${campaign.campaign_name}`,
                        }
                    }
                };
                let notify = await sendPushNotification(data);
                // console.log("========", notify);
                let notificationData = {
                    sent_by: req.user.id,
                    sent_to: campaign.creator._id,
                    campaign_name: campaign.campaign_name,
                    notification_message: `${req.user.user_name} Want To Join Your Campaign ${campaign.campaign_name}`,
                    notification_type: "APPLY_CAMPAIGN"
                }
                const notification = new Notification(notificationData);
                await notification.save();
                const userData = await User.findOne({_id: campaign.creator._id})
                userData.notificationCount = userData.notificationCount + 1
                await userData.save()
                let mailData = {
                    smi_name: req.user.user_name,
                    campaign: campaign.campaign_name
                }

                await emailHelper.sendMail(campaign.creator.email.trim(), 'Campaign Proposal', 'campaign-proposal.html', mailData);

                return res.status(httpStatus.OK)
                    .json(new APIResponse(proposal, 'proposal added successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'there is error in adding proposal', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error in adding Proposal', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async cancelPropsal(req, res, next) {
        try {
            // const now = new Date();
            if (req.user.user_role == 'BUSINESS') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to applying this Campaign', httpStatus.BAD_REQUEST));
            }

            let campaign = await Campaign.findOne({ _id: req.body.campaign, is_deleted: false }).populate('creator').exec();

            // if (campaign.hired) {
            //     return res.status(httpStatus.OK)
            //         .json(new APIResponse({}, 'Already Hired One SMI', httpStatus.BAD_REQUEST));
            // }

            if (!campaign) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Campaign is not available with this ID', httpStatus.BAD_REQUEST));
            }

            // if (campaign.expiration <= now) {
            //     return res.status(httpStatus.OK)
            //         .json(new APIResponse({}, 'Campaign is Expired', httpStatus.BAD_REQUEST));
            // }


            let OldProposal = await Proposal.findOne({ campaign: req.body.campaign, smi: req.user.id, is_deleted: false }).exec();
            // if (OldProposal) {
            //     return res.status(httpStatus.OK)
            //         .json(new APIResponse(OldProposal, 'You Have Already Applied To This Campaign', httpStatus.BAD_REQUEST));
            // }

            // let proposal = new Proposal({
            //     campaign: req.body.campaign,
            //     smi: req.user.id,
            //     description: req.body.description,
            //     cover_letter: req.body.cover_letter
            // });
            // proposal = await proposal.save();

            if (OldProposal) {
                let index = campaign.proposals.indexOf(OldProposal._id);
                if (index >= 0) {
                    campaign.proposals.splice(index, 1);
                }
                campaign = await campaign.save();
                OldProposal.is_deleted = true
                await OldProposal.save();


                return res.status(httpStatus.OK)
                    .json(new APIResponse(campaign, 'proposal cancel successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'there is error in cancel proposal', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error in cancel Proposal', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //accept invitation
    async acceptSmi(req, res, next) {
        try {

            if (req.user.user_role == 'SMI') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to accept Campaign Proposal', httpStatus.BAD_REQUEST));
            }

            let proposal = await Proposal.findOne({ _id: req.body.proposal_id, is_deleted: false }).populate('smi').populate('campaign').exec();
            // console.log("proposal=========>>>>>>>>", proposal);
            let campaign = await Campaign.findOne({ _id: proposal.campaign._id, is_deleted: false }).exec();
            // console.log("campaign=========>>>>>>>>", campaign);

            if (campaign.hired) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Already Hired One SMI', httpStatus.BAD_REQUEST));
            }

            if (!proposal) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'proposal not found', httpStatus.BAD_REQUEST));
            }
            if (!proposal.campaign) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Campaign not found', httpStatus.BAD_REQUEST));
            }
            if (!proposal.smi) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'SMI not found', httpStatus.BAD_REQUEST));
            }
            if (proposal.invitation_status == 'DECLINED') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Proposal Already Declined', httpStatus.BAD_REQUEST));
            }
            if (proposal.invitation_status == 'ACCEPTED') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(proposal, 'Proposal Already Accepted', httpStatus.BAD_REQUEST));
            }

            // proposal.invitation_status = 'ACCEPTED'
            // let response = await proposal.save();
            if (proposal) {
                proposal.invitation_status = 'ACCEPTED'

                campaign.hired = true;
                campaign = await campaign.save();
                // console.log("=========>>>>>>>>", campaign);
                let code = hash.MD5(`${req.user.id}:${req.user.email}:${new Date()}`);

                let applicantCode = new ApplicantCode({
                    proposal: proposal._id,
                    unique_code: code
                });
                applicantCode = await applicantCode.save();

                proposal.code_id = applicantCode._id
                proposal = await proposal.save();

                if (!applicantCode) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Error in Generating Code', httpStatus.BAD_REQUEST));
                }


                let data = {
                    token: proposal.smi.device_token,
                    payload: {
                        notification: {
                            title: "Proposal Request",
                            body: `your proposal to ${proposal.campaign.campaign_name} accepted , your unique code is ${applicantCode.unique_code}`,
                        }
                    }
                };

                let notify = await sendPushNotification(data);
                // console.log("--------> ", notify);
                let notificationData = {
                    sent_by: req.user.id,
                    sent_to: proposal.smi._id,
                    campaign_name: proposal.campaign.campaign_name,
                    notification_message: `your proposal to ${proposal.campaign.campaign_name} accepted , your unique code is ${applicantCode.unique_code}`,
                    notification_type: "ACCEPT_PROPOSAL"
                }
                const notification = new Notification(notificationData);
                await notification.save();
                const userData = await User.findOne({_id: proposal.smi._id})
                userData.notificationCount = userData.notificationCount + 1
                await userData.save()
                let mailData = {
                    code: applicantCode.unique_code,
                    campaign: proposal.campaign.campaign_name
                }

                await emailHelper.sendMail(proposal.smi.email.trim(), 'Proposal Accept', 'proposal-accept.html', mailData);

                return res.status(httpStatus.OK)
                    .json(new APIResponse(proposal, `Proposal Accepted successfully, your Code:${applicantCode.unique_code}`, httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'There is Some Error in Accept Proposal', httpStatus.OK));


        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error Accept Proposal', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //declined invitation
    async declineSmi(req, res, next) {
        try {

            if (req.user.user_role == 'SMI') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to accept Campaign Proposal', httpStatus.BAD_REQUEST));
            }

            let proposal = await Proposal.findOne({ _id: req.body.proposal_id, is_deleted: false }).populate('smi').populate('campaign').exec();
            // console.log("=========>>>>>>>>", proposal);


            if (!proposal) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'proposal not found', httpStatus.BAD_REQUEST));
            }
            if (!proposal.campaign) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Campaign not found', httpStatus.BAD_REQUEST));
            }
            if (!proposal.smi) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'SMI not found', httpStatus.BAD_REQUEST));
            }
            if (proposal.invitation_status == 'DECLINED') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Proposal Already Declined', httpStatus.BAD_REQUEST));
            }
            if (proposal.invitation_status == 'ACCEPTED') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(proposal, 'Proposal Already Accepted', httpStatus.BAD_REQUEST));
            }



            proposal.invitation_status = 'DECLINED'
            let response = await proposal.save();
            if (response) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Proposal Declined successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'There is Some Error in Decline Proposal', httpStatus.BAD_REQUEST));


        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error Accept Proposal', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all proposals
    async getAll(req, res, next) {
        try {
            // if (req.user.user_role == 'SMI') {
            //     return res.status(httpStatus.OK)
            //         .json(new APIResponse({}, 'you are not authorize to See Campaign Proposal', httpStatus.BAD_REQUEST));
            // }

            let response = await Proposal.find({ is_deleted: false }).sort({updatedAt: -1}).populate('smi').populate('campaign').lean().exec();
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Proposal Fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error In Getting Proposals', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all proposals of user
    async getAllProposalOfSMI(req, res, next) {
        // let { limit, skip } = req.query;
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            if (req.user.user_role == 'BUSINESS') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to See Campaign Proposal', httpStatus.BAD_REQUEST));
            }

            let resp = await Proposal.countDocuments({ smi: req.user.id, is_deleted: false, invitation_status: "RESPONSE_WAITING" }).lean().exec();

            let response = await Proposal.find({ smi: req.user.id, is_deleted: false, invitation_status: "RESPONSE_WAITING" }).sort({updatedAt: -1})
                .populate('campaign').populate('smi').skip(paginationQuery.skip).limit(paginationQuery.limit).lean().exec();

            let data = {
                proposals: [],
                count: 0
            }

            data.proposals = response
            data.count = resp
            return res.status(httpStatus.OK)
                .json(new APIResponse(data, 'Proposal Fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error In Getting Proposals', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async acceptedProposalSMI(req, res, next) {
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            if (req.user.user_role == 'BUSINESS') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to See Campaign Proposal', httpStatus.BAD_REQUEST));
            }

            let data = {
                proposals: [],
                count: 0
            }

            let resp = await Proposal.countDocuments({
                smi: req.user.id,
                is_deleted: false,
                $or: [
                    { invitation_status: "ACCEPTED" },
                    { completion_status: "ACCEPTED" }
                ],
            }).lean().exec();


            let response = await Proposal.find({
                smi: req.user.id,
                is_deleted: false,
                $or: [
                    { invitation_status: "ACCEPTED" },
                    { completion_status: "ACCEPTED" }
                ],
            }).sort({updatedAt: -1})
                .populate('campaign').populate('smi').populate('code_id').skip(paginationQuery.skip).limit(paginationQuery.limit).lean().exec();


            data.proposals = response,
                data.count = resp
            return res.status(httpStatus.OK)
                .json(new APIResponse(data, 'Proposal Fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error In Getting Proposals', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get proposal by id
    async getProposalById(req, res, next) {
        const { id } = req.params;
        try {
            let response = await Proposal.findById({ _id: id, is_deleted: false }).populate('smi').populate('campaign').lean().exec();
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Proposal Fetch successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error In Getting Proposal', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //update proposal by id
    async updateProposal(req, res, next) {
        try {
            delete req.body.invitation_status;
            if (req.user.user_role == 'BUSINESS') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to Update Campaign Proposal', httpStatus.BAD_REQUEST));
            }
            let proposal = await Proposal.findOne({ _id: req.body._id, is_deleted: false }).lean().exec();

            if (!proposal) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Proposal With This Id Is Not Available', httpStatus.BAD_REQUEST));
            }

            if (proposal.invitation_status === "ACCEPTED") {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Your Proposal Accepted,Now You Cannot Edit Your Proposal', httpStatus.BAD_REQUEST));
            }

            if (proposal.invitation_status === "DECLINED") {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Your Proposal Declined,Now You Cannot Edit Your Proposal', httpStatus.BAD_REQUEST));
            }

            let response = await Proposal.update(req.body);
            if (response) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Proposal Updated successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'There is Some Error in Update Proposal', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error Update Proposal', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async completeProposal(req, res, next) {
        try {
            delete req.body.invitation_status;
            delete req.body.description;
            delete req.body.cover_letter;


            if (req.user.user_role == 'BUSINESS') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to Complete Campaign Proposal', httpStatus.BAD_REQUEST));
            }
            let proposal = await Proposal.findOne({ _id: req.body._id, smi: req.user.id, is_deleted: false }).populate('campaign').exec();
            // console.log("==========", proposal);

            if (!proposal) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Proposal With This Id Is Not Available', httpStatus.BAD_REQUEST));
            }

            if (proposal.invitation_status === "DECLINED") {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'You Cannot Complete This Proposal', httpStatus.BAD_REQUEST));
            }

            if (proposal.invitation_status === "RESPONSE_WAITING") {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Your Proposal Not Accepted Yet', httpStatus.BAD_REQUEST));
            }

            let [BusinessMan, code, user] = await Promise.all([
                User.findOne({ _id: proposal.campaign.creator, is_deleted: false }),
                ApplicantCode.findOne({ unique_code: req.body.code, proposal: req.body._id, used: false }),
                User.findOne({ _id: req.user.id, is_deleted: false }),
            ]);


            if (!code) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Code Is Used', httpStatus.BAD_REQUEST));
            }

            code.used = true
            code = await code.save();


            if (!code) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Error In Code Used', httpStatus.BAD_REQUEST));
            }

            let data = {
                token: BusinessMan.device_token,
                payload: {
                    notification: {
                        title: "Completion Request",
                        body: `${req.user.user_name} Completed Your Campaign Using Code : ${code.unique_code},Give Review`,
                    }
                }
            };
            let notify = await sendPushNotification(data);

            let notificationData = {
                sent_by: req.user.id,
                sent_to: BusinessMan._id,
                campaign_name: proposal.campaign.campaign_name,
                notification_message: `${req.user.user_name} Completed Your Campaign Using Code : ${code.unique_code},Give Review`,
                notification_type: "COMPLETE_PROPOSAL"
            }
            const notification = new Notification(notificationData);
            await notification.save();
            const userData = await User.findOne({_id: BusinessMan._id})
            userData.notificationCount = userData.notificationCount + 1
            await userData.save()
            let mailData = {
                code: code.unique_code,
                smi_name: req.user.user_name
            }

            await emailHelper.sendMail(BusinessMan.email.trim(), 'Campaign Complete Request', 'campaign-complete.html', mailData);

            // proposal.is_completed = true
            proposal.completion_description = req.body.completion_description || '';
            proposal.completion_status = "RESPONSE_WAITING"

            let response = await proposal.save();

            if (response) {
                user.my_campaign.push(response.campaign)
                user.campaign_count = user.my_campaign.length
                await user.save();
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Campaign Completed successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'There is Some Error in Complete Proposal', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error Complete Campaign', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async accepteCompletionStatus(req, res, next) {
        try {
            if (req.user.user_role == 'SMI') {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not authorize to Complete Campaign Proposal', httpStatus.BAD_REQUEST));
            }
            let proposal = await Proposal.findOne({ _id: req.body._id, is_deleted: false }).populate('smi').populate('campaign');
            // console.log("==========", proposal);

            if (!proposal) {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Proposal With This Id Is Not Available', httpStatus.BAD_REQUEST));
            }

            if (proposal.completion_status === "DECLINED") {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Already Declined', httpStatus.BAD_REQUEST));
            }

            if (proposal.completion_status === "ACCEPTED") {
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'Already Accepted', httpStatus.BAD_REQUEST));
            }

            proposal.is_completed_in_SMI = true
            proposal.completion_status = "ACCEPTED"


            let response = await proposal.save();

            let data = {
                token: proposal.smi.device_token,
                payload: {
                    notification: {
                        title: "Proposal Completion Accept",
                        body: `Your Submitted Campaign Is Accpeted,Please Give review And Rating To ${proposal.campaign.campaign_name}`,
                    }
                }
            };
            let notify = await sendPushNotification(data);

            let notificationData = {
                sent_by: req.user.id,
                sent_to: proposal.smi._id,
                campaign_name: proposal.campaign.campaign_name,
                notification_message: `Your Submitted Campaign Is Accpeted,Please Give review And Rating To ${proposal.campaign.campaign_name}`,
                notification_type: "ACCEPT_COMPLETE_PROPOSAL"
            }
            const notification = new Notification(notificationData);
            await notification.save();
            const userData = await User.findOne({_id: proposal.smi._id})
            userData.notificationCount = userData.notificationCount + 1
            await userData.save()
            let mailData = {
                campaign_name: proposal.campaign.campaign_name
            }

            await emailHelper.sendMail(proposal.smi.email.trim(), 'Campaign Rating', 'campaign-rating.html', mailData);

            if (response) {
                let user = await User.findOne({ _id: req.user.id, is_deleted: false })
                user.my_campaign.push(response.campaign)
                user.campaign_count = user.my_campaign.length
                await user.save();
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Proposal Completion Accepted successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'There is Some Error in Accept Proposal Completion', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error Accept Proposal Completion', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    // async confirmProposalPayment (req, res) {
    //     const { id, payment_id } = req.params;
    //     try {
    //         console.log("payment_id ------> ", payment_id);
    //         if (!id) {
    //             return res.status(httpStatus.OK)
    //             .json(new APIResponse({}, 'No valid proposal ID found', httpStatus.OK));
    //         }
    //         let response = await stripe.charges.list({
    //             payment_intent: payment_id,
    //           });
    //           console.log("charge id",response.data[0].id)
    //           console.log("response-----> ", response);
    //         // let response = await Proposal.update({ _id: id, paymentConfirmed: true, payment_id: payment_id }).lean().exec();
    //         // if (response && response.paymentConfirmed) {
    //             return res.status(httpStatus.OK)
    //                 .json(new APIResponse(response, 'Payment Confirmed Successfully', httpStatus.OK));
    //         // } else {
    //         //     return res.status(httpStatus.OK)
    //         //         .json(new APIResponse({}, 'Error while confirming Payment', httpStatus.OK));
    //         // }

    //     } catch (error) {
    //         return res.status(httpStatus.INTERNAL_SERVER_ERROR)
    //             .json(new APIResponse(null, 'Error while confirming Payment', httpStatus.INTERNAL_SERVER_ERROR, error));
    //     }
    // }

}

module.exports = new ProposalController();