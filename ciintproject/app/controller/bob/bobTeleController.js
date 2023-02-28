
let commonHelper = require("../../common/helper")
let accessMiddleware = require('../../common/checkAccessMiddleware')
let commonController = require("../commonController")
let bobTeleApplicationsModel = require('../../model/bob/bobTeleModel')
const commonModel = require('../../model/commonModel');
let controllerObj = {}


controllerObj.getTeleApplicationsNew = async function (req, res, next) {
    // let middleObj = await accessMiddleware.checkAccessPermition(req, 3, "T");
    // if (middleObj) {
    //     let sideBarData = await commonController.commonSideBarData(req);
    //     let axisTeleColumns = await bobTeleApplicationsModel.getBobTeleColumns();
    //     let displayName = 'BOB BANK TELE APPLICATION NEW ';
    //     res.render("commonView/commonTeleView", { sidebarDataByServer: sideBarData, allIssuers: axisTeleColumns.allIssuers, allTr: axisTeleColumns.allTr[0], displayName: displayName, selectoptions: axisTeleColumns.selectOptions, currentIssuerId: 1 })

    // } else {
        res.render("error/noPermission");
    // }
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
    CONCAT('edit-tele-axis-application-ui?id=',tele_callers_applications_axis.axis_id) as "Edit",
    '' as "array|telecallers|Assigned To",
    tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
    tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
    tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
    tad_call_status as "multiple|tad_call_status|Call Status",
    tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
    tad_activation_call_counter as "int|tad_activation_call_counter|Activation Call Counter",
    tad_sms_counter as "int|tad_sms_counter|Sms Counter",
    axis_id as "int|axis_id|Id",
    ca_main_table as "int|ca_main_table|Main Table Id",
    axis_name as "string|axis_name|Axis Name",
    axis_mobile_number as "string|axis_mobile_number|Mobile Number",
    axis_application_number as "string|axis_application_number|Application Number",
    axis_activation as "bool|axis_activation|Axis Activation",
    CAST(axis_date as varchar) as "date|axis_date|Application Date",
    axis_card_type as "multiple|axis_card_type|Card Type",
    axis_ipa_status as "multiple|axis_ipa_status|Ipa Status",
    axis_final_status as "multiple|axis_final_status|Final Status",
    axis_ipa_original_status_sheet as "multiple|axis_ipa_original_status_sheet|Ipa Original Sheet Status",
    tad_axis_ipa_original_status_sheet as "multiple|tad_axis_ipa_original_status_sheet|Tad Ipa Original Sheet Status",
    axis_existing_c as "multiple|axis_existing_c|Existing C",
    axis_send_to_channel as "multiple|axis_send_to_channel|Send To Channel",
    axis_blaze_output as "multiple|axis_blaze_output|Blaze Output",
    axis_lead_error_log as "multiple|axis_lead_error_log|Lead Error Log",
    axis_live_feedback_status as "multiple|axis_live_feedback_status|Live Feedback Status",
    CAST(tad_updated_at as varchar) as "date|tad_updated_at|Last Updated At"
	`;
    let tableName = 'tele_callers_applications_axis';
    let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
    telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
    telecaller_name FROM axis_bank_applications_table camt
    left join applications_users_junction auj on auj.application_id = axis_id and auj.issuer_id = 1
    left join user_admin on ua_id = auj.admin_user 
    GROUP BY (camt.axis_id) ) as axis_bank_applications_table  `;
    let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'axis_id' });
    // console.log(dataFromDb, "dataFromDb");
    if (dataFromDb) {
        res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

    } else {
        commonHelper.errorHandler(res, finalData,)
    }
}






/* This is a function which is used to render the teleLeadsUi page. */
controllerObj.teleLeadsUi = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 3, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        res.render('bob/bobTeleLeads', { sidebarDataByServer: sideBarData })
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
    //console.log(req.body, "hi im in controller")



    let dataFromDb = await bobTeleApplicationsModel.getFilteredBobApplications(req.body, userdata.ua_id)
    // //console.log(dataFromDb, "data from db")


    if (dataFromDb) {
        //log(finalData, "final data in if");
        finalData.status = true
        finalData.code = "CIP-BOB-APPLICATION-SUC-102"
        finalData.message = "Operation performed successfully"
        finalData.payload = dataFromDb
        ////console.log(finalData, "final data");
        commonHelper.successHandler(res, finalData)

    } else {
        //console.log(finalData, "final data in else")
        commonHelper.errorHandler(res, finalData,)
    }
}
controllerObj.editApplicationUi = async (req, res, next) => {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 3, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        //console.log(req.body, "request body ")
        res.render('bob/editTeleApplication', { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

module.exports = controllerObj