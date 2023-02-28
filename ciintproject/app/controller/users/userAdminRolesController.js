let commonHelper = require("../../common/helper");
let userAdminrolesModel = require("../../model/users/userAdminRolesModel");


let commonController = require("../../controller/commonController");
let accessMiddleware = require('../../common/checkAccessMiddleware');

let controllerObj = {};


controllerObj.getUserAdminRolesUi = async function (req, res, next) {



    let middleObj = await accessMiddleware.checkAccessPermition(req, 47, "W")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);

        res.render("users/userAdminRoles", { sidebarDataByServer: sideBarData });
    } else {
        res.render("error/noPermission");
    }
}



controllerObj.getUserAdminRolesAjax = async function (req, res, next) {
    //console.log("getUserAdminRolesAjax");
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-105",
        payload: [],
    }

    let dataFromDb = await userAdminrolesModel.getUserRoles();
    if (dataFromDb.length > 0) {
        returnData.status = true
        returnData.code = "CIA-APP-USERADMINPANEL-105"
        returnData.payload = dataFromDb
        commonHelper.successHandler(res, returnData)
    } else {
        commonHelper.errorHandler(res, returnData)
    }
}


controllerObj.addNewUserAdminRole = async function (req, res, next) {
    console.log("addNewUserAdminRole");
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-105",
        payload: [],
    }
    if (req && req.body && req.body.roleName) {
        let addRole = await userAdminrolesModel.addNewRole(req.body.roleName);
        if (addRole.status) {
            returnData.status = true
            returnData.code = "CIA-APP-USERADMINPANEL-105";
            returnData.payload = addRole;
            commonHelper.successHandler(res, returnData);
        } else {
            returnData.code = 'ERROR-CIA-APP-USERADMINPANEL-PERMISSION-DENIED-107';
            returnData.payload = addRole;
            commonHelper.errorHandler(res, returnData);
        }



    } else {
        commonHelper.errorHandler(res, returnData)
    }

}

module.exports = controllerObj;