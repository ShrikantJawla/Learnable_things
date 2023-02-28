
let commonHelper = require("../../common/helper");
let uploadYesModel = require("../../model/yesBank/yesUploadModel");
let hitexternalApi = require("../../common/hitExternalApi");
let controllerObj = {};


let accessMiddleware = require('../../common/checkAccessMiddleware');

let commonController = require("../commonController");


controllerObj.uploadApplicationsUi = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "R");
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render('yesBank/yesUpload', { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}




controllerObj.uploadApplicationsAjex = async function (req, res, next) {
	let allParsedData = JSON.parse(req.body.allData);
	console.log("------------>>>>>> request data");
	if (req && req.body && allParsedData && allParsedData.length > 0) {
		let yesApplicationsByMainId = {};
		let yesApplicationsByApplicationId = {};
		let appApplicationDataByPhoneNumber = {};
		let getAllApplicationData = await uploadYesModel.getAllApplicationsDataFromMainTable();
		if (getAllApplicationData && getAllApplicationData.length > 0) {

			//console.log(getAllApplicationData[0], "getAllApplicationData in if");
			for (let i = 0; i < getAllApplicationData.length; i++) {
				appApplicationDataByPhoneNumber[getAllApplicationData[i].phone_number] = getAllApplicationData[i];
			}
		}
		let getYesBankAllApplicationData = await uploadYesModel.getAllYesBankApplicationsData();
		if (getYesBankAllApplicationData && getYesBankAllApplicationData.length > 0) {
			for (let i = 0; i < getYesBankAllApplicationData.length; i++) {
				yesApplicationsByApplicationId[getYesBankAllApplicationData[i].yb_application_number] = getYesBankAllApplicationData[i];
				//	console.log(getYesBankAllApplicationData[i], "bobApplicationsByApplicationId in iffififffifi");
				//	console.log(bobApplicationsByApplicationId, "bobApplicationsByApplicationId in for");
			}
		}
		let uploadDataInDB = await uploadYesModel.entryToBobFromSheetAjex(allParsedData, yesApplicationsByApplicationId, appApplicationDataByPhoneNumber);
		if (uploadDataInDB) {

		}
		res.send({ status: true, message: "Operation performed successfully." });
	} else {
		res.send({ status: false, message: "Invalid data" });
	}
}

module.exports = controllerObj;