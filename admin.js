"use strict";
const { Admin } = require("./server/apis/model/admin.model");
// const { Setting } = require("./server/apis/model/settings.model");
const { Industry } = require("./server/apis/model/industry.model");
const bcrypt = require('bcrypt');
const saltRounds = 10

createAdmin();
createIndustries();
// createSettings();

async function createAdmin() {
    try {
        const password = await bcrypt.hash('Test@123', saltRounds)
        let user = await Admin.findOne({})
        if (!user) {
            const data = {
                first_name: 'Promo',
                last_name: 'Admin',
                email: 'admin@admin.com',
                password: password
            }
            let model = new Admin(data)
            let newAdmin = await model.save()
        }
    } catch (error) {
        console.log("Error occured in checking for admin details.", error);
    }
}

// async function createSettings () {
//     try {
//         let setting = await Setting.findOne({})
//         if (!setting) {
//             const data = {
//                 smtp_email: "promoall140@gmail.com",
//                 smtp_password: "110890119031",
//                 smtp_host: "smtp.gmail.com",
//                 stripe_access_key: "pk_test_51IC6MVC79xcHe3tCOPha6EfCJxdmFP8Lc9UsLMXedOPd5Rw8xK0bQ0UvkFyfUzYtoA0mOuhZFHRXLNRqHTsb6li500i9boEwOe",
//                 stripe_secret_key: "sk_test_51IC6MVC79xcHe3tCP5OK2l4Zb2NQx7ls93MFD1XFm6MoN49iFlhIMEutwiT0yWtRrQ3qN48BbIElduQcc0shjHTB005fBhnRRk"
//             }
//             let model = new Setting(data)
//             let newSetting = await model.save()
//         }
//     } catch (error) {
//         console.log("Error occured in checking for settings details.", error);
//     }
// }

async function createIndustries() {
    const IndustryData = await Industry.findOne();
    if (!IndustryData) {
        const IndustryArray = [
            { name: "Business Services" },
            { name: "Food & Restaurant" },
            { name: "General Retail" },
            { name: "Health, Beauty, & Fitness" },
            { name: "Automotive Repair" },
            { name: "In-Home Care" },
            { name: "Technology" },
            { name: "In-Home Cleaning & Maintenance" },
            { name: "Travel & Lodging" },
            { name: "Sports & Recreation" },
            { name: "Construction" },
            { name: "Child Care" }
        ];
        await Industry.insertMany(IndustryArray)
    }
}