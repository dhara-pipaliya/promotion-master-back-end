const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const { User } = require('../model/user.model');

var Schema = new Schema({
    proposal: {
        type: mongoose.Schema.ObjectId,
        ref: 'Campaign',
        required: true,
    },
    unique_code: {
        type: String,
        required: true,
        index: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
});
/**
 * instance methods
 */

const ApplicantCode = mongoose.model('ApplicantCode', Schema);

module.exports = {
    ApplicantCode,
}