"use strict";
const { Notification } = require("../model/notification.model");
const httpStatus = require('http-status');
const APIResponse = require('../../helpers/APIResponse');
const { User } = require("../model/user.model");


class NotificationController {

    // add Notification
    async add(req, res, next) {
        try {
            req.body.sent_by = req.user.id
            let notification = new Notification(req.body);
            let response = await notification.save();

            return res.status(httpStatus.OK).json(new APIResponse(response, 'Notification added successfully', httpStatus.OK));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse({}, 'Error adding Notification', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //Notification get by id
    async getById(req, res, next) {
        let id = req.params.id;

        try {
            let response = await Notification.findById(id);
            if (response) {
                return res.status(httpStatus.OK).json(new APIResponse(response, 'Notification fetched successfully', httpStatus.OK));
            }
            return res.status(httpStatus.OK).json(new APIResponse({}, 'Notification with the specified ID does not exists', httpStatus.BAD_REQUEST));

        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR).json(new APIResponse(null, 'Error getting Notification', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

    //get all Notification
    async getAll(req, res, next) {
        try {
            let response = await Notification.find({ sent_to: req.user.id, is_deleted: false }).sort({updatedAt: -1}).populate('sent_by').lean().exec();
            await User.findOneAndUpdate({_id: req.user.id},{notificationCount: 0}).lean().exec()
            return res.status(httpStatus.OK)
                .json(new APIResponse(response, 'Notifications fetched successfully', httpStatus.OK));
        } catch (error) {
            return res.status(httpStatus.INTERNAL_SERVER_ERROR)
                .json(new APIResponse({}, 'Error getting Notifications', httpStatus.INTERNAL_SERVER_ERROR, error));
        }
    }

}

var exports = (module.exports = new NotificationController());