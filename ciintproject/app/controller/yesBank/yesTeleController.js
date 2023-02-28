
let commonHelper = require("../../common/helper")
let accessMiddleware = require('../../common/checkAccessMiddleware')
let commonController = require("../commonController")
let commonModel = require("../../model/commonModel");
let yesTeleApplicationsModel = require('../../model/yesBank/yesTeleModel')
let controllerObj = {}

/* This is a function which is used to render the teleLeadsUi page. */
controllerObj.teleLeadsUi = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "T")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render('yesBank/yesTeleLeads', { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}
controllerObj.getTeleApplicationsAjax = async function (req, res, next) {
	let userdata = jwt.decode(req.session.userToken)
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	}

	let dataFromDb = false;

	if (req.body.dropOff) {
		dataFromDb = await yesTeleApplicationsModel.getFilteredYesApplicationsWithYesApplicationStatusDistinct(req.body, userdata);
	} else {
		dataFromDb = await yesTeleApplicationsModel.getFilteredYesApplications(req.body, userdata)

	}

	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-YES-APPLICATION-SUC-102"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		
		commonHelper.successHandler(res, finalData)

	} else {
		
		commonHelper.errorHandler(res, finalData,)
	}
}

controllerObj.editApplicationUi = async (req, res, next) => {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "T")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		//console.log(req.body, "request body ")
		res.render('yesBank/editTeleApplication', { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

// Function to render commonTeleView for telecallers
controllerObj.getTeleApplicationsNew = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
        let yesTeleColumns = await yesTeleApplicationsModel.getYesTeleColumns();
        let displayName = 'YES BANK TELE APPLICATION NEW ';
        res.render("commonView/commonTeleView", { sidebarDataByServer: sideBarData, allIssuers: yesTeleColumns.allIssuers, allTr: yesTeleColumns.allTr[0], displayName: displayName, selectoptions: yesTeleColumns.selectOptions, currentIssuerId: 11})


    } else {
        res.render("error/noPermission");
    }
}

controllerObj.getTeleApplicationsAjaxNew = async function (req, res, next) {
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
	CONCAT('edit-tele-yes-application-ui?id=',tele_callers_applications_yes.yb_id) as "Edit",
	'' as "array|telecallers|Assigned To",
	tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
	tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
	tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
	tad_call_status as "multiple|tad_call_status|Call Status",
	tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
	tad_activation_call_counter as "int|tad_activation_call_counter|Activation Call Counter",
	tad_sms_counter as "int|tad_sms_counter|Sms Counter",
	tele_callers_applications_yes.yb_id as "int|yb_id|Id",
	tele_callers_applications_yes.yb_real_application_id as "string|yb_real_application_id|Application Id",
	tele_callers_applications_yes.ca_main_table as "int|ca_main_table|Main Table",
	tele_callers_applications_yes.yb_mobile_number as "int|yb_mobile_number|Mobile Number",
	card_applications_main_table.name as "string|name|Name",
	CAST(tele_callers_applications_yes.yb_application_created as varchar) as "date|yb_application_created|Application Created",
	tele_callers_applications_yes.yb_application_number as "string|yb_application_number|Application Number",
	tele_callers_applications_yes.yb_aps_ref_number as "string|yb_aps_ref_number|Aps Ref Number",
	tele_callers_applications_yes.yb_ekyc_status as "multiple|yb_ekyc_status|Ekyc Status",
	tele_callers_applications_yes.tad_yes_application_status as "multiple|tad_yes_application_status|Application Status Initial",
	tele_callers_applications_yes.yb_application_status as "multiple|yb_application_status|Application Status",
	card_applications_main_table.occupation as "select|occupation|Occupation",
	card_applications_main_table.monthly_income as "range|monthly_income|Monthly Income",
	card_applications_main_table.company_name as "string|company_name|Company Name",
	tele_callers_applications_yes.yb_final_status as "multiple|yb_final_status|Final Status",
	tele_callers_applications_yes.yb_ipa_status as "multiple|yb_ipa_status|Ipa Status",
	tele_callers_applications_yes.yb_dedupe_status as "multiple|yb_dedupe_status|Dedupe Status",
	tele_callers_applications_yes.yb_policy_check_status as "multiple|yb_policy_check_status|Policy Check Status",
	tele_callers_applications_yes.yb_cibil_check_status as "multiple|yb_cibil_check_status|Cibil Check Status",
	tele_callers_applications_yes.yb_idv as "select|yb_idv|Idv",
	CAST(tele_callers_applications_yes.yb_last_update_on as varchar) as "date|yb_last_update_on|Last Update On",
	tele_callers_applications_yes.yb_apply_through as "multiple|yb_apply_through|Apply Through",
	tele_callers_applications_yes.yb_credit_limit as "string|yb_credit_limit|Credit Limit",
	tele_callers_applications_yes.yb_vkyc_unable_reject_reasons as "string|yb_vkyc_unable_reject_reasons|Vkyc Enable Reject Reason",
	CAST(tele_callers_applications_yes.yb_decision_date as varchar) as "date|yb_decision_date|Decision Date",
	tele_callers_applications_yes.yb_decline_reson as "multiple|yb_decline_reson|Decline Reason",
	tele_callers_applications_yes.yb_dip_reject_reason as "multiple|yb_dip_reject_reason|Dip Reject Reason",
	CAST(tele_callers_applications_yes.created_at as varchar) as "date|created_at|Created At",
	CAST(tele_callers_applications_yes.updated_at as varchar) as "date|updated_at|Updated At"
	`;
    let tableName = 'tele_callers_applications_yes';
	let leftJoin = ` LEFT JOIN card_applications_main_table ON card_applications_main_table.id = tele_callers_applications_yes.ca_main_table `;
    let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
    telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
    telecaller_name FROM au_bank_applications_table camt
    left join applications_users_junction auj on auj.application_id = au_id and auj.issuer_id = 1
    left join user_admin on ua_id = auj.admin_user 
    GROUP BY (camt.au_id) ) as au_bank_applications_table  `;
    let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'yb_id', leftJoin : leftJoin });
    // console.log(dataFromDb, "dataFromDb");
    if (dataFromDb) {
        res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

    } else {
        commonHelper.errorHandler(res, finalData,)
    }
}
module.exports = controllerObj