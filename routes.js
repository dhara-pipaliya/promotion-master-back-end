"use strict";

var config = require("./config");


exports.setup = function (app) {
    console.log("Setting up routes.");

    // https://jwt.io/introduction/
    var jwt = require("express-jwt");

    //APIs without JWTtoken
    app.use(
        "/api/v1", function (req, res, next) {
            next();
        },
        jwt({
            secret: config.tokenSecret
        }).unless({
            path: [
                "/api/v1/user/signup",
                "/api/v1/user/login",
                "/api/v1/user/socialLogin",
                "/api/v1/verification/",
                "/api/v1/user/OTP",
                "/api/v1/user/forgotPassword",
                "/api/v1/admin/login",
                "/api/v1/payment/token/validate"
            ]
        })
    );

    var user = require("./server/apis/route/v1/user.route");
    var verification = require('./server/apis/route/v1/verification.route');
    var campaign = require('./server/apis/route/v1/campaign.route');
    var campaignInvitation = require('./server/apis/route/v1/campaignInvitation.route');
    var rating = require('./server/apis/route/v1/rating.route');
    var proposal = require('./server/apis/route/v1/proposal.route');
    var notification = require('./server/apis/route/v1/notification.route');
    const common = require('./server/apis/route/v1/common.route');
    var admin = require('./server/apis/route/v1/admin.route');
    var payment = require('./server/apis/route/v1/payment.route');
    const industry = require('./server/apis/route/v1/industry.route')
    
    app.use("/api/v1/", common);
    app.use("/api/v1/user/", user);
    app.use("/api/v1/verification/", verification);
    app.use("/api/v1/campaign/", campaign);
    app.use("/api/v1/invitation/", campaignInvitation);
    app.use("/api/v1/rating/", rating);
    app.use("/api/v1/proposal/", proposal);
    app.use("/api/v1/notification/", notification);
    app.use("/api/v1/admin/", admin);
    app.use("/api/v1/payment/", payment);
    app.use("/api/v1/industry/", industry)
};

module.exports = exports;
