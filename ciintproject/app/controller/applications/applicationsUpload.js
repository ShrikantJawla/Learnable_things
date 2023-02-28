let uploadIdfcModel = require('../../model/applications/allApplicationsUploadModel');
let commonController = require("../../controller/commonController");
let commonModel = require("../../model/commonModel");
const commonModelObj = require('../../model/commonModel/commonModel');
let accessMiddleware = require('../../common/checkAccessMiddleware');
////////////////////////////////////////////////////////////////////////////////////

let controllerObj = {};

controllerObj.uploadApplicationsUi = async function (req, res, next) {
    console.log('HI i am RRRR');
    let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "R")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
        res.render("applications/uploadAllApplicationsUi", { sidebarDataByServer: sideBarData });
    } else {
        res.render("error/noPermission");
    }
}


controllerObj.uploadApplicationsAjex = async function (req, res, next) {
    //console.log(JSON.parse(req.body.allParsedData), "------------>>>>>> request data");
    let allParsedData = JSON.parse(req.body.allData);
    //console.log(allParsedData , "allParsedData");
    if ( req && req.body && allParsedData && allParsedData.length > 0) {

        commingBankName = req.body.bankName;
        let allApplications = await commonModelObj.getAllUsersInBachis();
        let dataByPhoneNumber = {};
        for (let i = 0; i < allApplications.length > 0; i++) {
            dataByPhoneNumber[allApplications[i].phone_number] = allApplications[i];
        }
        let insertDataintoDb = await uploadIdfcModel.entryToAuFromSheetAjex(allParsedData, dataByPhoneNumber, commingBankName);
        if (insertDataintoDb) {
            res.send({ status: true, message: "Operation performed successfully." });
        } else {
            res.send({ status: false, message: "Error in DB." });
        }

    } else {
        res.send({ status: false, message: "Invalid data" });
    }
}

controllerObj.uploadBankSheetAjax = async function (req, res, next) {
    //console.log(JSON.parse(req.body.allParsedData), "------------>>>>>> request data");
    let allParsedData = JSON.parse(req.body.allData);
    //console.log(allParsedData , "allParsedData");
    if (req && req.body && allParsedData && allParsedData.length > 0) {

        commingBankName = req.body.bankName;
        let allApplications = await commonModelObj.getAllUsersInBachis();
        let dataByPhoneNumber = {};
        for (let i = 0; i < allApplications.length > 0; i++) {
            dataByPhoneNumber[allApplications[i].phone_number] = allApplications[i];
        }
        let insertDataintoDb = await uploadIdfcModel.entryToAuFromSheetAjex(allParsedData, dataByPhoneNumber, commingBankName);
        if (insertDataintoDb) {
            res.send({ status: true, message: "Operation performed successfully." });
        } else {
            res.send({ status: false, message: "Error in DB." });
        }

    } else {
        res.send({ status: false, message: "Invalid data" });
    }
}

module.exports = controllerObj;