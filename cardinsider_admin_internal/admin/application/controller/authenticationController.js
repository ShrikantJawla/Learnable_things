const authModel = require("../model/authenticationModel")
const commonHelper = require("../common/helper")
const session = require("express-session")
const commonControllerObj = require("./commonController")

let authObj = {}

authObj.signIn = async function (req, res, next) {
    //console.log(req.session, "SESSION");
    if (req.session && req.session.userToken) {
        let sideBarData = await commonControllerObj.commonSideBarData(req)
        res.render("homeViews/dashboard", { sidebarDataByServer: sideBarData })
    } else {
        res.render("authantication/signIn")
    }
    //res.render("homeViews/dashboard");
}

authObj.signOutData = function (req, res, next) {
    // //console.log("signout session data ===== >>>>>  ", req.session.userToken);
    req.session.destroy()
    let returnData = {
        status: true,
        code: "CIA-SIGNIN-101",
    }

    // //console.log("USER LOGGED OUT .......");

    commonHelper.successHandler(res, returnData)
}

authObj.signinData = async function (req, res, next) {
    // //console.log(`signin data ==================>>>>>>>>>>>>>`, req.body);
    let dataFromDb = await authModel.getUserSignInData(req.body)
    // //console.log("datatatatatatat", dataFromDb);
    let returnData = {
        status: true,
        code: "CIA-SIGNIN-101",
        payload: dataFromDb,
    }
    if (!dataFromDb) {
        returnData.status = false
        returnData.code = "CIA-SIGNIN-ERROR-101"
        commonHelper.errorHandler(res, returnData)
    } else {
        req.session.userToken = dataFromDb
        commonHelper.successHandler(res, returnData)
    }

    //res.send({ data: dataFromDb });
}

module.exports = authObj