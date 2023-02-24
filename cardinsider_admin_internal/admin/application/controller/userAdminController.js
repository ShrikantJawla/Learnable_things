const userAdminModel = require("../model/userAdminModel")
const commonHelper = require("../common/helper")
const session = require("express-session")
const helperObj = require("../common/helper")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")

let userAdminObj = {}

// User admins here.....

userAdminObj.userAdminList = async function (req, res, next) {
    // res.render("userAdmin/userAdminList", { sidebarDataByServer: sideBarData });

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 8, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("userAdmin/userAdminList", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

userAdminObj.getUserAdminData = async function (req, res, next) {
    let dataFromDb = await userAdminModel.getUserAdminAllData(req.body)
    res.render("userAdmin/userAdminTable", { adminUserList: dataFromDb })
}

userAdminObj.addNewAdminUser = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-106",
        payload: [],
    }
    let dataFromDb = false
   // console.log("admin request data-----", req.body);
    if (
        req.body.UApassword &&
        req.body.UAuserName &&
        req.body.UAuserEmail &&
        req.body.UAuserRole &&
        req.body.UAstrapiId &&
        req.body.UAactiveUser
    ) {
        dataFromDb = await userAdminModel.addNewAdminUser(
            req.body.UApassword,
            req.body.UAuserName,
            req.body.UAuserEmail,
            req.body.UAuserRole,
            req.body.UAstrapiId,
            1,
            req.body.UAactiveUser,
        )
    }

    if (dataFromDb == false) {
        commonHelper.errorHandler(res, returnData)
    } else {
        (returnData.status = true),
            (returnData.code = "CIA-APP-USERADMINPANEL-106"),
            (payload = dataFromDb)
        commonHelper.successHandler(res, returnData)
    }
}

userAdminObj.updateAdminUser = async function (req, res, next) {
   // console.log(req.body);
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-107",
        payload: [],
    }
    let dataFromDb = false
    if (req.body.ua_id) {
       // console.log(req.body)
        let updateData = {
            password: req.body.ua_password ? req.body.ua_password : "",
            name: req.body.ua_name,
            email: req.body.ua_email,
            userRole: req.body.ua_role,
            userStrapiId: req.body.ua_strapi_user_id,
            userActiveUser: req.body.ua_active_user,
        
        }
        //console.log("hi im in ua id");
        dataFromDb = await userAdminModel.updateAdminUser(
            req.body.ua_id,
            updateData
        )
        //console.log(dataFromDb, "datafrom db");
    }
    if (dataFromDb == false) {
        //console.log("hi im in this if");
        commonHelper.errorHandler(res, returnData)
    } else {
        //console.log("hi im in this else");
        (returnData.status = true),
            (returnData.code = "CIA-APP-USERADMINPANEL-107"),
            (payload = dataFromDb)
        commonHelper.successHandler(res, returnData)
    }
}

//admin roles here.....

userAdminObj.getUserAdminRolesPageUi = async function (req, res, next) {
    let sideBarData = await commonControllerObj.commonSideBarData(req)
    res.render("userAdmin/userAdminRoles", { sidebarDataByServer: sideBarData })
}

userAdminObj.getUserAdminRoles = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-105",
        payload: [],
    }

    let dataFromDb = await userAdminModel.getUserAdminroles()
    if (dataFromDb.length > 0) {
        returnData.status = true
        returnData.code = "CIA-APP-USERADMINPANEL-105"
        returnData.payload = dataFromDb
        commonHelper.successHandler(res, returnData)
    } else {
        commonHelper.errorHandler(res, returnData)
    }
}

// Permissions here.......

userAdminObj.getAllPermissions = async function (req, res, next) {
    //  await userAdminModel.updatePermissionData({permissionId : 3 , pStatus : false});
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 8, "W")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        // await userAdminModel.addNewRole('Editor 5');
        res.render("userAdmin/allPermissions", { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}

userAdminObj.getAllPermissionsData = async function (req, res, next) {
    let dataFromDb = await userAdminModel.getAllPermissions(req.body)
    res.render("userAdmin/userPermissionTable", { allPermissions: dataFromDb })
}

userAdminObj.updatePermissionDataController = async function (req, res, next) {
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

userAdminObj.postNewPermission = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-101",
        payload: [],
    }

    if (req.body.permissionUrl) {
        //console.log(req.body, "request body here");
        let url = req.body.permissionUrl
        //console.log("url here ...", url);

        let dataFromDb = await userAdminModel.addNewUrlInPermission(url)
        returnData.status = true
        returnData.code = "CIA-APP-USERADMINPANEL-101"
        returnData.payload = dataFromDb
        commonHelper.successHandler(res, returnData)
    } else {
        commonHelper.errorHandler(res, returnData)
    }
}

userAdminObj.removePermission = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-104",
        payload: [],
    }
    if (req.body.removeId && req.body.removeId != "") {
        let dataFromDb = await userAdminModel.removePermission(req.body.removeId)
        //console.log(dataFromDb, "data from remove p ");
        returnData.status = true
        returnData.code = "CIA-APP-USERADMINPANEL-104"
        returnData.payload = dataFromDb
        commonHelper.successHandler(res, returnData)
    } else {
        commonHelper.errorHandler(res, returnData)
    }
}

userAdminObj.addNewRole = async function (req, res, next) {
    let returnData = {
        status: false,
        code: "ERROR-CIA-APP-USERADMINPANEL-105",
        payload: [],
    }
    if (req && req.body && req.body.roleName) {
        let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 8, "W")
        if (middleWearObjRes) {
            let addRole = await userAdminModel.addNewRole(req.body.roleName)
            if (addRole.status) {
                returnData.status = true
                returnData.code = "CIA-APP-USERADMINPANEL-105"
                returnData.payload = addRole
                commonHelper.successHandler(res, returnData)
            } else {
                returnData.code = 'ERROR-CIA-APP-USERADMINPANEL-PERMISSION-DENIED-107'
                returnData.payload = addRole
                commonHelper.errorHandler(res, returnData)
            }

        } else {
            returnData.code = 'ERROR-CIA-APP-USERADMINPANEL-PERMISSION-DENIED-106'
            commonHelper.errorHandler(res, returnData)
        }

    } else {
        commonHelper.errorHandler(res, returnData)
    }

}

module.exports = userAdminObj