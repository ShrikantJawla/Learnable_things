let applicationModel = require("../model/applicationModel")
const creditCardModel = require("../model/creditCardModel")
const homeModel = require("../model/homeModel")
const commonHelper = require("../common/helper")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware");
const commonModel = require("../model/commonModel");
let applicationObj = {}
let JSONbig = require("json-bigint")
const scheduleFirebase = require("../common/firebaseService/scheduleNotification");
const smsService = require('../common/smsService/sendApprovedApplicationsSms');
const { end } = require("../../../configration/mariaDbConfig");
/* ===========>>>>>>>>>   card application upload here ....   <<<<<<<<<<<======================= */

applicationObj.cardApplicationUpload = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 1, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("cardApplications/fileUpload", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}

/* ===========>>>>>>>>>   add card application data here  ....   <<<<<<<<<<<======================= */



/* ===========>>>>>>>>>   processing axis sheet  data here  ....   <<<<<<<<<<<======================= */

/*  Processing  and performing operations  on the axis bank data */

applicationObj.addApplicationsDataForAxis = async function (req, res, next) {

    //console.log(req.body);
    /* Creating a variable called finalReturnData and assigning it an object with two properties. */
    let finalReturnData = {
        status: false,
        code: "CIA-APP-ADD-ERROR-102",
    }


    /* Updating the card sheet name in the database. */
    if (req.body.allCardFileName) {
        await applicationModel.updateCardSheetName(JSON.parse(req.body.allCardFileName));
    }


    /* The above code is declaring three variables and assigning them to empty objects. */
    let finalApprovedNotificationObject = {}
    let finalRejectedNotificationObject = {}
    let finalPendingNotificationObject = {}
    let finalApprovedSendSms = [];
    let finalApprovedData = [];


    /* Assigning values to approved notification object here. */
    finalApprovedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('Axis Bank', 'Approved', 'T');
    finalApprovedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('Axis Bank', 'Approved', 'M');
    finalApprovedNotificationObject.pageToOpen = 'ApplicationTracking';
    finalApprovedNotificationObject.fcm_token = [];



    /* Assigning values to rejected notification object here.*/
    finalRejectedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('Axis Bank', 'Rejected', 'T')
    finalRejectedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('Axis Bank', 'Rejected', 'M')
    finalRejectedNotificationObject.pageToOpen = 'apply'
    finalRejectedNotificationObject.fcm_token = []


    /* Assigning values to pending notification object here.*/
    finalPendingNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('Axis Bank', 'Processing', 'T')
    finalPendingNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('Axis Bank', 'Processing', 'M')
    finalPendingNotificationObject.pageToOpen = 'ApplicationTracking'
    finalPendingNotificationObject.fcm_token = []



    /* The above code is used to upload the application data from the excel sheet. */
    if (req.body && req.body.allData) {


        let insertQuesy = "";
        let updateQuery = "";
        let ifApprovedUpdateQuery = "";


        /* Getting the current date and time. */
        let currentDate = commonHelper.getCurrentDateTime();



        /* Fetching all the applications from the database. */
        let getAllApplicationsData = await applicationModel.fetchAllCardApplicationsForuploadApplication();

        /* Parsing the applications data that was sent from the client side. */
        let result = JSON.parse(req.body.allData);
        console.log(result.length, "result data ");

        let appLicationData = result;
        let alreadyApplicationsData = {}
        console.log(getAllApplicationsData.length, "get all applications");
        for (var k = 0; k < getAllApplicationsData.length; k++) {
            alreadyApplicationsData[getAllApplicationsData[k].Application_number.toString()] = getAllApplicationsData[k];


        }
        console.log(appLicationData, "application data here------");
        for (var i = 0; i < appLicationData.length; i++) {

            if (!appLicationData[i].id || appLicationData[i].id == "") {
                appLicationData[i].id = 0
            }


            let isAlreadyInsert = false
            let matchedData = {}
            if (alreadyApplicationsData[appLicationData[i].applicationNumber.toString()]) {
                isAlreadyInsert = true
                matchedData = alreadyApplicationsData[appLicationData[i].applicationNumber.toString()]
            }

            let cashback = "";

            if (appLicationData[i]['cashback'] && appLicationData[i]['cashback'] != "") {


                if (appLicationData[i]['cashbacknew'] && appLicationData[i]['cashbacknew'] != "") {

                    cashback = appLicationData[i]['cashbacknew'];
                } else {
                    cashback = appLicationData[i]['cashback'];
                }

            }
            if (appLicationData[i].status == "Declined") {
                appLicationData[i].status = "Rejected"



                if (matchedData['Application_Status'] != appLicationData[i].status && appLicationData[i].fcmToken !== '' && appLicationData[i].fcmToken !== null) {
                    finalRejectedNotificationObject.fcm_token.push(appLicationData[i].fcmToken)
                }



            } else if (appLicationData[i].status == "Approved") {
                appLicationData[i].status = "Approved"
                let dataToPush = {
                    'application_number': appLicationData[i].applicationNumber,
                    'user_id': appLicationData[i].id,
                    'issuer_id' : req.body.issuerId,
                    amount : 0,
                    application_id : 0,
                };
                if (isAlreadyInsert) {
                    dataToPush.application_id = matchedData.id;
                }
                if (cashback && cashback > 0) {
                    dataToPush.amount = cashback;
                }
                finalApprovedData.push(dataToPush);

                if (matchedData['Application_Status'] != appLicationData[i].status && appLicationData[i].fcmToken !== '' && appLicationData[i].fcmToken !== null) {
                    finalApprovedNotificationObject.fcm_token.push(appLicationData[i].fcmToken);
                    finalApprovedSendSms.push({
                        "mobiles": `91${appLicationData[i].phoneNumber}`,
                        "var": "test"
                    });

                }

                if (appLicationData[i].id != "" && appLicationData[i].refer_by != 0) {
                    ifApprovedUpdateQuery =
                        ifApprovedUpdateQuery +
                        ` UPDATE card_insider_users set "Referrers_approved" = '1' where id = ` +
                        appLicationData[i].id +
                        `; `
                }

            } else {
                appLicationData[i].status = "Processing"


                if (matchedData['Application_Status'] != appLicationData[i].status && appLicationData[i].fcmToken !== '' && appLicationData[i].fcmToken !== null) {
                    finalPendingNotificationObject.fcm_token.push(appLicationData[i].fcmToken)
                }

            }



            if (isAlreadyInsert) {
                updateQuery =
                    updateQuery +
                    ` UPDATE card_applications set "Application_Status" = '` +
                    appLicationData[i].status +
                    `' , "application_reason" = '` +
                    appLicationData[i].reasonForStatus +
                    `' , "application_through" = '` +
                    appLicationData[i].applyBy +
                    `' , "credit_card" = ` +
                    appLicationData[i].cardId +
                    ` where "Application_number" = '` +
                    appLicationData[i].applicationNumber +
                    `';`
            } else {
                insertQuesy =
                    insertQuesy +
                    ` INSERT INTO card_applications("Application_number", "Phone_Number" , "card_insider_user", "Application_Status", "card_issuer", "credit_card", "Application_date", "application_reason", "application_through" , "published_at" , "Referred_by" , "Cashback_to_be_paid") VALUES( '` +
                    appLicationData[i].applicationNumber +
                    `' , '` +
                    appLicationData[i].phoneNumber +
                    `', ` +
                    appLicationData[i].id +
                    ` , '` +
                    appLicationData[i].status +
                    `' , ` +
                    appLicationData[i].issuerId +
                    ` , ` +
                    appLicationData[i].cardId +
                    ` , '` +
                    appLicationData[i].dateOfApply +
                    `' , '` +
                    appLicationData[i].reasonForStatus +
                    `', '` +
                    appLicationData[i].applyBy +
                    `' , '` +
                    currentDate +
                    `' , ` +
                    appLicationData[i].refer_by +
                    ` , ` +
                    cashback +
                    `) ;`
            }
        }
        if (insertQuesy && insertQuesy != "") {
            console.log("insertQuesy")
            await applicationModel.addApplicationsData(insertQuesy)
        }
        if (updateQuery && updateQuery != "") {
            console.log("updateQuery")
            await applicationModel.addApplicationsData(updateQuery)
        }
        if (ifApprovedUpdateQuery && ifApprovedUpdateQuery != "") {
            console.log("ifApprovedUpdateQuery")
            await applicationModel.addApplicationsData(ifApprovedUpdateQuery)
        }
        //console.log("CURRENT DATE ", currentDate)
        finalReturnData.status = true;
        finalReturnData.code = "CIA-APP-ADD-102";
        commonModel.addDataToPaymentReport(finalApprovedData);

    }


    if (finalApprovedNotificationObject && finalApprovedNotificationObject.fcm_token && finalApprovedNotificationObject.fcm_token.length > 0) {

        let responseSubscribe = scheduleFirebase.subscribeToTopic(finalApprovedNotificationObject.fcm_token, "claim_cashback_request");
        console.log("SUBSCRIBE RESPONSE ---- ", responseSubscribe);

        scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(finalApprovedNotificationObject)
    }

    if (finalApprovedSendSms.length > 0) {
        console.log("hi im in send sms condition ");
        smsService.sendApprovedApplicationsSms({ sendersList: finalApprovedSendSms });
    }

    if (finalPendingNotificationObject && finalPendingNotificationObject.fcm_token && finalPendingNotificationObject.fcm_token.length > 0) {

        scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(finalPendingNotificationObject)
    }


    if (finalRejectedNotificationObject && finalRejectedNotificationObject.fcm_token && finalRejectedNotificationObject.fcm_token.length > 0) {

        scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(finalRejectedNotificationObject)
    }
    res.send(finalReturnData)
}


