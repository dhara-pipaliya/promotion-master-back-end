"use strict";
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

// freeze role
// var Role = Object.freeze({
//     USER: "user",
//     ADMIN: "admin",
// })

//user schema
var Schema = new Schema(
    {
        first_name: {
            type: String,
            trim: true,
            minlength: 2,
            index: true,
            // required: true
        },
        last_name: {
            type: String,
            trim: true,
            minlength: 2,
            index: true,
            // required: true
        },
        user_name: {
            type: String,
            trim: true,
            // unique: true,
            minlength: 2,
            // required: true
        },
        email: {
            type: String,
            trim: true,
            minlength: 5,
            // unique: true,
            index: true,
            lowercase: true,
            required: true
        },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Other'],
            required: false,
        },
        birth_date: {
            type: Date,
        },
        user_role: {
            type: String,
            enum: ['BUSINESS', 'SMI'],
            default: 'SMI',
        },
        my_campaign: [{
            type: mongoose.Schema.ObjectId,
            ref: 'Campaign'
        }],
        campaign_count: {
            type: Number,
            default: 0
        },
        image: {
            type: String,
        },
        business_name: {
            type: String
        },
        business_website: {
            type: String
        },
        business_description: {
            type: String
        },
        business_zipcode: {
            type: String
        },
        industry: {
            type: String
        },
        location: {
            type: String
        },
        password: {
            type: String,
            select: false,
        },
        favourite: {
            type: [{ type: Schema.Types.ObjectId, ref: "User" }]
        },
        is_deleted: {
            type: Boolean,
            default: false
        },
        status: {
            type: String,
            enum: ['registered', 'verified'],
            required: true,
        },
        forgot_password_token: {
            type: Number
        },
        is_social_login: {
            type: Boolean,
            default: false,
        },
        // social_type: {
        //     type: String,
        //     enum: ['facebook', 'twitter', 'instagram', 'linkedIn'],
        //     required: false,
        // },
        stars: {
            type: Number,
            default: 0,
        },
        social_accounts: {
            facebook: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            instagram: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            twitter: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            snapchat: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            tiktok: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            youtube: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            pinterest: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            },
            linkedin: {
                url: {
                    type: String,
                    default: ''
                },
                follower: {
                    type: Number,
                    default: 0
                }
            }
        },
        // followers_stats: {
        //     facebook: {
        //         type: Number,
        //         default: 0
        //     },
        //     instagram: {
        //         type: Number,
        //         default: 0
        //     },
        //     total: {
        //         type: Number,
        //         default: 0
        //     }
        // },
        device_token: {
            type: String,
            default: ""
        },
        signin_provider: {
            type: String,
            enum: ['facebook', 'google'],
        },
        facebook_id: {
            type: String,
        },
        google_id: {
            type: String,
        },
        active: {
            type: Boolean,
            default: false,
        },
        accountLinked: {
            type: Boolean,
            default: false
        },
        earnings: {
            type: Number,
            default: 0,
        },
        notificationCount: {
            type: Number,
            default: 0
        },
    },
    { timestamps: true }
);


//login user
Schema.statics.login = async function (email, user_name) {
    return this.findOne({
        $or: [{ email: email }, { user_name: user_name }],
        is_deleted: false
    }).select('+password').exec();
};

//social login user
Schema.statics.socialLogin = async function (email, user_role) {
    return this.findOne({
        email: email,
        $or: [{ signin_provider: "facebook" }, { signin_provider: "google" }],
        user_role: user_role,
        is_deleted: false
    }).exec();
};

//user find by id
Schema.statics.findById = function (id) {
    return this.findOne({ _id: id, is_deleted: false })
};

//user findall
// Schema.statics.getAll = function () {
//     return this.find({ user_role: "SMI", is_deleted: false })
// };


//user update by id
Schema.statics.update = function (data) {
    return this.findOneAndUpdate({
        _id: data._id,
    }, {
        $set: data
    },
        { new: true } // returns updated record
    );
};


//user delete by id
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

const User = mongoose.model("User", Schema);

module.exports = {
    User,
}
