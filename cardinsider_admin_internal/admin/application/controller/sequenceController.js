// let sequenceModel = require("../model/sequenceModel")
const commonHelper = require("../common/helper")
const commonControllerObj = require("./commonController")
const middleWearObj = require("../common/middleware")
const sequenceModel = require('../model/sequenceModel')
let sequenceControllerObject = {}

sequenceControllerObject.cardIssuerSequenceUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("sequences/cardIssuerSequence", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.creditCardSequenceUI = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "R")
    if (middleWearObjRes) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("sequences/creditCardSequence", {
            sidebarDataByServer: sideBarData,
        })
    } else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.getCardIssuersWithApplyNow = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "R")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.getCardIssuersApplySequenceWithApplyNow()
        let returnData = {
            status: true,
            code: 'CIA-APP-CI-APPLY-SEQUENCE-101',
            payload: {
                cardIssuersList: returnDataFromModel,
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.getCreditCardsWithApplyNow = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "R")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.getCreditCardsApplySequenceWithApplyNow()
        let returnData = {
            status: true,
            code: 'CIA-APP-CC-APPLY-SEQUENCE-101',
            payload: {
                creditCardsList: returnDataFromModel,
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.getCardIssuersSequence = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "R")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.getCardIssuerWithSequence()
        let returnData = {
            status: true,
            code: 'CIA-APP-CI-SEQUENCE-101',
            payload: {
                cardIssuersList: returnDataFromModel,
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.getCreditCardsSequenceByCardIssuer = async function (req, res, next) {
    console.log("RAfwsw", req.body)
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "R")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.getCreditCardsSequenceByCardIssuer(req.body.cardIssuer)
        let returnData = {
            status: true,
            code: 'CIA-APP-CI-SEQUENCE-101',
            payload: {
                creditCardsList: returnDataFromModel,
            }
        }
        commonHelper.successHandler(res, returnData)
    }
    else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.updateCardIssuersSequence = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.updateCardIssuerSequence(req.body)
        if (returnDataFromModel) {
            let returnData = {
                status: true,
                code: 'CIA-APP-UPDATE-CI-SEQUENCE-101',
            }
            commonHelper.successHandler(res, returnData)
        }
        else {
            let returnData = {
                status: false,
                code: 'CIA-APP-UPDATE-CI-SEQUENCE-ERROR-101',
                message: "Some error occurred. Please try again later."
            }
            commonHelper.errorHandler(res, returnData)
        }
    }
    else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.updateCreditCardsApplySequence = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.updateCreditCardsApplySequence(req.body)
        if (returnDataFromModel) {
            let returnData = {
                status: true,
                code: 'CIA-APP-UPDATE-CC-APPLY-SEQUENCE-101',
            }
            commonHelper.successHandler(res, returnData)
        }
        else {
            let returnData = {
                status: false,
                code: 'CIA-APP-UPDATE-CC-APPLY-SEQUENCE-ERROR-101',
                message: "Some error occurred. Please try again later."
            }
            commonHelper.errorHandler(res, returnData)
        }
    }
    else {
        res.render("error/noPermission")
    }
}
sequenceControllerObject.updateCreditCardsSequence = async function (req, res, next) {
    let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 9, "W")
    if (middleWearObjRes) {
        let returnDataFromModel = await sequenceModel.updateCreditCardsSequence(req.body)
        if (returnDataFromModel) {
            let returnData = {
                status: true,
                code: 'CIA-APP-UPDATE-CC-SEQUENCE-101',
            }
            commonHelper.successHandler(res, returnData)
        }
        else {
            let returnData = {
                status: false,
                code: 'CIA-APP-UPDATE-CC-SEQUENCE-ERROR-101',
                message: "Some error occurred. Please try again later."
            }
            commonHelper.errorHandler(res, returnData)
        }
    }
    else {
        res.render("error/noPermission")
    }
}
module.exports = sequenceControllerObject