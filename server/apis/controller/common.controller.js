"use strict";
const { Campaign } = require("../model/campaign.model");
const { User } = require("../model/user.model");
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');


class CommonController {

    async search(req, res, next) {

        try {
            const { page, limit, search, type } = req.query;
            const { user_role } = req.user;
            const paginationFilter = {
                limit: Number(limit) || 10,
                skip: ((Number(page) - 1) * limit)
            };
            console.log('req.query', req.query, paginationFilter);

            const response = {
                campaigns: [],
                influencers: [],
                campaignsCount: 0,
                influencersCount: 0,
            };

            if (!type || type === '1') {
                const campaignFilter = {
                    is_deleted: false,
                    visible: true,
                    price_status: 'ACCEPTED'
                };

                if (search && search.trim() && search.trim().length) {
                    campaignFilter['$or'] = [
                        { campaign_name: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' } },
                        { zip: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' } }
                    ];
                }

                if (user_role === 'BUSINESS') {
                    campaignFilter.creator = req.user.id;
                } else {
                    campaignFilter.hired = false;
                }

                if (Number(page) === 1) {
                    response.campaignsCount = await Campaign.countDocuments(campaignFilter).lean().exec();
                }
                let campaigns = await Campaign.find(campaignFilter).populate({
                    path: 'proposals',
                    match: { smi: req.user.id }
                }).skip(paginationFilter.skip).limit(paginationFilter.limit).lean().exec();

                campaigns = JSON.parse(JSON.stringify(campaigns))
                campaigns = campaigns.map((data) => {
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

                response.campaigns = campaigns
            }

            if (!type || type !== '1') {
                const userFilter = {
                    $or: [
                        { first_name: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' } },
                        { last_name: { $regex: '.*' + search.toLowerCase() + '.*', $options: 'i' } }
                    ],
                    is_deleted: false,
                    status: 'verified',
                    user_role: 'SMI'
                };

                if (Number(page) === 1) {
                    response.influencersCount = await User.countDocuments(userFilter).exec();
                }

                response.influencers = await User.find(userFilter).skip(paginationFilter.skip).limit(paginationFilter.limit).lean().exec();
            }


            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Operation completed successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Campaigns', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }
}

module.exports = new CommonController();