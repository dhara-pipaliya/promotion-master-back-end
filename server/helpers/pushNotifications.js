var admin = require("firebase-admin");
var serviceAccount = require("../config/firebase-config.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://promo-all-star-default-rtdb.firebaseio.com"
});

const options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

// let data ={
//     token : "esJ8WHbymsbZVW-V0cVv77:APA91bGl0zWfyWa-pssYCdSj8gVVVL_6twYGvd_MiSaCzwLHlFOwXiFA33ZqKpg7pFfxJQyX0ku-a9uCrjIJejAujSvcZoqW7hUVIM9RFJveFqK6CjSeRGjINPsZH_BgYJ_ZwBbhITsW",

//     payload : {
//        notification: {
//            title: "Friend Request",
//            body: "You just got a new friend request",
//    // icon: "default"
//        }
//    }};
//        await sendPushNotification(data)

const sendPushNotification = async (data) => {

    try {
        return await admin.messaging().sendToDevice(data.token, data.payload, options)
        // .then(function (response) {
        //     if (response) {
        //         console.log("Successfully sent message:", response);
        //         return response;
        //     }
        //     else {
        //         console.log("Error", response);
        //         return response;
        //     }
        // })
        // .catch(function (error) { console.log("Error sending message:", error); });
    } catch (err) {
        return { err }
    }
}


// let message = {
//     tokens: "bk3RNwTe3H0:CI2k_HHwgIpoDKCIZvvDMExUdFQ3P1...",
//     notification: {
//         title: "Portugal vs. Denmark",
//         body: "Great match!"
//     },
//  options : {
//     priority: "high",
//     timeToLive: 60 * 60 * 24
// },
// }
const sendToMulti = async (message) => {
    try {
        return await admin.messaging().sendMulticast(message)
    } catch (error) {
        return { error }
    }
}


module.exports = {
    sendPushNotification,
    sendToMulti
}