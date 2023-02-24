const { pool } = require("../../../configration/database")
const bcrypt = require("bcrypt")
const res = require("express/lib/response")

let authModel = {}

authModel.getUserSignInData = async function (reqData) {
    let resultData = {} 
    let returnData = false
    const hashSalt = await bcrypt.genSalt(6)
    let clientPassword = await bcrypt.hash(reqData.password, hashSalt)
    //console.log("original pasword", reqData.password);
    //console.log("ivgiu  ....>>>>", clientPassword);

    let queryEmail = reqData.email
    let query = `SELECT * from "user_admin" where "ua_email" = '${queryEmail}'`
    try {
        let queryData = await pool.query(query)
        //console.log("queryData==>>>>", queryData);
        resultData = queryData.rows[0]
    } catch (err) {
        //console.log(err);
    }
    //console.log("rData", resultData);
    if (resultData != undefined) {

       // console.log(resultData, "result data in line 25");
        if(resultData.active_user){

            const validPassword = await bcrypt.compare(
                reqData.password,
                resultData.ua_password
            );
            //console.log("valid password", validPassword);
            if (validPassword) {
                //console.log("successs hurahhaahaaaa");
                const token = jwt.sign({
                    ua_id: resultData.ua_id,
                    ua_name: resultData.ua_name,
                    ua_email: resultData.ua_email,
                    ua_role: resultData.ua_role,
                    ua_strapi: resultData.strapi_user_id,
                    created_by: resultData.created_by
    
                }, process.env.JWTSECRET, {
                    expiresIn: process.env.JWTEXPIRESIN
                })
               // console.log({jwtToken: token});
                returnData = token
            }
        }

       
    }
    return returnData
}



module.exports = authModel