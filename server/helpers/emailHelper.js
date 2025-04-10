/* eslint-disable no-unused-vars */
require('dotenv').config();
const nodemailer = require('nodemailer');
// const emailConfig = require('../../../config/config');
const EmailTemplates = require('swig-email-templates');
// const config = require('../../../config/config');

// const adminEmail = config.adminEmail;
let transporter

const templates = new EmailTemplates({
    root: 'views/',
    swig: {
        cache: false
    }
});

async function sendMail(email, subjectName, mailTemplateName, mailData) {
    return new Promise(async (resolve, reject) => {
        templates.render(mailTemplateName, mailData, async (err, html, text, sub) => {
            if (err) {
                // return new Error(err);
                reject(err);
            }
            else {
                const mailOptions = {
                    from: 'chingchou001@gmail.com', // sender address
                    to: email, // list of receivers
                    subject: subjectName, // Subject line
                    html
                };
                let info = await transporter.sendMail(mailOptions);
                resolve(info);
            }
        });
    })
};

async function setupTransport() {
    try {
        transporter = nodemailer.createTransport({
            service: 'gmail',
            // host: envVars.SMTP_HOST,
            host: 'smtp.gmail.com',
            port: 587,
            startssl: {
                enable: true
            },
            secure: false,
            auth: {
                user: 'chingchou001@gmail.com',
                pass: 'Test@123'
            }
        });

        const result = await transporter.verify();
        console.log('we can send mails', result);
    } catch (err) {
        console.log("Error while verifying transport ", err);
    }
}

setupTransport();

module.exports = {
    sendMail,
    setupTransport
};
