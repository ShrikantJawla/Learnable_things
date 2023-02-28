let commonHelper = require('../../common/helper');
let commonModel = require('../../model/commonModel');
let commonController = require("../../controller/commonController");
let auApplicationsModel = require('../../model/au/auApplicationsModel')

const CsvParser = require("json2csv").Parser

let accessMiddleware = require('../../common/checkAccessMiddleware');


let controllerObj = {}

controllerObj.getApplications = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("au/auApplications.ejs", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsNew = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let auColumns = await auApplicationsModel.getAuColumns();
		// console.log('auCOl',auColumns)
		let displayName = 'AU BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: auColumns.allIssuers, allTr: auColumns.allTr[0], displayName: displayName, selectoptions: auColumns.selectOptions , currentIssuerId : 7})
	} else {
		res.render("error/noPermission")
	}
}


controllerObj.getApplicationsAjaxNew = async function (req, res, next) {
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
	CONCAT('edit-au-application-ui?id=',au_bank_applications_table.au_id) as "Edit",
	au_bank_applications_table.au_id as select,
	telecaller_name as telecallers,
	au_bank_applications_table.au_id as "int|au_id|Id",
	au_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
	au_bank_applications_table.au_customer_name as "string|au_customer_name|Name",
	au_bank_applications_table.au_application_number as "string|au_application_number|Application Number",
	au_bank_applications_table.au_phone_number as "int|au_phone_number|Phone Number",
	au_bank_applications_table.au_bank_assisted as "bool|au_bank_assisted|Bank Assisted",
	CAST(au_bank_applications_table.au_initiation_date as varchar) as "date|au_initiation_date|Initiation Date",
	CAST(au_bank_applications_table.au_revised_date as varchar) as "date|au_revised_date|Revised Date",
	au_bank_applications_table.au_card_variant as "multiple|au_card_variant|Card Variant",
	au_bank_applications_table.au_current_status as "multiple|au_current_status| Current Status",
	au_bank_applications_table.au_drop_off_page_initial as "multiple|au_drop_off_page_initial| Drop Off Page Initial",
	au_bank_applications_table.au_drop_off_page as "multiple|au_drop_off|Drop Off Page",
	au_bank_applications_table.au_final_status as "multiple|au_final_status|Final Status",
	au_bank_applications_table.au_reject_reason as "string|au_reject_reason|Reject Reason",
	au_bank_applications_table.au_ipa_status as "multiple|au_ipa_status|Ipa Status",
	au_bank_applications_table.au_utm_source as "multiple|au_utm_source|Utm Source",
	au_bank_applications_table.au_utm_medium as "multiple|au_utm_medium|Utm Medium", 
	au_bank_applications_table.au_utm_campaign as "string|au_utm_campaign|Utm Campaign",
	au_bank_applications_table.au_utm_term as "string|au_utm_term|Utm Term",
	au_bank_applications_table.au_lead_from as "multiple|au_lead_from|Lead From",
	CAST(au_bank_applications_table.created_at as varchar) as "date|created_at|Created at",
	CAST(au_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated at"
	`;
	let tableName = 'au_bank_applications_table';
	let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
	telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
	telecaller_name FROM au_bank_applications_table camt
	left join applications_users_junction auj on auj.application_id = au_id and auj.issuer_id = 7
	left join user_admin on ua_id = auj.admin_user 
	GROUP BY (camt.au_id) ) as au_bank_applications_table  `;
	let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'au_id', tableNameQuery : tableNameQuery });
	//console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}

controllerObj.getApplicationsAjax = async function (req, res, next) {
	console.log(req.body, "request body ")
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	}



	let dataFromDb = await auApplicationsModel.getFilteredAuApplications(req.body)



	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-APPLICATION-SUC-102"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		//console.log(finalData.payload.applicationsData, "final data");
		commonHelper.successHandler(res, finalData)

	} else {
		//console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}
}
controllerObj.exportCsv = async (req, res, next) => {
	const { applicationsData } = await auApplicationsModel.exportCsv(JSON.parse(req.body.allData))
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
	res.render('au/editApplication', { sidebarDataByServer: sideBarData })
}
controllerObj.getApplicationDataById = async (req, res, next) => {
	let returnDataFromModel = await auApplicationsModel.getApplicationDataById(
		parseInt(req.query.id)
	)
	let returnData = {
		status: true,
		code: 'CI-APP-EXISTING-AU-APPLICATIONEDIT-101',
		payload: {
			...returnDataFromModel,
		}
	}
	commonHelper.successHandler(res, returnData)
}
controllerObj.updateApplication = async (req, res, next) => {

}
module.exports = controllerObj
