/* Importing the required modules. */
let bobApplicationsModel = require('../../model/bob/bobApplicationsModel');
let commonHelper = require('../../common/helper');
const CsvParser = require("json2csv").Parser;


/* Importing the `commonController` file from the `controller` folder. */
let commonController = require("../../controller/commonController");

/* Importing the `checkAccessMiddleware` file from the `common` folder. */
let accessMiddleware = require('../../common/checkAccessMiddleware');
/* Importing the commonModel.js file from the model folder. */
const commonModel = require('../../model/commonModel');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
let controllerObj = {}


/* A function which is used to render the view of the page. */
controllerObj.getApplicationsNew = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 3, "W");
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let bobColumns  = await bobApplicationsModel.getbobColumns();
		let displayName = 'BOB BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: bobColumns.allIssuers, allTr: bobColumns.allTr[0], displayName: displayName, selectoptions: bobColumns.selectOptions , currentIssuerId : 2})
	} else {
		res.render("error/noPermission")
	}
}


/* This function is used to get the data from the database and render the data in the view. */
controllerObj.getApplicationsAjaxNew = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}

	let userLatestRole = await commonModel.getUserAdminRole(
		req.body.loggedUser.ua_id
	);
	let currentUserRole = userLatestRole[0].ua_role;
	let currentUserId = false;
	if (currentUserRole == 3) {
		currentUserId = req.body.loggedUser.ua_id;
	}
	let selectColumns = `
	CONCAT('edit-bob-application-ui?id=',bob_applications_table.bob_id) as "Edit",  
		  bob_applications_table.bob_id as select,
		  telecaller_name as telecallers,
		  bob_applications_table.bob_id as "int|bob_id|Id",
		  bob_applications_table.ca_main_table as "int|ca_main_table|Main Table",
		  bob_applications_table.bob_name as "string|bob_name|Name",
		  bob_applications_table.bob_application_number as "string|bob_application_number|Application Number",
		  CAST(bob_applications_table.bob_date as varchar) as "date|bob_date|Application Date",
		  bob_applications_table.bob_application_status as "multiple|bob_application_status|Application Status",
		  bob_applications_table.bob_email_id as "string|bob_email_id|Email Id",
		  bob_applications_table.bob_card_type as "multiple|bob_card_type|Card Type",
		  bob_applications_table.bob_stage as "multiple|bob_stage|Stage",
		  bob_applications_table.bob_esign_status as "multiple|bob_esign_status|Esign Stage",
		  bob_applications_table.bob_dasm_reason as "string|bob_dasm_reason|Dasm Reason",
		  bob_applications_table.bob_reject_reason as "multiple|bob_reject_reason|Reject Reason",
		  bob_applications_table.bob_esign_form_url as "url|bob_esign_form_url|Esign Form Url",
		  bob_applications_table.bob_vkyc_link as "url|bob_vkyc_link|Vkyc Link",
		  bob_applications_table.bob_ipa_original_status_sheet as "string|bob_ipa_original_status_sheet|IPA Original Status Sheet",
		  bob_applications_table.bob_ipa_status_bool as "bool|bob_ipa_status_bool|IPA Status",
		  bob_applications_table.bob_city as "multiple|bob_city|City",
		  bob_applications_table.bob_state as "multiple|bob_state|State",
		  bob_applications_table.bob_utm_source as "string|bob_utm_source|UTM Source",
		  bob_applications_table.bob_utm_campaign as "multiple|bob_utm_campaign|UTM Campaign",
		  bob_applications_table.bob_utm_medium as "string|bob_utm_medium|UTM Medium",
		  CAST(bob_applications_table.created_at as varchar) as "date|created_at|Created At",
		  CAST(bob_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
	`;
	let tableName = 'bob_applications_table';
	let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
	telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
	telecaller_name FROM bob_applications_table camt
	left join applications_users_junction auj on auj.application_id = bob_id and auj.issuer_id = 2
	left join user_admin on ua_id = auj.admin_user 
	GROUP BY (camt.bob_id) ) as bob_applications_table  `;
	let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'bob_id',  tableNameQuery : tableNameQuery});
	// console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}





controllerObj.getApplications = async function (req, res, next) {


	let middleObj = await accessMiddleware.checkAccessPermition(req, 3, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)

		res.render("bob/bobApplications.ejs", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}


controllerObj.getApplicationsAjax = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-103",
		message: "Something went wrong",
		payload: []
	}



	let dataFromDb = await bobApplicationsModel.getFilteredBobApplications(req.body)


	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-APPLICATION-SUC-103"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb

		commonHelper.successHandler(res, finalData)

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}
controllerObj.exportCsv = async (req, res, next) => {
	const { applicationsData } = await bobApplicationsModel.exportCsv(JSON.parse(req.body.allData))
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
	let sideBarData = await commonController.commonSideBarData(req)
	res.render('bob/editApplication', { sidebarDataByServer: sideBarData })
}
controllerObj.getApplicationDataById = async (req, res, next) => {
	let returnDataFromModel = await bobApplicationsModel.getApplicationDataById(
		parseInt(req.query.id)
	)
	let returnData = {
		status: true,
		code: 'CI-APP-EXISTING-BOB-APPLICATIONEDIT-101',
		payload: {
			...returnDataFromModel,
		}
	}
	commonHelper.successHandler(res, returnData)
}
controllerObj.updateApplication = async (req, res, next) => {

}
module.exports = controllerObj