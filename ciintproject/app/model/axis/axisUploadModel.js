let { pool } = require('../../utils/configs/database');
//////////////////////////////////////////
let uploadModel = {};

let allApplicationsModel = require('../applications/allApplicationsModel');





uploadModel.entryToAxisFromSheet = async function (insertData) {
	let dataFromMain = await allApplicationsModel.getAllApplicationsForOthers();

	let returnData = false;
	let dataToDb = [];
	let singleObj = {
		application_id: null,
		date: null,
		name: null,
		mobile_number: null,
		card_type: null,
		ipa_status: null,
		final_status: null,
		main_table: null,
	};
	console.log(insertData[0], "insertData");
	console.log(dataFromMain[0], "dataFromMain");

	console.log(insertData[0].MOBILE_NO.slice(0, 2), "insertData length");

	if (dataFromMain.length > 0 && insertData.length > 0) {
		console.log("first two from main -------->>>>", dataFromMain[0].phone_number.slice(0, 2));
		console.log("first two from main -------->>>>", dataFromMain[0].phone_number.slice(dataFromMain[0].phone_number.length - 6, dataFromMain[0].phone_number.length));
		console.log("first two from insert -------->>>>", insertData[0].MOBILE_NO.slice(0, 2));
		console.log("first two from insert -------->>>>", insertData[0].MOBILE_NO.slice(insertData[0].MOBILE_NO.length - 6, insertData[0].MOBILE_NO.length));

		let matchedFromMain = [];
		for (let i = 0; i < dataFromMain.length; i++) {
			console.log(i, "insertData length");

			// matchedFromMain = dataFromMain.filter(item => ((item.phone_number.slice(0, 2) == insertData[i].MOBILE_NO.slice(0, 2)) && (item.phone_number.slice(item.phone_number.length - 6, item.phone_number.length) == insertData[i].MOBILE_NO.slice(insertData[i].MOBILE_NO.length - 6, insertData[i].MOBILE_NO.length))));

			for (let j = 0; j < insertData.length; j++) {
				if ((dataFromMain[i].phone_number.slice(0, 2) === insertData[j].MOBILE_NO.slice(0, 2)) && (dataFromMain[i].phone_number.slice(dataFromMain[i].phone_number.length - 6, dataFromMain[i].phone_number.length) === insertData[j].MOBILE_NO.slice(insertData[j].MOBILE_NO.length - 6, insertData[j].MOBILE_NO.length))) {
					console.log("hi im in if condition ", i, j);
					console.log("first  from main -------->>>>", dataFromMain[i].phone_number.slice(0, 2));
					console.log("last  from main -------->>>>", dataFromMain[i].phone_number.slice(dataFromMain[i].phone_number.length - 6, dataFromMain[i].phone_number.length));
					console.log("first two from insert -------->>>>", insertData[j].MOBILE_NO.slice(0, 2));
					console.log("last  from insert -------->>>>", insertData[j].MOBILE_NO.slice(insertData[j].MOBILE_NO.length - 6, insertData[j].MOBILE_NO.length));
					// singleObj.application_id = insertData[j].APPLICATION_NO;
					// singleObj.date = insertData[j].DATE;
					// singleObj.name = insertData[j].NAME;
					// singleObj.mobile_number = dataFromMain[i].phone_number;
					// singleObj.card_type = insertData[j].CARDTYPE;
					// singleObj.ipa_status = insertData[j]['IPA STATUS'];
					// singleObj.final_status = insertData[j]['ETE STATUS'];
					// singleObj.main_table = dataFromMain[i].id;
					// singleObj.main_id = i;
					// singleObj.insertDataId = j;

					dataToDb.push({
						application_id: insertData[j].APPLICATION_NO,
						date: insertData[j].DATE,
						name: insertData[j].NAME,
						mobile_number: dataFromMain[i].phone_number,
						tracking_id: dataFromMain[i].tracking_id,
						mobile_number_2: insertData[j].MOBILE_NO,
						card_type: insertData[j].CARDTYPE,
						ipa_status: insertData[j]['IPA STATUS'],
						final_status: insertData[j]['ETE STATUS'],
						main_table: dataFromMain[i].id,
						main_id: i,
						insertDataId: j,
					});
					console.log(singleObj, "dataToDb");
				}

			}



			console.log("dataToDb in for ", dataToDb);
		}

		console.log("matchedFromMain", dataToDb);
		console.log(insertData.length);


	}

	console.log(dataToDb, "dataToDb");





	returnData = true;

	//console.log(insertData[0], "dataFromSheet here");

	return dataToDb;




}

uploadModel.getAllApplicationsDataFromMainTable = async function () {
	let queryToDb = `SELECT * FROM card_applications_main_table`;
	let mainData = [];
	try {
		let dataQuery = await pool.query(queryToDb);
		mainData = dataQuery.rows;
	} catch (error) {
		console.log(error);

	}
	return mainData;
}

