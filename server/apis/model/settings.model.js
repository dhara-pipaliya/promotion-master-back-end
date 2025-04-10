"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Schema = new Schema(
    {
        smtp_email : {
            type: String,
            lowercase:true,
            trim: true
        },
        smtp_password: {
            type: String
        },
        smtp_host: {
            type: String
        },
        stripe_access_key: {
            type: String
        },
        stripe_secret_key: {
            type: String
        }
    },
    { timestamps: true }
);

// find setting 
Schema.statics.getSettings = function () {
    return this.findOne({}).exec();
}

// setting update by id
Schema.statics.updateSettings = function (data) {
    return this.findOneAndUpdate({
        _id: data._id,
    }, {
        $set: data
    },
        { new: true } // returns updated record
    );
};

const Setting = mongoose.model("Setting", Schema);

module.exports = {
    Setting
}