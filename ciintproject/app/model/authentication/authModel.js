//////////////////// IMPORTS HERE.......///////////////////////////////////////

const { pool } = require('../../utils/configs/database');

const bcrypt = require('bcrypt');

///////////////////////////////////////

let authModel = {};


authModel.getUserSignInData = async function (reqData) {

	let resultData = {};
	let returnData = false;
	const hashSalt = await bcrypt.genSalt(6);
	let clientPassword = await bcrypt.hash(reqData.password, hashSalt);

	let queryEmail = reqData.email;
	let dbQuery = `SELECT * from user_admin where ua_email = '${queryEmail}'`;

	try {
		let queryData = await pool.query(dbQuery);
		
		resultData = queryData.rows[0];
		console.log(queryData.rows , "queryDataqueryData");

	} catch (err) {
		console.error(err);
	}

	if (resultData != undefined) {

		if (resultData.active_user) {

			const validPassword = await bcrypt.compare(reqData.password, resultData.ua_password);
			if (validPassword) {

				const token = jwt.sign({
					ua_id: resultData.ua_id,
					ua_name: resultData.ua_name,
					ua_email: resultData.ua_email,
					ua_role: resultData.ua_role,
					ua_telenumber: resultData.ua_tele_number
				}, process.env.JWTSECRET, {
					expiresIn: process.env.JWTEXPIRESIN
				})

				returnData = token;
			}

		}

	}

	return returnData;

}

authModel.getFormFilledCounts = async function (reqData) {
	let returnData = {};
	
	return returnData;
}

authModel.getAppliedCounts = async function (reqData) {
	let returnData = {};
	
	return returnData;
}

authModel.commonQuery = async function (sqlQuery) {
	let /* Returning the data to the controller. */
		returnData = false;
	try {
		let queryData = await pool.query(sqlQuery);
		return queryData;

	} catch (err) {
		return returnData;
	}

}

module.exports = authModel;