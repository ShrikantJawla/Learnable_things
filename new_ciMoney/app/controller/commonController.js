const commonModel = require("../model/commonModel");
let commonControllerObj = {}

commonControllerObj.commonSideBarData = async function (req) {

    let allSideBars = await commonModel.getSideBarData()
    // console.log(allSideBars , "allUserDAta");
    let sideBarArray = []
    if (req && req.session && req.session.userToken) {
        let userdata = jwt.decode(req.session.userToken)
        if (userdata && userdata.ua_id) {
            let userLatestRole = await commonModel.getUserAdminRole(
                userdata.ua_id
            );
            if (userLatestRole && userLatestRole.length > 0) {
                let needToCheckPermissions = true
                let currentUserRole = userLatestRole[0].ua_role
                if (currentUserRole == 1) {
                    needToCheckPermissions = false
                }
                // if (currentUserRole == 3) {
                //     needToCheckPermissions = false
                // }
                if (allSideBars.length > 0) {
                    for (let i = 0; i < allSideBars.length > 0; i++) {
                        let checkPermissionData = false
                        if (needToCheckPermissions) {
                            checkPermissionData = await commonModel.checkIsHavePermission(
                                currentUserRole,
                                allSideBars[i].as_id
                            );
                        }
                        if (allSideBars[i].as_is_parent) {
                            let newObj = {}
                            newObj.title = allSideBars[i].as_title
                            newObj.icon = allSideBars[i].as_icon
                            newObj.child = []
                            for (let k = 0; k < allSideBars.length > 0; k++) {
                                let childObj = {}
                                if (allSideBars[k].as_parent_id == allSideBars[i].as_id && !allSideBars[k].as_is_parent) {
                                    childObj.childTitle = allSideBars[k].as_title
                                    childObj.childUrl = allSideBars[k].as_url
                                    if (!needToCheckPermissions) {
                                        newObj.child.push(childObj)
                                    } else if (checkPermissionData) {
                                        if (allSideBars[k].as_permission_of == 'R' && checkPermissionData.uap_access_read) {
                                            newObj.child.push(childObj)
                                        } else if (allSideBars[k].as_permission_of == 'W' && checkPermissionData.uap_access_write) {
                                            newObj.child.push(childObj)
                                        } else if (allSideBars[k].as_permission_of == 'D' && checkPermissionData.uap_access_remove) {
                                            newObj.child.push(childObj)
                                        }
                                    }

                                    if (currentUserRole == 3 && allSideBars[k].as_permission_of == 'T') {
                                        childObj.childTitle = allSideBars[k].as_title
                                        childObj.childUrl = allSideBars[k].as_url
                                        newObj.child.push(childObj)
                                    }

                                }

                            }

                            if (!needToCheckPermissions) {
                                sideBarArray.push(newObj)
                            } else if (checkPermissionData) {
                                if (checkPermissionData.uap_access_status && checkPermissionData.uap_access_read) {
                                    sideBarArray.push(newObj)
                                }
                            }
                            if (currentUserRole == 3 && newObj.child.length > 0) {
                                sideBarArray.push(newObj)
                            }
                        }
                    }
                    // console.log(sideBarArray);
                }
            }
        }
    }

    return sideBarArray
    //res.send(allUserDAta)
}

commonControllerObj.checkAccessPermition = async function (req, moduleId, permissionFor) {
    let returnData = false
    if (req && req.session && req.session.userToken) {
        let userdata = jwt.decode(req.session.userToken)
        if (userdata && userdata.ua_id) {
            let userLatestRole = await commonModel.getUserAdminRole(
                userdata.ua_id
            )
            if (userLatestRole && userLatestRole.length > 0) {
                let currentUserRole = userLatestRole[0].ua_role
                if (currentUserRole == 1) {
                    returnData = true
                } else {
                    let checkPermissionData = await commonModel.checkIsHavePermission(
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
module.exports = commonControllerObj