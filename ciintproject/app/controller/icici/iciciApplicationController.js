let commonHelper = require('../../common/helper');
let commonModel = require('../../model/commonModel');
let commonController = require("../../controller/commonController");
let accessMiddleware = require('../../common/checkAccessMiddleware');
let iciciModel = require("../../model/icici/iciciApplicationModel");

controllerObj = {}

controllerObj.getApplications = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, "T")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		res.render("icici/iciciApplications", { sidebarDataByServer: sideBarData, allIssuers: allIssuers })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsNew = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let getIcicColumns = await iciciModel.getIcicColumns();
		let displayName = 'ICICI BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: getIcicColumns.allIssuers, allTr: getIcicColumns.allTr[0], displayName: displayName , selectoptions : getIcicColumns.selectOptions , currentIssuerId : 6})
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsAjaxNew = async function (req, res, next) {
	console.log("i was herererere")
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
		CONCAT('edit-icici-application?id=',icici_bank_application.icici_id) as "Edit",  
		icici_id as select,
		'' as assignTo,
		icici_bank_application.icici_id as "int|icici_id|Id" , 
		icici_bank_application.icici_application_number as "string|icici_application_number|Application Number",
		icici_bank_application.ca_main_table as "int|ca_main_table|Main Table",
		icici_bank_application.icici_applicant_name as "string|icici_applicant_name|Name",
		icici_bank_application.icici_flow_type as "string|icici_flow_type|Flow Type",
		icici_bank_application.icici_phone_number as "string|icici_phone_number|Phone Number",
		icici_bank_application.icici_card_type as "string|icici_card_type|Card Type",
		icici_bank_application.icici_pricing_code as "string|icici_pricing_code|Pricing Code",
		icici_bank_application.icici_is_card_applied as "string|icici_is_card_applied|Is Card Applied",
		icici_bank_application.icici_rejection_reason as "string|icici_rejection_reason|Rejection Reason",
		icici_bank_application.icici_approved_remarks as "string|icici_approved_remarks|Approved Remarks",
		icici_bank_application.icici_req_income_doc as "string|icici_req_income_doc|Req Income Doc",
		icici_bank_application.icici_current_address_pincode as "string|icici_current_address_pincode|Current Pincode",
		icici_bank_application.icici_permanent_address_pincode as "string|icici_permanent_address_pincode|Permanent Pincode",
		icici_bank_application.icici_gems_arn as "string|icici_gems_arn|Gems Arn",
		icici_bank_application.icici_bre_decision as "string|icici_bre_decision|Bre Decision",
		icici_bank_application.icici_ckyc_approver_decision as "string|icici_ckyc_approver_decision|CKYC Approved Decision",
		icici_bank_application.icici_current_status as "string|icici_current_status|Current Status",
		icici_bank_application.icici_app_status as "string|icici_app_status|App Status",
		icici_bank_application.icici_idisb_dma as "string|icici_idisb_dma|IDISB DMA",
		icici_bank_application.icici_se_id as "string|icici_se_id|SE ID",
		icici_bank_application.icici_status as "string|icici_status|Status",
		icici_bank_application.icici_submission_status as "string|icici_submission_status|Submission Status",
		icici_bank_application.icici_current_city as "string|icici_current_city|Current City",
		icici_bank_application.icici_region as "string|icici_region|Region",
		CAST(icici_bank_application.icici_created_date as varchar) as "date|icici_created_date|Created Date",
		icici_bank_application.icici_location as "string|icici_location|Location",
		icici_bank_application.icici_rbm_name as "string|icici_rbm_name| RBM Name",
		icici_bank_application.icici_emp_name as "string|icici_emp_name|Emp Name",
		icici_bank_application.icici_delink_dat as "string|icici_delink_date|Delink Dat",
		icici_bank_application.icici_delinker as "string|icici_delinker|Delinker",
		icici_bank_application.icici_vkyc_opted_flag as "string|icici_vkyc_opted_flag|VKYC Opted Flag",
		icici_bank_application.icici_initiated_flag as "string|icici_initiated_flag|Initiated Flag",
		CAST(icici_bank_application.icici_created_at as varchar) as "date|icici_created_at|Created At",
		CAST(icici_bank_application.icici_updated_at as varchar) as "date|icici_updated_at|Updated At"
	`;
	let tableName = 'icici_bank_application';
	let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'icici_id' });
	//console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}

}

controllerObj.getApplicationsRahulEx = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, "T")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		let queryForTr = `SELECT 
		icici_id as select,
		'' as assignTo,
		icici_bank_application.icici_id as "int|icici_id|Id" , 
		icici_bank_application.icici_application_number as "string|icici_application_number|Application Number",
		icici_bank_application.ca_main_table as "int|ca_main_table| Main Table",
		icici_bank_application.icici_applicant_name as "string|icici_applicant_name|Name",
		icici_bank_application.icici_flow_type as "string|icici_flow_type|Flow Type",
		icici_bank_application.icici_phone_number as "string|icici_phone_number|Phone Number",
		icici_bank_application.icici_card_type as "string|icici_card_type|Card Type",
		icici_bank_application.icici_pricing_code as "string|icici_pricing_code|Pricing Code",
		icici_bank_application.icici_is_card_applied as "string|icici_is_card_applied|Is Card Applied",
		icici_bank_application.icici_rejection_reason as "string|icici_rejection_reason|Rejection Reason",
		icici_bank_application.icici_approved_remarks as "string|icici_approved_remarks|Approved Remarks",
		icici_bank_application.icici_req_income_doc as "string|icici_req_income_doc|Req Income Doc",
		icici_bank_application.icici_current_address_pincode as "string|icici_current_address_pincode|Current Pincode",
		icici_bank_application.icici_permanent_address_pincode as "string|icici_permanent_address_pincode|Permanent Pincode",
		icici_bank_application.icici_gems_arn as "string|icici_gems_arn|Gems Arn",
		icici_bank_application.icici_bre_decision as "string|icici_bre_decision|Bre Decision",
		icici_bank_application.icici_ckyc_approver_decision as "string|icici_ckyc_approver_decision|CKYC Approved Decision",
		icici_bank_application.icici_current_status as "string|icici_current_status|Current Status",
		icici_bank_application.icici_app_status as "string|icici_app_status|App Status",
		icici_bank_application.icici_idisb_dma as "string|icici_idisb_dma|IDISB DMA",
		icici_bank_application.icici_se_id as "string|icici_se_id|SE ID",
		icici_bank_application.icici_status as "string|icici_status|Status",
		icici_bank_application.icici_submission_status as "string|icici_submission_status|Submission Status",
		icici_bank_application.icici_current_city as "string|icici_current_city|Current City",
		icici_bank_application.icici_region as "string|icici_region|Region",
		icici_bank_application.icici_created_date as "date|icici_created_date|Created Date",
		icici_bank_application.icici_location as "string|icici_location|Location",
		icici_bank_application.icici_rbm_name as "string|icici_rbm_name| RBM Name",
		icici_bank_application.icici_emp_name as "string|icici_emp_name|Emp Name",
		icici_bank_application.icici_delink_dat as "string|icici_delink_date|Delink Dat",
		icici_bank_application.icici_delinker as "string|icici_delinker|Delinker",
		icici_bank_application.icici_vkyc_opted_flag as "string|icici_vkyc_opted_flag|VKYC Opted Flag",
		icici_bank_application.icici_initiated_flag as "string|icici_initiated_flag|Initiated Flag",
		icici_bank_application.icici_created_at as "date|icici_created_at|Created At",
		icici_bank_application.icici_updated_at as "date|icici_updated_at|Updated At"
		FROM icici_bank_application limit 1`;
		let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
		let displayName = 'ICICI BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: allIssuers, allTr: allTr[0], displayName: displayName })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsAjaxRahulEx = async function (req, res, next) {
	
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
	icici_id as select,
		'' as assignTo,
		icici_bank_application.icici_id as "int|icici_id|Id" , 
		icici_bank_application.icici_application_number as "string|icici_application_number|Application Number",
		icici_bank_application.ca_main_table as "int|ca_main_table| Main Table",
		icici_bank_application.icici_applicant_name as "string|icici_applicant_name|Name",
		icici_bank_application.icici_flow_type as "string|icici_flow_type|Flow Type",
		icici_bank_application.icici_phone_number as "string|icici_phone_number|Phone Number",
		icici_bank_application.icici_card_type as "string|icici_card_type|Card Type",
		icici_bank_application.icici_pricing_code as "string|icici_pricing_code|Pricing Code",
		icici_bank_application.icici_is_card_applied as "string|icici_is_card_applied|Is Card Applied",
		icici_bank_application.icici_rejection_reason as "string|icici_rejection_reason|Rejection Reason",
		icici_bank_application.icici_approved_remarks as "string|icici_approved_remarks|Approved Remarks",
		icici_bank_application.icici_req_income_doc as "string|icici_req_income_doc|Req Income Doc",
		icici_bank_application.icici_current_address_pincode as "string|icici_current_address_pincode|Current Pincode",
		icici_bank_application.icici_permanent_address_pincode as "string|icici_permanent_address_pincode|Permanent Pincode",
		icici_bank_application.icici_gems_arn as "string|icici_gems_arn|Gems Arn",
		icici_bank_application.icici_bre_decision as "string|icici_bre_decision|Bre Decision",
		icici_bank_application.icici_ckyc_approver_decision as "string|icici_ckyc_approver_decision|CKYC Approved Decision",
		icici_bank_application.icici_current_status as "string|icici_current_status|Current Status",
		icici_bank_application.icici_app_status as "string|icici_app_status|App Status",
		icici_bank_application.icici_idisb_dma as "string|icici_idisb_dma|IDISB DMA",
		icici_bank_application.icici_se_id as "string|icici_se_id|SE ID",
		icici_bank_application.icici_status as "string|icici_status|Status",
		icici_bank_application.icici_submission_status as "string|icici_submission_status|Submission Status",
		icici_bank_application.icici_current_city as "string|icici_current_city|Current City",
		icici_bank_application.icici_region as "string|icici_region|Region",
		icici_bank_application.icici_created_date as "date|icici_created_date|Created Date",
		icici_bank_application.icici_location as "string|icici_location|Location",
		icici_bank_application.icici_rbm_name as "string|icici_rbm_name| RBM Name",
		icici_bank_application.icici_emp_name as "string|icici_emp_name|Emp Name",
		icici_bank_application.icici_delink_dat as "string|icici_delink_date|Delink Dat",
		icici_bank_application.icici_delinker as "string|icici_delinker|Delinker",
		icici_bank_application.icici_vkyc_opted_flag as "string|icici_vkyc_opted_flag|VKYC Opted Flag",
		icici_bank_application.icici_initiated_flag as "string|icici_initiated_flag|Initiated Flag",
		icici_bank_application.icici_created_at as "date|icici_created_at|Created At",
		icici_bank_application.icici_updated_at as "date|icici_updated_at|Updated At"
	`;
	let tableName = 'icici_bank_application';
	let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'icici_id' });
	//console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}

}