/* ===========>>>>>>>>>   processing IDFC bank sheet  data here  ....   <<<<<<<<<<<======================= */

applicationObj.addApplicationsDataForIdfc = async function (req, res, next) {
    let finalReturnData = {
        status: false,
        code: "CIIP-2-IDFC-Error-101",

    }
    if (req.body && req.body.allData) {
        if (req.body.allCardFileName) {
            await applicationModel.updateCardSheetName(JSON.parse(req.body.allCardFileName));
        }
        let parsedReqData = JSON.parse(req.body.allData)

        let getAllApplicationsData = await applicationModel.getApplicationsForSheetUpsert(14)
        let getAllUsersData = await applicationModel.getAllUsersForSheetUpsert()

        //console.log(getAllUsersData , "getAllApplicationsData");
        let resFromDb
        let allApplicationsWeHave = {}
        let allUsers = {}
        if (getAllApplicationsData.length > 0) {
            for (let n = 0; n < getAllApplicationsData.length; n++) {
                allApplicationsWeHave[getAllApplicationsData[n].Application_number] = getAllApplicationsData[n]
            }
        }
        if (getAllUsersData.length > 0) {
            for (let g = 0; g < getAllUsersData.length; g++) {
                allUsers[getAllUsersData[g].id] = getAllUsersData[g]
            }
        }
        resFromDb = await applicationModel.upsertIdfcApplicationsData(parsedReqData, allApplicationsWeHave, allUsers , req.body.issuerId)

        // console.log("parsed data--------- >>>>>>>>>>>>>", parsedReqData);
       // console.log(resFromDb, "-------- dwgneri")
        if (resFromDb) {




            if (resFromDb.aprovedNotificationObject && resFromDb.aprovedNotificationObject.fcm_token && resFromDb.aprovedNotificationObject.fcm_token.length > 0) {

                let responseSubscribe = scheduleFirebase.subscribeToTopic(resFromDb.aprovedNotificationObject.fcm_token, "claim_cashback_request");
                console.log("SUBSCRIBE RESPONSE ---- ", responseSubscribe);
                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.aprovedNotificationObject)



            }

            if (resFromDb.approvedSmsObject && resFromDb.approvedSmsObject.length > 0) {
                console.log(" \n\n have to send sms to these numbers \n\n", resFromDb.approvedSmsObject);
                smsService.sendApprovedApplicationsSms({ sendersList: resFromDb.approvedSmsObject });
            }

            if (resFromDb.rejectedNotificationObject && resFromDb.rejectedNotificationObject.fcm_token && resFromDb.rejectedNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.rejectedNotificationObject)


            }

            if (resFromDb.pendingNotificationObject && resFromDb.pendingNotificationObject.fcm_token && resFromDb.pendingNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.pendingNotificationObject)
            }

            // if (resFromDb.notificationArray && resFromDb.notificationArray.length > 0) {
            //     console.log('I AM in ');
            //     for (let k = 0; k < resFromDb.notificationArray.length; k++) {

            //         let sendObj = {
            //             notifictionTitle: resFromDb.notificationArray[k].tittle,
            //             notificationText: resFromDb.notificationArray[k].message,
            //             target: {
            //                 userSegment: 'Send With FCM Token',
            //                 messageTopics: 'Select Message Topics',
            //                 fcmToken: resFromDb.notificationArray[k].fcmToken
            //             },
            //             payload: [{ page: 'page', value: resFromDb.notificationArray[k].pageToOpen }],
            //             notificationTime: 1
            //         };
            //         //console.log(sendObj);
            //         scheduleFirebase.sendNotification(sendObj);
            //     }
            // }
            //console.log(resFromDb.finalApprovedData);
            commonModel.addDataToPaymentReport(resFromDb.finalApprovedData);
            finalReturnData.status = true
            finalReturnData.code = 'CIIP-2-IDFC-Success-101'
            res.send(finalReturnData)

        } else {
            finalReturnData.status = false
            finalReturnData.code = 'CIIP-2-IDFC-Error-102'
            res.send(finalReturnData)
        }

    } else {
        finalReturnData.status = false
        finalReturnData.code = 'CIIP-2-IDFC-Error-101'
        res.send(finalReturnData)
    }



}


