let commonHelper = require("../../common/helper")
let accessMiddleware = require('../../common/checkAccessMiddleware')
let commonController = require("../commonController")
let auTeleApplicationsModel = require('../../model/au/auTeleModel');
let commonModel = require("../../model/commonModel");
let controllerObj = {}

/* This is a function which is used to render the teleLeadsUi page. */
controllerObj.teleLeadsUi = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        res.render('au/auTeleLeads', { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}
// Function to render commonTeleView for telecallers
controllerObj.getTeleApplicationsNew = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
        let auTeleColumns = await auTeleApplicationsModel.getAuTeleColumns();
        let displayName = 'AU BANK TELE APPLICATION NEW ';
        res.render("commonView/commonTeleView", { sidebarDataByServer: sideBarData, allIssuers: auTeleColumns.allIssuers, allTr: auTeleColumns.allTr[0], displayName: displayName, selectoptions: auTeleColumns.selectOptions, currentIssuerId: 7})


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
    CONCAT('edit-tele-au-application-ui?id=',tele_callers_applications_au.au_id) as "Edit",
    '' as "array|telecallers|Assigned To",
    tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
    tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
    tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
    tad_call_status as "multiple|tad_call_status|Call Status",
    tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
    tad_sms_counter as "int|tad_sms_counter|Sms Counter",
    au_id as "int|au_id|Id",
    ca_main_table as "int|ca_main_table|Main Table Id",
    au_customer_name as "string|au_customer_name|Name",
    au_phone_number as "string|au_phone_number|Phone Number",
    au_application_number as "string|au_application_number|Application Number",
    CAST (au_initiation_date as varchar) as "date|au_initiation_date|Initiation Date",
    au_card_variant as "multiple|au_card_variant|Card Variant",
    tad_au_dropoff_page as "multiple|tad_au_dropoff_page|Assigned Dropoff Page",
    au_drop_off_page as "multiple|au_drop_off_page|Dropoff Page",
    au_current_status as "multiple|au_current_status|Current Status",
    au_final_status as "multiple|au_final_status|Final Status",
    au_reject_reason as "multiple|au_reject_reason|Reject Reason",
    CAST (tad_updated_at as varchar) as "date|tad_updated_at|Last Updated At",
    CAST (auj_created_at as varchar)  as "date|auj_created_at|Assigned At"
	`;
    let tableName = 'tele_callers_applications_au';
    let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
    telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
    telecaller_name FROM au_bank_applications_table camt
    left join applications_users_junction auj on auj.application_id = au_id and auj.issuer_id = 1
    left join user_admin on ua_id = auj.admin_user 
    GROUP BY (camt.au_id) ) as au_bank_applications_table  `;
    let dataFromDb = await commonModel.getDataByPagination({ body: req.body, currenUserId: currentUserId, selectColumns: selectColumns, tableName: tableName, shortByColumn: 'au_id' });
    // console.log(dataFromDb, "dataFromDb");
    if (dataFromDb) {
        res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

    } else {
        commonHelper.errorHandler(res, finalData,)
    }
}

/* This is a function which is used to get the data from the database and send it to the frontend. */
controllerObj.getTeleApplicationsAjax = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let finalData = {
        status: false,
        code: "CIP-APPLICATION-ERR-102",
        message: "Something went wrong",
        payload: []
    }
     console.log(req.body, "hi im in controller");
    let dataFromDb;
    if(req.body.dropOff){
        // console.log("hi  im in dropoff page ");
        dataFromDb = await auTeleApplicationsModel.getFilteredAuApplicationsWithDropoffDifference(req.body, userdata);
    }else{
        dataFromDb = await auTeleApplicationsModel.getFilteredAuApplications(req.body, userdata);
    }
   console.log(dataFromDb, "data from db")
    if (dataFromDb) {
        //log(finalData, "final data in if");
        finalData.status = true
        finalData.code = "CIP-AU-APPLICATION-SUC-102"
        finalData.message = "Operation performed successfully"
        finalData.payload = dataFromDb
       // console.log(finalData.payload.applicationsData, "final data");
        commonHelper.successHandler(res, finalData)

    } else {
        //console.log(finalData, "final data in else")
        commonHelper.errorHandler(res, finalData,)
    }
}


controllerObj.editApplicationUi = async (req, res, next) => {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        //console.log(req.body, "request body ")
        res.render('au/editTeleApplication', { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}
module.exports = controllerObj