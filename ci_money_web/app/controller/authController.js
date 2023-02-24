const authModel = require("../model/authModel");
const helper = require("../utils/common/helper");
const jwt = require("jsonwebtoken")
let authControllerObj = {};

// controller to render login page
authControllerObj.renderLoginPage = async function (req, res, next) {
  console.log(req.body)
  if(req.loggedUser){
    res.render("/")
  }else{
    res.render("auth/login");
  }
  
};

// controller to send verify login data and send otp
authControllerObj.sendLoginOtp = async function (req, res, next) {
  let returnData = {
    status: false,
    code: "API-AUTH-ERROR-101",
    message: "Something Went Wrong",
  };
  console.log(req.body)
  let { data, dataType } = req.body;

  if (data.length && dataType.length > 0) {
    let returnDataFromModel = await authModel.sendVerificationOtp(
      data,
      dataType
    );

    if (returnDataFromModel.status == true) {
      returnData.status = returnDataFromModel.status;
      returnData.code = returnDataFromModel.code;
      returnData.message = returnDataFromModel.message;
      helper.successHandler(res, returnData, 200);
    } else {
      returnData.status = returnDataFromModel.status;
      returnData.code = returnDataFromModel.code;
      returnData.message = returnDataFromModel.message;
      helper.errorHandler(res, returnData, 400);
    }
  } else {
    helper.errorHandler(res, returnData, 400);
  }
};

authControllerObj.verifyLoginOtp = async function(req, res, next){
  let returnData = {
		status: false,
		code: "API-AUTH-ERROR-102",
		message: "Data Missing",
	}
  if(req.body.data.length > 0 && req.body.otp.length === 6 && req.body.type.length > 0){
    let returnDataFromModel = await authModel.verifyUserOtp(req.body);
    if (returnDataFromModel.status == true) {
      returnData.status = returnDataFromModel.status;
      returnData.code = returnDataFromModel.code;
      returnData.message = returnDataFromModel.message;
      req.session.userToken = returnDataFromModel.payload;
      helper.successHandler(res, returnData, 200);
    } else {
      returnData.status = returnDataFromModel.status;
      returnData.code = returnDataFromModel.code;
      returnData.message = returnDataFromModel.message;
      helper.errorHandler(res, returnData, 400);
    }
  }else{
    helper.errorHandler(res, returnData, 400);
  }
}

authControllerObj.completeUserProfile = async function(req, res, next){
  let returnData = {
    status : false,
    code : "API-AUTH-ERROR-103",
    message : "Error Completing Profle"
  }

  let userToken = jwt.decode(req.session.userToken);
  let userData = req.body;
  
  let dataFromModel = await authModel.saveUserProlfe(userToken, userData);
  
  if (dataFromModel.status == true) {
    returnData.status = dataFromModel.status;
    returnData.code = dataFromModel.code;
    returnData.message = dataFromModel.message;
    req.session.userToken = dataFromModel.payload;
    helper.successHandler(res, returnData, 200);
  } else {
    returnData.status = dataFromModel.status;
    returnData.code = dataFromModel.code;
    returnData.message = dataFromModel.message;
    helper.errorHandler(res, returnData, 400);
  }
}

module.exports = authControllerObj;
