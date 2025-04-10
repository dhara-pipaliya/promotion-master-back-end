'use strict'
const { Industry } = require("../model/industry.model");
const httpStatus = require("http-status");
const APIResponse = require("../../helpers/APIResponse");

class IndustryController {

    async getIndustries(req, res) {
        try {
            const industries = await Industry.findAll()
            return res.status(httpStatus.OK)
                .json(new APIResponse(industries, 'Industries fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error while fetching industries. ', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async addIndustries(req, res) {
        try {
            if (req.user.user_role == 'ADMIN') {
                const industryExists = await Industry.findOne({ name: req.body.name }).lean().exec();
                if (industryExists) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Industry with same name already exists. ', httpStatus.BAD_REQUEST));
                }
                let model = new Industry(req.body);
                const industryData = await model.save();

                return res.status(httpStatus.OK)
                    .json(new APIResponse(industryData, 'Industry added successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'You are not authorize to add industry. ', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error while adding industries. ', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async updateIndustry(req, res) {
        try {
            if (req.user.user_role == 'ADMIN') {
                const industryExists = await Industry.findOne({ name: req.body.name, _id: { $ne: req.body._id } }).lean().exec();
                if (industryExists) {
                    return res.status(httpStatus.OK)
                        .json(new APIResponse({}, 'Industry with same name already exists. ', httpStatus.BAD_REQUEST));
                }
                const response = await Industry.updateIndustry(req.body);
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Industry updated successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'You are not authorize to update industry. ', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error while updating industries. ', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    async removeIndustry(req, res) {
        try {
            if (req.user.user_role == 'ADMIN') {
                const response = await Industry.delete(req.params.id);
                return res.status(httpStatus.OK)
                    .json(new APIResponse(response, 'Industry removed successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK)
                .json(new APIResponse({}, 'You are not authorize to remove industry. ', httpStatus.BAD_REQUEST));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error while removing industries. ', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }
}

module.exports = new IndustryController();