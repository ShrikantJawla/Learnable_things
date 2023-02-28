let commonHelper = require("../../common/helper")
let applicationsModel = require("../../model/applications/allApplicationsModel")
const CsvParser = require("json2csv").Parser
let allBanksModel = require("../../model/applications/allBanksModel")
let commonController = require("../../controller/commonController")
let commonModel = require("../../model/commonModel");
let accessMiddleware = require('../../common/checkAccessMiddleware')
const uploadMissingModel = require('../../model/applications/uploadMissingModel');
const { render } = require("ejs")
///////////////////////////////////////////////////////////
let controllerObj = {}


// getting all applications ui here.....

controllerObj.getApplicationsNew = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let allColumns = await applicationsModel.getAllBanksColumns();
		let displayName = 'ALL APPLICATION LEADS NEW';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: allColumns.allIssuers, allTr: allColumns.allTr[0], displayName: displayName  , selectoptions : allColumns.selectOptions})
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.getApplicationsNewAjex = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	let userdata = jwt.decode(req.session.userToken);
	let userLatestRole = await commonModel.getUserAdminRole(
		userdata.ua_id
	);
	let currentUserRole = userLatestRole[0].ua_role;
	let currentUserId = false;
	if (currentUserRole == 3) {
		currentUserId = userdata.ua_id;
	}
	let selectColumns = `
	CONCAT('edit-application-ui?id=',card_applications_main_table.id) as "Edit",
	card_applications_main_table.id as select,
    card_applications_main_table.cold_calling_bank_assigned_array as "array|cold_calling_bank_assigned_array|Cold Calling Bank",
	card_applications_main_table.id as "int|id|Lead Id",
    card_applications_main_table.name as "string|name|Name",
    card_applications_main_table.email as "string|email|Email",
    card_applications_main_table.phone_number as "string|phone_number|Phone Number",
    card_applications_main_table.is_salaried as "bool|is_salaried|Is Salaried",
    card_applications_main_table.ipa_status as "bool|ipa_status|Ipa Status",
    card_applications_main_table.form_filled_array as "array|form_filled_array|Form Filled Array",
    card_applications_main_table.banks_applied_array as "array|banks_applied_array|Banks Applied Array",
    card_applications_main_table.banks_approved_array as "array|banks_approved_array|Banks Approved Array",
    card_applications_main_table.low_cibil_score_bool as "bool|low_cibil_score_bool|Low Cibil Score",
    card_applications_main_table.device_type as "select|device_type|Device Type",
    card_applications_main_table.city as "string|city|City",
    card_applications_main_table.state as "string|state|State",
    card_applications_main_table.salary as "string|salary|Salary",
    CAST(card_applications_main_table.date_of_birth as varchar) as "date|date_of_birth|Date Of Birth",
    card_applications_main_table.pin_code as "string|pin_code|Pin Code",
    manage_pincodes.mp_idfc_available as "bool|mp_idfc_available|IDFC Pin",
    manage_pincodes.mp_axis_available as "bool|mp_axis_available|Axis Pin",
    manage_pincodes.mp_au_available as "bool|mp_au_available|Au Pin",
    manage_pincodes.mp_yes_available as "bool|mp_yes_available|Yes Pin",
    manage_pincodes.mp_bob_available as "bool|mp_bob_available|BOB Pin", 
    card_applications_main_table.sms_status as "multiple|sms_status|Sms Status",
    card_applications_main_table.occupation as "multiple|occupation|occupation",
    card_applications_main_table.annual_income as "string|annual_income|Annual Income",
    card_applications_main_table.company_name as "string|company_name|Company Name",
    card_applications_main_table.adhar_name as "string|adhar_name|Adhar Name",
    card_applications_main_table.aadhar_pin as "string|aadhar_pin|Aadhar Pin",
    card_applications_main_table.tracking_id as "string|tracking_id|Tracking Id",
	CAST(card_applications_main_table.created_at as varchar)  as "date|created_at|Created At",
    CAST(card_applications_main_table.updated_at as varchar)  as "date|updated_at|Updated At"
	`;
	let tableName = 'card_applications_main_table';
	let leftJoin = ` LEFT JOIN manage_pincodes ON manage_pincodes.mp_pincode = CAST(pin_code as varchar)  `;
	let dataFromDb = await commonModel.getDataByPagination({body: req.body , currenUserId: currentUserId , selectColumns : selectColumns , tableName:  tableName , shortByColumn : 'id' , leftJoin : leftJoin});
	//console.log(dataFromDb.applicationsData[0], "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}

