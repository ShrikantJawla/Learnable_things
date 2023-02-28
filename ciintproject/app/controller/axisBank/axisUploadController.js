const fs = require('fs');
const { promisify } = require('util');
const unlinkAsync = promisify(fs.unlink);
const XLSX = require('xlsx');
const commonModelObj = require('../../model/commonModel/commonModel');

let accessMiddleware = require('../../common/checkAccessMiddleware');




let hitexternalApi = require('../../common/hitExternalApi');
let commonHelper = require("../../common/helper");
let uploadModel = require('../../model/axis/axisUploadModel');

let commonController = require("../../controller/commonController");
///////////////////////////////////////////////////////////////////////////////
let controllerObj = {};


controllerObj.uploadApplicationsUi = async function (req, res, next) {


	let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("axisBank/axisFileUpload", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}


controllerObj.uploadFileData = async function (req, res, next) {
	let data = [];
	console.log("uploadFileData");
	//console.log(req.body);
	console.log(req.file, "req file here");

	let workbook = XLSX.readFile(req.file.path, { cellDates: true, });
	let sheetNames = workbook.SheetNames;
	let dataFromSheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetNames[1]],);
	//console.log(dataFromSheet[0]['IPA STATUS'], "dataFromSheet here");


	let modelResult = await uploadModel.entryToAxisFromSheet(dataFromSheet);
	res.send({ data: modelResult });

	if (modelResult != false) {
		setTimeout(async function () {
			console.log("deleting file");
			await unlinkAsync(req.file.path);
		}, 5000);
	}

}

controllerObj.uploadFileDataByAjex = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-AXIS-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	};
	//console.log(req.body.allData , "uploadFileData");

	let getAllBanksApplications = await commonModelObj.getAllUsersInBachis();
	console.log(getAllBanksApplications.length, "ALL Bank Applications Data");
	let setAppApplicationDataACN = {};

	if (getAllBanksApplications && getAllBanksApplications.length > 0) {
		for (let k = 0; k < getAllBanksApplications.length; k++) {
			let userDataMobileNumber = getAllBanksApplications[k]['phone_number'];
			userDataMobileNumber.trim();
			let lastSixDigitUser = userDataMobileNumber.substr(userDataMobileNumber.length - 6);
			let firstTwoDigitUser = userDataMobileNumber.substring(0, 2);
			let newIndex = firstTwoDigitUser + '-' + lastSixDigitUser;
			setAppApplicationDataACN[newIndex] = getAllBanksApplications[k];
		}
	}
	let getAllAxisBankApplications = await uploadModel.getAllAxisApplicationsData();
	let axisAllApplicationsById = {};
	let axisAllApplicationByApplicationId = {};
	for (let i = 0; i < getAllAxisBankApplications.length; i++) {
		axisAllApplicationsById[getAllAxisBankApplications[i].ca_main_table] = getAllAxisBankApplications[i];
		axisAllApplicationByApplicationId[getAllAxisBankApplications[i].axis_application_number] = getAllAxisBankApplications[i];
	}
	//console.log(axisAllApplicationsById);
	let modelResult = await uploadModel.entryToAxisFromSheetAjex(JSON.parse(req.body.allData) , axisAllApplicationsById , axisAllApplicationByApplicationId , setAppApplicationDataACN);
	console.log(modelResult , "modelResult");
	if(modelResult.ipApproveData.length > 0){
		//console.log("ipApproveData");
		hitexternalApi.hitExternalApibeddlyingdrahomach(modelResult.ipApproveData);
	}
	finalData.status = true;
	commonHelper.successHandler(res, finalData);
}


controllerObj.addActivationData = async (req, res, next) => {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		//console.log(req.body, "request body ")
		res.render('axisBank/axisActivationUpload', { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.addActivationDataAjex = async (req, res, next) => {
	let allData = JSON.parse(req.body.allData);

	let returnData = {
		"status": false,
		"code": "Axis-bank-ERR-110",
		"message": "something went wrong",
		"payload": []
	}
	let datafromModel = await uploadModel.uploadActivationDataAjex(allData.sheetData);
	console.log(datafromModel, "datafromModeldatafromModel");
	if (datafromModel) {
		returnData.status = true;
		returnData.code = "Axis-bank-Success-101";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;

		commonHelper.successHandler(res, returnData);

	} else {
		commonHelper.errorHandler(res, returnData);
	}
}

module.exports = controllerObj;