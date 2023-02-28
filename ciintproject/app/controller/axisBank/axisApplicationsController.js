let axisApplicationsModel = require("../../model/axis/axisApplicationsModel");
let commonHelper = require("../../common/helper");
const CsvParser = require("json2csv").Parser;
const commonModel = require("../../model/commonModel");

let accessMiddleware = require("../../common/checkAccessMiddleware");

let commonController = require("../../controller/commonController");

let controllerObj = {};

controllerObj.getApplicationsNew = async function(req, res, next){
  let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "W");
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		let axisColumns = await axisApplicationsModel.getAxisColumns();
   
		let displayName = 'AXIS BANK APPLICATION NEW ';
		res.render("commonView/commonView", { sidebarDataByServer: sideBarData, allIssuers: axisColumns.allIssuers, allTr: axisColumns.allTr[0], displayName: displayName  , selectoptions : axisColumns.selectOptions , currentIssuerId : 1})
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
	
	let userLatestRole = await commonModel.getUserAdminRole(
		req.body.loggedUser.ua_id
	);
	let currentUserRole = userLatestRole[0].ua_role;
	let currentUserId = false;
	if (currentUserRole == 3) {
		currentUserId = req.body.loggedUser.ua_id;
	}
	let selectColumns = `
  CONCAT('edit-axis-application-ui?id=',axis_bank_applications_table.axis_id) as "Edit",
  axis_bank_applications_table.axis_id as select,
  telecaller_name as telecallers,
  axis_bank_applications_table.axis_id as "int|axis_id|Id",
  axis_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
  axis_bank_applications_table.axis_name as "string|axis_name|Name",
  axis_bank_applications_table.axis_mobile_number as "string|axis_mobile_number|Mobile Number",
  axis_bank_applications_table.axis_application_number as "string|axis_application_number|Application Number",
  axis_bank_applications_table.axis_activation as "bool|axis_activation|Activation",
  CAST(axis_bank_applications_table.axis_date as varchar) as "date|axis_date|Application Date",
  CAST(axis_bank_applications_table.axis_revised_date as varchar) as "date|axis_revised_date|Revised Date",
  axis_bank_applications_table.axis_card_type as "multiple|axis_card_type|Card Type",
  axis_bank_applications_table.axis_ipa_status as "multiple|axis_ipa_status|IPA Status",
  axis_bank_applications_table.axis_final_status as "multiple|axis_final_status|Final Status",
  axis_bank_applications_table.axis_ipa_original_status_sheet_initial as "multiple|axis_ipa_original_status_sheet_initial|ETE Original Status Sheet Initial",
  axis_bank_applications_table.axis_ipa_original_status_sheet as "multiple|axis_ipa_original_status_sheet|ETE Original Status Sheet",
  axis_bank_applications_table.axis_existing_c as "select|axis_existing_c|ETB/NTB",
  axis_bank_applications_table.axis_send_to_channel as "multiple|axis_send_to_channel|Send To Channel",
  axis_bank_applications_table.axis_blaze_output as "multiple|axis_blaze_output|Blaze Output",
  axis_bank_applications_table.axis_lead_error_log as "multiple|axis_lead_error_log|Lead Error Log",
  axis_bank_applications_table.axis_live_feedback_status as "multiple|axis_live_feedback_status|Live Feedback Status",
  CAST(axis_bank_applications_table.created_at as varchar) as "date|created_at|Created At",
  CAST(axis_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
	`;
  let tableName = 'axis_bank_applications_table';
	let tableNameQuery = `   (SELECT camt.*,array_agg(case when auj.admin_user is not null then admin_user end) 
  telecallers , array_agg(case when auj.admin_user is not null then user_admin.ua_name end) 
  telecaller_name FROM axis_bank_applications_table camt
  left join applications_users_junction auj on auj.application_id = axis_id and auj.issuer_id = 1
  left join user_admin on ua_id = auj.admin_user 
  GROUP BY (camt.axis_id) ) as axis_bank_applications_table  `;
	let dataFromDb = await commonModel.getDataByPagination({body: req.body , currenUserId: currentUserId , selectColumns : selectColumns , tableName:  tableName , shortByColumn : 'axis_id' , tableNameQuery : tableNameQuery} );
	// console.log(dataFromDb, "dataFromDb");
	if (dataFromDb) {
		res.render('commonView/commonAjax', { applicationsList: dataFromDb.applicationsData, totalCount: dataFromDb.count, getAllIssuers: dataFromDb.getAllIssuers, currentIssuer: req.body.issuerName })

	} else {
		commonHelper.errorHandler(res, finalData,)
	}
}




controllerObj.getApplications = async function (req, res, next) {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("axisBank/axisApplications.ejs", {
      sidebarDataByServer: sideBarData,
    });
  } else {
    res.render("error/noPermission");
  }
};

controllerObj.getApplicationsAjax = async function (req, res, next) {
  // console.log(req.body, "\n\n\n\n");
  let finalData = {
    status: false,
    code: "CIP-APPLICATION-ERR-102",
    message: "Something went wrong",
    payload: [],
  };
  let dataFromDb = await axisApplicationsModel.getFilteredAxisApplications(
    req.body
  );

  if (dataFromDb) {
    finalData.status = true;
    finalData.code = "CIP-AXIS-APPLICATION-SUC-102";
    finalData.message = "Operation performed successfully";
    finalData.payload = dataFromDb;
    commonHelper.successHandler(res, finalData);
  } else {
    commonHelper.errorHandler(res, finalData);
  }
};

controllerObj.exportCsv = async (req, res, next) => {
  const { applicationsData } = await axisApplicationsModel.exportCsv(
    JSON.parse(req.body.allData)
  );
  const csvParser = new CsvParser();
  let csvData;
  if (applicationsData.length == 0) {
    csvData = csvParser.parse({ data: "no data found" });
  } else {
    csvData = csvParser.parse(applicationsData);
  }
  res.setHeader("Content-Type", "text/csv");
  res.status(200).end(csvData);
};

controllerObj.editApplicationUi = async (req, res, next) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("axisBank/editApplication", {
      sidebarDataByServer: sideBarData,
    });
  } else {
    res.render("error/noPermission");
  }
};

controllerObj.getApplicationDataById = async (req, res, next) => {
  let returnDataFromModel = await axisApplicationsModel.getApplicationDataById(
    parseInt(req.query.id)
  );
  let returnData = {
    status: true,
    code: "CI-APP-EXISTING-AXIS-APPLICATION-EDIT-101",
    payload: {
      ...returnDataFromModel,
    },
  };
  commonHelper.successHandler(res, returnData);
};
controllerObj.updateApplication = async (req, res, next) => {};
module.exports = controllerObj;
