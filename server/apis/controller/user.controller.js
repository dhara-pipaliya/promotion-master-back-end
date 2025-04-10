"use strict";
const hash = require('object-hash');
const { User } = require("../model/user.model");
const { Campaign } = require("../model/campaign.model");
const { Verification } = require('../model/verification.model')
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const Utils = require('../../helpers/utils')
let JWTHelper = require('../../helpers/jwt.helper');
let emailHelper = require('../../helpers/emailHelper');
const { getPaginateQuery } = require('../../helpers/utils');
const siteUrl = process.env.SITE_URL
console.log("siteUrl",siteUrl);
const { Rating } = require('../model/rating.model');
const { unlinkSync, existsSync } = require("fs");
const bcrypt = require('bcrypt');
const saltRounds = 10

class UserController {

    //sign up user
    async signUp(req, res) {
        try {
            const userExists = await User.findOne({ $or: [{ email: req.body.email }, { user_name: req.body.user_name }] }).lean();

            // const userName = await User.findOne({ user_name: req.body.user_name })
            // $or: [{ email: req.body.email }, { user_name: req.body.user_name }]
            if (userExists && userExists.user_name === req.body.user_name) {
                return res.status(httpStatus.OK).json(new APIResponse({}, 'this username is already exist', httpStatus.BAD_REQUEST));
            }
            if (!userExists) {
                // if (req.body.password === req.body.confirm_password) {
                req.body.status = 'registered';
                req.body.password = await bcrypt.hash(req.body.password, saltRounds);
                // req.body.status = 'verified';
                let model = new User(req.body);
                let user = await model.save();
                if (user) {
                    let verifyToken = hash.MD5(`${user._id}:${user.email}:${user.app}`)

                    let verifyData = {
                        user: user._id,
                        token: verifyToken
                    }
                    let verify = await Verification.findByUser(user._id);

                    if (verify) {
                        return res.status(httpStatus.BAD_REQUEST).json(new APIResponse({}, 'a verification email has already been sent', httpStatus.BAD_REQUEST));
                    }

                    verify = new Verification(verifyData)
                    verify = await verify.save()

                    // JWTHelper = require('../../helpers/jwt.helper');

                    const token = JWTHelper.getJWTToken({
                        id: user._id,
                        user_name: user.user_name,
                        email: user.email,
                        user_role: user.user_role,
                    });
                    console.log("======", `${siteUrl}/api/v1/verification/?token=${verifyToken}`);
                    let mailData = {
                        link: `${siteUrl}/api/v1/verification/?token=${verifyToken}`
                    }

                    await emailHelper.sendMail(user.email.trim(), 'Account Verification', 'customer-verification.html', mailData);
                    let response = user
                    response[token] = token
                    // let response = {
                    //     // ...JSON.parse(JSON.stringify(user)),
                    //     ...user,
                    //     token: token
                    // }
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'User added successfully, please check your email for verifying your account', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse({}, 'there is error adding user', httpStatus.BAD_REQUEST));
                // }
                // return res.status(httpStatus.OK).json(new APIResponse({}, 'confirm password do not match with password', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'User already exist with this email', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //login user
    async login(req, res) {
        let body = req.body;
        try {
            let response = await User.login(body.email, body.user_name);
            if (response && await bcrypt.compare(body.password, response.password)) {
                if (response.status === 'verified') {
                    // JWTHelper = require('../../helpers/jwt.helper');

                    const token = JWTHelper.getJWTToken({
                        id: response.id,
                        user_name: response.user_name,
                        email: response.email,
                        user_role: response.user_role
                    });

                    response.device_token = req.body.device_token || ""
                    response.active = true
                    await response.save();
                    response = {
                        ...JSON.parse(JSON.stringify(response)),
                        token: token
                    }

                    return res.status(httpStatus.OK).json(new APIResponse(response, 'Login Successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse({}, 'Please!!!,Verify Your Account', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'Please !!!,Check Your Credential', httpStatus.UNAUTHORIZED));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error Authenticating User', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async socialLogin(req, res) {
        try {
            let { email, user_role } = req.body;

            let response = await User.socialLogin(email, user_role);

            if (!response) {
                let count = await User.findOne({ email: email, user_role: user_role });
                if (count) {
                    return res.status(httpStatus.OK).json(new APIResponse(null, 'email with this user role already exists plz check!', httpStatus.UNAUTHORIZED));
                }
                req.body.status = "verified";
                response = new User(req.body);
                response = await response.save();

                if (req.body.image) {
                    console.log("profile upload");
                    response.image = req.body.image
                    response = await response.save();
                }
            }

            if (response) {

                // JWTHelper = require('../../helpers/jwt.helper');

                const token = JWTHelper.getJWTToken({
                    id: response._id,
                    user_name: response.user_name,
                    email: response.email,
                    user_role: response.user_role,
                });
                response = await User.update({
                    _id: response._id,
                    // token: token,
                    facebook_id: req.body.facebook_id || '',
                    google_id: req.body.google_id || '',
                    active: true
                });

                console.log("============", token);
                let data = {
                    ...JSON.parse(JSON.stringify(response)),
                    token: token
                }
                return res.status(httpStatus.OK).json(new APIResponse(data, 'Login successfully', httpStatus.OK))
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'Authentication error', httpStatus.UNAUTHORIZED));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, "Error authenticating user", httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //user get by id
    async getById(req, res) {
        let id = req.params.id;

        try {
            let [response, followersCount, businessReview] = await Promise.all(
                [
                    User.findById(id).lean().exec(),
                    User.find({ favourite: { $in: id } }).countDocuments().lean().exec(),
                    Rating.find({
                        smi: id
                    }).populate(
                        {
                            path: "campaign_id",
                            select: "campaign_name"
                        }
                    ).lean().exec()
                ]
            )
            // response = Object.assign(response, {
            //     'followersCount': followersCount,
            //     'businessReviewCount': businessReviewCount,
            //     'followingCount': response.favourite.length
            // })
            const reviewsGroupedByCampaign = businessReview.reduce((obj, review) => {
                const campaignId = review.campaign_id._id.toString();
                if (!obj[campaignId]) {
                    obj[campaignId] = [];
                }

                if (review.rating_type === 'BUSINESS_TO_SMI') {
                    obj[campaignId][0] = {
                        ...review,
                        campaign_name: review.campaign_id.campaign_name
                    };
                } else {
                    obj[campaignId][1] = {
                        ...review,
                        campaign_name: review.campaign_id.campaign_name
                    };
                }
                return obj;
            }, {});
            response.followersCount = followersCount
            response.businessReviewCount = Object.values(reviewsGroupedByCampaign).length;
            response.followingCount = response.favourite.length;
            response.businessReview = reviewsGroupedByCampaign;
            // let response = await User.findById(id);
            // let followersCount = await User.find({favourite: {$in: id}}).count().lean().exec()
            // let businessReviewCount = await Rating.find({smi: id, rating_type: "BUSINESS_TO_SMI"}).count().lean().exec()
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(response, 'User fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'User with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            console.log("error----------?>", error);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error getting user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all user
    async getAll(req, res) {
        try {
            let response = await User.find({ is_deleted: false });
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Users fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting users', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    // async socialMedia(req, res, next) {
    //     try {
    //         let response = await User.findOne({ _id: req.user.id, is_deleted: false });
    //         if (req.body.social_media === 'instagram' && response) {
    // let instagram = {
    //     user_name: req.body.user_name,
    // }
    // const insta = await fetch(`https://www.instagram.com/${req.body.user_name}/?__a=1`);

    // const data = await insta.json();

    // let followers = data.graphql.user.edge_followed_by.count

    // if (followers) {
    //     let total = followers + response.followers_stats.facebook
    //     response.followers_stats.instagram = followers
    //     response.social_accounts.instagram = instagram
    //     response.followers_stats.total = total
    //     response = await response.save();
    //     return res.status(httpStatus.OK)
    //         .json(new APIResponse(response, 'socialmedia added successfully', httpStatus.OK));
    // }
    //             return res.status(httpStatus.OK)
    //                 .json(new APIResponse({}, 'there is problem in getting instagram followers', httpStatus.BAD_REQUEST));
    //         }
    //         return res.status(httpStatus.OK)
    //             .json(new APIResponse({}, 'error in adding social media', httpStatus.BAD_REQUEST));
    //     } catch (error) {
    //         return res.status(httpStatus.INTERNAL_SERVER_ERROR)
    //             .json(new APIResponse({}, 'Error getting users', httpStatus.INTERNAL_SERVER_ERROR, error));
    //     }
    // }

    //update user 
    async update(req, res) {
        try {
            delete req.body.email;
            // delete body.password;
            if (req.body.social_accounts) {
                req.body.social_accounts = JSON.parse(req.body.social_accounts)
            }
            if (req.user.id == req.body._id) {

                if (req.files['profile']) {
                    const oldProfileData = await User.findOne({ _id: req.body._id }, { image: true })
                    if (oldProfileData.image) {
                        const oldImagename = oldProfileData.image.split(`${siteUrl}/`)
                        if (existsSync(oldImagename[1])) {
                            unlinkSync(oldImagename[1])
                        }
                    }
                    req.body.image = `${siteUrl}/` + req.files['profile'][0].path
                }

                if (req.body.device_token) {
                    req.body.device_token = req.body.device_token
                }

                const response = await User.update(req.body);
                if (response) {
                    return res.status(httpStatus.OK).json(new APIResponse(response, 'User updated successfully', httpStatus.OK));
                }
                return res.status(httpStatus.OK).json(new APIResponse({}, 'User with the specified ID does not exists', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'you are not authorize to update this profile', httpStatus.BAD_REQUEST));
        } catch (e) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error updating user', httpStatus.INTERNAL_SERVER_ERROR, e));
        }
    }

    //get all Influencer
    async getAllInfluencer(req, res) {
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            const response = {
                influencer: [],
                count: 0
            };
            let totalCount = await User.find({ user_role: "SMI", is_deleted: false, _id: { $ne: req.user.id }, status: 'verified' }).countDocuments();
            response.count = totalCount ? totalCount : 0;
            response.influencer = await User.find({ user_role: "SMI", is_deleted: false, _id: { $ne: req.user.id }, status: 'verified' }).skip(paginationQuery.skip).limit(paginationQuery.limit);

            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Influencers fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Influencers', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all businessman
    async getAllBusinessMan(req, res) {
        try {
            let response = await User.find({ user_role: "BUSINESS", is_deleted: false }).populate('my_campaign');
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'businesses fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting businesses', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //set favoutite
    async setFavourite(req, res) {
        let id = req.params.id;

        try {
            let response = await User.findById(req.user.id);
            if (response) {
                if (response.favourite.some(user => user == id)) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse(response, 'user already added to favourite', httpStatus.OK));
                }

                response.favourite.push(id)
                response = await response.save();
                return res.status(httpStatus.OK).json(new APIResponse(response, 'user added to favourite', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'user with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error adding to favourite', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //remove from favourite
    async unFavourite(req, res) {
        let id = req.params.id;

        try {
            let response = await User.findById(req.user.id);
            if (response) {
                if (response.favourite.find(user => user == id)) {
                    let index;
                    response.favourite.map((user, i) => {
                        if (user == id) {
                            index = i;
                        }
                    })

                    response.favourite.splice(index, 1);
                }

                response = await response.save();
                return res.status(httpStatus.OK).json(new APIResponse(response, 'user successfully un-favourite', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'user with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error adding to favourite', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //  Forgot password OTP
    async forgotPasswordOTP(req, res) {
        try {
            let response = await User.findOne({ email: req.body.email, user_role: req.body.user_role });
            response = JSON.parse(JSON.stringify(response));
            if (response) {
                const mailData = {
                    OTP: Utils.generateUUID(6, { numericOnly: true })
                };
                let sentMail = await emailHelper.sendMail(response.email.trim(), 'Account Verification', 'OTP-verification.html', mailData);
                if (sentMail) {
                    await User.update({ _id: response._id, forgot_password_token: mailData.OTP });
                    return res.status(httpStatus.OK).json(new APIResponse(null, 'OTP sent on your mail', httpStatus.OK));
                }
            }
            return res.status(httpStatus.OK).json(new APIResponse(null, 'User with the specified Email does not exists', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error sending OTP', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    // forgot password
    async forgotPassword(req, res) {
        try {
            let { email, otp, password, confirm_password } = req.body;
            if (password === confirm_password) {
                const newPassword = await bcrypt.hash(password, saltRounds)
                let response = await User.findOne({ email: email, user_role: req.body.user_role }).lean().exec();
                if (response) {
                    if (response.forgot_password_token == Number(otp)) {
                        await User.update({
                            _id: response._id,
                            forgot_password_token: null,
                            password: newPassword,
                            // confirm_password: confirm_password
                        });
                        return res.status(httpStatus.OK).json(new APIResponse(null, 'Password reset successfully', httpStatus.OK));
                    }
                    return res.status(httpStatus.OK).json(new APIResponse(null, 'You have passed wrong OTP', httpStatus.BAD_REQUEST));
                }
                return res.status(httpStatus.OK).json(new APIResponse(null, 'User with the specified Email does not exists', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse(null, 'password and confirm_password do not match', httpStatus.BAD_REQUEST));
        } catch (e) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error updating user', httpStatus.INTERNAL_SERVER_ERROR, e));
        }
    }

    async changePassword(req, res) {
        try {
            let { user_role, old_password, new_password, confirm_new_password } = req.body;
            if (new_password === confirm_new_password) {
                let response = await User.findOne({ _id: req.user.id, user_role: user_role }).select('+password').lean().exec();
                if (response) {
                    if (await bcrypt.compare(old_password, response.password)) {
                        const newPass = await bcrypt.hash(new_password,saltRounds) 
                        await User.update({
                            _id: response._id,
                            password: newPass,
                            // confirm_password: confirm_new_password
                        });
                        return res.status(httpStatus.OK).json(new APIResponse(null, 'Password reset successfully', httpStatus.OK));
                    }
                    return res.status(httpStatus.OK).json(new APIResponse(null, 'You have passed wrong old password', httpStatus.BAD_REQUEST));
                }
                return res.status(httpStatus.OK).json(new APIResponse(null, 'User does not exists', httpStatus.BAD_REQUEST));
            }
            return res.status(httpStatus.OK).json(new APIResponse(null, 'new_password and confirm_new_password do not match', httpStatus.BAD_REQUEST));
        } catch (e) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error updating user', httpStatus.INTERNAL_SERVER_ERROR, e));
        }
    }

    // home page api
    async homePage(req, res) {
        // let { limit, skip } = req.query;
        try {
            const { page, limit } = req.query;
            const paginationQuery = getPaginateQuery(page, limit);
            const fieldToSelect = 'user_name image stars';

            if (req.user.user_role === 'SMI') {

                // let data = {
                //     campaign: [],
                //     user: {},
                //     myCampaignCount: 0,
                //     campaignCount: 0
                // }

                let user = await User.findOne({ _id: req.user.id, is_deleted: false }).populate({
                    path: "favourite",
                    select: fieldToSelect
                });

                // let campaign = await Campaign.find({ is_deleted: false, visible: true })

                // if (campaign && campaign.length) {
                //     campaign = campaign.map((data) => {
                //         if (user.my_campaign.map(x => x._id).indexOf(data._id) == -1) {
                //             return data;
                //         }
                //     })
                // }
                // campaign = campaign.filter((e) => { return e });

                // // let response = { user, campaign }

                // data.campaign = campaign
                // data.user = user
                // data.myCampaignCount = user.my_campaign.length ? user.my_campaign.length : 0;
                // data.campaignCount = campaign.length ? campaign.length : 0
                // if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(user, 'Home Page Fetched successfully', httpStatus.OK));
                // }
            }

            if (req.user.user_role === 'BUSINESS') {

                let data = {
                    user: {},
                    // influencer: [],
                    myCampaignCount: 0,
                    // influencerCount: 0
                }

                let count = await User.findOne({ _id: req.user.id, is_deleted: false }).populate({
                    path: 'my_campaign',
                    match: { price_status: { $ne: 'ACCEPTED' } }
                })

                let user = await User.findOne({ _id: req.user.id, is_deleted: false }).populate({
                    path: 'my_campaign',
                    match: { price_status: { $ne: 'ACCEPTED' } },
                    options: {
                        sort: { 'updatedAt': -1 },
                        skip: paginationQuery.skip,
                        limit: paginationQuery.limit
                    },
                }).populate({
                    path: "favourite",
                    select: fieldToSelect
                })

                // let influencer = await User.find({ is_deleted: false, user_role: "SMI" }).limit(addLimit).skip(addSkip);

                // let response = { user, influencer }

                data.user = user
                data.myCampaignCount = count.my_campaign.length ? count.my_campaign.length : 0
                // data.influencer = influence
                // data.influencerCount = influencer.length ? influencer.length : 0

                // if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(data, 'Home Page Fetched successfully', httpStatus.OK));
                // }
                // return res.status(httpStatus.OK).json(new APIResponse({}, 'Error in Fetching HomePage', httpStatus.BAD_REQUEST));
            }
        } catch (e) {
            console.log('error ', e);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error In HomePage', httpStatus.INTERNAL_SERVER_ERROR, e));
        }
    }

    async homePageForBusiness(req, res) {
        // let { limit, skip } = req.query;
        try {

            if (req.user.user_role === 'BUSINESS') {

                let businessMan = await User.findOne({ _id: req.user.id, is_deleted: false }).populate({
                    path: 'my_campaign',
                    // match: { price_status: { $ne: 'ACCEPTED' } },
                    options: {
                        sort: { 'updatedAt': -1 },
                        limit: 5
                    },
                })

                let influecer = await User.find({ user_role: "SMI", is_deleted: false, status: 'verified' }).sort({ 'stars': -1 }).limit(5);


                // let influencer = await User.find({ is_deleted: false, user_role: "SMI" }).limit(addLimit).skip(addSkip);

                let response = { businessMan, influecer }

                // data.user = user
                // data.myCampaignCount = count.my_campaign.length ? count.my_campaign.length : 0
                // data.influencer = influence
                // data.influencerCount = influencer.length ? influencer.length : 0

                // if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(response, 'Home Page Fetched successfully', httpStatus.OK));
                // }
                // return res.status(httpStatus.OK).json(new APIResponse({}, 'Error in Fetching HomePage', httpStatus.BAD_REQUEST));
            }
        } catch (e) {
            console.log('error ', e);
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error In HomePage', httpStatus.INTERNAL_SERVER_ERROR, e));
        }
    }

    //delete user by id
    async delete(req, res) {
        let userId = req.params.id;
        try {
            let response = await User.delete(userId);
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse({}, 'User deleted successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'User with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse(null, 'Error deleting user', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //logout user
    async logout(req, res) {
        try {
            let response = await User.findById({ _id: req.user.id });
            if (response) {
                response.active = false
                response = await response.save();
                return res.status(httpStatus.OK).json(new APIResponse(response, 'user logout successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'something went wrong', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error in logout User', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }
}

module.exports = new UserController();