/* ===========>>>>>>>>>   processing  BANK OF BARODA sheet  data here  ....   <<<<<<<<<<<======================= */

applicationObj.addApplicationsDataForBob = async function (req, res, next) {
    let finalReturnData = {
        status: false,
        code: "CIIP-2-BOB-Error-101",

    }
    if (req.body && req.body.allData) {
        //console.log(req.body);
        let parsedReqData = JSON.parse(req.body.allData)
        if (req.body.allCardFileName) {
            await applicationModel.updateCardSheetName(JSON.parse(req.body.allCardFileName));
        }
        let getAllApplicationsData = await applicationModel.getApplicationsForSheetUpsert(12)
        let getAllUsersData = await applicationModel.getAllUsersForSheetUpsert()
        // console.log(parsedReqData);

        let allApplicationsWeHave = {}
        let allUsers = {}

        let resFromDb

        if (getAllApplicationsData.length > 0) {
            for (let n = 0; n < getAllApplicationsData.length; n++) {
                allApplicationsWeHave[getAllApplicationsData[n].Application_number] = getAllApplicationsData[n]
            }
        }
        if (getAllUsersData.length > 0) {
            for (let g = 0; g < getAllUsersData.length; g++) {
                allUsers[getAllUsersData[g].id] = getAllUsersData[g]
            }
        }


        resFromDb = await applicationModel.upsertBobApplicationsData(parsedReqData, allApplicationsWeHave, allUsers , req.body.issuerId)


        // console.log("parsed data--------- >>>>>>>>>>>>>", parsedReqData);
        //console.log(resFromDb, "-------- dwgneri")
        if (resFromDb) {


            if (resFromDb.aprovedNotificationObject && resFromDb.aprovedNotificationObject.fcm_token && resFromDb.aprovedNotificationObject.fcm_token.length > 0) {

                let responseSubscribe = scheduleFirebase.subscribeToTopic(resFromDb.aprovedNotificationObject.fcm_token, "claim_cashback_request");
                console.log("SUBSCRIBE RESPONSE ---- ", responseSubscribe);

                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.aprovedNotificationObject);
            }


            if (resFromDb.approvedSmsObject && resFromDb.approvedSmsObject.length > 0) {
                console.log(" \n\n have to send sms to these numbers \n\n", resFromDb.approvedSmsObject);
                smsService.sendApprovedApplicationsSms({ sendersList: resFromDb.approvedSmsObject });
            }

            if (resFromDb.rejectedNotificationObject && resFromDb.rejectedNotificationObject.fcm_token && resFromDb.rejectedNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.rejectedNotificationObject)


            }

            if (resFromDb.pendingNotificationObject && resFromDb.pendingNotificationObject.fcm_token && resFromDb.pendingNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.pendingNotificationObject)
            }


            // if (resFromDb.notificationArray && resFromDb.notificationArray.length > 0) {
            //     console.log('I AM in ');
            //     for (let k = 0; k < resFromDb.notificationArray.length; k++) {

            //         let sendObj = {
            //             notifictionTitle: resFromDb.notificationArray[k].tittle,
            //             notificationText: resFromDb.notificationArray[k].message,
            //             target: {
            //                 userSegment: 'Send With FCM Token',
            //                 messageTopics: 'Select Message Topics',
            //                 fcmToken: resFromDb.notificationArray[k].fcmToken
            //             },
            //             payload: [{ page: 'page', value: resFromDb.notificationArray[k].pageToOpen }],
            //             notificationTime: 1
            //         };
            //         // console.log(sendObj);
            //         scheduleFirebase.sendNotification(sendObj);
            //     }
            // }

             //console.log(resFromDb.finalApprovedData , "djbcdcddj");
             commonModel.addDataToPaymentReport(resFromDb.finalApprovedData);
            finalReturnData.status = true
            finalReturnData.code = 'CIIP-2-BOB-Success-101'
            res.send(finalReturnData)

        } else {
            finalReturnData.status = false
            finalReturnData.code = 'CIIP-2-BOB-Error-102'
            res.send(finalReturnData)
        }

    } else {
        finalReturnData.status = false
        finalReturnData.code = 'CIIP-2-BOB-Error-101'
        res.send(finalReturnData)
    }



}



