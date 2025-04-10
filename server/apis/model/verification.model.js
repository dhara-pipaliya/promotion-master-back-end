const mongoose = require('mongoose');
var Schema = mongoose.Schema;

const {User} = require('../model/user.model');

var Schema = new Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true,
    },
    token: {
        type: String,
        required: true,
        index: true,
    },
    used: {
        type: Boolean,
        default: false,
    },
    verifiedAt: {
        type: Date,
        required: function() {
            return this.used
        }
    }
});
/**
 * instance methods
 */
Schema.statics.verify = async function(verification) {
    // let verification = this;

    verification.used = true;
    verification.verifiedAt = new Date();

    try {
        verification = await verification.save()

        if(!verification) {
            return false;
        }
    } catch (err) {
        throw Error('there was a problem verifying your email: ', err.message)
    }

    let user = await User.findByIdAndUpdate({
        _id: verification.user
    }, {
        $set: {
            status: 'verified'
        }
    }, {
        new: true,
    })

    if(!user) {
        return false
    }

    console.log('user found: ', user)

    return true
}

/**
 * model methods
 */
Schema.statics.findByUser = async function(user) {
    let Verification = this;

    let verification;
    try {
        verification = await Verification.findOne({
            user: user,
            used: false,
        });

        if(!verification) {
            return false;
        }
    } catch (err) {
        throw Error('error finding user verification: ', err.message)
    }

    return verification;
}

const Verification = mongoose.model('Verification', Schema);

module.exports = {
    Verification,
}