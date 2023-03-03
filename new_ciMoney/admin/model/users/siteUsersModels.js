const { pool } = require("../../utils/configs/database");
const bcrypt = require("bcrypt");
const commonModel = require("../../model/commonModel");

let siteUsersModel = {};

siteUsersModel.updateAdminUser = async function (id, updateData) {
  let resultData = {};
  let returnData = false;
  if (updateData.password != "") {
    //console.log("executing with password");
    //console.log(updateData.password);
    const hashSalt = await bcrypt.genSalt(6);
    let clientPassword = await bcrypt.hash(updateData.password, hashSalt);
    let pquery = `UPDATE user_admin SET ua_name = '${updateData.name}', ua_email = '${updateData.email}',ua_password = '${clientPassword}', ua_role = ${updateData.userRole} ,
          active_user = ${updateData.userActive} , ua_tele_number = '${updateData.userTeleNumber}', updated_at = CURRENT_TIMESTAMP where ua_id = ${id};`;
    try {
      let queryData = await pool.query(pquery);
      resultData = queryData;
    } catch (err) {
      //console.log(err);
    }
  } else {
    //console.log("executing without password");
    let nquery = `UPDATE user_admin SET ua_name = '${updateData.name}', ua_email = '${updateData.email}', ua_role = ${updateData.userRole} , 
          active_user = ${updateData.userActive} , ua_tele_number = '${updateData.userTeleNumber}', updated_at = CURRENT_TIMESTAMP where ua_id = ${id};`;
    try {
      let queryDataN = await pool.query(nquery);
      resultData = queryDataN;
    } catch (err) {
      //console.log(err);
    }
  }
  returnData = resultData;
  return returnData;
};

siteUsersModel.getEUColumns = async () => {
  let returnData = {
    allTr: [],
  };
  let queryForTr = `SELECT 
          CONCAT('edit-users-ui?id=',cim_users.cim_id) as "Edit",
          cim_users.cim_id as select,
          cim_users.cim_id as "int|cim_id|Id",
          cim_users.cim_name as "string|cim_name|Name",
          cim_users.cim_number as "string|cim_number|Number",
          cim_users.cim_email as "string|cim_email|Email",
          cim_users.cim_is_verified as "bool|cim_is_verified|Is Verified",
          CAST(cim_users.created_at as varchar) as "date|created_at|Created at",
          CAST(cim_users.updated_at as varchar) as "date|updated_at|Updated at"
              FROM cim_users limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], "D");
  let getAlRolesQuery = `SELECT uar_id as value , uar_role_name as  ua_role  FROM public.user_admin_role
    ORDER BY uar_id ASC `;
  let selectOptions = {
    ua_role: await commonModel.getDataOrCount(getAlRolesQuery, [], "D"),
  };
  //  console.log('ua_rolleee',selectOptions)

  returnData.allTr = allTr;
  // returnData.selectOptions = selectOptions;
  return returnData;
};

module.exports = siteUsersModel;