/* ===========>>>>>>>>>   processing  AU BANK sheet  data here  ....   <<<<<<<<<<<======================= */

applicationObj.addApplicationsDataForAu = async function (req, res, next) {
    let finalReturnData = {
        status: false,
        code: "CIIP-2-AU-Error-101",

    }
    if (req.body && req.body.allData) {
        if (req.body.allCardFileName) {
            await applicationModel.updateCardSheetName(JSON.parse(req.body.allCardFileName));
        }
        //console.log(req.body);
        let parsedReqData = JSON.parse(req.body.allData)

        let getAllApplicationsData = await applicationModel.getApplicationsForSheetUpsert(19)
        let getAllUsersData = await applicationModel.getAllUsersForSheetUpsert()
        // console.log(parsedReqData);

        let allApplicationsWeHave = {}
        let allUsers = {}


        //console.log(parsedReqData);
        let resFromDb

        if (getAllApplicationsData.length > 0) {
            for (let n = 0; n < getAllApplicationsData.length; n++) {
                allApplicationsWeHave[getAllApplicationsData[n].Application_number] = getAllApplicationsData[n]
            }
        }
        if (getAllUsersData.length > 0) {
            for (let g = 0; g < getAllUsersData.length; g++) {
                allUsers[getAllUsersData[g].id] = getAllUsersData[g]
            }
        }


        //   console.log(parsedReqData, "parsed request data");



        resFromDb = await applicationModel.upsertAuApplicationsData(parsedReqData, allApplicationsWeHave, allUsers , req.body.issuerId)


        // console.log("parsed data--------- >>>>>>>>>>>>>", parsedReqData);
        //console.log(resFromDb, "-------- dwgneri");
        if (resFromDb) {


            if (resFromDb.aprovedNotificationObject && resFromDb.aprovedNotificationObject.fcm_token && resFromDb.aprovedNotificationObject.fcm_token.length > 0) {

                let responseSubscribe = scheduleFirebase.subscribeToTopic(resFromDb.aprovedNotificationObject.fcm_token, "claim_cashback_request");
                console.log("SUBSCRIBE RESPONSE ---- ", responseSubscribe);
                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.aprovedNotificationObject);

            }

            if (resFromDb.approvedSmsObject && resFromDb.approvedSmsObject.length > 0) {
                console.log(" \n\n have to send sms to these numbers \n\n", resFromDb.approvedSmsObject);
                smsService.sendApprovedApplicationsSms({ sendersList: resFromDb.approvedSmsObject });
            }


            if (resFromDb.rejectedNotificationObject && resFromDb.rejectedNotificationObject.fcm_token && resFromDb.rejectedNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.rejectedNotificationObject)


            }

            if (resFromDb.pendingNotificationObject && resFromDb.pendingNotificationObject.fcm_token && resFromDb.pendingNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.pendingNotificationObject)
            }


            // if (resFromDb.notificationArray && resFromDb.notificationArray.length > 0) {
            //     console.log('I AM in ');
            //     for (let k = 0; k < resFromDb.notificationArray.length; k++) {

            //         let sendObj = {
            //             notifictionTitle: resFromDb.notificationArray[k].tittle,
            //             notificationText: resFromDb.notificationArray[k].message,
            //             target: {
            //                 userSegment: 'Send With FCM Token',
            //                 messageTopics: 'Select Message Topics',
            //                 fcmToken: resFromDb.notificationArray[k].fcmToken
            //             },
            //             payload: [{ page: 'page', value: resFromDb.notificationArray[k].pageToOpen }],
            //             notificationTime: 1
            //         };

            //          scheduleFirebase.sendNotification(sendObj);
            //     }
            //     // console.log(resFromDb.notificationArray.length);
            // }
            //console.log(resFromDb.finalApprovedData , "djbcdc222222ddj");
            commonModel.addDataToPaymentReport(resFromDb.finalApprovedData);
            finalReturnData.status = true
            finalReturnData.code = 'CIIP-2-AU-Success-101'
            res.send(finalReturnData)

        } else {
            finalReturnData.status = false
            finalReturnData.code = 'CIIP-2-AU-Error-102'
            res.send(finalReturnData)
        }

    } else {
        finalReturnData.status = false
        finalReturnData.code = 'CIIP-2-AU-Error-101'
        res.send(finalReturnData)
    }



}





