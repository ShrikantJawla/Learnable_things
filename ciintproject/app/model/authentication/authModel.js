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
	let dbQuery = `SELECT *  from user_admin where ua_email = $1`;

	try {
		let queryData = await pool.query(dbQuery, [queryEmail]);
		
		resultData = queryData.rows[0];
		
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
	let allFormFilled = `SELECT Count(*) FROM public.card_applications_main_table where array_length(form_filled_array, 1) is NOT NULL;`;
	let axisFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'axis' = any(form_filled_array) `;
	let bobFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'bob' = any(form_filled_array) `;
	let idfcFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'idfc' = any(form_filled_array) `;
	let auFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'aubank' = any(form_filled_array) `;
	let yesFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'yesbank' = any(form_filled_array) `;
	let hitForCountAll = await authModel.commonQuery(allFormFilled);
	let hitForCountAxis = await authModel.commonQuery(axisFormFilled);
	let hitForCountBob = await authModel.commonQuery(bobFormFilled);
	let hitForCountIdfc = await authModel.commonQuery(idfcFormFilled);
	let hitForCountAu = await authModel.commonQuery(auFormFilled);
	let hitForCountYes = await authModel.commonQuery(yesFormFilled);
	if (hitForCountAll){
		returnData.allCount = hitForCountAll.rows[0].count;
		
	}
	if (hitForCountAxis){
		returnData.axis = hitForCountAxis.rows[0].count;
	}
	if (hitForCountBob){
		returnData.bob = hitForCountBob.rows[0].count;
	}
	if (hitForCountIdfc){
		returnData.idfc = hitForCountIdfc.rows[0].count;
	}
	if (hitForCountAu){
		returnData.au = hitForCountAu.rows[0].count;
	}
	if (hitForCountYes){
		returnData.yesBank = hitForCountYes.rows[0].count;
	}
	return returnData;
}

authModel.getAppliedCounts = async function (reqData) {
	let returnData = {};
	let allFormFilled = `SELECT Count(*) FROM public.card_applications_main_table where array_length(banks_applied_array, 1) is NOT NULL;`;
	let axisFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'axis' = any(banks_applied_array) `;
	let bobFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'bob' = any(banks_applied_array) `;
	let idfcFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'idfc' = any(banks_applied_array) `;
	let auFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'aubank' = any(banks_applied_array) `;
	let yesFormFilled = ` SELECT Count(*) FROM public.card_applications_main_table where 'yesbank' = any(banks_applied_array) `;
	let hitForCountAll = await authModel.commonQuery(allFormFilled);
	let hitForCountAxis = await authModel.commonQuery(axisFormFilled);
	let hitForCountBob = await authModel.commonQuery(bobFormFilled);
	let hitForCountIdfc = await authModel.commonQuery(idfcFormFilled);
	let hitForCountAu = await authModel.commonQuery(auFormFilled);
	let hitForCountYes = await authModel.commonQuery(yesFormFilled);
	if (hitForCountAll){
		returnData.allCountApplied = hitForCountAll.rows[0].count;
		
	}
	if (hitForCountAxis){
		returnData.axisApplied = hitForCountAxis.rows[0].count;
	}
	if (hitForCountBob){
		returnData.bobApplied = hitForCountBob.rows[0].count;
	}
	if (hitForCountIdfc){
		returnData.idfcApplied = hitForCountIdfc.rows[0].count;
	}
	if (hitForCountAu){
		returnData.auApplied = hitForCountAu.rows[0].count;
	}
	if (hitForCountYes){
		returnData.yesBankApplied = hitForCountYes.rows[0].count;
	}
	//console.log(returnData , "hi i am in");
	return returnData;
}

authModel.getAxisApplicationCount = async function (reqData) {
	let returnData = {};
	let allApplications = `SELECT axis_ipa_original_status_sheet FROM public.axis_bank_applications_table `;
	let hitForThis = await authModel.commonQuery(allApplications);
	if (hitForThis && hitForThis.rows && hitForThis.rows.length > 0){
		for (let i = 0 ; i < hitForThis.rows.length; i++){
			
			if (returnData[hitForThis.rows[i].axis_ipa_original_status_sheet]){
				returnData[hitForThis.rows[i].axis_ipa_original_status_sheet] = returnData[hitForThis.rows[i].axis_ipa_original_status_sheet] + 1;
			} else {
				returnData[hitForThis.rows[i].axis_ipa_original_status_sheet] = 1;
			}
		}

	}
	return returnData;
}

authModel.getAuApplicationCount = async function (reqData) {
	let returnData = {};
	let allApplications = `SELECT au_current_status as status FROM public.au_bank_applications_table `;
	let hitForThis = await authModel.commonQuery(allApplications);
	if (hitForThis && hitForThis.rows && hitForThis.rows.length > 0){
		for (let i = 0 ; i < hitForThis.rows.length; i++){
			
			if (returnData[hitForThis.rows[i].status]){
				returnData[hitForThis.rows[i].status] = returnData[hitForThis.rows[i].status] + 1;
			} else {
				returnData[hitForThis.rows[i].status] = 1;
			}
		}

	}
	return returnData;
}
authModel.getBobApplicationCount = async function (reqData) {
	let returnData = {};
	let allApplications = `SELECT bob_ipa_original_status_sheet as status FROM public.bob_applications_table`;
	let hitForThis = await authModel.commonQuery(allApplications);
	if (hitForThis && hitForThis.rows && hitForThis.rows.length > 0){
		for (let i = 0 ; i < hitForThis.rows.length; i++){
			
			if (returnData[hitForThis.rows[i].status]){
				returnData[hitForThis.rows[i].status] = returnData[hitForThis.rows[i].status] + 1;
			} else {
				returnData[hitForThis.rows[i].status] = 1;
			}
		}

	}
	return returnData;
}
authModel.getIdfcApplicationCount = async function (reqData) {
	let returnData = {};
	let allApplications = `SELECT idfc_sub_status as status FROM public.idfc_bank_applications_table `;
	let hitForThis = await authModel.commonQuery(allApplications);
	if (hitForThis && hitForThis.rows && hitForThis.rows.length > 0){
		for (let i = 0 ; i < hitForThis.rows.length; i++){
			
			if (returnData[hitForThis.rows[i].status]){
				returnData[hitForThis.rows[i].status] = returnData[hitForThis.rows[i].status] + 1;
			} else {
				returnData[hitForThis.rows[i].status] = 1;
			}
		}

	}
	return returnData;
}
authModel.getYesApplicationCount = async function (reqData) {
	let returnData = {};
	let allApplications = `SELECT yb_application_status as status FROM public.yes_bank_applications_table `;
	let hitForThis = await authModel.commonQuery(allApplications);
	if (hitForThis && hitForThis.rows && hitForThis.rows.length > 0){
		for (let i = 0 ; i < hitForThis.rows.length; i++){
			
			if (returnData[hitForThis.rows[i].status]){
				returnData[hitForThis.rows[i].status] = returnData[hitForThis.rows[i].status] + 1;
			} else {
				returnData[hitForThis.rows[i].status] = 1;
			}
		}

	}
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