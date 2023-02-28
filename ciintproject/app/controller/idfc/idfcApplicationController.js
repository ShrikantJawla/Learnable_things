

///////////////////////////////////////////////////////////////////////////////////////////////////
/* Importing the files from the specified path. */
let idfcApplicationsModel = require('../../model/idfc/idfcApplicationsModel');
let commonHelper = require('../../common/helper');
const CsvParser = require("json2csv").Parser;

/* Importing the commonController.js file from the controller folder. */
let commonController = require("../../controller/commonController");

/* Importing the checkAccessMiddleware.js file from the common folder. */
let accessMiddleware = require('../../common/checkAccessMiddleware');

/* Importing the commonModel.js file from the model folder. */
const commonModel = require("../../model/commonModel");


/* Creating an empty object. */
let controllerObj = {};


/* A function which is used to render the view of the page. */
controllerObj.getApplicationsNew = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "W");
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let idfcColumns = await idfcApplicationsModel.getIdfcColumns();
		let displayName = 'IDFC BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: idfcColumns.allIssuers, allTr: idfcColumns.allTr[0], displayName: displayName, selectoptions: idfcColumns.selectOptions , currentIssuerId : 4})
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
	CONCAT('edit-idfc-application-ui?id=',idfc_bank_applications_table.idfc_id) as "Edit",  
	idfc_bank_applications_table.idfc_id as select,
	telecaller_name as telecallers,
	idfc_bank_applications_table.idfc_id as "int|idfc_id|Id",
	idfc_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
    card_applications_main_table.name as "string|name|Name",
    card_applications_main_table.phone_number as "string|phone_number|Phone Number",
	CAST(idfc_bank_applications_table.idfc_date as varchar) as "date|idfc_date|Application Date",
    idfc_bank_applications_table.idfc_application_number as "string|idfc_application_number|Application Number",
    idfc_bank_applications_table.idfc_choice_credit_card as "multiple|idfc_choice_credit_card|Choice Credit Card",
	idfc_bank_applications_table.idfc_sub_status_initial as "multiple|idfc_sub_status_initial|Sub Stage Initial",
    idfc_bank_applications_table.idfc_sub_status as "multiple|idfc_sub_status|Sub Stage",
    idfc_bank_applications_table.idfc_stage_integration_status as "multiple|idfc_stage_integration_status|Stage Integration Status",
    idfc_bank_applications_table.idfc_status as "multiple|idfc_status|Final Stage",
    idfc_bank_applications_table.idfc_reason as "multiple|idfc_reason|Reason",
    idfc_bank_applications_table.idfc_date_ipa_status as "bool|idfc_date_ipa_status|Date Ipa Status",
    idfc_bank_applications_table.idfc_utm_campaign as "string|idfc_utm_campaign|Utm Campaign",
    idfc_bank_applications_table.idfc_splitted_utm as "string|idfc_splitted_utm|Splitted Utm",
    idfc_bank_applications_table.idfc_crm_team_lead_id as "string|idfc_crm_team_lead_id|Crm Team Lead Id",
    idfc_bank_applications_table.idfc_location_city as "multiple|idfc_location_city|Location City",
    idfc_bank_applications_table.idfc_credit_limit as "int|idfc_credit_limit|Credit Limit",
    idfc_bank_applications_table.idfc_lead_from as "multiple|idfc_lead_from|Lead From",
    CAST(idfc_bank_applications_table.created_at as varchar) as "date|created_at|Created At",
    CAST(idfc_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
	`;
	let tableName = 'idfc_bank_applications_table';
	let leftJoin = ` LEFT JOIN card_applications_main_table ON card_applications_main_table.id = idfc_bank_applications_table.ca_main_table `;
	let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
	telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
	telecaller_name FROM idfc_bank_applications_table camt
	left join applications_users_junction auj on auj.application_id = idfc_id and auj.issuer_id = 4
	left join user_admin on ua_id = auj.admin_user 
	GROUP BY (camt.idfc_id) ) as idfc_bank_applications_table  `;
	let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'idfc_id', leftJoin: leftJoin, tableNameQuery : tableNameQuery });
	// console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}



controllerObj.getApplications = async function (req, res, next) {


	let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("idfc/idfcApplications", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}


}

controllerObj.getApplicationsAjax = async function (req, res, next) {
	// //console.log(req.body, "request body ")
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	}



	let dataFromDb = await idfcApplicationsModel.getFilteredIdfcApplications(req.body)
	// //console.log(dataFromDb, "data from db")


	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-APPLICATION-SUC-102"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		////console.log(finalData, "final data");
		commonHelper.successHandler(res, finalData)

	} else {
		//console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}
}
controllerObj.exportCsv = async (req, res, next) => {
	const { applicationsData } = await idfcApplicationsModel.exportCsv(JSON.parse(req.body.allData))
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
	res.render('idfc/editApplication', { sidebarDataByServer: sideBarData })
}
controllerObj.getApplicationDataById = async (req, res, next) => {
	let returnDataFromModel = await idfcApplicationsModel.getApplicationDataById(
		parseInt(req.query.id)
	)
	let returnData = {
		status: true,
		code: 'CI-APP-EXISTING-IDFC-APPLICATIONEDIT-101',
		payload: {
			...returnDataFromModel,
		}
	}
	commonHelper.successHandler(res, returnData)
}
controllerObj.updateApplication = async (req, res, next) => {

}
module.exports = controllerObj