/* ===========>>>>>>>>>   processing  YES BANK sheet  data here  ....   <<<<<<<<<<<======================= */

applicationObj.addApplicationsDataForYes = async function (req, res, next) {
    let finalReturnData = {
        status: false,
        code: "CIIP-2-AU-Error-101",

    }
    if (req.body.allCardFileName) {
        await applicationModel.updateCardSheetName(JSON.parse(req.body.allCardFileName));
    }
    if (req.body && req.body.allData) {
        //console.log(req.body);
        let parsedReqData = JSON.parse(req.body.allData)

        let getAllApplicationsData = await applicationModel.getApplicationsForSheetUpsert(7);
        let getAllUsersData = await applicationModel.getAllUsersForSheetUpsert();



        let allApplicationsWeHave = {}
        let allUsers = {}


        //console.log(parsedReqData);
        let resFromDb

        if (getAllApplicationsData.length > 0) {
            for (let n = 0; n < getAllApplicationsData.length; n++) {
                allApplicationsWeHave[getAllApplicationsData[n].Application_number] = getAllApplicationsData[n]
            }
        }
        if (getAllUsersData.length > 0) {
            for (let g = 0; g < getAllUsersData.length; g++) {
                allUsers[getAllUsersData[g].ciu_number] = getAllUsersData[g]
            }
        }


        //console.log(allUsers);



        resFromDb = await applicationModel.upsertYesApplicationsData(parsedReqData, allApplicationsWeHave, allUsers , req.body.issuerId)


        // console.log("parsed data--------- >>>>>>>>>>>>>", parsedReqData);
        console.log(resFromDb.aprovedNotificationObject, "-------- dwgneri");
        if (resFromDb) {


            if (resFromDb.aprovedNotificationObject && resFromDb.aprovedNotificationObject.fcm_token && resFromDb.aprovedNotificationObject.fcm_token.length > 0) {

                let responseSubscribe = scheduleFirebase.subscribeToTopic(resFromDb.aprovedNotificationObject.fcm_token, "claim_cashback_request");
                console.log("SUBSCRIBE RESPONSE ---- ", responseSubscribe);
                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.aprovedNotificationObject);

            }

            if (resFromDb.approvedSmsObject && resFromDb.approvedSmsObject.length > 0) {
                console.log(" \n\n have to send sms to these numbers \n\n", resFromDb.approvedSmsObject);
                smsService.sendApprovedApplicationsSms({ sendersList: resFromDb.approvedSmsObject });
            }



            if (resFromDb.rejectedNotificationObject && resFromDb.rejectedNotificationObject.fcm_token && resFromDb.rejectedNotificationObject.fcm_token.length > 0) {


                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.rejectedNotificationObject)


            }

            if (resFromDb.pendingNotificationObject && resFromDb.pendingNotificationObject.fcm_token && resFromDb.pendingNotificationObject.fcm_token.length > 0) {
                scheduleFirebase.sendCardApplicationsNotificationToMultipleFcms(resFromDb.pendingNotificationObject)
            }
            console.log(resFromDb.finalApprovedData , "djbcdc222222ddj");
            //commonModel.addDataToPaymentReport(resFromDb.finalApprovedData);

            finalReturnData.status = true
            finalReturnData.code = 'CIIP-2-AU-Success-101'
            res.send(finalReturnData)

        } else {
            finalReturnData.status = false
            finalReturnData.code = 'CIIP-2-AU-Error-102'
            res.send(finalReturnData)
        }


    } else {
        finalReturnData.status = false
        finalReturnData.code = 'CIIP-2-AU-Error-101'
        res.send(finalReturnData)
    }



}

