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
            // required: true,
        },
        smi: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            // required: true,
        },
        business: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            // required: true,
        },
        rating_type: {
            type: String,
            enum: ['SMI_TO_CAMPAIGN', 'BUSINESS_TO_SMI'],
            required: true
        },
        review:{
            type:String
        },
        rating: {
            type: Number,
            default: 0,
            max: 5
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
    return this.findOne({ _id: id, is_deleted: false })
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

const Rating = mongoose.model("Rating", Schema);

module.exports = {
    Rating,
}
