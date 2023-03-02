///////////////////////////////Imports here ......... ///////////////////////////////
const session = require("express-session");
const commonHelper = require("../../common/helper");
const authModel = require("../../model/authentication/authModel");
let commonController = require("../../controller/commonController");
const factoryModel = require("../../model/factoryModel");

///////////////////////////////
let authControllerObj = {};

authControllerObj.signInUi = async function (req, res, next) {
  if (req.session && req.session.userToken) {
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("home/dashboard.ejs", { sidebarDataByServer: sideBarData});
  } else {
    res.render("home/signIn");
  }
};

authControllerObj.signOutData = function (req, res, next) {
  req.session.destroy();
  let returnData = {
    status: true,
    code: "CIA-SIGNIN-101",
  };

  commonHelper.successHandler(res, returnData);
};

authControllerObj.signinData = async function (req, res, next) {
  let dataFromDb = false;
  let returnData = {
    status: true,
    code: "CIA-SIGNIN-101",
    payload: dataFromDb,
  };

  dataFromDb = await authModel.getUserSignInData(req.body);
  console.log(dataFromDb , "dataFromDbdataFromDb");
  let time = new Date();
  let current_hour = time.getHours();
  
  // if(current_hour >= 12){
  //   let dailyPunchIn = await factoryModel.updatePunchOutStatus();
  // }else{
  //   console.log("Before 6 PM")
  // }

  if (!dataFromDb) {
    returnData.status = false;
    returnData.code = "CIA-SIGNIN-ERROR-101";
    commonHelper.errorHandler(res, returnData);
  } else {
    req.session.userToken = dataFromDb;
    commonHelper.successHandler(res, returnData);
  }

  //res.send({ data: dataFromDb });
};

module.exports = authControllerObj;