/* ===========>>>>>>>>>   END OF PROCESSING   YES BANK sheet  data here  ....   <<<<<<<<<<<======================= */

applicationObj.updateCardApplicationsData = async function () {
    //console.log("updaing")
}

/* ===========>>>>>>>>>   card applications list here ....   <<<<<<<<<<<======================= */

applicationObj.getAllApplicationsList = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 1, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("./cardApplications/cardApplicationList", {
            applicationList: [],
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}
applicationObj.getAllApplicationsListByAjax = async function (req, res, next) {
    /* {
  filterObject: {
    to_application_date: '2022-05-25',
    id: '1234',
    Application_number: '345',
    Phone_Number: '444256',
    card_issuer: '25',
    credit_card: '326',
    application_through: 'web',
    Application_Status: 'Rejected',
    from_application_date: '2022-06-02',
    Cashback_paid: 'true'
  },
  pageNo: '2',
  sort: '-Cashback_paid'
} */


    // //console.log({
    //     Phone_Number, Application_number, id, card_issuer,
    //     credit_card, application_through, Application_Status,
    //     from_application_date, Cashback_paid, to_application_date, pageNo, sort, entresPerPage
    // })
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 1, "W")
    if (middleWearObjRes) {
        let { returnDataFromModel, count } = await applicationModel.fetchAllCardApplications(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTEREDAPPLICATIONS-101',
            payload: {
                applicationList: returnDataFromModel,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

applicationObj.getAllIssuersData = async function (req, res, next) {
    let rData = await applicationModel.getAllIssuers()
    //console.log(rData)
    let returnData = {
        status: true,
        code: "CIA-APP-ADD-101",
        payload: rData,
    }
    commonHelper.successHandler(res, returnData)
    // res.render("./cardApplications/cardApplicationList", { applicationList: rData });
}
applicationObj.getWebUsers = async function (req, res, next) {
    let rData = await applicationModel.getAllWebUsers()
    //res.send(rData);
    let returnData = {
        status: true,
        code: "CIA-APP-ADD-102",
        payload: rData,
    }
    commonHelper.successHandler(res, returnData)
}
applicationObj.getCardIssuersPresentInCardApplications = async function (
    req,
    res,
    next
) {
    let dataFromDb =
        await creditCardModel.fetchCardIssuersListPresentInCardApplications()
    let returnData = {
        status: true,
        code: "CIA-CARDISSUERLIST-101",
        payload: dataFromDb,
    }
    if (dataFromDb.length == 0) {
        returnData.status = false
        returnData.code = "CIA-CARDISSUERLIST-ERROR-101"

        commonHelper.errorHandler(res, returnData)
    } else {
        commonHelper.successHandler(res, returnData)
    }
}
applicationObj.getNewApplicationPageUi = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 1, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("cardApplications/newApplication", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}
module.exports = applicationObj