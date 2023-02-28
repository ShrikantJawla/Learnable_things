
let commonHelper = require("../../common/helper");
let uploadBobModel = require("../../model/bob/bobUploadModel");
let hitexternalApi = require("../../common/hitExternalApi");
let controllerObj = {};


let accessMiddleware = require('../../common/checkAccessMiddleware');

let commonController = require("../../controller/commonController");


controllerObj.uploadApplicationsUi = async function (req, res, next) {


	let middleObj = await accessMiddleware.checkAccessPermition(req, 3, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);

		res.render('bob/bobUpload', { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}

}




controllerObj.uploadApplicationsAjex = async function (req, res, next) {
	//console.log(JSON.parse(req.body.allParsedData), "------------>>>>>> request data");
	let allParsedData = JSON.parse(req.body.allData);
	if (req && req.body && allParsedData && allParsedData.length > 0 && allParsedData[0]['UTM_SOURCE']) {
		let appApplicationDataByTracking = {};
		let appApplicationDataByPhoneNumber = {};
		let bobApplicationsByMainId = {};
		let bobApplicationsByApplicationId = {};


		let getAllApplicationData = await uploadBobModel.getAllApplicationsDataFromMainTable();

		if (getAllApplicationData && getAllApplicationData.length > 0) {
			//console.log(getAllApplicationData[0], "getAllApplicationData in if");
			for (let i = 0; i < getAllApplicationData.length; i++) {
				appApplicationDataByTracking[getAllApplicationData[i].tracking_id] = getAllApplicationData[i];
				appApplicationDataByPhoneNumber[getAllApplicationData[i].phone_number] = getAllApplicationData[i];
			}
		}
		let getBobAllApplicationData = await uploadBobModel.getAllBobApplicationsData();
		//console.log(getBobAllApplicationData[0], "bobApplicationsByApplicationId in iffififffifi");
		if (getBobAllApplicationData && getBobAllApplicationData.length > 0) {
			for (let i = 0; i < getBobAllApplicationData.length; i++) {
				bobApplicationsByMainId[getBobAllApplicationData[i].ca_main_table] = getBobAllApplicationData[i];
				bobApplicationsByApplicationId[getBobAllApplicationData[i].bob_application_number] = getBobAllApplicationData[i];
				//	console.log(getBobAllApplicationData[i], "bobApplicationsByApplicationId in iffififffifi");
				//	console.log(bobApplicationsByApplicationId, "bobApplicationsByApplicationId in for");
			}
		}
		//console.log(JSON.parse(req.body.allParsedData));
		let uploadDataInDB = await uploadBobModel.entryToBobFromSheetAjex(allParsedData, bobApplicationsByMainId, bobApplicationsByApplicationId, appApplicationDataByTracking, appApplicationDataByPhoneNumber);
		if (uploadDataInDB.ipApproveData && uploadDataInDB.ipApproveData.length > 0) {
			//console.log(uploadDataInDB.ipApproveData , "uploadDataInDB");
			hitexternalApi.hitExternalApibeddlyingdrahomach(uploadDataInDB.ipApproveData);

		}
		res.send({ status: true, message: "Operation performed successfully." });
	} else {
		res.send({ status: false, message: "Invalid data" });
	}
}

module.exports = controllerObj;