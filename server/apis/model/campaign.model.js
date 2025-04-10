"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;
const Utils = require('../../helpers/utils');

//campaign schema
var Schema = new Schema(
    {
        campaign_name: {
            type: String,
            trim: true,
            minlength: 2,
            required: true,
            index: true
        },
        zip: {
            type: String,
        },
        creator: {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        },
        image: {
            type: String,
        },
        campaign_instruction: {
            type: String,
        },
        campaign_links: {
            type: String
        },
        price: {
            campaign_price: {
                type: String,
            },
            sales_tax_rate: {
                type: String,
                default: "8.00"
            },
            sales_tax: {
                type: String,
            },
            business_price: {
                type: String,
            },
            stripe_fee_rate: {
                type: String,
                default: "2.90"
            },
            stripe_fee: {
                type: String,
            },
            stripe_fee_fixed: {
                type: String,
                default: "0.30"
            },
            total_stripe_fee: {
                type: String,
            },
            commission_rate: {
                type: String,
                default: "10.00"
            },
            commission: {
                type: String,
            },
            smi_price: {
                type: String,
            },
        },
        hired: {
            type: Boolean,
            default: false
        },
        price_status: {
            type: String,
            enum: ['ACCEPTED', 'DECLINED', 'RESPONSE_WAITING'],
            default: 'ACCEPTED',
        },
        visible: {
            type: Boolean,
            // select: false,
            default: true
        },
        // expiration: {
        //     type: Date,
        //     required: true
        // },
        invited_smi: [{
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }],
        proposals: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Proposal'
        }],
        industry: {
            type: String,
            required: true
        },
        stars: {
            type: Number,
            default: 0,
        },
        active: {
            type: Boolean,
            default: true
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        paymentConfirmed: {
            type: Boolean,
            default: false
        },
        payment_id: {
            type: String,
            select: false
        }
    },
    { timestamps: true }
);




//campaign find by id
Schema.statics.findById = function (id) {
    return this.findOne({ _id: id, is_deleted: false }).populate('invited_smi');
};

//findall campaign
Schema.statics.getAll = function () {
    return this.find({ is_deleted: false })
};


//campaign update by id
Schema.statics.update = function (data) {
    return this.findOneAndUpdate({
        _id: data._id,
    }, {
        $set: data
    },
        { new: true } // returns updated record
    );
};


//campaign delete by id
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

const Campaign = mongoose.model("Campaign", Schema);

module.exports = {
    Campaign,
}
