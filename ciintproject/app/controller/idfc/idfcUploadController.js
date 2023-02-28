let uploadIdfcModel = require('../../model/idfc/idfcFileUploadModel');
let hitexternalApi = require("../../common/hitExternalApi");

let commonController = require("../../controller/commonController");

let accessMiddleware = require('../../common/checkAccessMiddleware');

////////////////////////////////////////////////////////////////////////////////////

let controllerObj = {};

/* This is a function that is called when the user visits the `/uploadApplicationsUi` route. It renders
the `idfcFileUpload` view. */
controllerObj.uploadApplicationsUi = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("idfc/idfcFileUpload", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}

}


controllerObj.uploadApplicationsAjex = async function (req, res, next) {
	//console.log(JSON.parse(req.body.allParsedData), "------------>>>>>> request data");
	let allParsedData = JSON.parse(req.body.allData);
	//console.log(allParsedData, "allParsedData");
	if (req && req.body && allParsedData && allParsedData.length > 0) {
		let appApplicationDataByTracking = {};
		let appApplicationDataByPhoneNumber = {};
		let IDFCApplicationsByMainId = {};
		let IDFCApplicationsByApplicationId = {};


		let getAllApplicationData = await uploadIdfcModel.getAllApplicationsDataFromMainTable();

		if (getAllApplicationData && getAllApplicationData.length > 0) {
			//console.log(getAllApplicationData[0], "getAllApplicationData in if");
			for (let i = 0; i < getAllApplicationData.length; i++) {
				appApplicationDataByTracking[getAllApplicationData[i].tracking_id] = getAllApplicationData[i];
				appApplicationDataByPhoneNumber[getAllApplicationData[i].phone_number] = getAllApplicationData[i];
			}
		}
		let getIDFCAllApplicationData = await uploadIdfcModel.getAllIdfcApplicationsData();
		//console.log(getIDFCAllApplicationData[0], "IDFCApplicationsByApplicationId in iffififffifi");
		if (getIDFCAllApplicationData && getIDFCAllApplicationData.length > 0) {
			for (let i = 0; i < getIDFCAllApplicationData.length; i++) {
				IDFCApplicationsByMainId[getIDFCAllApplicationData[i].ca_main_table] = getIDFCAllApplicationData[i];
				IDFCApplicationsByApplicationId[getIDFCAllApplicationData[i].idfc_application_number] = getIDFCAllApplicationData[i];
				//	console.log(getIDFCAllApplicationData[i], "IDFCApplicationsByApplicationId in iffififffifi");
				//	console.log(IDFCApplicationsByApplicationId, "IDFCApplicationsByApplicationId in for");
			}
		}
		//console.log(JSON.parse(req.body.allParsedData));
		let uploadDataInDB = await uploadIdfcModel.entryToIdfcFromSheetAjex(allParsedData, IDFCApplicationsByMainId, IDFCApplicationsByApplicationId, appApplicationDataByTracking, appApplicationDataByPhoneNumber);
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