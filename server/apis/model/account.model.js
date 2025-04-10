"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Schema = new Schema(
    {
        user_id: {
            type: mongoose.Schema.ObjectId,
            trim: true,
            minlength: 2,
            index: true,
            required: true
        },
        stripe_account_id: {
            type: String,
            trim: true,
            required: true
        }
    },
    { timestamps: true }
)

const Account = mongoose.model("Account", Schema);

module.exports = {
    Account
}