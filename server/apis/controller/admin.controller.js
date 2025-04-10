"use strict";
const { User } = require("../model/user.model");
const { Campaign } = require("../model/campaign.model");
const { Setting } = require("../model/settings.model");
const { Admin } = require("../model/admin.model")
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const { getPaginateQuery } = require('../../helpers/utils');
let JWTHelper = require('../../helpers/jwt.helper');
const bcrypt = require('bcrypt');

class AdminController {

    async getFilteredData(model, query, searchValue, searchableFields, sort, page = 1, limit) {
        let result = {}
        let countQuery = null
        const paginationQuery = getPaginateQuery(page, limit);
        if (!sort) {
            sort = { createdAt: -1 }
        }
        if (searchValue) {
            query['$or'] = []
            searchableFields.forEach(element => {
                const obj = {}
                obj[element] = { $regex: '.*' + searchValue + '.*', $options: 'i' };
                query['$or'].push(obj)
            });
        }
        countQuery = Object.assign({}, query)
        result.data = await model.find(query).lean().sort(sort).skip(paginationQuery.skip).limit(paginationQuery.limit).lean().exec()
        result.totalCount = await model.countDocuments(countQuery).lean().exec()
        return result
    }

    async getAllUsers(req, res) {
        try {
            if (req.user.user_role == 'ADMIN') {
                let query = {}
                query['is_deleted'] = false
                if (req.body.type) {
                    query.user_role = req.body.type
                }
                const { page, limit } = req.query;
                let searchableFields = ["first_name", "last_name", "email"]
                let response = await this.getFilteredData(User, query, req.body.searchValue, searchableFields, req.body.sort, page, limit)
                let data = {
                    users: [],
                    count: 0
                }
                data.users = response.data
                data.count = response.totalCount
                return res.status(httpStatus.OK)
                    .json(new APIResponse(data, 'Users fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to fetch all influencers', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error fetching users', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async getAllCampaign(req, res) {
        try {
            if (req.user.user_role == 'ADMIN') {
                let query = {}
                query['is_deleted'] = false
                if (req.body.industry) {
                    query['industry'] = req.body.industry
                }
                const { page, limit } = req.query;
                let searchableFields = ["campaign_name"]
                let response = await this.getFilteredData(Campaign, query, req.body.searchValue, searchableFields, req.body.sort, page, limit)
                let data = {
                    campaign: [],
                    count: 0
                }
                data.campaign = response.data
                data.count = response.totalCount
                return res.status(httpStatus.OK)
                    .json(new APIResponse(data, 'Campaigns fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to fetch all campaigns', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error fetching campaigns', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async getSettings(req, res) {
        try {
            if (req.user.user_role == 'ADMIN') {
                const response = await Setting.getSettings();
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Settings fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to fetch settings', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error fetching settings', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async updateSettings(req, res) {
        try {
            if (req.user.user_role) {
                let data = req.body
                let response = await Setting.updateSettings(data)
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Settings updated successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'you are not authorize to update settings', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding settings', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async login(req, res) {
        let body = req.body;
        try {
            let user = await Admin.login(body.email);
            if (user && await bcrypt.compare(body.password, user.password)) {
                const token = JWTHelper.getJWTToken({
                    id: user._id,
                    email: user.email,
                    user_role: 'ADMIN'
                });
                let response = user
                response['token'] = token
                return res.status(httpStatus.OK).json(new APIResponse(response, 'Login Successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'Please !!!,Check Your Credential', httpStatus.UNAUTHORIZED));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error Authenticating User', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

}

module.exports = new AdminController();