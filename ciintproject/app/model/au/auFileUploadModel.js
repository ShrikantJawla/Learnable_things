let { pool } = require('../../utils/configs/database');
//////////////////////////////////////////
let uploadModel = {};

uploadModel.getAllApplicationsDataFromMainTable = async function () {
	let queryToDb = `SELECT * FROM card_applications_main_table  WHERE "tracking_id" != 'null'`;
	let mainData = [];
	try {
		let dataQuery = await pool.query(queryToDb);
		mainData = dataQuery.rows;
	} catch (error) {
		//console.log(error);

	}
	return mainData;
}


uploadModel.getAllAuApplicationsData = async function () {
	//console.log("hi im in getAllIdfcApplicationsData");
	returnData = false;
	try {
		const query = await pool.query(`SELECT * FROM public.au_bank_applications_table `, []);
		// //console.log(query);
		returnData = query.rows;
	} catch (error) {
		// console.error(error);
		returnData = error;
	}
	return returnData;

}


uploadModel.deleteDuplicateData = async function (queries) {

	try {
		const query = await pool.query(queries, []);
		// //console.log(query);
		//console.log(queries)
		returnData = query.rows;
	} catch (error) {
		// console.error(error);
		returnData = error;
	}
}
uploadModel.entryToAuFromSheetAjex = async function (insertData, appApplicationDataByPhoneNumber, AUApplicationsByMainId, AUApplicationsByApplicationId, appApplicationDataByTracking) {

	let returnData = false;

	let sqlQuery = '';
	let sqlQueryUpdate = '';
	let updateMainApplicationTableSql = '';
	let ipApproveData = [];
	////console.log(insertData);
	//console.log(insertData[0], "insert data 0 index");
	for (let i = 0; i < insertData.length; i++) {
		if (typeof insertData[i]['REJECT_REASON'] === 'undefined') {
			
			insertData[i]['REJECT_REASON'] = insertData[i]['REJECT RESION'];

		}
		if (typeof insertData[i]['UTM_SOURCE'] === 'undefined') {
			insertData[i]['UTM_SOURCE'] = insertData[i]['UTM SOURCE'];
		}
		if (typeof insertData[i]['CARD_CREATION_REQUEST_DATE'] === 'undefined') {
			insertData[i]['CARD_CREATION_REQUEST_DATE'] = insertData[i]['CARD CREATION DATE'];
		}
		// console.log(insertData[i]['CARD_CREATION_REQUEST_DATE'] , insertData[i]['REJECT_REASON'] , insertData[i]['UTM_SOURCE'] );
		if (!isNaN(insertData[i].CARD_CREATION_REQUEST_DATE)) {
			insertData[i].CARD_CREATION_REQUEST_DATE = 0;
		}

		let encodedPhoneNumber = '';
		let finalStatus = '';
		let iPaStatus = false;
		let updateIPAStatusQuery = '';
		let entryByForm = false;
		let leadFrom = '';
		let utmTerm = insertData[i]['UTM_TERM'];
		// if (typeof insertData[i]['UTM TERM'] === 'undefined' ){
		// 	utmTerm = insertData[i]['UTM_TERM'];

		// } else {
		// 	utmTerm = insertData[i]['UTM TERM'];
		// }

		let trackingId = '{param}';
		let applicationId = insertData[i]['LEAD_ID'].trim();





		if (insertData[i]['UTM_CAMPAIGN']) {
			let applicationModeArray = insertData[i]['UTM_CAMPAIGN'].split('-');
			let applicationMode = applicationModeArray[applicationModeArray.length - 1];
			if (applicationMode == 'form') {
				entryByForm = true;
			}
		}

		if (insertData[i]['UTM_CAMPAIGN'] != "NA" || insertData[i]['UTM_CAMPAIGN'] != "") {

			let splittedCampaign = insertData[i]['UTM_CAMPAIGN'].split('-');


			if (splittedCampaign[splittedCampaign.length - 2] == 'ci') {
				leadFrom = 'CIMONEY';

			} else if (splittedCampaign[splittedCampaign.length - 1] == 'form') {
				////console.log(splittedCampaign[splittedCampaign.length - 1], "<<<---------- lead from");
				leadFrom = 'FORM';
			} else if (splittedCampaign[splittedCampaign.length - 1] == 'app') {
				////console.log(splittedCampaign[splittedCampaign.length - 1], "<<<---------- lead");
				leadFrom = 'APP';
			} else if (splittedCampaign[splittedCampaign.length - 1] == 'website') {
				////console.log(splittedCampaign[splittedCampaign.length - 1], "<<<---------- lead");
				leadFrom = 'WEBSITE';
			} else {
				leadFrom = 'OTHERS';
			}


		} else {

			leadFrom = 'OTHERS';
		}






		if (!insertData[i].CARD_CREATION_REQUEST_DATE || insertData[i].CARD_CREATION_REQUEST_DATE == "0-Jan-00" || insertData[i].CARD_CREATION_REQUEST_DATE == "0") {
			insertData[i].CARD_CREATION_REQUEST_DATE = null;
		} else {
			insertData[i].CARD_CREATION_REQUEST_DATE = `'` + insertData[i].CARD_CREATION_REQUEST_DATE + `'`;
		}




		if (entryByForm) {
			
			if (!isNaN(utmTerm)) {
				utmTerm = Math.abs(utmTerm);

				encodedPhoneNumber = utmTerm / 3;
				////console.log(encodedPhoneNumber, "encodedPhoneNumber obs in line number --- 139");
				trackingId = utmTerm;

			} else {
				let splitTerm = utmTerm.split('-');
				if (splitTerm.length == 2) {
					trackingId = splitTerm[splitTerm.length - 2];
					//applicationId = splitTerm[splitTerm.length - 2];
					if (!isNaN(splitTerm[splitTerm.length - 1])) {
						encodedPhoneNumber = splitTerm[splitTerm.length - 1] / 3;
						encodedPhoneNumber = Math.abs(encodedPhoneNumber);
					}

				}

			}
			//console.log(encodedPhoneNumber , utmTerm);
		}
		// if (encodedPhoneNumber != '' && encodedPhoneNumber.length > 0 && encodedPhoneNumber > 0) {
		// 	encodedPhoneNumber = encodedPhoneNumber;
		// } else {
		// 	encodedPhoneNumber = '';
		// }
		////console.log(utmTerm , "utmTerm" , i);
		////console.log(insertData[i]['CURRENT_STATUS']);
		let ipApproveDataNeedToPush = false;
		if (insertData[i]['CURRENT_STATUS'] == 'Card Generated') {
			iPaStatus = true;
			ipApproveDataNeedToPush = true;
			finalStatus = 'Approved';
			updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
			ipApproveData.push({ lead: 'auapp', trackingId: trackingId });
			////console.log(11);
		} else if ((insertData[i]['CURRENT_STATUS'] == 'FISERV WAIT') || (insertData[i]['CURRENT_STATUS'] == 'WIP CASES')) {
			iPaStatus = true;
			ipApproveDataNeedToPush = true;
			finalStatus = "Pending";
			////console.log(22);
		} else {
			////console.log(33);
			if (insertData[i]['REJECT_REASON'] == 'INACTIVITY' || insertData[i]['REJECT_REASON'] == 'Journey yet to be completed') {
				finalStatus = 'In Complete';
			} else {
				finalStatus = "Rejected";
			}
		}

		if (insertData[i]['CARD_VARIANT_SELECTED'] && insertData[i]['CARD_VARIANT_SELECTED'] != 0 && insertData[i]['CARD_VARIANT_SELECTED'] != '') {
			iPaStatus = true;
		}

		if (ipApproveDataNeedToPush) {
			ipApproveData.push({ lead: 'auipa', trackingId: trackingId });
		}
		if (iPaStatus) {
			updateIPAStatusQuery = ` , "ipa_status" = 'true'`;

		}
		//tracking id need to be checked TOO DO
		//encodedPhoneNumber = encodedPhoneNumber.trim();
		// if (encodedPhoneNumber == '9893667305' || utmTerm == 'wmspo9medhq0hpul2bppuioa-29681001915'){
		// 	console.log('hi i am in -- 9893667305' , encodedPhoneNumber);
		// 	console.log(appApplicationDataByPhoneNumber[encodedPhoneNumber]);
		// }
		if ((encodedPhoneNumber != '' ) && appApplicationDataByPhoneNumber[encodedPhoneNumber]) {
			let matchedData = appApplicationDataByPhoneNumber[encodedPhoneNumber];
			// if (appApplicationDataByTracking[trackingId] && appApplicationDataByTracking[trackingId].id > 0) {
			// 	matchedData = appApplicationDataByTracking[trackingId];
			// }
			//console.log(matchedData, "matchedData");

			insertData[i].main_table = matchedData.id;
			insertData[i].mobile_number = matchedData.phone_number;
			if (!insertData[i].main_table){
				console.log(insertData[i] , "FAILED");
			}
			insertData[i].name = matchedData.name;
			let ifApprovedQuery = ``;
			if (insertData[i]['CURRENT_STATUS'] == 'Card Generated') {
				updateApprovedStatus = true;
				let banksApproved = await uploadModel.manageArrayQuery(matchedData.banks_approved_array);
				ifApprovedQuery = ` "banks_approved_array" = ` + banksApproved + `,`;


			}
			let formFilledArrayQuery = await uploadModel.manageArrayQuery(matchedData.form_filled_array);
			let banksApplied = await uploadModel.manageArrayQuery(matchedData.banks_applied_array);

			updateMainApplicationTableSql = updateMainApplicationTableSql + ` UPDATE card_applications_main_table SET  "name" = '` + insertData[i]['CUSTOMER_NAME'] + `',  ` + ifApprovedQuery + ` "banks_applied_array" = ` + banksApplied + `, "form_filled_array" = ` + formFilledArrayQuery + ` ` + updateIPAStatusQuery + ` WHERE "id" = ` + insertData[i].main_table + `; `;
			if (AUApplicationsByApplicationId[applicationId]) {
				let currentBankId = AUApplicationsByApplicationId[applicationId].au_id;
				sqlQueryUpdate = sqlQueryUpdate + `  UPDATE au_bank_applications_table SET 
                au_reject_reason = '`+ insertData[i]['REJECT_REASON'] + `',
                au_final_status  = '`+ finalStatus + `',
                au_current_status = '`+ insertData[i]['CURRENT_STATUS'] + `' ,
				au_ipa_status = `+ iPaStatus + `,
				au_drop_off_page = '`+ insertData[i]['DROP_OFF_PAGE'] + `',
				au_revised_date = `+ insertData[i].CARD_CREATION_REQUEST_DATE + `,
				au_card_variant = '`+ insertData[i]['CARD_VARIANT_SELECTED'] + `',
				ca_main_table = `+ insertData[i].main_table + `,
				au_utm_source = '`+ insertData[i]['UTM_SOURCE'] + `',
				au_phone_number = '${insertData[i].mobile_number}',
				updated_at = (now() AT TIME ZONE 'Asia/Kolkata')
                where au_id = `+ currentBankId + ` ;`;
			} else {
				////console.log('in ithis insert ');
				sqlQuery = sqlQuery + ` INSERT INTO au_bank_applications_table (au_customer_name, au_application_number, 
					au_initiation_date, au_card_variant,
					au_current_status, au_reject_reason, au_utm_medium, au_utm_campaign, au_utm_term, au_utm_source, au_lead_from, au_revised_date,
					au_final_status, ca_main_table, au_ipa_status, au_phone_number, au_drop_off_page, au_drop_off_page_initial) 
					values('`+ insertData[i]['CUSTOMER_NAME'] + `', '` + applicationId + ` ', '` + insertData[i]['APPLICATION_INITIATION_DATE'] + `', '` + insertData[i]['CARD_VARIANT_SELECTED'] + `',
					 '`+ insertData[i]['CURRENT_STATUS'] + `', '` + insertData[i]['REJECT_REASON'] + `',
					'`+ insertData[i]['UTM_MEDIUM'] + `', '` + insertData[i]['UTM_CAMPAIGN'] + `', '` + insertData[i]['UTM_TERM'] + `', 
					'`+ insertData[i]['UTM_SOURCE'] + `', '` + leadFrom + `', ` + insertData[i].CARD_CREATION_REQUEST_DATE + `, '` + finalStatus + `', ` + insertData[i].main_table + `, ` + iPaStatus + `, '` + encodedPhoneNumber + `', '` + insertData[i]['DROP_OFF_PAGE'] + `', '` + insertData[i]['DROP_OFF_PAGE'] + `');`;
			}
		} else {
			// if (AUApplicationsByApplicationId[insertData[i].main_table]) {
			// 	let currentBankId = AUApplicationsByMainId[insertData[i].main_table].au_id;
			// 	sqlQueryUpdate = sqlQueryUpdate + `  UPDATE au_bank_applications_table SET 
			//     au_reject_reason = '`+ insertData[i]['REJECT_REASON'] + `',
			//     au_final_status  = '`+ finalStatus + `',
			//     au_current_status = `+ insertData[i]['CURRENT_STATUS'] + ` ,
			// 	ipa_status = `+ iPaStatus + `,
			// 	au_card_variant = '`+insertData[i]['CARD_VARIANT_SELECTED']+`',
			// 	updated_at = CURRENT_TIMESTAMP
			//     where idfc_id = `+ currentBankId + ` ;`;
			// } else {
			// 	sqlQuery = sqlQuery + ` INSERT INTO au_bank_applications_table (au_customer_name, au_application_number, 
			// 		au_initiation_date, au_card_variant,
			// 		au_current_status, au_reject_reason, au_utm_medium, au_utm_campaign, au_utm_term, au_utm_source,
			// 		au_final_status, ca_main_table, ipa_status, au_phone_number) 
			// 		values('`+insertData[i]['CUSTOMER_NAME']+`', ' ', '`+insertData[i]['APPLICATION_INITIATION_DATE']+`', '`+insertData[i]['CARD_VARIANT_SELECTED']+`',
			// 		 '`+insertData[i]['CURRENT_STATUS']+`', '`+insertData[i]['REJECT_REASON']+`',
			// 		'`+insertData[i]['UTM_MEDIUM']+`', '`+insertData[i]['UTM_CAMPAIGN']+`', '`+insertData[i]['UTM TERM']+`', 
			// 		'`+insertData[i]['UTM_SOURCE']+`', '`+finalStatus+`', `+insertData[i].main_table+`, `+iPaStatus+`, '`+encodedPhoneNumber+`');`;
			// }
			if (AUApplicationsByApplicationId[applicationId]) {
				let currentBankId = AUApplicationsByApplicationId[applicationId].au_id;
				sqlQueryUpdate = sqlQueryUpdate + `  UPDATE au_bank_applications_table SET 
                au_reject_reason = '`+ insertData[i]['REJECT_REASON'] + `',
                au_final_status  = '`+ finalStatus + `',
                au_current_status = '`+ insertData[i]['CURRENT_STATUS'] + `' ,
				au_ipa_status = `+ iPaStatus + `,
				au_drop_off_page = '`+ insertData[i]['DROP_OFF_PAGE'] + `',
				au_revised_date = `+ insertData[i].CARD_CREATION_REQUEST_DATE + `,
				au_card_variant = '`+ insertData[i]['CARD_VARIANT_SELECTED'] + `',
				
				au_utm_source = '`+ insertData[i]['UTM_SOURCE'] + `',
				updated_at = (now() AT TIME ZONE 'Asia/Kolkata')
                where au_id = `+ currentBankId + ` ;`;
			} else {
				sqlQuery = sqlQuery + ` INSERT INTO au_bank_applications_table (au_customer_name, au_application_number, 
					au_initiation_date, au_card_variant,
					au_current_status, au_reject_reason, au_utm_medium, au_utm_campaign, au_utm_term, au_utm_source, au_lead_from, au_revised_date,
					au_final_status, au_ipa_status, au_phone_number, au_drop_off_page, au_drop_off_page_initial)  
					values('`+ insertData[i]['CUSTOMER_NAME'] + `', '` + applicationId + ` ', '` + insertData[i]['APPLICATION_INITIATION_DATE'] + `', '` + insertData[i]['CARD_VARIANT_SELECTED'] + `',
					 '`+ insertData[i]['CURRENT_STATUS'] + `', '` + insertData[i]['REJECT_REASON'] + `',
					'`+ insertData[i]['UTM_MEDIUM'] + `', '` + insertData[i]['UTM_CAMPAIGN'] + `', '` + insertData[i]['UTM_TERM'] + `', 
					'`+ insertData[i]['UTM_SOURCE'] + `', '` + leadFrom + `', ` + insertData[i].CARD_CREATION_REQUEST_DATE + `, '` + finalStatus + `', ` + iPaStatus + `, '` + encodedPhoneNumber + `', '` + insertData[i]['DROP_OFF_PAGE'] + `', '` + insertData[i]['DROP_OFF_PAGE'] + `');`;
			}
		}
	}
	//console.log('IN INSERT 444', sqlQuery);
	///console.log('IN UPDATE' , sqlQueryUpdate);
	try {
		let query;
		if (sqlQueryUpdate != '') {
			////console.log('IN UPDATE' , sqlQueryUpdate);
			query = await pool.query(sqlQueryUpdate, []);
			console.log('IN UPDATE query');
		}

		if (sqlQuery != '') {
			////console.log('IN INSERT', sqlQuery);
			query = await pool.query(sqlQuery, []);
			console.log('IN INSERT');
		}

		if (updateMainApplicationTableSql != '') {
			////console.log('IN Update MAIN TABLE', updateMainApplicationTableSql);
			query = await pool.query(updateMainApplicationTableSql, []);
			console.log('IN Update MAIN TABLE');
		}
		// //console.log(sqlQueryUpdate , "IN UPDATE");
		// //console.log(query);
		returnData = query.rows;
	} catch (error) {
		console.error(error);
		returnData = error;
	}
	ipApproveData = [];
	return { ipApproveData };



}

uploadModel.manageArrayQuery = async function (matchedDataArray) {
	let formFilledArrayQuery = ``;
	let formFilledArrayArray = [];
	let isAlredayFilledForm = false;
	if (matchedDataArray && matchedDataArray.length > 0) {
		for (let j = 0; j < matchedDataArray.length; j++) {

			if (matchedDataArray[j]) {
				if (matchedDataArray[j] == 'aubank') {
					isAlredayFilledForm = true;
				}
				formFilledArrayArray.push(matchedDataArray[j]);
			}

		}
		if (!isAlredayFilledForm) {
			formFilledArrayArray.push('aubank');
		}

	} else {
		formFilledArrayArray.push('aubank');
	}
	formFilledArrayQuery = `ARRAY` + JSON.stringify(formFilledArrayArray).split('"').join("'");
	return formFilledArrayQuery;
}



module.exports = uploadModel;