controllerObj.renderIciciUploadFile = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, "T")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("icici/iciciUpload", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.renderIciciUploadFileAjex = async function (req, res, next) {
	let returnData = {
		status: false,
		payload: [],
		code: "ICICI-UPLOAD-ERROR-101",
	};
	let allParsedData = JSON.parse(req.body.allData);
	let uploadSheetData = await iciciModel.uploadSheetIcici(allParsedData);
	if (uploadSheetData) {
		returnData.status = true;
		returnData.code = 'ICICI-ALL-OK-UPLOAD';
		returnData.message = 'ALL OK'
	} else {
		returnData.message = 'DATA NOT INSERTED , CONTACT TO DEVELOPER';
	}
	console.log(returnData, "returnDatareturnData");
	commonHelper.successHandler(res, returnData);
}

controllerObj.getTeleApplications = async function (req, res, next) {
	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, "T")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		res.render("icici/iciciTeleApplications", { sidebarDataByServer: sideBarData, allIssuers: allIssuers })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsAjax = async function (req, res, next) {
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
	let dataFromDb = await iciciModel.getAllApplicationsNew(req.body, currentUserId);
	//console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('icici/iciciApplicationsRequested', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}

}

controllerObj.getTeleApplicationsAjax = async function (req, res, next) {
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
	let dataFromDb = await iciciModel.getTeleApplicationsNew(req.body, currentUserId);
	if (dataFromDb) {
		res.render('icici/iciciTeleApplicationRequested', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}

}

controllerObj.assignTeleApplications = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}

	let dataFromDb = await iciciModel.getAllApplicationsNew(req.body);
	console.log(dataFromDb, "dataFromDbdataFromDb");
	if (dataFromDb) {
		res.render('applications/applicationListAjex', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}

}

controllerObj.getTeleApplicationsNew = async function(req, res, next){
	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let getIcicColumns = await iciciModel.getIcicTeleColumns();
		let displayName = 'ICICI BANK TELE APPLICATION NEW ';
		res.render("commonView/commonTeleView", { sidebarDataByServer: sideBarData, allIssuers: getIcicColumns.allIssuers, allTr: getIcicColumns.allTr[0], displayName: displayName , selectoptions : getIcicColumns.selectOptions , currentIssuerId : 6})
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getTeleApplicationsAjaxNew = async function(req, res, next){
	
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
	CONCAT('edit-icici-application?id=',icici_bank_application.icici_id) as "Edit",
		'' as Telecallers,
		icici_bank_application.icici_id as "int|icici_id|Id" , 
		icici_bank_application.icici_application_number as "string|icici_application_number|Application Number",
		icici_bank_application.ca_main_table as "int|ca_main_table|Main Table",
		icici_bank_application.icici_applicant_name as "string|icici_applicant_name|Name",
		icici_bank_application.icici_flow_type as "multiple|icici_flow_type|Flow Type",
		icici_bank_application.icici_phone_number as "string|icici_phone_number|Phone Number",
		icici_bank_application.icici_card_type as "multiple|icici_card_type|Card Type",
		icici_bank_application.icici_pricing_code as "string|icici_pricing_code|Pricing Code",
		icici_bank_application.icici_is_card_applied as "string|icici_is_card_applied|Is Card Applied",
		icici_bank_application.icici_rejection_reason as "string|icici_rejection_reason|Rejection Reason",
		icici_bank_application.icici_approved_remarks as "string|icici_approved_remarks|Approved Remarks",
		icici_bank_application.icici_req_income_doc as "string|icici_req_income_doc|Req Income Doc",
		icici_bank_application.icici_current_address_pincode as "string|icici_current_address_pincode|Current Pincode",
		icici_bank_application.icici_permanent_address_pincode as "string|icici_permanent_address_pincode|Permanent Pincode",
		icici_bank_application.icici_gems_arn as "string|icici_gems_arn|Gems Arn",
		icici_bank_application.icici_bre_decision as "string|icici_bre_decision|Bre Decision",
		icici_bank_application.icici_ckyc_approver_decision as "string|icici_ckyc_approver_decision|CKYC Approved Decision",
		icici_bank_application.icici_current_status as "multiple|icici_current_status|Current Status",
		icici_bank_application.icici_app_status as "string|icici_app_status|App Status",
		icici_bank_application.icici_idisb_dma as "string|icici_idisb_dma|IDISB DMA",
		icici_bank_application.icici_se_id as "string|icici_se_id|SE ID",
		icici_bank_application.icici_status as "multiple|icici_status|Status",
		icici_bank_application.icici_submission_status as "multiple|icici_submission_status|Submission Status",
		icici_bank_application.icici_current_city as "string|icici_current_city|Current City",
		icici_bank_application.icici_region as "string|icici_region|Region",
		CAST(icici_bank_application.icici_created_date as varchar) as "date|icici_created_date|Created Date",
		icici_bank_application.icici_location as "string|icici_location|Location",
		icici_bank_application.icici_rbm_name as "string|icici_rbm_name| RBM Name",
		icici_bank_application.icici_emp_name as "string|icici_emp_name|Emp Name",
		icici_bank_application.icici_delink_dat as "string|icici_delink_date|Delink Dat",
		icici_bank_application.icici_delinker as "string|icici_delinker|Delinker",
		icici_bank_application.icici_vkyc_opted_flag as "multiple|icici_vkyc_opted_flag|VKYC Opted Flag",
		icici_bank_application.icici_initiated_flag as "multiple|icici_initiated_flag|Initiated Flag",
		CAST(icici_bank_application.icici_created_at as varchar) as "date|icici_created_at|Created At",
		CAST(icici_bank_application.icici_updated_at as varchar) as "date|icici_updated_at|Updated At"
	`;
	let tableName = 'icici_bank_application';
	let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'icici_id' });
	//console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}

}


module.exports = controllerObj