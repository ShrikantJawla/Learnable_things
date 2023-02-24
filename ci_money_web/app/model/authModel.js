const http = require("http");
const { pool } = require("../utils/config/database");
const helper = require("../utils/common/helper");
let commonHelper = require("../utils/common/commonHelper");
let mobileOtpHelper = require("../utils/common/mobileOtpHelper");

let modelObj = {};

// sending mobile otp
modelObj.sendVerificationOtp = async function (data, type) {
  let otp;
  let returnData = {
    status: false,
    code: "AUTH_MODEL_ERR_1",
    message: "Error Sending OTP",
  };

  // query to add number and otp into db

  try {
    let query = ``;
    if (type === "mobile") {
      query = `INSERT INTO cim_users (cim_number, cim_number_otp) VALUES ($1, $2) ON CONFLICT (cim_number) DO UPDATE SET cim_number_otp = EXCLUDED.cim_number_otp returning *;`;
      otp = await mobileOtpHelper.generateOtp(data);
    } else if (type === "email") {
      query = `INSERT INTO cim_users (cim_email, cim_email_otp) VALUES ($1, $2) ON CONFLICT (cim_email) DO UPDATE SET cim_email_otp = EXCLUDED.cim_email_otp returning *;`;
    }
    let insertData = await pool.query(query, [data, otp]);
    if (insertData.rows) {
      if (type === "mobile") {
        setTimeout(async () => {
          console.log("executing after 60 seconds");
          await mobileOtpHelper.setOtpToZero(data);
          console.log("executing after 60 seconds after otp set zero");
        }, 60 * 1000);
      }
      returnData.status = true;
      returnData.code = "API-AUTH-SUCCESS-101";
      returnData.message = "OTP Sent Successfully";
    }
  } catch (err) {
    console.log(err);
  }

  return returnData;
};

modelObj.verifyUserOtp = async function (body) {
  let returnData = {
    status: false,
    code: "AUTH_MODEL_ERR_2",
    message: "Invalid OTP",
    payload: "",
  };
  let { data, type, otp } = body;

  let query;
  let userData = {};
  if (type === "mobile") {
    console.log(" i was here");
    query = `SELECT * FROM cim_users WHERE cim_number = '${data}'`;
    try{
      let dataFromDb = await pool.query(query);
      userData = dataFromDb.rows[0];
      console.log(userData);
      if (userData.cim_number_otp == 0) {
        returnData.status = false;
        returnData.code = "AUTH_MODEL_ERR_3";
        returnData.message = "OTP EXPIRED";
        return returnData;
      }
      if (otp == userData.cim_number_otp) {
        await mobileOtpHelper.setOtpToZero(data);
        let userToken = await commonHelper.userToken(
          userData.cim_id,
          userData.cim_name,
          userData.cim_uuid,
          userData.cim_number,
          userData.cim_email,
          userData.cim_is_verified
        );
        returnData.payload = userToken;
        returnData.status = true;
        returnData.code = "AUTH_MODEL_SUCCESS_1";
        returnData.message = "OTP MATCHED";
        return returnData;
      } else {
        returnData.status = false;
        returnData.code = "AUTH_MODEL_ERR_4";
        returnData.message = "INVALID OTP";
        return returnData;
      }
    }catch(err){
      console.log(err)
      return returnData
    }
  }
  return returnData;
};

modelObj.saveUserProlfe = async function (userToken, userData) {
  let returnData = {
    status: false,
    code: "AUTH_MODEL_ERR_2",
    message: "ERROR UPDATING PROFILE",
    payload: "",
  };
  let query;
  if (userToken.email != null) {
    query = `UPDATE cim_users SET cim_name = '${userData.name}', cim_phone = '${userData.phone}' , cim_is_verified = true WHERE cim_id = ${userToken.id} RETURNING *`;
  } else if (userToken.mobile != null) {
    query = `UPDATE cim_users SET cim_name = '${userData.name}', cim_email = '${userData.email}' , cim_is_verified = true WHERE cim_id = ${userToken.id} RETURNING *`;
  }
  try{
    let dataFromDb = await pool.query(query);
    if (dataFromDb) {
      let newUserToken = await commonHelper.userToken(
        dataFromDb.rows[0].cim_id,
        dataFromDb.rows[0].cim_name,
        dataFromDb.rows[0].cim_uuid,
        dataFromDb.rows[0].cim_number,
        dataFromDb.rows[0].cim_email,
        dataFromDb.rows[0].cim_is_verified
      );
      returnData.payload = newUserToken;
      returnData.status = true;
      returnData.code = "AUTH_MODEL_SUCCESS_3";
      returnData.message = "USER PROFILE CREATED";
      return returnData;
    } else {
      returnData.status = false;
      returnData.code = "AUTH_MODEL_ERROR_3";
      returnData.message = "ERROR CREATING USER PROFILE";
      return returnData;
    }
  }catch(err){
    console.log(err)
    return returnData
  }
  
  
};
module.exports = modelObj;
