let middleObj = {}
const commonHelper = require("../common/helper")
let jwt = require("jsonwebtoken")
let userAdminModel = require("../model/userAdminModel")



middleObj.checkTheLoginStatus = function (req, res, next) {
    if (!req.session || !req.session.userToken) {
        res.redirect("sign-in")
    } else {
        next()
    }
}

middleObj.checkTheLoginStatusForAjax = function (req, res, next) {
    if (!req.session || !req.session.userToken) {
        commonHelper.errorHandler(res, {
            status: false,
            message: "authentication error",
            code: "CIA-AUTH-101",
        })
    } else {
        next()
    }
}

middleObj.checkThePermition = async function (req, res, next) {
    if (req.session && req.session.userToken) {
        let userdata = jwt.decode(req.session.userToken)
        if (userdata && userdata.ua_id) {
            let userLatestRole = await userAdminModel.getUserAdminRole(
                userdata.ua_id
            )
            if (userLatestRole && userLatestRole.length > 0) {
                let currentUrl = req.url
                let stringUrl = currentUrl.split("?")
                console.log(stringUrl, "stringUrlstringUrl")
                //console.log()
                currentUrl = stringUrl[0]
                let checkPermission = await userAdminModel.checkIsHavePermission(
                    userLatestRole[0].ua_role,
                    currentUrl
                )
                console.log(checkPermission, "checkPermissioncheckPermission")
                if (checkPermission) {
                    next()
                } else {
                    commonHelper.errorHandler(res, {
                        status: false,
                        message: "Permission denied",
                        code: "CIA-AUTH-105",
                    })
                }
                //console.log(currentUrl , 'currentUrlcurrentUrl');
            } else {
                commonHelper.errorHandler(res, {
                    status: false,
                    message: "authentication error",
                    code: "CIA-AUTH-104",
                })
            }
        } else {
            commonHelper.errorHandler(res, {
                status: false,
                message: "authentication error",
                code: "CIA-AUTH-103",
            })
        }
    } else {
        commonHelper.errorHandler(res, {
            status: false,
            message: "authentication error",
            code: "CIA-AUTH-102",
        })
    }
}

middleObj.checkAccessPermition = async function (req, moduleId, permissionFor) {
    let returnData = false
    if (req && req.session && req.session.userToken) {
        let userdata = jwt.decode(req.session.userToken)
        if (userdata && userdata.ua_id) {
            let userLatestRole = await userAdminModel.getUserAdminRole(
                userdata.ua_id
            )
            if (userLatestRole && userLatestRole.length > 0) {
                let currentUserRole = userLatestRole[0].ua_role
                if (currentUserRole == 1) {
                    returnData = true
                } else {
                    let checkPermissionData = await userAdminModel.checkIsHavePermission(
                        currentUserRole,
                        moduleId
                    )
                    if (checkPermissionData && permissionFor != '') {
                        if (checkPermissionData.uap_access_status) {
                            if (permissionFor == 'R' && checkPermissionData.uap_access_read) {
                                returnData = true
                            } else if (permissionFor == 'W' && checkPermissionData.uap_access_write) {
                                returnData = true
                            } else if (permissionFor == 'D' && checkPermissionData.uap_access_remove) {
                                returnData = true
                            }
                        }
                    }
                }

            }
        }
    }
    return returnData
}


// middleObj.uploadFileTOStorage = async function (req, res, next) {
//     console.log(req.body);
//     let storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, basePath + '/public/uploads/');
//         },
//         filename: function (req, file, cb) {
//             cb(null, Date.now() + file.originalname);
//         }
//     });
//     const fileFitler = function (req, file, cb) {
//         if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg') {
//             cb(null, true);
//         } else {
//             cb(null, false);
//         }
//     }
//     let upload = multer({ storage: storage, fileFilter: fileFitler });
//     return upload;
// }



module.exports = middleObj