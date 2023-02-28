let userAdminModel = require("../../model/users/userAdminModel");
let commonHelper = require("../../common/helper");
const commonModel = require("../../model/commonModel.js");

let commonController = require("../../controller/commonController");
let accessMiddleware = require("../../common/checkAccessMiddleware");
const { pool } = require("../../utils/configs/database");

let userAdminObj = {};

// User admins here.....

/**
 * It checks if the string is a 10 digit number and if it is, it checks if it is a valid Indian mobile
 * number
 *
 * Args:
 *   str: The string to be validated.
 *
 * Returns:
 *   A function that takes a string as an argument and returns a boolean value.
 */
let validateNumber = function (str) {
  if (str.length == 10) {
    // Regular expression to check if string is a Indian mobile number
    const regexExp = /^[6-9]\d{9}$/gi;
    return regexExp.test(str);
  } else {
    return false;
  }
};

userAdminObj.userAdminListUI = async function (req, res, next) {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    let uaColumns = await userAdminModel.getUaColumns();
    // console.log(uaColumns)
    const displayName = "User Admin List";
    res.render("commonView/commonView", {
      sidebarDataByServer: sideBarData,
      allTr: uaColumns.allTr[0],
      displayName: displayName,
      selectoptions: uaColumns.selectOptions,
    });
    // res.render("users/userAdmins", { sidebarDataByServer: sideBarData })
  } else {
    res.render("error/noPermission");
  }
};

userAdminObj.getUserAdminAjax = async (req, res) => {
  let finalData = {
    status: false,
    code: "CIP-APPLICATION-ERR-101",
    message: "Something went wrong",
    payload: [],
  };
  let userdata = jwt.decode(req.session.userToken);
  let userLatestRole = await commonModel.getUserAdminRole(userdata.ua_id);
  let currentUserRole = userLatestRole[0].ua_role;
  let currentUserId = false;
  if (currentUserRole == 3) {
    currentUserId = userdata.ua_id;
  }
  let selectColumns = `
	CONCAT('edit-user-admin-ui?id=',user_admin.ua_id) as "Edit",
        user_admin.ua_id as select,
        user_admin.ua_id as "int|ua_id|Id",
        user_admin.ua_name as "string|ua_name|Name",
        user_admin.ua_email as "string|ua_email|Email",
        user_admin.ua_role as "multiple|ua_role|Role",
        user_admin.active_user as "bool|active_user|Active Status",
        CAST(user_admin.created_at as varchar) as "date|created_at|Created at",
        CAST(user_admin.updated_at as varchar) as "date|updated_at|Updated at"
	`;
  let tableName = "user_admin";
  let dataFromDb = await commonModel.getDataByPagination({
    body: req.body,
    currenUserId: currentUserId,
    selectColumns: selectColumns,
    tableName: tableName,
    shortByColumn: "ua_id",
  });
  if (dataFromDb) {
    res.render("commonView/commonAjax", {
      applicationsList: dataFromDb.applicationsData,
      totalCount: dataFromDb.count,
      getAllIssuers: dataFromDb.getAllIssuers,
      currentIssuer: req.body.issuerName,
    });
  } else {
    commonHelper.errorHandler(res, finalData);
  }
};


userAdminObj.editUserAdminUi = async (req,res)=>{
    let sideBarData = await commonController.commonSideBarData(req);
    console.log(sideBarData);
	res.render('users/editUserAdmin', { sidebarDataByServer: sideBarData })
}


userAdminObj.getSingleUserAdmin = async (req,res)=>{
    const id = req.params.id;
    try {
        const data = await pool.query(`SELECT * FROM user_admin WHERE ua_id = ${id}`)
        res.status(200).json({
            status:'ok',
            payload:data.rows[0]
        })
    } catch (error) {
        console.log(error)
        res.status(501).json({
            status:501,
            message:error.message
        })
    }

}

userAdminObj.getAllAdminRoles = async (req,res)=>{
    try {
        const data = await pool.query(`SELECT * FROM user_admin_role`)
        res.status(200).send({
            status:'ok',
            payload:data.rows
        })
    } catch (error) {
        console.log('Get all admin roles route',error);
        res.status(501).json({
            status:501,
            message:error.message
        })
    }
}


userAdminObj.addNewAdminUser = async function (req, res, next) {
  let returnData = {
    status: false,
    code: "ERROR-CIA-APP-USERADMINPANEL-106",
    payload: [],
  };
  let dataFromDb = false;
  // console.log("admin request data-----", req.body);
  if (
    req.body.UApassword &&
    req.body.UAuserName &&
    req.body.UAuserEmail &&
    req.body.UAuserRole &&
    req.body.UAActiveUser &&
    req.body.UATeleNumber
  ) {
    let validatedNumber = validateNumber(req.body.UATeleNumber);
    // console.log(validatedNumber);
    if (validatedNumber) {
      let teleNumber = "+91" + req.body.UATeleNumber;
      dataFromDb = await userAdminModel.addNewAdminUser(
        req.body.UApassword,
        req.body.UAuserName,
        req.body.UAuserEmail,
        req.body.UAuserRole,
        req.body.UAActiveUser,
        teleNumber
      );
    } else {
      dataFromDb = false;
    }
  }

  if (dataFromDb == false) {
    commonHelper.errorHandler(res, returnData);
  } else {
    (returnData.status = true),
      (returnData.code = "CIA-APP-USERADMINPANEL-106"),
      (payload = dataFromDb);
    commonHelper.successHandler(res, returnData);
  }
};

userAdminObj.updateAdminUser = async function (req, res, next) {
  // console.log(req.body);
  let returnData = {
    status: false,
    code: "ERROR-CIA-APP-USERADMINPANEL-107",
    payload: [],
  };
  let dataFromDb = false;
  if (req.body.ua_id) {
    // console.log(req.body)
    let updateData = {
      password: req.body.ua_password ? req.body.ua_password : "",
      name: req.body.ua_name,
      email: req.body.ua_email,
      userRole: req.body.ua_role,
      userActive: req.body.ua_active_user,
      userTeleNumber: "+91" + req.body.ua_tele_number,
    };
    //console.log("hi im in ua id");
    dataFromDb = await userAdminModel.updateAdminUser(
      req.body.ua_id,
      updateData
    );
    //console.log(dataFromDb, "datafrom db");
  }
  if (dataFromDb == false) {
    //console.log("hi im in this if");
    commonHelper.errorHandler(res, returnData);
  } else {
    //console.log("hi im in this else");
    (returnData.status = true),
      (returnData.code = "CIA-APP-USERADMINPANEL-107"),
      (payload = dataFromDb);
    commonHelper.successHandler(res, returnData);
  }
};
/* This is a function that is used to get the list of telecallers. */

module.exports = userAdminObj;
