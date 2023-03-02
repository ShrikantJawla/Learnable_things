let userAdminModel = require("../../model/users/userAdminModel");
let commonHelper = require("../../common/helper");
const commonModel = require("../../model/commonModel.js");
const bcrypt = require("bcrypt");

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
    const displayName = "User Admin List";
    res.render("commonView/commonView", {
      sidebarDataByServer: sideBarData,
      allTr: uaColumns.allTr[0],
      displayName: displayName,
      selectoptions: uaColumns.selectOptions,
      addEntryUrl: `/users/add-new-userAdmin`,
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
        uar.uar_role_name as "multiple|uar_role_name|Role",
        user_admin.active_user as "bool|active_user|Active Status",
        CAST(user_admin.created_at as varchar) as "date|created_at|Created at",
        CAST(user_admin.updated_at as varchar) as "date|updated_at|Updated at"
	`;
  let leftJoin = `LEFT JOIN user_admin_role AS uar ON uar.uar_id=user_admin.ua_role`
  let tableName = "user_admin";
  let dataFromDb = await commonModel.getDataByPagination({
    body: req.body,
    currenUserId: currentUserId,
    selectColumns: selectColumns,
    tableName: tableName,
    shortByColumn: "ua_id",
    leftJoin,
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

userAdminObj.editUserAdminUi = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("users/editUserAdmin", { sidebarDataByServer: sideBarData });
  }else {
    res.render("error/noPermission");
  }
};

userAdminObj.getSingleUserAdmin = async (req, res) => {
  const id = req.params.id;
  try {
    const data = await pool.query(
      `SELECT * FROM user_admin WHERE ua_id = ${id}`
    );
    res.status(200).json({
      status: "ok",
      payload: data.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(501).json({
      status: 501,
      message: error.message,
    });
  }
};

userAdminObj.getAllAdminRoles = async (req, res) => {
  try {
    const data = await pool.query(`SELECT * FROM user_admin_role`);
    res.status(200).send({
      status: "ok",
      payload: data.rows,
    });
  } catch (error) {
    console.log("Get all admin roles route", error);
    res.status(501).json({
      status: 501,
      message: error.message,
    });
  }
};

userAdminObj.addNewUserAdminUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("users/addNewUserAdmin", { sidebarDataByServer: sideBarData });
  }else {
    res.render("error/noPermission");
  }
};

userAdminObj.addNewAdminUser = async function (req, res, next) {
  let returnData = {
    status: false,
    code: "ERROR-CIA-APP-USERADMINPANEL-106",
    payload: [],
  };
  // console.log("admin request data-----", req.body);
  let dataFromDb = false;
  if (
    req.body.UApassword &&
    req.body.UAuserName &&
    req.body.UAuserEmail &&
    req.body.UAuserRole &&
    req.body.UAActiveUser
    ) {
    dataFromDb = await userAdminModel.addNewAdminUser(
      req.body.UApassword,
      req.body.UAuserName,
      req.body.UAuserEmail,
      req.body.UAuserRole,
      req.body.UAActiveUser
    );
  }
  // console.log(dataFromDb)
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
  const id = req.params.id;
  const { userName, email, role, activeStatus, password } = req.body;
  let query;
  try {
    if (password !== "") {
      query = `UPDATE user_admin 
  SET ua_name = '${userName}', ua_email = '${email}', ua_role = ${+role},active_user=${activeStatus},updated_at=now()
  WHERE ua_id = ${id} returning *`;
    } else {
      const hashSalt = await bcrypt.genSalt(6);
      let clientPassword = await bcrypt.hash(password, hashSalt);
      query = `UPDATE user_admin 
  SET ua_name = '${userName}', ua_email = '${email}', ua_role = ${+role},active_user=${activeStatus},ua_password = '${clientPassword}'
  WHERE ua_id = ${id} returning *`;
    }
    let result = await pool.query(query);
    return res.status(200).json({
      status: "ok",
      payload: result,
    });
  } catch (error) {
    console.log(error.message);
    res.status(501).json({
      status: 501,
      message: error.message,
    });
  }
};

userAdminObj.externalUsersListUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    let uaColumns = await userAdminModel.getEUColumns();
    const displayName = "User Admin List";
    res.render("commonView/commonView", {
      sidebarDataByServer: sideBarData,
      allTr: uaColumns.allTr[0],
      displayName: displayName,
      selectoptions: uaColumns.selectOptions,
      addEntryUrl: `/users/add-new-userAdmin`,
    });
    // res.render("users/userAdmins", { sidebarDataByServer: sideBarData })
  } else {
    res.render("error/noPermission");
  }
};

userAdminObj.externalUsersListAjax = async(req,res)=>{
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
	CONCAT('edit-users-ui?id=',cim_users.cim_id) as "Edit",
        cim_users.cim_id as select,
        cim_users.cim_id as "int|cim_id|Id",
        cim_users.cim_name as "string|cim_name|Name",
        cim_users.cim_number as "string|cim_number|Number",
        cim_users.cim_email as "string|cim_email|Email",
        cim_users.cim_is_verified as "bool|cim_is_verified|Is Verified",
        CAST(cim_users.created_at as varchar) as "date|created_at|Created at",
        CAST(cim_users.updated_at as varchar) as "date|updated_at|Updated at"
	`;
  let leftJoin = `LEFT JOIN user_admin_role AS uar ON uar.uar_id=user_admin.ua_role`
  let tableName = "cim_users";
  let dataFromDb = await commonModel.getDataByPagination({
    body: req.body,
    currenUserId: currentUserId,
    selectColumns: selectColumns,
    tableName: tableName,
    shortByColumn: "cim_id",
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
}



module.exports = userAdminObj;
