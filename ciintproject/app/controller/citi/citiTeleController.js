
let commonHelper = require("../../common/helper")
let accessMiddleware = require('../../common/checkAccessMiddleware')
let commonController = require("../commonController")
let citiTeleApplicationsModel = require('../../model/citi/citiTeleModel')
let controllerObj = {}

/* This is a function which is used to render the teleLeadsUi page. */
controllerObj.teleLeadsUi = async function (req, res, next) {
    let middleObj = await accessMiddleware.checkAccessPermition(req, 10, "T")
    if (middleObj) {
        let sideBarData = await commonController.commonSideBarData(req)
        res.render('citi/citiTeleLeads', { sidebarDataByServer: sideBarData })
    } else {
        res.render("error/noPermission")
    }
}
controllerObj.getTeleApplicationsAjax = async function (req, res, next) {
    let userdata = jwt.decode(req.session.userToken)
    let finalData = {
        status: false,
        code: "CIP-APPLICATION-ERR-102",
        message: "Something went wrong",
        payload: []
    }
    //console.log(req.body, "hi im in controller")



    let dataFromDb = await citiTeleApplicationsModel.getFilteredCitiApplications(req.body, userdata.ua_id)
    // //console.log(dataFromDb, "data from db")


    if (dataFromDb) {
        //log(finalData, "final data in if");
        finalData.status = true
        finalData.code = "CIP-CITI-APPLICATION-SUC-102"
        finalData.message = "Operation performed successfully"
        finalData.payload = dataFromDb
        ////console.log(finalData, "final data");
        commonHelper.successHandler(res, finalData)

    } else {
        //console.log(finalData, "final data in else")
        commonHelper.errorHandler(res, finalData,)
    }
}

module.exports = controllerObj