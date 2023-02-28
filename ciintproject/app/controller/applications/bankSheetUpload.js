let uploadIdfcModel = require('../../model/applications/allApplicationsUploadModel');
let commonController = require("../commonController");


let accessMiddleware = require('../../common/checkAccessMiddleware');
////////////////////////////////////////////////////////////////////////////////////

let controllerObj = {};


controllerObj.uploadBankSheetAjax = async function (req, res, next) {
    let allParsedData = JSON.parse(req.body.allData);
    if (req && req.body && allParsedData && allParsedData.length > 0) {

        commingBankName = req.body.bankName;
        let allApplications = await uploadIdfcModel.getAllApplicationsDataFromMainTable();
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