uploadModel.entryToAxisFromSheetAjex = async function (insertData, axisAllApplications, axisAllApplicationByApplicationId, allApplications) {

	//console.log(insertData, "dataFromMain");
	let returnData = false;

	let sqlQuery = '';
	let sqlQueryUpdate = '';
	let updateMainApplicationTableSql = '';
	let ipApproveData = [];

	//let writeFileString = "";

	for (let i = 0; i < insertData.length; i++) {
		let IPAStatus = false;
		let modifyFinalStatus = '';
		let updateIPAStatusQuery = '';

		insertData[i].send_to_channel = insertData[i].send_to_channel.replaceAll(/'/g, "  ");

		//writeFileString = writeFileString + insertData[i].send_to_channel + " \n ";

		//console.log(insertData[i].send_to_channel);

		if (insertData[i].ipa_status == 'IPA Approved') {
			IPAStatus = true;
			updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
		}
		if (insertData[i].final_status == 'Approved') {
			IPAStatus = true;
			modifyFinalStatus = 'Approved';
			
		} else if (insertData[i].final_status == 'Declined') {
			modifyFinalStatus = 'Rejected';
		} else {
			modifyFinalStatus = 'Pending';
		}
		if (!insertData[i].revised_date || insertData[i].revised_date == '' || insertData[i].revised_date == 'CTL inceration Error') {
			insertData[i].revised_date = null;
		} else {
			insertData[i].revised_date = `'` + insertData[i].revised_date + `'`;
			//console.log(insertData[i].revised_date);
		}
		if (allApplications[insertData[i].mobile_number]) {
			let matchedData = allApplications[insertData[i].mobile_number];

			//console.log("matched data-------->>>>>...", matchedData.tracking_id, "<<<<<<<<<<------------ tracking id matched");
			insertData[i].main_table = matchedData.id;
			insertData[i].mobile_number = matchedData.phone_number;
			let formFilledArrayQuery = ``;
			let ifApprovedQuery = ``;

			insertData[i].name = matchedData.name;
			formFilledArrayQuery = await uploadModel.manageArrayQuery(matchedData.form_filled_array);
			let banksApplied = await uploadModel.manageArrayQuery(matchedData.banks_applied_array);


			// if ( formFilledArrayQuery != `ARRAY['axis']`) {
			// 	console.log(formFilledArrayQuery);
			// }





			if (insertData[i].ipa_status == 'IPA Approved') {
				ipApproveData.push({ lead: 'axisipa', trackingId: matchedData.tracking_id });
			}

			let updateApprovedStatus = null;
			if (insertData[i].final_status == "Approved") {
				ipApproveData.push({ lead: 'axisapp', trackingId: matchedData.tracking_id });
				let banksApproved = await uploadModel.manageArrayQuery(matchedData.banks_approved_array);
				ifApprovedQuery = ` "banks_approved_array" = ` + banksApproved + `,`;
				updateApprovedStatus = true;

			}
			if (insertData[i]['reason'] == '1601 - Score Reject' || insertData[i]['reason'] == '1602- Cibil Negative / Cibil Reject') {
				updateIPAStatusQuery = updateIPAStatusQuery + ` , low_cibil_score_bool = false`;
			}

			updateMainApplicationTableSql = updateMainApplicationTableSql + ` UPDATE card_applications_main_table SET  ` + ifApprovedQuery + ` "banks_applied_array" = ` + banksApplied + `, "form_filled_array" = ` + formFilledArrayQuery + ` ` + updateIPAStatusQuery + `   WHERE "id" = ` + insertData[i].main_table + `; `;
			if (axisAllApplicationByApplicationId[insertData[i].application_id]) {
				let currentAxisId = axisAllApplicationByApplicationId[insertData[i].application_id].axis_id;
				sqlQueryUpdate = sqlQueryUpdate + ` UPDATE axis_bank_applications_table SET "axis_ipa_status" = '` + insertData[i].ipa_status + `', "axis_ipa_original_status_sheet" = '` + insertData[i].final_status + `' , "axis_final_status" = '` + modifyFinalStatus + `' , "axis_revised_date" = ` + insertData[i].revised_date + ` , "axis_blaze_output" = '` + insertData[i].BLAZE_OUTPUT + `' , "axis_send_to_channel" = '` + insertData[i].send_to_channel + `' , "axis_existing_c" = '` + insertData[i].EXISTING_C + `' , "axis_lead_error_log" = '` + insertData[i].LEAD_ERROR_LOG + `' , "axis_live_feedback_status" = '` + insertData[i].LIVE_FEEDBACK_STATUS + `',  "ca_main_table" = ` + insertData[i].main_table + `, "axis_name" = '` + insertData[i].name + `', "axis_mobile_number" = '` + insertData[i].mobile_number + `', updated_at = (now() AT TIME ZONE 'Asia/Kolkata'::text)  WHERE "axis_id" = ` + currentAxisId + ` ; \n `
			} else {
				sqlQuery = sqlQuery + ` INSERT INTO axis_bank_applications_table("axis_application_number","axis_date","axis_name","axis_mobile_number","axis_card_type", "axis_ipa_status", "axis_ipa_original_status_sheet", "ca_main_table" , "axis_ipa_status_bool" , "axis_final_status" , "axis_revised_date" , "axis_blaze_output" , "axis_send_to_channel" , "axis_existing_c" , "axis_lead_error_log" , "axis_live_feedback_status", "axis_ipa_original_status_sheet_initial" ) 
				VALUES ( '`+ insertData[i].application_id + `', '` + insertData[i].date + `', '` + insertData[i].name + `', '` + insertData[i].mobile_number + `' , '` + insertData[i].card_type + `' , '` + insertData[i].ipa_status + `' , '` + insertData[i].final_status + `' , ` + insertData[i].main_table + ` , ` + IPAStatus + ` , '` + modifyFinalStatus + `' , ` + insertData[i].revised_date + ` , '` + insertData[i].BLAZE_OUTPUT + `' , '` + insertData[i].send_to_channel + `' , '` + insertData[i].EXISTING_C + `' , '` + insertData[i].LEAD_ERROR_LOG + `' , '` + insertData[i].LIVE_FEEDBACK_STATUS + `', '` + insertData[i].final_status + `');`;
			}
		} else {
			//console.log("in else part" , axisAllApplicationByApplicationId[insertData[i].application_id]);
			if (axisAllApplicationByApplicationId[insertData[i].application_id]) {
				let currentAxisId = axisAllApplicationByApplicationId[insertData[i].application_id].axis_id;
				sqlQueryUpdate = sqlQueryUpdate + ` UPDATE axis_bank_applications_table SET "axis_ipa_status" = '` + insertData[i].ipa_status + `', "axis_ipa_original_status_sheet" = '` + insertData[i].final_status + `' , "axis_final_status" = '` + modifyFinalStatus + `' , "axis_revised_date" = ` + insertData[i].revised_date + `  , "axis_blaze_output" = '` + insertData[i].BLAZE_OUTPUT + `' , "axis_send_to_channel" = '` + insertData[i].send_to_channel + `' , "axis_existing_c" = '` + insertData[i].EXISTING_C + `' , "axis_lead_error_log" = '` + insertData[i].LEAD_ERROR_LOG + `' , "axis_live_feedback_status" = '` + insertData[i].LIVE_FEEDBACK_STATUS + `', updated_at = (now() AT TIME ZONE 'Asia/Kolkata'::text)    WHERE "axis_id" = ` + currentAxisId + `; \n `
			} else {
				sqlQuery = sqlQuery + ` INSERT INTO axis_bank_applications_table("axis_application_number","axis_date","axis_card_type", "axis_ipa_status", "axis_ipa_original_status_sheet" , "axis_ipa_status_bool" , "axis_final_status" , "axis_revised_date" , "axis_blaze_output" , "axis_send_to_channel" , "axis_existing_c" , "axis_lead_error_log" , "axis_live_feedback_status", "axis_ipa_original_status_sheet_initial")  
				VALUES ( '`+ insertData[i].application_id + `', '` + insertData[i].date + `', '` + insertData[i].card_type + `' , '` + insertData[i].ipa_status + `' , '` + insertData[i].final_status + `' , ` + IPAStatus + ` , '` + modifyFinalStatus + `' ,  ` + insertData[i].revised_date + ` , '` + insertData[i].BLAZE_OUTPUT + `' , '` + insertData[i].send_to_channel + `' , '` + insertData[i].EXISTING_C + `' , '` + insertData[i].LEAD_ERROR_LOG + `' , '` + insertData[i].LIVE_FEEDBACK_STATUS + `', '` + insertData[i].final_status + `' );`;
			}
		}

	}

	//console.log(sqlQueryUpdate, "sqlQueryUpdate");
	//console.log(sqlQuery , "sqlQueryUpdate");
	try {
		let query;
		if (sqlQueryUpdate != '') {
			// const fs = require('fs');
			// var stream = fs.createWriteStream(`${__dirname}/my_file.txt`);
			// stream.once('open', function (fd) {
			// 	stream.write(sqlQueryUpdate);
			// 	stream.end();
			// });


			query = await pool.query(sqlQueryUpdate, []);
			console.log('IN UPDATE');
		}
		if (sqlQuery != '') {
			query = await pool.query(sqlQuery, []);
			console.log('IN INSERT');
		}
		if (updateMainApplicationTableSql != '') {
			//console.log('IN Update MAIN TABLE', updateMainApplicationTableSql);
			query = await pool.query(updateMainApplicationTableSql, []);
			console.log('IN Update MAIN TABLE');
		}
		//console.log(sqlQueryUpdate , "IN UPDATE");
		// console.log(query);
		returnData = query.rows;
	} catch (error) {
		console.error(error);
		returnData = error;
	}
	return { returnData, ipApproveData };

}

uploadModel.manageArrayQuery = async function (matchedDataArray) {
	let formFilledArrayQuery = ``;
	let formFilledArrayArray = [];
	let isAlredayFilledForm = false;
	if (matchedDataArray && matchedDataArray.length > 0) {
		for (let j = 0; j < matchedDataArray.length; j++) {

			if (matchedDataArray[j]) {
				if (matchedDataArray[j] == 'axis') {
					isAlredayFilledForm = true;
				}
				formFilledArrayArray.push(matchedDataArray[j]);
			}

		}
		if (!isAlredayFilledForm) {
			formFilledArrayArray.push('axis');
		}

	} else {
		formFilledArrayArray.push('axis');
	}
	formFilledArrayQuery = `ARRAY` + JSON.stringify(formFilledArrayArray).split('"').join("'");
	return formFilledArrayQuery;
}

// uploadModel.getAllAxisApplicationsData = async function () {
// 	returnData = false;
// 	try {
// 		const query = await pool.query(`SELECT * FROM public.axis_bank_applications_table
// 		ORDER BY axis_id ASC `, []);
// 		// console.log(query);
// 		returnData = query.rows;
// 	} catch (error) {
// 		// console.error(error);
// 		returnData = error;
// 	}
// 	return returnData;
// }
uploadModel.getAllAxisApplicationsData = async function () {
	let hitLimit = 100000;
	let totalCount = 0;
	let totalHitLength = 0;
	let getCountOfAllDataSql = ` SELECT Count(*) FROM public.axis_bank_applications_table ;`;
	let lastRecordId;
	let allRecord = [];
	try {
		let getCount = await pool.query(getCountOfAllDataSql);
		if (getCount && getCount.rows && getCount.rows.length > 0 && getCount.rows[0].count) {
			totalCount = getCount.rows[0].count;
			console.log(totalCount, "totalCounttotalCount");
			totalHitLength = totalCount / hitLimit;
			let checkTheDecimalValue = totalHitLength % 1;
			if (checkTheDecimalValue != 0) {
				totalHitLength = ~~totalHitLength;
				totalHitLength = totalHitLength + 1;
			}
			console.log(totalHitLength, "totalHitLengthtotalHitLength");
			if (totalHitLength > 0) {
				for (let i = 0; i < totalHitLength; i++) {
					if (i == 0) {
						let sqlForRecord = ` SELECT * FROM public.axis_bank_applications_table
						 ORDER BY axis_id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecord");
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex");
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].axis_id;
							if (allRecord.length == 0){
								allRecord = getAllData.rows;
							}
							
							console.log(lastRecordId, "lastRecordIdlastRecordId");
						}

					} else {
						let sqlForRecord = ` SELECT * FROM public.axis_bank_applications_table where axis_id > ${lastRecordId} ORDER BY axis_id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecordsqlForRecord" , i);
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex " , i);
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].axis_id;
							allRecord.push(...getAllData.rows);
							
							console.log(lastRecordId, "lastRecordIdlastRecordId" , i);
						}
					}
				}
			}
			console.log(allRecord.length ,totalCount )
			//if (totalCount != 0);
		}
		return allRecord;
		//console.log(totalCount);
	} catch (e) {
		console.log(e);
		return allRecord;
	}
}
uploadModel.uploadActivationDataAjex = async function (dataToInsert) {
	returnData = false;
	let sqlQuery = ` `;
	console.log(dataToInsert, 'HI I SSSS')
	if (dataToInsert && dataToInsert.length > 0) {
		for (let i = 0; i < dataToInsert.length; i++) {
			if (dataToInsert[i]['Activation'] == 1) {
				dataToInsert[i]['Activation'] = true;
			} else {
				dataToInsert[i]['Activation'] = false;
			}
			sqlQuery = sqlQuery + ` update axis_bank_applications_table set axis_activation = ${dataToInsert[i]['Activation']} where axis_application_number = '${dataToInsert[i]['APPLICATION_NO']}'; `
		}
		//console.log(sqlQuery , "sqlQuerysqlQuery");
		try {
			const query = await pool.query(sqlQuery, []);
			// console.log(query);
			//returnData = query.rows;
			returnData = true;
		} catch (error) {
			// console.error(error);
			returnData = false;
		}
		console.log(returnData, 'returnDatareturnDatareturnData');
	}

	return returnData;
}
module.exports = uploadModel;