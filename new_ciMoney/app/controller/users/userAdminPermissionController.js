
let userAdminModel = require('../../model/users/userAdminPermissionModel');
let commonHelper = require('../../common/helper');

let commonController = require("../../controller/commonController");
let accessMiddleware = require('../../common/checkAccessMiddleware');
const { async } = require('q');

let controllerObj = {};

/* This is a function which is used to render the userAdminPermissions page. */

controllerObj.getUserAdminPermissionUi = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 47, "W")
	if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
	res.render("users/userAdminPermissions", {sidebarDataByServer : sideBarData});
	} else {
		res.render("error/noPermission");
	}

}

/* This is a function which is used to get all the permissions from the database. */
controllerObj.getAllPermissionsData = async function (req, res, next) {
    let dataFromDb = await userAdminModel.getAllPermissions(req.body);
    // console.log(dataFromDb, "oiî---------------------- ");
   


	let middleObj = await accessMiddleware.checkAccessPermition(req, 47, "W")
	if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
	res.render("users/userPermissionTable", {allPermissions: dataFromDb ,sidebarDataByServer : sideBarData});
	} else {
		res.render("error/noPermission");
	}
   
}


/* This is a function which is used to add new permission in the database. */
controllerObj.postNewPermission = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-101",
        payload: [],
    }

    if (req.body.permissionUrl) {
        //console.log(req.body, "request body here");
        let url = req.body.permissionUrl
       // console.log("url here ...", url);

        let dataFromDb = await userAdminModel.addNewUrlInPermission(url)
        returnData.status = true
        returnData.code = "CIA-APP-USERADMINPANEL-101"
        returnData.payload = dataFromDb
        commonHelper.successHandler(res, returnData)
    } else {
        commonHelper.errorHandler(res, returnData)
    }
}



controllerObj.updatePermissionDataController = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-101",
        payload: [],
    }
    //console.log(req.body);
    if (req && req.body && req.body.permissionId) {
        let dataBody = req.body
        //let dataFromDb = {};
        let dataFromDb = await userAdminModel.updatePermissionData({
            permissionId: dataBody.permissionId,
            pStatus: dataBody.pStatus,
            rStatus: dataBody.rStatus,
            wStatus: dataBody.wStatus,
            dStatus: dataBody.dStatus,
            url: dataBody.permissionUrl,
        })
        if (dataFromDb.status) {
            returnData.status = true
            returnData.code = "CIA-APP-USERADMINPANEL-102"
            commonHelper.successHandler(res, returnData)
        } else {
            returnData.code = "ERROR-CIA-APP-USERADMINPANEL-102"
            commonHelper.errorHandler(res, returnData)
        }
    } else {
        returnData.code = "ERROR-CIA-APP-USERADMINPANEL-103"
        commonHelper.errorHandler(res, returnData)
    }
}

controllerObj.getUserManagePermission = async function(req, res, next){

	let middleObj = await accessMiddleware.checkAccessPermition(req, 47, "W")

	if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req);
        let dataFromDb = await userAdminModel.getDataInEditTeamsBankAccess();
        console.log(dataFromDb, "data from db");
	res.render("users/manageTeleAccess", {allData: dataFromDb ,sidebarDataByServer : sideBarData, });
	} else {
		res.render("error/noPermission");
	}
   
}



module.exports = controllerObj;