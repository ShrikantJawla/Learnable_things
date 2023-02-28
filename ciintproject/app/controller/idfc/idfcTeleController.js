
let commonHelper = require("../../common/helper")
let accessMiddleware = require('../../common/checkAccessMiddleware')
let commonController = require("../commonController")
let idfcTeleApplicationsModel = require('../../model/idfc/idfcTeleModel');
const commonModel = require("../../model/commonModel");
let controllerObj = {};


controllerObj.getTeleApplicationsNew = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "T");
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
        let idfcTeleColumns = await idfcTeleApplicationsModel.getIdfcTeleColumns();
       
        let displayName = 'IDFC BANK TELE APPLICATION NEW ';
        res.render("commonView/commonTeleView", { sidebarDataByServer: sideBarData, allIssuers: idfcTeleColumns.allIssuers, allTr: idfcTeleColumns.allTr[0], displayName: displayName, selectoptions: idfcTeleColumns.selectOptions, currentIssuerId: 4 })

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

    let currentUserRole = req.body.loggedUser.ua_role;
    let currentUserId = false;
    if (currentUserRole == 3) {
        currentUserId = req.body.loggedUser.ua_id;
    }
    let selectColumns = `
    CONCAT('edit-tele-idfc-application-ui?id=',tele_callers_applications_idfc.idfc_id) as "Edit",
    '' as "array|telecallers|Assigned To",
    tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
    tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
    tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
    tad_call_status as "multiple|tad_call_status|Call Status",
    tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
    tad_activation_call_counter as "int|tad_activation_call_counter|Activation Call Counter",
    tad_sms_counter as "int|tad_sms_counter|Sms Counter",
    idfc_id as "int|idfc_id|Id",
    ca_main_table as "int|ca_main_table|Main Table Id",
    CAST(idfc_date as varchar) as "date|idfc_date|Application Date",
    name as "string|name|Name",
    phone_number as "string|phone_number|Mobile Number",
    idfc_application_number as "string|idfc_application_number|Application Number",
    idfc_choice_credit_card as "multiple|idfc_choice_credit_card|Choice Credit Card",
    tad_idfc_sub_status as "multiple|tad_idfc_sub_status|Assigned Sub Status",
    idfc_sub_status as "multiple|idfc_sub_status|Sub Status",
    idfc_status as "multiple|idfc_status|Final Status",
    idfc_stage_integration_status as "multiple|idfc_stage_integration_status|Stage Integration Status",
    idfc_reason as "multiple|idfc_reason|Reason",
    idfc_date_ipa_status as "bool|idfc_date_ipa_status|Date IPA Status",
    idfc_location_city as "multiple|idfc_location_city|Location City",
    idfc_credit_limit as "int|idfc_credit_limit|Credit Limit",
    CAST(auj_updated_at as varchar) as "date|auj_updated_at|Assigned At",
    CAST(tad_updated_at as varchar) as "date|tad_updated_at|Last Updated At"
	`;
    let tableName = 'tele_callers_applications_idfc';
    let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
    telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
    telecaller_name FROM axis_bank_applications_table camt
    left join applications_users_junction auj on auj.application_id = axis_id and auj.issuer_id = 1
    left join user_admin on ua_id = auj.admin_user 
    GROUP BY (camt.axis_id) ) as axis_bank_applications_table  `;
    let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'idfc_id' });
    // console.log(dataFromDb, "dataFromDb");
    if (dataFromDb) {
        res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

    } else {
        commonHelper.errorHandler(res, finalData,)
    }
}





/* This is a function which is used to render the teleLeadsUi page. */
controllerObj.teleLeadsUi = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        res.render('idfc/idfcTeleLeads', { sidebarDataByServer: sideBarData })
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
        dataFromDb = await idfcTeleApplicationsModel.getFilteredIdfcApplicationsWithSubStatusDistinct(req.body, userdata);


    } else {
        dataFromDb = await idfcTeleApplicationsModel.getFilteredIdfcApplications(req.body, userdata)
    }

    if (dataFromDb) {
        finalData.status = true
        finalData.code = "CIP-IDFC-APPLICATION-SUC-102"
        finalData.message = "Operation performed successfully"
        finalData.payload = dataFromDb
        commonHelper.successHandler(res, finalData)

    } else {
        commonHelper.errorHandler(res, finalData,)
    }
}
controllerObj.editApplicationUi = async (req, res, next) => {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        res.render('idfc/editTeleApplication', { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

module.exports = controllerObj