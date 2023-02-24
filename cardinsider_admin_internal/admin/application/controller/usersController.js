const userModel = require("../model/userModel")
const commonControllerObj = require("./commonController")
const commonHelper = require("../common/helper")
const middleWearObj = require("../common/middleware")
const userModelObj = require("../model/userModel")
let userControllerObj = {}

userControllerObj.getAllCiUsersAjax = async function (req, res, next) {
    let allUserDAta = await userModel.fetchCiUsers();
    console.log('hi i am back');
    res.send(allUserDAta)
}

userControllerObj.getCiUsers = async function (req, res, next) {
    let allCiUsersData = await userModel.fetchCiUsers()

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, 'R')
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("users/ciUsersList", { ciUsersList: allCiUsersData, sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }


}

userControllerObj.getFilteredCiUsers = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, "R")
    if (middleWearObjRes) {
        let { returnDataFromModal, count } = await userModel.getFilteredCiUsers(req.body)
        let returnData = {
            status: true,
            code: 'CIA-APP-FILTERED-CI-USER-S-101',
            payload: {
                ciUsersList: returnDataFromModal,
                count,
            }
        }

        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
userControllerObj.getExistingCiUserByIdUI = async function (req, res, next) {
    let isIntresult = commonHelper.checkIsInt(req.query.id);
    if (req.query.id && isIntresult) {
        let returnDataFromModel = await userModel.fetchCiUserById(
            parseInt(req.query.id)
        )
        if (req.query.html === "false") {
            let returnData = {
                status: true,
                code: 'CI-APP-EXISTING-CI-USER-UI-101',
                payload: {
                    ciUserDetail: returnDataFromModel,
                }
            }
            commonHelper.successHandler(res, returnData)
        } else {
            if (returnDataFromModel === null) {
                let returnData = {
                    status: false,
                    message: "No record Found",
                    code: 'CI-APP-EXISTING-CI-USER-UI-ERROR-101',
                }
                commonHelper.errorHandler(res, returnData, 404)
            } else {
                let middleWearObjRes = await middleWearObj.checkAccessPermition(
                    req,
                    7,
                    "W"
                )
                if (middleWearObjRes) {
                    let sideBarData = await commonControllerObj.commonSideBarData(req)
                    res.status(200).render("users/editCiUser", {
                        ciUserDetail: returnDataFromModel,
                        sidebarDataByServer: sideBarData,
                    })
                } else {
                    res.render("error/noPermission")
                }
            }
        }
    } else {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        let returnData = {
            status: false,
            message: "Please provide an Id",
            code: 'CI-APP-EXISTING-CI-USER-UI-ERROR-102',
            payload: {
                errMessage: "Please provide an Id",
                sidebarDataByServer: sideBarData,
            }
        }
        commonHelper.errorHandler(res, returnData, 404)
    }

}
userControllerObj.updateCiUserById = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, "W")
    if (middleWearObjRes) {
        if (!req.query.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: 'CI-APP-UPDATEOFFER-ERROR-101',
            }
            commonHelper.errorHandler(res, returnData, 400)
        } else {
            let rr = await userModelObj.updateCiUserById(req.query.id, req.body.ciUser, userdata.ua_strapi)
            console.log(rr)
            if (rr === 'success') {
                let returnData = {
                    status: true,
                    code: 'CI-APP-UPDATEOFFER-101',
                    payload: {}
                }
                commonHelper.successHandler(res, returnData)
            }
            else {
                let returnData = {
                    status: false,
                    message: "Please provide an id",
                    code: 'CI-APP-UPDATEOFFER-ERROR-102',
                }
                commonHelper.errorHandler(res, returnData, 400)
            }
        }

    }
    else {
        res.render("error/noPermission")
    }

}
userControllerObj.deleteCiUserById = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, "D")
    if (middleWearObjRes) {
        if (!req.params.id) {
            let returnData = {
                status: false,
                message: "Please provide an id",
                code: "CIA-APP-DELETE-CI-USER--ERROR-101",
                payload: {}
            }
            commonHelper.errorHandler(res, returnData, 400)
        }
        else {
            let ciUserId = req.params.id
            let returnData = {
                status: true,
                code: "CIA-APP-DELETE-CI-USER--101",
                payload: {},
            }
            await userModel.deleteCiUserById(ciUserId)
            commonHelper.successHandler(res, returnData)
        }
    }
    else {
        res.render("error/noPermission")
    }
}








userControllerObj.getInternalUsers = async function (req, res, next) {
    // //console.log("Hi im in this ")
    let returnData = await userModel.fetchInternalUsers()

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, 'R')
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("users/internalUsersList", { internalUserslist: returnData, sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }



}
userControllerObj.getAccountDetails = async function (req, res, next) {
    let returnData = await userModel.fetchAccountInformations()

    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, 'R')
    if (middleWearObjRes) {
        //console.log("hey im in permission role ");
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("users/accountDetails", { userAccountsList: returnData, sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}


userControllerObj.getCardApplicationsForRelation = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, "R")
    if (middleWearObjRes) {
        let dataFromDb = await userModelObj.getCardApplicationsForRelation()
        let returnData = {
            status: true,
            code: "CIA-APP-CARDAPPLICATIONSFORRELATION-101",
            payload: dataFromDb,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
userControllerObj.getRefferalNamesForRelation = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 7, "R")
    if (middleWearObjRes) {
        let dataFromDb = await userModelObj.getRefferalNamesForRelation()
        let returnData = {
            status: true,
            code: "CIA-APP-REFFERALNAMESFORRELATION-101",
            payload: dataFromDb,
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}

module.exports = userControllerObj