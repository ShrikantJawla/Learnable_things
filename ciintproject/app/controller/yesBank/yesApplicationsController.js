let yesApplicationsModel = require('../../model/yesBank/yesApplicationsModel')
let commonHelper = require('../../common/helper')
let commonModel = require("../../model/commonModel")
const CsvParser = require("json2csv").Parser

let accessMiddleware = require('../../common/checkAccessMiddleware')


let commonController = require("../../controller/commonController")

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


let controllerObj = {}

controllerObj.getApplications = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("yesBank/yesApplications.ejs", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsNew = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let yesColumns = await yesApplicationsModel.getYesColumns();
		let displayName = 'YES BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: yesColumns.allIssuers, allTr: yesColumns.allTr[0], displayName: displayName  , selectoptions : yesColumns.selectOptions , currentIssuerId : 11})
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
		CONCAT('edit-yes-application-ui?id=',yes_bank_applications_table.yb_id) as "Edit",  
		yes_bank_applications_table.yb_id as select,
		telecaller_name as telecallers,
		yes_bank_applications_table.yb_id as "int|yb_id|Id",
		yes_bank_applications_table.yb_real_application_id as "string|yb_real_application_id|Application Id",
		yes_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
		yes_bank_applications_table.yb_mobile_number as "string|yb_mobile_number|Mobile Number",
		card_applications_main_table.name as "string|name|Name",
		CAST(yes_bank_applications_table.yb_application_created as varchar) as "date|yb_application_created|Application Created",
		yes_bank_applications_table.yb_application_number as "string|yb_application_number|Application Number",
		yes_bank_applications_table.yb_aps_ref_number as "string|yb_aps_ref_number|Aps Ref Number",
		yes_bank_applications_table.yb_ekyc_status as "multiple|yb_ekyc_status|Ekyc Status",
		yes_bank_applications_table.yb_application_status_initial as "multiple|yb_application_status_initial|Application Status Initial",
		yes_bank_applications_table.yb_application_status as "multiple|yb_application_status|Application Status",
		yes_bank_applications_table.yb_final_status as "multiple|yb_final_status|Final Status",
		yes_bank_applications_table.yb_ipa_status as "multiple|yb_ipa_status|Ipa Status",
		yes_bank_applications_table.yb_dedupe_status as "multiple|yb_dedupe_status|Dedupe Status",
		yes_bank_applications_table.yb_policy_check_status as "multiple|yb_policy_check_status|Policy Check Status",
		yes_bank_applications_table.yb_cibil_check_status as "multiple|yb_cibil_check_status|Cibil Check Status",
		yes_bank_applications_table.yb_idv as "select|yb_idv|Idv",
		CAST(yes_bank_applications_table.yb_last_update_on as varchar) as "date|yb_last_update_on|Last Update On",
		yes_bank_applications_table.yb_apply_through as "multiple|yb_apply_through|Apply Through",
		yes_bank_applications_table.yb_credit_limit as "string|yb_credit_limit|Credit Limit",
		yes_bank_applications_table.yb_vkyc_unable_reject_reasons as "string|yb_vkyc_unable_reject_reasons|Vkyc Enable Reject Reason",
		CAST(yes_bank_applications_table.yb_decision_date as varchar) as "date|yb_decision_date|Decision Date",
		yes_bank_applications_table.yb_decline_reson as "multiple|yb_decline_reson|Decline Reason",
		yes_bank_applications_table.yb_dip_reject_reason as "multiple|yb_dip_reject_reason|Dip Reject Reason",
		card_applications_main_table.occupation as "select|occupation|Occupation",
		card_applications_main_table.aadhar_pin as "string|aadhar_pin|Aadhar Pin",
		card_applications_main_table.monthly_income as "range|monthly_income|Monthly Income",
		card_applications_main_table.company_name as "string|company_name|Company Name",
		CAST(yes_bank_applications_table.created_at as varchar) as "date|created_at|Created At",
		CAST(yes_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
	`;
	let tableName = 'yes_bank_applications_table';
	let leftJoin = ` LEFT JOIN card_applications_main_table ON card_applications_main_table.id = yes_bank_applications_table.ca_main_table `;
	let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
	telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
	telecaller_name FROM yes_bank_applications_table camt
	left join applications_users_junction auj on auj.application_id = yb_id and auj.issuer_id = 11
	left join user_admin on ua_id = auj.admin_user 
	GROUP BY (camt.yb_id) ) as yes_bank_applications_table  `;
	let dataFromDb = await commonModel.getDataByPagination({body: req.body , currenUserId: currentUserId , selectColumns : selectColumns , tableName:  tableName , shortByColumn : 'yb_id' ,  leftJoin: leftJoin, tableNameQuery : tableNameQuery  });
	// console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}


controllerObj.getApplicationsAjax = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	}



	let dataFromDb = await yesApplicationsModel.getFilteredYesApplications(req.body)


	if (dataFromDb) {
		finalData.status = true
		finalData.code = "CIP-YES-APPLICATION-SUC-102"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		commonHelper.successHandler(res, finalData)

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}
controllerObj.exportCsv = async (req, res, next) => {
	const { applicationsData } = await yesApplicationsModel.exportCsv(JSON.parse(req.body.allData))
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
	console.log("Hello")
	let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render('yesBank/editApplication', { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.getApplicationDataById = async (req, res, next) => {
	let returnDataFromModel = await yesApplicationsModel.getApplicationDataById(
		parseInt(req.query.id)
	)
	let returnData = {
		status: true,
		code: 'CI-APP-EXISTING-YES-APPLICATION-EDIT-101',
		payload: {
			...returnDataFromModel,
		}
	}
	commonHelper.successHandler(res, returnData)
}
controllerObj.updateApplication = async (req, res, next) => {

}
module.exports = controllerObj
