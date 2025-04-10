"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const Utils = require('../../helpers/utils');

//CampaignInvitation schema
var Schema = new Schema(
    {
        sent_by: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        campaign_name:{
            type:String
        },
        notification_message:{
            type:String
        },
        sent_to: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        notification_type: {
            type: String,
            enum: ["CAMPAIGN_INVITATION",'APPLY_CAMPAIGN','ACCEPT_PROPOSAL','COMPLETE_PROPOSAL','ACCEPT_COMPLETE_PROPOSAL'],
            // default: "CAMPAIGN"
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);




//Rating find by id
Schema.statics.findById = function (id) {
    return this.findOne({ _id: id, is_deleted: false }).lean().exec();
};

//findall Rating
Schema.statics.getAll = function () {
    return this.find({ is_deleted: false })
};


//Rating update by id
Schema.statics.update = function (data) {
    return this.findOneAndUpdate({
        _id: data._id,
    }, {
        $set: data
    },
        { new: true } // returns updated record
    );
};


//Rating delete by id
Schema.statics.delete = function (id) {
    return this.findOneAndUpdate({
        _id: id,
        is_deleted: { $ne: true }
    }, {
        $set: { is_deleted: true }
    },
        { new: true } // returns updated record
    );
};

const Notification = mongoose.model("Notification", Schema);

module.exports = {
    Notification,
}