controllerObj.getAllApplicationsUi = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("applications/allApplications", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.showAllApplicationsUi = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		let queryForData = `SELECT ua_id , ua_name FROM public.user_admin where ua_role = 3
		ORDER BY ua_id ASC `;
		let allUsers = await commonModel.getDataOrCount(queryForData, [], 'D');
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuer = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		//console.log(allIssuer, "allIssuer");
		res.render("applications/newUpdateApplicationList", { sidebarDataByServer: sideBarData, allUsers: allUsers, allIssuers: allIssuer })
	} else {
		res.render("error/noPermission")
	}

}

controllerObj.uploadSMSStatus = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 43, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("applications/smsStatusUpload", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.exportSmsFile = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 43, "W")
	if (middleObj) {
		let getAllBanksData = await applicationsModel.getSmSActiveBanks()
		//console.log(getAllBanksData, "getAllBanksData");
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("applications/smsFileExport", { allBanks: getAllBanksData, sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.uploadSMSStatusAjex = async function (req, res, next) {
	//console.log(req.body, "request body ")
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-103",
		message: "Something went wrong",
		payload: []
	}
	if (req && req.body && req.body.provider && req.body.provider != "" && req.body.allData && req.body.allData != "") {
		let allApplicationsByPhoneNumber = {}
		// let getAllApplicationData = await applicationsModel.getAllApplicationsForOthers()
		// if (getAllApplicationData && getAllApplicationData.length > 0) {
		// 	for (let i = 0; i < getAllApplicationData.length; i++) {
		// 		allApplicationsByPhoneNumber["91" + getAllApplicationData[i].phone_number] = getAllApplicationData[i]
		// 	}
		// }
		let dataFromDb;
		if (req.body.provider === "msg91") {
			dataFromDb = await applicationsModel.uploadSMSDate(JSON.parse(req.body.allData), req.body.provider, allApplicationsByPhoneNumber);
		}

		if (req.body.provider === "vfirst") {

			dataFromDb = await applicationsModel.uploadvFistSMSDate(JSON.parse(req.body.allData), req.body.provider, allApplicationsByPhoneNumber)
		}


		if (dataFromDb) {
			finalData.status = true
			finalData.code = "CIP-APPLICATION-103"
			finalData.message = "All OK"
		}

		console.log("final data");

	}


	commonHelper.successHandler(res, finalData)
	//console.log(req.body , "body body ");
}

controllerObj.getFilteredApplicationsAjax = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-104",
		message: "Something went wrong",
		payload: []
	}
	//console.log(req.body, "request body ");
	console.log(req.body.requestFor, "requestForPhonerequestForPhone");
	let dataFromDb = await applicationsModel.getFilteredApplications(JSON.parse(req.body.allData), req.body.requestFor);
	//console.log(dataFromDb , "dataFromDbdataFromDb");
	const csvParser = new CsvParser()
	let csvData
	if (dataFromDb.length == 0) {
		csvData = csvParser.parse({ "data": "no data found" })
	} else {
		csvData = csvParser.parse(dataFromDb).replace(/['"]+/g, '');
		//console.log(csvData)
	}
	//console.log(typeof(csvData) , "bbbbbb");
	//csvData = csvParser.parse({ "data": "+9911" })
	//csvData = csvParser.parse(  { "phone": "+919750606602", "email": 'selvalatha0123557@gmail.com' },)
	//const csvData = csvParser.parse(dataFromDb.length  == 0 ? ["a","b","c"]: dataFromDb);
	res.setHeader("Content-Type", "text/csv")
	res.setHeader("Content-Disposition", "attachment; filename=cardInsiderAdminPS.csv")
	res.status(200).end(csvData)
	// if (req.query && req.query.for == 'demo'){
	// 	const csvParser = new CsvParser();
	// 	const csvData = csvParser.parse([{id:1 ,name: "rahul"}]);
	// 	res.setHeader("Content-Type", "text/csv");
	// 	res.setHeader("Content-Disposition", "attachment; filename=cardInsiderAdminPS.csv");
	// 	res.status(200).end(csvData);
	// } else {
	// 	let finalData = {
	// 		status: false,
	// 		code: "CIP-APPLICATION-ERR-103",
	// 		message: "Something went wrong",
	// 		payload: []
	// 	};
	// 	// console.log(req.body, "hi im in controller");
	// 	let dataFromDb = await applicationsModel.getFilteredApplications(req.query);
	// 	//console.log(dataFromDb, "data from db");

	// 	if (dataFromDb) {
	// 		const csvParser = new CsvParser();
	// 		const csvData = csvParser.parse(dataFromDb);
	// 		res.setHeader("Content-Type", "text/csv");
	// 		res.setHeader("Content-Disposition", "attachment; filename=cardInsiderAdminPS.csv");
	// 		res.status(200).end(csvData);
	// 		//log(finalData, "final data in if");
	// 		// finalData.status = true;
	// 		// finalData.code = "CIP-APPLICATION-SUC-103";
	// 		// finalData.message = "Operation performed successfully";
	// 		// finalData.payload = dataFromDb;
	// 		// //console.log(finalData, "final data");
	// 		// commonHelper.successHandler(res, finalData);

	// 	} else {
	// 		console.log(finalData, "final data in else");
	// 		commonHelper.errorHandler(res, finalData,);
	// 	}
	// }


}
controllerObj.downloadFileByData = async function (req, res, next) {
	const csvParser = new CsvParser()
	const csvData = csvParser.parse(dataFromDb)
	res.setHeader("Content-Type", "text/csv")
	res.setHeader("Content-Disposition", "attachment; filename=cardInsiderAdminPS.csv")
	res.status(200).end(csvData)
}
controllerObj.getAllApplicationsAjax = async function (req, res, next) {
	// console.log(req.body, "request body ");
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	// console.log(req.body, "hi im in controller");
	let dataFromDb = await applicationsModel.getAllApplications(req.body)
	//console.log(dataFromDb, "data from db");
	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-APPLICATION-SUC-101"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		//console.log(finalData, "final data");
		commonHelper.successHandler(res, finalData)

	} else {
		// console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}

}
controllerObj.getAllApplicationsAjaxNew = async function (req, res, next) {
	console.log(req.body, "request body ");
	//let bodayData = JSON.parse(req.body);
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	// console.log(req.body, "hi im in controller");
	let dataFromDb = await applicationsModel.getAllApplicationsNew(req.body)
	//console.log(dataFromDb, "data from db");
	if (dataFromDb) {
		//console.log(dataFromDb, "final data in if");
		// finalData.status = true
		// finalData.code = "CIP-APPLICATION-SUC-101"
		// finalData.message = "Operation performed successfully"
		// finalData.payload = dataFromDb
		// //console.log(finalData, "final data");
		// commonHelper.successHandler(res, finalData)
		res.render('applications/applicationListAjex', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers , currentIssuer : req.body.issuerName})

	} else {
		// console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}

}

controllerObj.getAllApplicationsOfBank = async function (req, res, next) {
	// console.log(req.body, "request body ")
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	}
	// console.log(req.body, "hi im in controller")
	let dataFromDb = await applicationsModel.getAllApplicationsForOthers(req.body)
	//console.log(dataFromDb, "data from db");
	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-APPLICATION-SUC-102"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		//console.log(finalData, "final data");
		commonHelper.successHandler(res, finalData)

	} else {
		// console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}

}


///////////////////// getAllBanksInApplications here //////////////////////////

controllerObj.getAllBanksInApplications = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 47, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		//console.log(req.body, "request body ")
		res.render("applications/allBanks", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}


////////////////////  getAllBanksInApplicationsAjax here //////////////////////////

controllerObj.getAllBanksInApplicationsAjax = async function (req, res, next) {
	// console.log(req.body, "request body  him im in getAllBanksInApplicationsAjax")

	let returnData = {
		"status": false,
		"code": "All-banks-applications-ERR-101",
		"message": "something went wrong",
		"payload": []
	}
	let dataFromDb = await allBanksModel.getAllBanksInApplications(req.body)

	if (dataFromDb.applicationsData.length >= 0) {
		returnData.status = true
		returnData.message = "Operation performed successfully"
		returnData.payload = dataFromDb
		returnData.code = "All-banks-applications-SUC-101"
		commonHelper.successHandler(res, returnData)


	} else {


		commonHelper.errorHandler(res, returnData)
	}

}


controllerObj.updateApplyStatus = async function (req, res, next) {
	// console.log(req.body)
	let returnData = {
		"status": false,
		"code": "All-banks-applications-ERR-102",
		"message": "something went wrong",
		"payload": []
	}

	if (req.body && req.body.id) {
		let dataFromDb = await allBanksModel.updateApplySmsStatus({ bankId: req.body.id, applyStatus: req.body.applyActive, smsStatus: req.body.smsActive })
		if (dataFromDb.length >= 0) {
			returnData.status = true
			returnData.message = "Operation performed successfully"
			returnData.payload = dataFromDb
			returnData.code = "All-banks-applications-SUC-102"
			commonHelper.successHandler(res, returnData)
		} else {
			commonHelper.errorHandler(res, returnData)
		}
	}

	//res.send({"got request in updateApplyStatus": req.body});
}

controllerObj.exportCsv = async (req, res, next) => {
	const { applicationsData } = await applicationsModel.exportCsv(JSON.parse(req.body.allData))
	const csvParser = new CsvParser()
	let csvData
	if (applicationsData.length == 0) {
		csvData = csvParser.parse({ "data": "no data found" })
	} else {
		csvData = csvParser.parse(applicationsData)
	}
	res.setHeader("Content-Type", "text/csv")
	res.status(200).end(csvData)
}

controllerObj.editApplicationUi = async (req, res, next) => {


	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		//console.log(req.body, "request body ")
		res.render('applications/editApplication', { sidebarDataByServer: sideBarData })
		// res.render("applications/allBanks",);
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.getApplicationDataById = async (req, res, next) => {
	let returnDataFromModel = await applicationsModel.getApplicationDataById(
		parseInt(req.query.id)
	)
	let returnData = {
		status: true,
		code: 'CI-APP-EXISTINGAPPLICATIONEDIT-101',
		payload: {
			...returnDataFromModel,
		}
	}
	commonHelper.successHandler(res, returnData)
}


controllerObj.updateApplication = async (req, res, next) => {

}

/* A function that is used to upload missing data. */
controllerObj.uploadMissingData = async function (req, res, next) {
	console.log('upload-bank-sheet');
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("applications/uploadBankSheets", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}

/* A function that is used to upload missing data. */
controllerObj.matchPhoneNumberWithApplication = async function (req, res, next) {
	console.log('matchPhoneNumberWithApplication');
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("applications/matchPhoneNumberWithApp", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}

/* Function to Add SMS Templates */
controllerObj.editSmsTemplates = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("applications/editSmsTemplates", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}

controllerObj.getAllBanksForUploadMissingData = async function (req, res, next) {

	let returnData = {
		"status": false,
		"code": "All-banks-applications-ERR-104",
		"message": "something went wrong",
		"payload": []
	}
	let datafromModel = await allBanksModel.getAllBanksForMissingUploadData();

	if (datafromModel) {
		returnData.status = true;
		returnData.code = "All-banks-applications-Success-105";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;

		commonHelper.successHandler(res, returnData);

	} else {
		commonHelper.errorHandler(res, returnData);
	}

}

controllerObj.postAllBanksMissingData = async function (req, res, next) {
	//console.log('hi rahul');


	let allData = JSON.parse(req.body.allData);

	console.log(allData.bankId);

	let returnData = {
		"status": false,
		"code": "All-banks-applications-ERR-108",
		"message": "something went wrong",
		"payload": []
	}
	let datafromModel = false;

	switch (allData.bankId) {
		case 1:
			datafromModel = await uploadMissingModel.proccessAndUploadMissingData(allData.sheetData);

			break;
		case 2:
			///datafromModel = await uploadMissingModel.getAllUsersInBactesTest(allData.sheetData);
			break;
		case 4:
			datafromModel = await uploadMissingModel.proccessAndUploadMissingDataIdfc(allData.sheetData);
			break;
		case 7:
			//datafromModel = await uploadMissingModel.getAllUsersInBachis(allData.sheetData);
			break;
		case 11:
			datafromModel = await uploadMissingModel.proccessAndUploadMissingDataYesBank(allData.sheetData);
			break;
		default:
			returnData.code = 'All-banks-applications-ERR-109';
			returnData.status = false;
			returnData.message = 'Issuer Not found';
			break;
	}

	if (datafromModel) {
		returnData.status = true;
		returnData.code = "All-banks-applications-Success-109";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;

		commonHelper.successHandler(res, returnData);

	} else {
		commonHelper.errorHandler(res, returnData);
	}

}

controllerObj.geteMatchedPhoneNumberSheet = async function (req, res, next) {
	//console.log('hi rahul');


	let allData = JSON.parse(req.body.allData);

	//console.log(allData);

	let returnData = {
		"status": false,
		"code": "All-banks-applications-ERR-108",
		"message": "something went wrong",
		"payload": []
	}
	let datafromModel = false;

	// switch (allData.bankId) {
	// 	case 1:
	// 		console.log("hi im in axis");
	// 		//datafromModel = await uploadMissingModel.proccessAndUploadMissingData(allData.sheetData);

	// 		break;
	// 	case 2:
	// 		console.log("hi im in bob");
	// 		///datafromModel = await uploadMissingModel.getAllUsersInBactesTest(allData.sheetData);
	// 		break;
	// 	case 4:
	// 		console.log("hi im in idfc");
	// 		datafromModel = await uploadMissingModel.proccessToGetSheetWithPhoneNumberIDFC(allData.sheetData , allData.keyindex , allData.bankId);
	// 		break;
	// 	case 7:
	// 		console.log("hi im in au");
	// 		//datafromModel = await uploadMissingModel.getAllUsersInBachis(allData.sheetData);
	// 		break;
	// 	case 11:
	// 		console.log("hi im in yes");
	// 		//datafromModel = await uploadMissingModel.proccessAndUploadMissingDataYesBank(allData.sheetData);
	// 		break;
	// 	default:
	// 		console.log("hi im in ");
	// 		returnData.code = 'All-banks-applications-ERR-109';
	// 		returnData.status = false;
	// 		returnData.message = 'Issuer Not found';
	// 		break;
	// }
	datafromModel = await uploadMissingModel.proccessToGetSheetWithPhoneNumberIDFC(allData.sheetData, allData.keyindex, allData.bankId);

	if (datafromModel && datafromModel.length > 0) {
		returnData.status = true;
		returnData.code = "All-banks-applications-Success-109";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;

		//commonHelper.successHandler(res, returnData);
		const csvParser = new CsvParser()
		let csvData
		// if (datafromModel.length == 0) {
		// 	csvData = csvParser.parse({ "data": "no data found" })
		// } else {
		// 	csvData = csvParser.parse(datafromModel).replace(/['"]+/g, '');
		// 	//console.log(csvData)
		// }
		csvData = csvParser.parse(datafromModel).replace(/['"]+/g, '');
		res.setHeader("Content-Type", "text/csv")
		res.setHeader("Content-Disposition", "attachment; filename=resetByphoneNumber.csv")
		res.status(200).end(csvData)

	} else {
		commonHelper.errorHandler(res, returnData);
	}

}


/* The above code is inserting data into the database. */
controllerObj.insertNewColdCalling = async function (req, res, next) {
	// console.log(req.body);
	/* Creating a variable called returnData and assigning it an object with properties. */
	let returnData = {
		"status": false,
		"code": "Cold-calling-data-error-101",
		"message": "something went wrong",
		"payload": []
	}
	/* Creating an object with the data that will be inserted into the database. */
	let dataToInsert = {
		cardIssuer: req.body.issuer.split("_")[1] ?? null,
		bankName: req.body.issuer.split("_")[0] ?? null,
		assignTo: req.body.assign_to ?? null,
		mainId: req.body.main_id ?? null,
		callStatus: req.body.call_status ?? null,
		declineCounter: req.body.decline_counter ?? null,
		callSchedule: req.body.call_schedule ?? null,
		note: req.body.note ?? null,
		smsCounter: req.body.sms_counter ?? null
	};

	
	/* Calling the insertColdCallingData function from the applicationsModel.js file and passing in the
	dataToInsert variable. */
	let datafromModel  = await applicationsModel.insertColdCallingData({ insertData: dataToInsert });
	if (datafromModel) {
		returnData.status = true;
		returnData.code = "Cold-calling-data-success-201";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;
		/* Sending a response to the client. */
		commonHelper.successHandler(res, returnData);

	} else {
		/* Sending a response to the client with the error message. */
		commonHelper.errorHandler(res, returnData);
	}
}

controllerObj.removeNewColdCallingData = async function (req, res, next) {
	let datafromModel;
	/* Creating a variable called returnData and assigning it an object with properties. */
	let returnData = {
		"status": false,
		"code": "Cold-calling-data-error-101",
		"message": "something went wrong",
		"payload": []
	}

	/* Creating an object with the data that will be inserted into the database. */
	let dataToRemove = {
		cc_id: req.body.cc_id
	};
	console.log(req.body, "hello ");
	
	if (dataToRemove.cc_id) {
		datafromModel  = await applicationsModel.removeColdCallingData({ insertData: dataToRemove });
	}
	
	if (datafromModel) {
		returnData.status = true;
		returnData.code = "Cold-calling-data-success-201";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;
		/* Sending a response to the client. */
		commonHelper.successHandler(res, returnData);

	} else {
		/* Sending a response to the client with the error message. */
		commonHelper.errorHandler(res, returnData);
	}
}


module.exports = controllerObj
