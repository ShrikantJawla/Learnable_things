let commonHelper = require("../../common/helper");
let accessMiddleware = require('../../common/checkAccessMiddleware');
let commonController = require("../commonController");
const postNewCallerIdModel = require('../../model/calling/postNewCallerIdModel');

let manageNumberModel = require('../../model/calling/managePhoneNumberModel');

/* Creating an empty object. */
let controllerObj = {};



/* This is a function that is called when the user visits the `/manageNumber` route. */
controllerObj.renderManagePhoneNumber = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W");
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let banksDataForCallerIds = await manageNumberModel.getBanksDataForManagingCallerIds();
		let allCallerIds = await manageNumberModel.getAllCallerId(req.query.issuer);
		res.render("calling/manageNumber", { sidebarDataByServer: sideBarData, banksData: banksDataForCallerIds.payload, callerData: allCallerIds });
	} else {
		res.render("error/notFound");
	}
}
controllerObj.getCallerIdWithIssuer = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-CALLING-ERR-101",
		message: "Something went wrong",
		payload: []
	}

	if (req.query.issuer) {
		let allCallerIds = await manageNumberModel.getAllCallerId(req.query.issuer, req.body.filter);
		if (allCallerIds) {
			finalData.status = true;
			finalData.code = "CIP-CALLING-APPLICATION-SUC-103";
			finalData.message = "Operation performed successfully";
			finalData.payload = allCallerIds;
			commonHelper.successHandler(res, finalData);
		}
	} else {
		commonHelper.errorHandler(res, finalData);
	}
}



/* This function is called when the user clicks on the `Get Tele Users` button. */
controllerObj.getTeleUsersInCallerIds = async function (req, res, next) {

	/* A default response object. */
	let finalData = {
		status: false,
		code: "CIP-CALLING-ERR-101",
		message: "Something went wrong",
		payload: []
	}



	if (req.body.issuer && req.body.bank) {
		let teleDataForCallerIds = await manageNumberModel.getTeleUsersWhereIsuerIsActive({ issuerId: req.body.issuer, bank: req.body.bank });
		if (teleDataForCallerIds) {

			finalData.status = true;
			finalData.code = "CIP-CALLING-APPLICATION-SUC-101";
			finalData.message = "Operation performed successfully";
			finalData.payload = teleDataForCallerIds;
			commonHelper.successHandler(res, finalData);
		}
	} else {
		commonHelper.errorHandler(res, finalData);
	}
}
controllerObj.getDefaultCallerIdWithIssuer = async function (req, res, next) {

	/* A default response object. */
	let finalData = {
		status: false,
		code: "CIP-CALLING-ERR-101",
		message: "Something went wrong",
		payload: []
	}

	if (req.body.issuer && req.body.bank) {
		let callerIdWithIssuer = await manageNumberModel.getAllCallerIdUnique(req.body.issuer);

		if (callerIdWithIssuer) {
			finalData.status = true;
			finalData.code = "CIP-CALLING-APPLICATION-SUC-101";
			finalData.message = "Operation performed successfully";
			finalData.payload = callerIdWithIssuer;
			commonHelper.successHandler(res, finalData);
		}
	} else {
		commonHelper.errorHandler(res, finalData);
	}
}


controllerObj.postNewCallerId = async function (req, res, next) {

	let finalData = {
		status: false,
		code: "CIP-CALLING-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	if (req.body.issuer && req.body.number && req.body.telecaller && req.body.isEnabled) {
		let postResponse = await postNewCallerIdModel.postNewCallerId({ postData: JSON.parse(JSON.stringify(req.body)) });
		if (postResponse) {
			finalData.status = true;
			finalData.code = "CIP-CALLING-101";
			finalData.message = "Operation performed";
			commonHelper.successHandler(res, finalData, 200);
		} else {
			commonHelper.errorHandler(res, finalData, 404);
		}
	} else {

		commonHelper.errorHandler(res, finalData, 403);

	}


}
controllerObj.addNewNumber = async function (req, res, next) {

	let finalData = {
		status: false,
		code: "CIP-CALLING-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	if (req.body.issuer && req.body.number && req.body.isEnabled) {
		let postResponse = await postNewCallerIdModel.addNewCallerId({ postData: JSON.parse(JSON.stringify(req.body)) });
		if (postResponse) {
			finalData.status = true;
			finalData.code = "CIP-CALLING-101";
			finalData.message = "Operation performed";
			commonHelper.successHandler(res, finalData, 200);
		} else {
			commonHelper.errorHandler(res, finalData, 404);
		}
	} else {

		commonHelper.errorHandler(res, finalData, 403);

	}


}
controllerObj.unassignCallerId = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-DELETING-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	if (req.body.id) {
		let removeAssign = await postNewCallerIdModel.unassignCallerId(req.body.id);
		if (removeAssign) {
			finalData.status = true;
			finalData.code = "CIP-CALLING-101";
			finalData.message = "Operation performed";
			commonHelper.successHandler(res, finalData, 200);
		} else {
			commonHelper.errorHandler(res, finalData, 404);
		}
	} else {

		commonHelper.errorHandler(res, finalData, 403);

	}


}

/* Exporting the controllerObj object. */
module.exports = controllerObj;