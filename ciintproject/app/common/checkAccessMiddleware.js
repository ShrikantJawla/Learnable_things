let middleObj = {};
let jwt = require("jsonwebtoken");
let userAdminModel = require("../model/users/userAdminModel");
let commonModel = require("../model/commonModel");

middleObj.checkAccessPermition = async function (req, moduleId, permissionFor) {
  let returnData = false;
  // console.log(req.session, "weghe9n");
  if (req && req.session && req.session.userToken) {
    let userdata = jwt.decode(req.session.userToken);
    if (userdata && userdata.ua_id) {
      let userLatestRole = await commonModel.getUserAdminRole(userdata.ua_id);
      //console.log(userLatestRole, "user latest role");
      if (userLatestRole && userLatestRole.length > 0) {
        let currentUserRole = userLatestRole[0].ua_role;
        if (currentUserRole == 1) {
          returnData = true;
        } else if (currentUserRole == 3 && permissionFor == "T") {
          returnData = true;
        } else {
          //console.log(moduleId, "moduleid ---- ", currentUserRole, "------ currentuserrole");

          let checkPermissionData = await commonModel.checkIsHavePermission(
            currentUserRole,
            moduleId
          );
          // console.log(checkPermissionData, "chedeojmo");
          if (checkPermissionData && permissionFor != "") {
            if (checkPermissionData.uap_access_status) {
              if (permissionFor == "R" && checkPermissionData.uap_access_read) {
                returnData = true;
              } else if (
                permissionFor == "W" &&
                checkPermissionData.uap_access_write
              ) {
                returnData = true;
              } else if (
                permissionFor == "D" &&
                checkPermissionData.uap_access_remove
              ) {
                returnData = true;
              }
            }
          }
        }
      }
    }
  }
  return returnData;
};

module.exports = middleObj;
