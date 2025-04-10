"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const Utils = require('../../helpers/utils');

//CampaignInvitation schema
var Schema = new Schema(
    {
        campaign: {
            type: mongoose.Schema.ObjectId,
            ref: 'Campaign',
            required: true,
        },
        smi: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
        invitation_status: {
            type: String,
            enum: ['ACCEPTED', 'DECLINED', 'RESPONSE_WAITING'],
            default: 'RESPONSE_WAITING',
        },
        description: {
            type: String
        },
        cover_letter: {
            type: String
        },
        is_completed_in_SMI: {
            type: Boolean,
            default: false
        },
        is_completed_in_Business: {
            type: Boolean,
            default: false
        },
        completion_description: {
            type: String
        },
        code_id: {
            type: mongoose.Schema.ObjectId,
            ref: 'ApplicantCode',
        },
        completion_status: {
            type: String,
            enum: ['ACCEPTED', 'DECLINED', 'RESPONSE_WAITING'],
            // default: '',
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        // paymentConfirmed: {
        //     type: Boolean,
        //     default: false
        // },
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

const Proposal = mongoose.model("Proposal", Schema);

module.exports = {
    Proposal,
}
