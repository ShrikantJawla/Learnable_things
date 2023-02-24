let firebaseService = require("./firebaseConfig");
let admin = require("firebase-admin");
const userModel = require("../../model/userModel");
const CronJob = require("cron").CronJob;
const { pool } = require("../../../../configration/database");
const { app } = require("firebase-admin");
const { response } = require("express");

let scheduleNotifications = {};

// getting all users tokens here.....

scheduleNotifications.getAllUsersTokens = async function () {
    let allUsersTokens = [];
    let returnData = [];
    allUsersTokens = await userModel.fetchAllUsersFcmTokens();
    // console.log(allUsersTokens, "alluserTokens");
    allUsersTokens.forEach((element) => {
        if (element.fcm_token) {
            returnData.push(element.fcm_token);
        }
    });
    // console.log(returnData, "returnData");
    return returnData;
};

//adding notification data to db here....

scheduleNotifications.addNotificationDataToDb = async function (data) {
    let insertData = {
        title: data.notifictionTitle,
        text: data.notificationText,
        targetUserSegment: data.target.userSegment === "Select User Segments" ?
            "" : data.target.userSegment,
        targetMessageTopics: data.target.messageTopics === "Select Message Topics" ?
            "" : data.target.messageTopics,
        payload: JSON.stringify(data.payload),
        imgurl: data.notificationImage === undefined ? "" : data.notificationImage,
        fcmToken: data.target.fcmToken === undefined ? "" : data.target.fcmToken,
        topicVal: data.target.messageTopics === "Card Issuers Topics" ?
            data.target.cardIssuerTopicsVal : data.target.messageTopics === "Credit Cards Topics" ?
                data.target.cardCardTopicsVal : "",
        targetDevice: data.target.userSegment === "Send To Devices" &&
            data.target.targetDevices === "1" ?
            "Android" : data.target.userSegment === "Send To Devices" &&
                data.target.targetDevices === "2" ?
                "Ios" : data.target.userSegment === "Send To Devices" &&
                    (data.target.targetDevices === undefined ||
                        data.target.targetDevices === "0") ?
                    "All devices " : "",
        notitcationTime: data.notificationTime === 1 ? "Now" : data.notificationTime,
        notificationResult: JSON.stringify({}),
    };
    // console.log(insertData, "this is in insert data ");
    const queryDb = `INSERT INTO scheduled_notifications 
    ("sn_title", "sn_text", "sn_time", "sn_usersegment", "sn_payload", "sn_img_url", "sn_fcm_token", "sn_topic_val", "sn_result", "sn_target_messagetopics", "sn_target_device")
    VALUES ('${insertData.title}', '${insertData.text}', '${insertData.notitcationTime}', '${insertData.targetUserSegment}','${insertData.payload}' , '${insertData.imgurl}', '${insertData.fcmToken}', '${insertData.topicVal}', '${insertData.notificationResult}', '${insertData.targetMessageTopics}', '${insertData.targetDevice}') returning sn_id;`;
    let resultFromDb;

    try {
        let queryData = await pool.query(queryDb);
        resultFromDb = queryData.rows[0];
        // console.log(queryData);
    } catch (err) {
        console.log(err);
        resultFromDb = err;
    }
     console.log(resultFromDb, "segrbi");
    return resultFromDb;
};

// upadting notifications data in db here....

scheduleNotifications.addNotificationResultToDb = async function (data, id) {
    let updateData = {
        notificationResult: JSON.stringify(data),
    };
    let updateQuery = `UPDATE scheduled_notifications SET "sn_result" = '${updateData.notificationResult}' WHERE "sn_id" = ${id};`;
    let returnData;
    try {
        let queryData = await pool.query(updateQuery);
        returnData = queryData.rows;
    } catch (err) {
        console.log(err);
        returnData = err;
    }
    return returnData;
};

// sedning notifications  here.......

