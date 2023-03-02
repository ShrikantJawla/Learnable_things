let commonHelper = require("../../common/helper");
const commonModel = require("../../model/commonModel.js");
const bcrypt = require("bcrypt");

let commonController = require("../../controller/commonController");
let accessMiddleware = require("../../common/checkAccessMiddleware");
const { pool } = require("../../utils/configs/database");

const siteUsersModels = require('../../model/users/siteUsersModels')

const siteUsersController = {}



siteUsersController.externalUsersListUI = async (req, res) => {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "W");
    if (middleObj) {
      let sideBarData = await commonController.commonSideBarData(req);
      let uaColumns = await siteUsersModels.getEUColumns();
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
  
  siteUsersController.externalUsersListAjax = async(req,res)=>{
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
  

  module.exports = siteUsersController;