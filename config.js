"use strict";

/*!
 * Module dependencies.
 */

const fs = require("fs");
const envFile = require("path").join(__dirname, "env.json");

let env = {};

// Read env.json file, if it exists, load the id's and secrets from that
// Note that this is only in the development env
// it is not safe to store id's in files
if (process.env.NODE_ENV == "dev" && fs.existsSync(envFile)) {
    var envData = fs.readFileSync(envFile, "utf-8");
    env = JSON.parse(envData);
    Object.keys(env).forEach(key => (process.env[key] = env[key]));
    console.log("process env", process.env);
} else {
    // console.log(process.env);
}

// /**
//  * Expose
//  */

module.exports = {
    dev: process.env.NODE_ENV == "dev",
    db: process.env.MONGOLAB_URI,
    tokenSecret: process.env.APP_TOKEN_SECRET,
    fcmKey: process.env.FCM_KEY,
    email: process.env.email,
    password: process.env.password,
    mailServer: process.env.mailServer,
    mailPort: process.env.mailPort,
    mailHostSecure: process.env.mailHostSecure,
    twilioSid: process.env.twilioSid,
    twilioToken: process.env.twilioToken,
    twilioNumber: process.env.twilioNumber
};