scheduleNotifications.sendNotification = async function (notificationData) {
    var fcmToken = notificationData.target.fcmToken || "";
    console.log(notificationData, "notification data here...");
    // let userTokens = await scheduleNotifications.getAllUsersTokens();

    let dbData = await scheduleNotifications.addNotificationDataToDb(notificationData);

    let payloadData = {};

    //calculating time to live here. ..
    let currentTime = Date.parse(new Date().toLocaleString("en-Us", { timeZone: "Asia/Kolkata" }));
    let scheduleDate = notificationData.notificationTime === 1 ? currentTime : Date.parse(notificationData.notificationTime);
    let timeToLive = Math.abs((scheduleDate - currentTime) / 1000);



    console.log(currentTime, "time to live here.currentTime.");
    console.log(scheduleDate, "time to live here.scheduleDate.");
    console.log(timeToLive, "time to live here..");

    //cron job here.....

    function cronJobM(timeinsecs, methodCallBackCron) {
        console.log(" before job here....");
        let date = new Date();
        date.setSeconds(date.getSeconds() + timeinsecs);
        const job = new CronJob(date, methodCallBackCron);
        console.log("After job instantiation");
        job.start();
    }
    if (notificationData.payload && notificationData.payload.length > 0) {
        console.log("hello im in this line 134");
        for (let i = 0; i < notificationData.payload.length; i++) {
            payloadData[`${notificationData.payload[i].page}`] =
                notificationData.payload[i].value;
        }

        console.log("notification data ------------->>>>>>>>>", notificationData, "<<<<-------------------- notification data here....")

        for (let i = 0; i < notificationData.payload.length; i++) {
            payloadData[`${notificationData.payload[i].page}`] =
                notificationData.payload[i].value;
        }

        // } else {
        //     payloadData = {};
        // }

        let payload = {
            notification: {
                title: notificationData.notifictionTitle,
                body: notificationData.notificationText,
                image: notificationData.notificationImage ?? ""
            },

            data: payloadData,
        };




        var options = {
            priority: "high",
            timeToLive: notificationData.notificationTime === 1 ?
                1 : timeToLive <= 0 ?
                    1 : timeToLive,
        };

        if (
            notificationData.target.cardCardTopicsVal &&
            notificationData.target.cardCardTopicsVal != ""
        ) {
            let topic = notificationData.target.cardCardTopicsVal;
            console.log(topic, "topic topic");
            if (timeToLive > 1) {
                console.log("there is time to execute ------ line 179");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);
                    admin
                        .messaging()
                        .sendToTopic(topic, payload, options)
                        .then((resp) => {
                            console.log("mesaging response -------- >>>>>>>", resp);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                });
            } else {
                admin
                    .messaging()
                    .sendToTopic(topic, payload, options)
                    .then((resp) => {
                        console.log("mesaging response -------- >>>>>>>", resp);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else if (
            notificationData.target.cardIssuerTopicsVal &&
            notificationData.target.cardIssuerTopicsVal != ""
        ) {
            let topic = notificationData.target.cardIssuerTopicsVal;
            if (timeToLive > 1) {
                console.log("there is time to execute ----- line 211");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);
                    admin
                        .messaging()
                        .sendToTopic(topic, payload, options)
                        .then((resp) => {
                            console.log("mesaging response -------- >>>>>>>", resp);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                });
            } else {
                admin
                    .messaging()
                    .sendToTopic(topic, payload, options)
                    .then((resp) => {
                        console.log("mesaging response -------- >>>>>>>", resp);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else if (fcmToken && fcmToken != "") {
            console.log("printing options ----- >>>", options);
            console.log("printing payload ------>>>>>", payload);
            console.log("printing fcm token ----- >>>>", fcmToken);
            if (notificationData.notificationTime != 1) {
                console.log(fcmToken, "fcm token here");
                console.log(options, "options token here");
                console.log(payload, "payload token here");
                console.log("there is time to execute ----- line 245");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);
                    admin
                        .messaging()
                        .sendToDevice(fcmToken, payload, options)
                        .then((resp) => {
                            console.log("resp resp ----->>>>>", resp);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                            return resp;
                        })
                        .catch((err) => {
                            console.log("err err err ----- >>>>>", err);
                            return err;
                        });
                });
            } else {
                console.log(fcmToken, "fcm token here");
                console.log(options, "options token here");
                console.log(payload, "payload token here");
                console.log("hi im in line 264 hi im in line 264 hi im in line 264 hi im in line 264 hi im in line 264");
                // let message = {
                //     "token": "fOyQJfYGCEyUqjWMB6CNH-:APA91bERyQPNe1EW2A1jAa4p6Tdf9AXF-dCO3WLz0DazxGD5PMX8nEON0hksBRckDINgsHzth4lcpXHUcYiWE2qfgMz-jDFTscYkLMBhqRzSErtFArrp0oJf3uXDnrLKU-MeOlAgeFOM",
                //     "mutable_content" : true,

                
                //     "notification":{
                //         "title" : "Check this Title",
                //         "body" : "Body",
                //     },
                
                //     "data":{
                //         "image-url": ""
                //     }
                
                // }
                // let message = {
                //     notification: {
                //         title: 'app image',
                //         body: "Hello! This is a test message",
                //         image: ''
                //     },
                //     android: {
                //         notification: {
                //             image: 'https://cardinsider.com/wp-content/uploads/2021/07/flipkart-axis-bank-credit-card.png'
                //         }
                //     },
                //     apns: {
                //         payload: {
                //             aps: {
                //                 'mutable-content': 1,
                //                 'content_available': true,
                //             }
                //         },
                //         fcm_options: {
                //             image: 'https://cardinsider.com/wp-content/uploads/2021/07/flipkart-axis-bank-credit-card.png'
                //         }
                //     },
                //     webpush: {
                //         headers: {
                //             image: 'https://cardinsider.com/wp-content/uploads/2021/07/flipkart-axis-bank-credit-card.png'
                //         }
                //     },
                //     token: 'cWu6h5nQbks4rSo68pCwVu:APA91bH78O1S7YIHP5OcKA_mcgFgxttL7euiJzN6SCaxMqhyCOTiPcRuJ9C8yo2WWGky52MQ_DYbD9B9dwNXnm1DxdQGYp4co2lY_i9qOKrftf5dNXHUQqOv1_76VHkfH7OZTChFA7i1',
                // };
                // const registrationTokens = [
                //     'ea0aRJvAmkZQlL3-IYOs2m:APA91bEiH-GYu7bT0_TwnRa_bWq6XkWAr8hf79Ovu6He8004H1zNqF7wOaDU6VPTLkUwpQYX0EinzpH8Pp1W4bSyYKMKgHq4UgnNSXOCSRgxNu-zpM4e57Ga1pInb0XTuwVeKXZTTs8m'
                //   ]
                // admin.messaging().subscribeToTopic(registrationTokens, 'customImage').then((resp)=>{
                //     console.log(resp['errors'],"response ");
                // });
                // admin.messaging().send(message).then((resp) => {
                //     console.log("response ------->>>>>>", resp);
                // });
                admin
                    .messaging()
                    .sendToDevice(fcmToken, payload, options)
                    .then((resp) => {
                        console.log("resp resp ----->>>>>", resp);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);

                        return resp;
                    })
                    .catch((err) => {
                        console.log("err err err ----- >>>>>", err);
                        return err;
                    });
            }
        } else if (
            notificationData.target.targetDevices &&
            notificationData.target.targetDevices != "" &&
            notificationData.target.targetDevices === "1"
        ) {
            console.log("hey im in android target");

            let topic = "ci_android";
            if (timeToLive > 1) {
                console.log("there is time to execute ------ line 326");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);
                    admin
                        .messaging()
                        .sendToTopic(topic, payload, options)
                        .then((resp) => {
                            console.log("mesaging response -------- >>>>>>>", resp);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                });
            } else {
                admin
                    .messaging()
                    .sendToTopic(topic, payload, options)
                    .then((resp) => {
                        console.log("mesaging response -------- >>>>>>>", resp);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else if (
            notificationData.target.targetDevices &&
            notificationData.target.targetDevices != "" &&
            notificationData.target.targetDevices === "2"
        ) {
            console.log("hey im in Ios target");

            let topic = "ci_ios";
            if (timeToLive > 1) {
                console.log("there is time to execute   line ---- 361");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);
                    admin
                        .messaging()
                        .sendToTopic(topic, payload, options)
                        .then((resp) => {
                            console.log("mesaging response -------- >>>>>>>", resp);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                        })
                        .catch((err) => {
                            console.log(err);
                        });
                });
            } else {
                admin
                    .messaging()
                    .sendToTopic(topic, payload, options)
                    .then((resp) => {
                        console.log("mesaging response -------- >>>>>>>", resp);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            }
        } else if (notificationData.target.targetDevices &&
            notificationData.target.targetDevices != "" &&
            notificationData.target.targetDevices === "0") {
            console.log(
                "sending notification data =-------- >>> ",
                fcmToken,
                userTokens,
                payload,
                options
            );

            console.log("executing this  line number ----- 396");
            // console.log("notification data ----- ", notificationData);

            if (timeToLive > 1) {
                console.log("there is time to execute");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);
                    admin
                        .messaging()
                        .sendToTopic("ci_users", payload, options)
                        .then((resp) => {
                            console.log("resp resp ----->>>>>", resp);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                            return resp;
                        })
                        .catch((err) => {
                            console.log("err err err ----- >>>>>", err);
                            return err;
                        });
                });
            } else {

                admin
                    .messaging()
                    .sendToTopic("ci_users", payload, options)
                    .then((resp) => {
                        console.log("resp resp ----->>>>>", resp);
                        return resp;
                    })
                    .catch((err) => {
                        console.log("err err err ----- >>>>>", err);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                        return err;
                    });
            }
        } else if (notificationData.target.userSegment &&
            notificationData.target.userSegment != "" &&
            notificationData.target.userSegment === "Send To Approved Applications") {

            console.log("executing this  line number ----- 435");
            // console.log("notification data ----- ", notificationData);
            // console.log("notification data ----- ", notificationData.target.userSegment);

            // console.log("\n\n", payload, "\n\n", options, "\n\n");


            if (timeToLive > 1) {
                console.log("there is time to execute");
                cronJobM(timeToLive, function () {
                    console.log("executing after some time ----->>>", timeToLive);

                    admin.messaging().sendToTopic("claim_cashback_request", payload, options).then((resp) => {
                        console.log("resp resp ----->>>>>", resp);
                        return resp;
                    })
                        .catch((err) => {
                            console.log("err err err ----- >>>>>", err);
                            scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                            return err;
                        });

                });
            } else {

                admin.messaging().sendToTopic("claim_cashback_request", payload, options).then((resp) => {
                    console.log("resp resp ----->>>>>", resp);
                    return resp;
                })
                    .catch((err) => {
                        console.log("err err err ----- >>>>>", err);
                        scheduleNotifications.addNotificationResultToDb(resp, dbData.sn_id);
                        return err;
                    });
            }




        } else {
            console.log("nothing to send here line 441");
        }

        // if (notificationData.targetDeviceSelect == 0) {
        //     console.log("hey im in this --------", notificationData.targetDeviceSelect);
        //     console.log("send ing to android");
        //     admin.app("com.cardinsider.creditcards")
        //         .messaging().sendToDevice(
        //             "d3XLXAZES4Gya-fyvAxnYw:APA91bFQfKDmnhw1YCXuleAbDNDePSRQgZE5ZbUD7YAayMIZ7drlyNff-0JZy0IXrvT2eaiRNIAvml0EHio_VcqEYbzivCpJcoY4u0-hKXmEua-t3DAnX9RAiCySTBZgMmMA2HZ9mNkK", {
        //                 notification: {
        //                     title: "dfgef",
        //                     body: "iugiugu",
        //                 },
        //             }
        //         ).then((resp) => {
        //             console.log("resp resp ----->>>>>", resp);
        //             return resp;
        //         })
        //         .catch((err) => {
        //             console.log("err err err ----- >>>>>", err);
        //             return err;
        //         });

        // }
    }else{
        console.log("hi im in else ");
    };
}


/* The above code is sending a notification to multiple FCM tokens. */
scheduleNotifications.sendCardApplicationsNotificationToMultipleFcms = async function (messageObject) {
    //console.log(messageObject.fcm_token.length, "sfdgsfiognfn");

    /* Creating a variable called fcmTokens and assigning it the value of the fcm_token property of the
    messageObject. */
    let fcmTokens = messageObject.fcm_token;

    /* The above code is creating a new object called options. This object has two properties, priority
    and timeToLive. */
    let options = {
        priority: "high",
        timeToLive: 60 * 60 * 24 * 2,
    }


    /* The above code is creating a payload object that will be sent to the FCM server. */
    let payload = {
        notification: {
            title: messageObject.title,
            body: messageObject.message,
        },
        data: {
            page: messageObject.pageToOpen,
        },
        tokens: fcmTokens,
        options: options
    };




    /* Sending a message to all the devices in the registration tokens array. */
    await admin.messaging().sendMulticast(payload, false).then((response) => {
        console.log(response);
    });

}


scheduleNotifications.sendCashbackReferralsNotification = async function (messageObject) {
    console.log(messageObject, "messageobject \n\n\n");

    /* Creating a variable called fcmTokens and assigning it the value of the fcm_token property of the
    messageObject. */
    let fcmTokens = messageObject.token;

    /* The above code is creating a new object called options. This object has two properties, priority
    and timeToLive. */
    let options = {
        priority: "high",
        timeToLive: 60 * 60 * 24 * 2,
    }


    /* The above code is creating a payload object that will be sent to the FCM server. */
    let payload = {
        notification: {
            title: messageObject.notificationTitle,
            body: messageObject.body,
            image: messageObject.imgUrl ?? ""
        },
        data: { page: 'webview', url: 'https://trking.cardinsider.com/red' }

    };

    await admin.messaging().sendToDevice(fcmTokens, payload, options).then((resp) => {
        console.log(response);
        return response;
    });
}





scheduleNotifications.subscribeToTopic = async function (tokens, topicName) {
    if (tokens && topicName) {

        return await admin.messaging().subscribeToTopic(tokens, topicName).then((resp) => {
            console.log("subscribed to topic response : ------ ", resp);
        })

    } else {
        return "Either tokens are empty or topic is empty";
    }
}





scheduleNotifications.unSubscribeFromTopic = async function (tokens, topicName) {
    if (tokens && topicName) {

        return await admin.messaging().unsubscribeFromTopic(tokens, topicName).then((resp) => {
            console.log("unSubscribed from topic response : ------ ", resp);
        })

    } else {
        return "Either tokens are empty or topic is empty";
    }
}




module.exports = scheduleNotifications;