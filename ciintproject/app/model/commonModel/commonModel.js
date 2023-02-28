
const { pool } = require('../../utils/configs/database');
let commonModel = require('../../model/commonModel');
let commonModelObj = {};


commonModelObj.getAllUsersInBachis = async function () {
	let hitLimit = 100000;
	let totalCount = 0;
	let totalHitLength = 0;
	let getCountOfAllDataSql = ` SELECT Count(*) FROM public.card_applications_main_table ;`;
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
						let sqlForRecord = ` SELECT * FROM public.card_applications_main_table ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecord");
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex");
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
							if (allRecord.length == 0){
								allRecord = getAllData.rows;
							}
							
							console.log(lastRecordId, "lastRecordIdlastRecordId");
						}

					} else {
						let sqlForRecord = ` SELECT * FROM public.card_applications_main_table where id > ${lastRecordId} ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecordsqlForRecord" , i);
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex " , i);
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
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

commonModelObj.getAllUsersInBachisMew = async function (selectQueryCount , sqlQuery) {
	let hitLimit = 100000;
	let totalCount = 0;
	let totalHitLength = 0;
	let getCountOfAllDataSql = selectQueryCount;
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
						let sqlForRecord = ` ${sqlQuery} ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecord");
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex");
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
							if (allRecord.length == 0){
								allRecord = getAllData.rows;
							}
							
							console.log(lastRecordId, "lastRecordIdlastRecordId");
						}

					} else {
						let sqlForRecord = ` ${sqlQuery} AND  id > ${lastRecordId} ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecordsqlForRecord" , i);
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex " , i);
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
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

commonModelObj.getAllUsersInBactesTest = async function () {
	let hitLimit = 300000;
	let totalCount = 0;
	let totalHitLength = 0;
	let getCountOfAllDataSql = ` SELECT * FROM public.card_applications_main_table ;`;
	let lastRecordId;
	let allRecord = [];
	try {
		let getCount = await pool.query(getCountOfAllDataSql);
		
		console.log(getCount.rows.length);
	} catch (e) {
		console.log(e);
	}
}

commonModelObj.assignToTelly = async function (bodyData) {
    let returnData = false;
	if(bodyData.issuer == 'icici_6'){
		if (bodyData.main_id && bodyData.main_id.length > 0 && bodyData.assign_to) {
			let issuerId = 6;
			let insertedDataQuery = ``;
			for (let i = 0; i < bodyData.main_id.length; i++) {
			  let checkIfAlreadyAssignSql = `SELECT * FROM public.lead_assigning_user_junction 
				where issuer_id = 6 AND is_work_done = false AND lead_id = ${bodyData.main_id[i]} `;
			  let checkIfAlreadyExist = await commonModel.getDataOrCount(checkIfAlreadyAssignSql, [], 'D');
			  console.log(checkIfAlreadyExist, "checkIfAlreadyExistcheckIfAlreadyExist");
			  if (!checkIfAlreadyExist) {
				let inserdtedData = {
				  lead_id: bodyData.main_id[i],
				  user_id: bodyData.assign_to,
				  issuer_id: issuerId,
				  is_auto_assigned: false
				};
				let insertedQuery = await commonModel.insert('lead_assigning_user_junction', inserdtedData, true);
				insertedDataQuery = insertedDataQuery + insertedQuery + '; ';
		
			  }
			}
			if (insertedDataQuery != '') {
			  let insertIntoLead = await commonModel.getDataOrCount(insertedDataQuery, [], 'U');
			  if (insertIntoLead) {
				returnData = true;
			  }
			}
		  }
	}else{
		
	}
   
    return returnData;
  }

module.exports = commonModelObj;