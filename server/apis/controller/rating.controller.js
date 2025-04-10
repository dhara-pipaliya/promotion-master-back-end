"use strict";
const { Rating } = require("../model/rating.model");
const { Campaign } = require('../model/campaign.model')
const { Proposal } = require('../model/proposal.model')
const { User } = require('../model/user.model')
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const { Types } = require("mongoose");


class RatingController {

    // add CampaignRating
    async addToCampaign(req, res) {
        try {
            if (req.user.user_role == 'SMI') {

                let data = await Rating.findOne({ campaign_id: req.body.campaign_id, smi: req.user.id, rating_type: 'SMI_TO_CAMPAIGN', is_deleted: false });
                if (data) {
                    let response = await Rating.update({ _id: data._id, rating: req.body.rating });

                    // let response = await Rating.update(req.body);
                    if (response) {
                        console.log("=======", response);
                        let avgRating = await Rating.aggregate([
                            {
                                //{ $and: [ { score: { $gt: 70, $lt: 90 } }, { views: { $gte: 1000 } } ] }
                                $match: { $and: [{ campaign_id: Types.ObjectId(response.campaign_id) }, { rating_type: "SMI_TO_CAMPAIGN" }] }
                            },
                            {
                                $group: { _id: "$campaign_id", average: { $avg: "$rating" } }
                            }
                        ]
                        ).exec();
                        console.log("=========", avgRating[0].average.toFixed(1));

                        let data = {
                            _id: response.campaign_id,
                            stars: avgRating[0].average.toFixed(1)
                        }
                        // console.log("=========", data);
                        let campaign = await Campaign.update(data);
                        console.log("===========", campaign);
                        return res.status(httpStatus.OK).json(new APIResponse(campaign, 'Campaign rating updated successfully', httpStatus.OK));
                    }
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'error in updating rating', httpStatus.BAD_REQUEST));
                }

                let rating = new Rating({
                    campaign_id: req.body.campaign_id,
                    smi: req.user.id,
                    rating: req.body.rating,
                    review: req.body.review,
                    rating_type: 'SMI_TO_CAMPAIGN'
                });

                let response = await rating.save();

                if (response) {
                    // console.log("=======", req.body.campaign_id);
                    let avgRating = await Rating.aggregate([
                        {
                            $match: { $and: [{ campaign_id: Types.ObjectId(response.campaign_id) }, { rating_type: "SMI_TO_CAMPAIGN" }] }
                        },
                        {
                            $group: { _id: "$campaign_id", average: { $avg: "$rating" } }
                        }
                    ]
                    ).exec();
                    console.log("=========", avgRating[0].average.toFixed(1));

                    let data = {
                        _id: response.campaign_id,
                        stars: avgRating[0].average.toFixed(1)
                    }
                    // console.log("=========", data);
                    let campaign = await Campaign.update(data);
                    console.log("===========", campaign);
                    let proposal = await Proposal.findOne({ _id: req.body.proposal_id, is_deleted: false });

                    proposal.is_completed_in_Business = true
                    proposal = await proposal.save();
                    return res.status(httpStatus.OK).json(new APIResponse(campaign, 'Campaign rating added successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse(response, 'error in adding rating', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not eligible for rating this Compaign', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding Campaign Rating', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //add SMI rating
    async addToSMI(req, res) {
        try {
            if (req.user.user_role == 'BUSINESS') {

                let data = await Rating.findOne({ smi: req.body.smi, campaign_id: req.body.campaign_id, rating_type: 'BUSINESS_TO_SMI', is_deleted: false });
                if (data) {
                    let response = await Rating.update({ _id: data._id, rating: req.body.rating });

                    // let response = await Rating.update(req.body);
                    if (response) {
                        // console.log("=======", req.body.smi);
                        let avgRating = await Rating.aggregate([
                            {
                                $match: { $and: [{ smi: Types.ObjectId(response.smi) }, { rating_type: "BUSINESS_TO_SMI" }] }
                            },
                            {
                                $group: { _id: "$smi", average: { $avg: "$rating" } }
                            }
                        ]
                        ).exec();
                        // console.log("=========", avgRating[0].average.toFixed(2));

                        let data = {
                            _id: response.smi,
                            stars: avgRating[0].average.toFixed(1)
                        }
                        // console.log("=========", data);
                        let user = await User.update(data);
                        // console.log("===========", user);
                        return res.status(httpStatus.OK).json(new APIResponse(user, 'User rating updated successfully for this Campaign', httpStatus.OK));
                    }
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'error in updating rating', httpStatus.BAD_REQUEST));

                }

                let rating = new Rating({
                    campaign_id: req.body.campaign_id,
                    smi: req.body.smi,
                    business: req.user.id,
                    rating: req.body.rating,
                    review: req.body.review,
                    rating_type: 'BUSINESS_TO_SMI'
                });

                let response = await rating.save();

                if (response) {
                    // console.log("=======", req.body.smi);
                    let avgRating = await Rating.aggregate([
                        {
                            $match: { $and: [{ smi: Types.ObjectId(response.smi) }, { rating_type: "BUSINESS_TO_SMI" }] }
                        },
                        {
                            $group: { _id: "$smi", average: { $avg: "$rating" } }
                        }
                    ]
                    ).exec();
                    // console.log("=========", avgRating[0].average.toFixed(1));

                    let data = {
                        _id: response.smi,
                        stars: avgRating[0].average.toFixed(1)
                    }
                    // console.log("=========", data);
                    let user = await User.update(data);
                    // console.log("===========", user);
                    return res.status(httpStatus.OK).json(new APIResponse(user, 'User rating added successfully for This Campaign', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse(response, 'error in adding rating', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not eligible for rating this SMI', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding User Rating', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all SMI rating
    async getAllSMI(req, res) {
        try {
            let response = await Rating.find({ rating_type: "BUSINESS_TO_SMI", is_deleted: false });
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Rating fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Rating', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all Campaign rating
    async getAllCampaign(req, res) {
        try {
            let response = await Rating.find({ rating_type: "SMI_TO_CAMPAIGN", is_deleted: false });
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Rating fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Rating', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    // //update campaign rating
    // async updateCompaignRating(req, res, next) {
    //     let { campaign_id, rating } = req.body;
    //     try {
    //         if (req.user.user_role == "SMI") {

    //             let data = await Rating.findOne({ campaign_id: campaign_id, smi: req.user.id, rating_type: 'SMI_TO_CAMPAIGN', is_deleted: false });
    //             if (data) {
    //                 let response = await Rating.update({ _id: data._id, rating: rating });

    //                 // let response = await Rating.update(req.body);
    //                 if (response) {
    //                     // console.log("=======", req.body.campaign_id);
    //                     let avgRating = await Rating.aggregate([
    //                         {
    //                             $match: { campaign_id: Types.ObjectId(response.campaign_id) }
    //                         },
    //                         {
    //                             $group: { _id: "$campaign_id", average: { $avg: "$rating" } }
    //                         }
    //                     ]
    //                     ).exec();
    //                     // console.log("=========", avgRating[0].average.toFixed(1));

    //                     let data = {
    //                         _id: response.campaign_id,
    //                         stars: avgRating[0].average.toFixed(1)
    //                     }
    //                     // console.log("=========", data);
    //                     let campaign = await Campaign.update(data);
    //                     console.log("===========", campaign);
    //                     return res.status(httpStatus.OK).json(new APIResponse(campaign, 'Campaign rating updated successfully', httpStatus.OK));
    //                 }
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'error in updating rating', httpStatus.BAD_REQUEST));
    //             }
    //             return res.status(httpStatus.OK).json(new APIResponse({}, 'you cant update this campaign rating ', httpStatus.BAD_REQUEST));
    //         }
    //         return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not authorize to update this Campaign Rating', httpStatus.BAD_REQUEST));
    //     } catch (e) {
    //         return res.status(httpStatus.INTERNAL_SERVER_ERROR)
    //             .json(new APIResponse(null, 'Error updating Campaign Rating', httpStatus.INTERNAL_SERVER_ERROR, e));
    //     }
    // }

    // //update SMI rating
    // async updateSMIRating(req, res, next) {
    //     let { smi, campaign_id, rating } = req.body;
    //     try {
    //         if (req.user.user_role == "BUSINESS") {

    //             let data = await Rating.findOne({ smi: smi, campaign_id: campaign_id, rating_type: 'BUSINESS_TO_SMI', is_deleted: false });
    //             if (data) {
    //                 let response = await Rating.update({ _id: data._id, rating: rating });

    //                 // let response = await Rating.update(req.body);
    //                 if (response) {
    //                     // console.log("=======", req.body.smi);
    //                     let avgRating = await Rating.aggregate([
    //                         {
    //                             $match: { smi: Types.ObjectId(response.smi) }
    //                         },
    //                         {
    //                             $group: { _id: "$smi", average: { $avg: "$rating" } }
    //                         }
    //                     ]
    //                     ).exec();
    //                     // console.log("=========", avgRating[0].average.toFixed(2));

    //                     let data = {
    //                         _id: response.smi,
    //                         stars: avgRating[0].average.toFixed(1)
    //                     }
    //                     // console.log("=========", data);
    //                     let user = await User.update(data);
    //                     // console.log("===========", user);
    //                     return res.status(httpStatus.OK).json(new APIResponse(user, 'User rating updated successfully for this Campaign', httpStatus.OK));
    //                 }
    //                 return res.status(httpStatus.OK).json(new APIResponse(response, 'error in updating rating', httpStatus.BAD_REQUEST));
    //             }
    //             return res.status(httpStatus.OK).json(new APIResponse({}, 'you cant update this User rating ', httpStatus.BAD_REQUEST));
    //         }
    //         return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not authorize to update this User Rating', httpStatus.BAD_REQUEST));
    //     } catch (e) {
    //         return res.status(httpStatus.INTERNAL_SERVER_ERROR)
    //             .json(new APIResponse(null, 'Error updating User Rating', httpStatus.INTERNAL_SERVER_ERROR, e));
    //     }
    // }
}

module.exports = new RatingController()