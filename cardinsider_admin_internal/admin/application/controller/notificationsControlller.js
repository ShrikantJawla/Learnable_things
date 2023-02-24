let commonHelper = require("../common/helper")
let fireService = require("../common/firebaseService/scheduleNotification")
let notificationModel = require("../model/notificationModel")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")


let notificationControllerObj = {}


notificationControllerObj.scheduleNotificationsPage = async function (req, res, next) {

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 6, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("manageNotifications/scheduleNotifications", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }


}

notificationControllerObj.postScheduleNotificationFormData = async function (req, res, next) {
    //console.log(req.body, "reques body here...");
    await fireService.sendNotification(req.body)
    res.send("dsg")
}


notificationControllerObj.viewScheduledNotificationsPage = async function (req, res, next) {

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 6, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("manageNotifications/viewScheduledNotificationsPage", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }

}





notificationControllerObj.viewScheduledNotificationsPageTable = async function (req, res, next) {
    let responseFromDb = await notificationModel.getScheduledNotificationsData()
    //console.log(responseFromDb);
    res.render("manageNotifications/viewScheduledNotificationsPageTable", { scheduledNotifications: responseFromDb })
}



notificationControllerObj.getScheduledNotificationsData = async function (req, res, next) {    
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 6, "R");
    if (middleWearObjRes) {
        let responseFromDb = await notificationModel.fetchNotificationsData(req.body);
         console.log(responseFromDb.paymentData[0]);
        res.render("./manageNotifications/viewScheduledNotificationsPageTable", {
            reportData: responseFromDb.paymentData,
            totalCount : responseFromDb.count,
        });
    } else {
        res.render("error/noPermission");
    }
    
}






module.exports = notificationControllerObj;