"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var Schema = new Schema(
    {
        first_name: {
            type: String,
            trim: true,
            minlength: 2,
            index: true,
        },
        last_name: {
            type: String,
            trim: true,
            minlength: 2,
            index: true,
        },
        email: {
            type: String,
            trim: true,
            minlength: 5,
            index: true,
            lowercase: true,
            required: true
        },
        password: {
            type: String,
            select: false
        }
    },
    { timestamps: true }
)

//login admin
Schema.statics.login = async function (email, password) {
    return this.findOne({
        email: email ,
    }).select('+password').lean().exec();
};

const Admin = mongoose.model("Admin", Schema);

module.exports = {
    Admin
}