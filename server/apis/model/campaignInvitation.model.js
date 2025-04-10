"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const Utils = require('../../helpers/utils');

//CampaignInvitation schema
var Schema = new Schema(
    {
        campaign_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        user_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        invited_by: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        invitation_status: {
            type: String,
            enum: ['ACCEPTED', 'DECLINED', 'RESPONSE_WAITING'],
            default: 'RESPONSE_WAITING',
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
    },
    { timestamps: true }
);




//CampaignInvitation find by id
Schema.statics.findById = function (id) {
    return this.findOne({ _id: id, is_deleted: false })
};

//findall CampaignInvitation
Schema.statics.getAll = function () {
    return this.find({ is_deleted: false })
};


//CampaignInvitation update by id
Schema.statics.update = function (data) {
    return this.findOneAndUpdate({
        _id: data._id,
    }, {
        $set: data
    },
        { new: true } // returns updated record
    );
};


//CampaignInvitation delete by id
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

const CampaignInvitation = mongoose.model("CampaignInvitation", Schema);

module.exports = {
    CampaignInvitation,
}
