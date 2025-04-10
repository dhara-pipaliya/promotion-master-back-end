"use strict";
const { Campaign } = require("../model/campaign.model");
const { CampaignInvitation } = require('../model/campaignInvitation.model')
const { User } = require('../model/user.model');
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');


class CampaignInvitationController {

    // add to Campaign
    async addToCampaign(req, res, next) {
        try {
            if (req.user.user_role == 'BUSINESS') {

                let campaign = await Campaign.findById({ _id: req.body.campaign_id, is_deleted: false }).lean().exec();
                if (!campaign) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Campaign not found', httpStatus.BAD_REQUEST));
                }

                let invitation = await CampaignInvitation.findOne({ campaign_id: req.body.campaign_id, user_id: req.body.user_id, is_deleted: false }).lean().exec();
                if (invitation) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Invitation already sent', httpStatus.BAD_REQUEST));
                }

                let response = new CampaignInvitation({
                    campaign_id: req.body.campaign_id,
                    user_id: req.body.user_id,
                    invited_by: req.user.id,
                    invitation_status: "RESPONSE_WAITING",
                })

                response = await response.save()

                if (response) {
                    campaign.invited_smi.push(req.body.user_id)
                    campaign = await campaign.save()
                    return res.status(httpStatus.OK)
                        .json(new APIResponse(campaign, 'Invitation sent successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'error in sent invitation', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to create CampaignInvitation', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error adding CampaignInvitation', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //remove from campaign
    async removeFromCampaign(req, res, next) {
        try {
            if (req.user.user_role == 'BUSINESS') {

                let campaign = await Campaign.findById({ _id: req.body.campaign_id, is_deleted: false }).lean().exec();
                if (!campaign) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Campaign not found', httpStatus.BAD_REQUEST));
                }

                let response = await CampaignInvitation.findOneAndDelete({ campaign_id: req.body.campaign_id, user_id: req.body.user_id, is_deleted: false }).lean().exec();
                if (response) {
                    let index = campaign.invited_smi.indexOf(req.body.user_id);
                    if (index > -1) {
                        campaign.invited_smi.splice(index, 1);
                        campaign = await campaign.save()
                        return res.status(httpStatus.OK)
                            .json(new APIResponse(campaign, 'Remove Invitation from campaign successfully', httpStatus.OK));
                    }
                }
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you have not sent invitation to this user', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to create CampaignInvitation', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error adding CampaignInvitation', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //CampaignInvitation get by id
    async getById(req, res, next) {
        let id = req.params.id;

        try {
            if (req.user.user_role == 'BUSINESS') {
                let response = await CampaignInvitation.findById(id).lean().exec();
                if (response) {
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'CampaignInvitation fetched successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse({}, 'CampaignInvitation with the specified ID does not exists', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to create CampaignInvitation', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error getting CampaignInvitation', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all CampaignInvitation
    async getAll(req, res, next) {
        try {
            if (req.user.user_role == 'BUSINESS') {
                let response = await CampaignInvitation.find({ is_deleted: false }).lean().exec();
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'CampaignInvitations fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to create CampaignInvitation', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting CampaignInvitations', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //accept invitation
    async acceptInvitation(req, res, next) {
        try {
            if (req.user.user_role == 'SMI') {

                let campaign = await Campaign.findById({ _id: req.body.campaign_id, is_deleted: false }).lean().exec();
                if (!campaign) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Campaign not found', httpStatus.BAD_REQUEST));
                }

                let response = await CampaignInvitation.findOne({ user_id: req.body.user_id, campaign_id: req.body.campaign_id, is_deleted: false }).lean().exec();
                if (response.invitation_status == 'ACCEPTED') {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse(response, 'Invitation Already Accepted', httpStatus.BAD_REQUEST));
                }


                if (response) {
                    response.invitation_status = 'ACCEPTED'
                    response = await response.save();
                    let user = await User.findOne({ _id: req.body.user_id, is_deleted: false }).lean().exec();
                    if (user) {
                        user.my_campaign.push(req.body.campaign_id)
                        await user.save();
                    }
                    return res.status(httpStatus.OK)
                        .json(new APIResponse(response, 'Invitation Accepted successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not invited in this campaign', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to accept CampaignInvitation', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error deleting CampaignInvitation', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //declined invitation
    async declinedInvitation(req, res, next) {
        try {
            if (req.user.user_role == 'SMI') {

                let campaign = await Campaign.findById({ _id: req.body.campaign_id, is_deleted: false }).lean().exec();
                if (!campaign) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Campaign not found', httpStatus.BAD_REQUEST));
                }

                let response = await CampaignInvitation.findOne({ user_id: req.body.user_id, campaign_id: req.body.campaign_id, is_deleted: false }).lean().exec();

                if (response.invitation_status == 'DECLINED') {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse(response, 'Invitation Already Declined', httpStatus.BAD_REQUEST));
                }

                if (response) {
                    response.invitation_status = 'DECLINED'
                    response = await response.save();
                    return res.status(httpStatus.OK)
                        .json(new APIResponse(response, 'Invitation Declined successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK)
                    .json(new APIResponse({}, 'you are not invited in this campaign', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to accept CampaignInvitation', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error deleting CampaignInvitation', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

}

var exports = (module.exports = new CampaignInvitationController());