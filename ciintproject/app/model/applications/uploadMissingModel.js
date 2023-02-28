
const { parse } = require('json2csv');
const { pool } = require('../../utils/configs/database');
const commonModelObj = require('../../model/commonModel/commonModel');
let modelObj = {};

/**
 * It fetches all the rows from the axis_bank_applications_table where the ca_main_table column is
 * either NULL or 0
 * @returns An array of objects.
 */
async function getAxisApplicationsDataForMissing() {
	let reurnData = false;

	let queryToDb = `SELECT * FROM public.axis_bank_applications_table WHERE ca_main_table Is NULL OR ca_main_table = 0 ORDER BY axis_id ASC`;

	try {
		let dataFromDb = await pool.query(queryToDb);
		reurnData = dataFromDb.rows;

	} catch (err) {
		console.error(err);

	}

	return reurnData;
}

modelObj.proccessAndUploadMissingData = async function (dataBySheet) {



	if (dataBySheet && dataBySheet.length > 0) {
		let sheetDataByAppId = {};
		let sheetDataByNumber = {};
		let allMainUsersDataByPhoneNumber = {};
		let allAxisAllApplicationsbyAppId = {};
		let insertQuery = ``;
		for (let i = 0; i < dataBySheet.length; i++) {
			console.log(dataBySheet[i].MOB_NO);
			dataBySheet[i].MOB_NO = dataBySheet[i].MOB_NO.toString().substring(2);
			console.log(dataBySheet[i].MOB_NO);
			dataBySheet[i].MOB_NO = parseInt(dataBySheet[i].MOB_NO);
			sheetDataByAppId[dataBySheet[i].CASE_ID] = dataBySheet[i];
			sheetDataByNumber[dataBySheet[i].MOB_NO] = dataBySheet[i];
			insertQuery = insertQuery + ` INSERT INTO card_applications_main_table (name, phone_number) VALUES ('` + dataBySheet[i].CUSTOMER_NAME + `' , '` + dataBySheet[i].MOB_NO + `') ON CONFLICT DO NOTHING ; `
		}
		let getAllMainUsersData = ` SELECT * FROM public.card_applications_main_table  `;

		try {
			//console.log(insertQuery);
			let dataFromDb = await pool.query(insertQuery);
			let getMainUserData = await commonModelObj.getAllUsersInBachis();
			if (getMainUserData && getMainUserData.length > 0) {
				let allUsersData = getMainUserData;
				console.log(allUsersData.length,);
				if (allUsersData && allUsersData.length > 0) {
					for (let k = 0; k < allUsersData.length; k++) {
						allMainUsersDataByPhoneNumber[allUsersData[k].phone_number] = allUsersData[k];

					}

					let getAllAxisApplicationsSql = ` SELECT * FROM public.axis_bank_applications_table where ca_main_table is null `;
					let getAllAxisApplicationsData = await pool.query(getAllAxisApplicationsSql);
					//console.log(getAllAxisApplicationsData.rows , "getAllAxisApplicationsSqlgetAllAxisApplicationsSql");
					let updateAxisApplicationDataSql = ` `;
					if (getAllAxisApplicationsData && getAllAxisApplicationsData.rows.length > 0) {
						let getAllAxisApplicationsAllData = getAllAxisApplicationsData.rows;
						//console.log(getAllAxisApplicationsAllData , "getAllAxisApplicationsDatagetAllAxisApplicationsData");
						for (let b = 0; b < getAllAxisApplicationsAllData.length > 0; b++) {
							let getSheetDataByApplicationId = sheetDataByAppId[getAllAxisApplicationsAllData[b].axis_application_number];
							if (getSheetDataByApplicationId) {

								let mainTableUserId = allMainUsersDataByPhoneNumber[getSheetDataByApplicationId.MOB_NO];
								//console.log(mainTableUserId , "getNumberByApplicationId");
								if (mainTableUserId) {
									updateAxisApplicationDataSql = updateAxisApplicationDataSql + ` update axis_bank_applications_table set ca_main_table = ${mainTableUserId.id} where axis_id = ${getAllAxisApplicationsAllData[b].axis_id}; `;
								}

							}


							//allAxisAllApplicationsbyAppId[ getAllAxisApplicationsAllData[b].axis_application_number] = getAllAxisApplicationsAllData[b];
						}
						if (updateAxisApplicationDataSql) {
							///console.log()
							await pool.query(updateAxisApplicationDataSql);
						}
						return true;
					} else {
						console.log('error');
					}
				} else {
					console.log("ERROR");
				}
			} else {
				console.log("ERROR");
			}

		} catch (err) {
			console.error(err);

		}
	} else {
		console.log('HI I AM In ELSE')
	}

}

modelObj.proccessAndUploadMissingDataIdfc = async function (dataBySheet) {

	console.log(dataBySheet, "dataBySheet");

	if (dataBySheet && dataBySheet.length > 0) {
		let sheetDataByAppId = {};
		let sheetDataByNumber = {};
		let allMainUsersDataByPhoneNumber = {};
		let allAxisAllApplicationsbyAppId = {};
		let insertQuery = ``;
		for (let i = 0; i < dataBySheet.length; i++) {
			dataBySheet[i]['APPLICANT MOBILE'] = parseInt(dataBySheet[i]['APPLICANT MOBILE']);
			if (dataBySheet[i]['APPLICANT MOBILE'] && dataBySheet[i]['APPLICANT MOBILE'] > 999999999) {
				sheetDataByAppId[dataBySheet[i]['APPLICATION REF. NO.']] = dataBySheet[i];
				sheetDataByNumber[dataBySheet[i]['APPLICANT MOBILE']] = dataBySheet[i];
				// insertQuery = insertQuery + ` INSERT INTO card_applications_main_table (name, phone_number) VALUES ('` + dataBySheet[i]['CUSTOMER: FULL NAME'] + `' , '` + dataBySheet[i]['APPLICANT MOBILE'] + `') ON CONFLICT DO NOTHING ; `

				insertQuery = insertQuery + ` INSERT INTO card_applications_main_table (name, phone_number , city , banks_applied_array) 
				VALUES ('`+ dataBySheet[i]['CUSTOMER: FULL NAME'] + `', ` + dataBySheet[i]['APPLICANT MOBILE'] + `, '${dataBySheet[i]['LOCATION NAME']}' , '{idfc}')
				ON CONFLICT (phone_number) DO UPDATE 
				  SET name = excluded.name, 
					  city = excluded.city,
					  banks_applied_array = array_append(card_applications_main_table.banks_applied_array ,'idfc'),
					  updated_at = (now() AT TIME ZONE 'Asia/Kolkata');`;
			}

		}
		let getAllMainUsersData = ` SELECT * FROM public.card_applications_main_table  `;

		try {
			console.log(insertQuery);
			let dataFromDb = await pool.query(insertQuery);
			//console.log(dataFromDb, "dataFromDbdataFromDbdataFromDb");
			let getMainUserData = await commonModelObj.getAllUsersInBachis();
			//let getMainUserData = false;
			if (getMainUserData && getMainUserData.length > 0) {
				let allUsersData = getMainUserData;
				console.log(allUsersData.length);
				if (allUsersData && allUsersData.length > 0) {
					for (let k = 0; k < allUsersData.length; k++) {
						allMainUsersDataByPhoneNumber[allUsersData[k].phone_number] = allUsersData[k];

					}

					let getAllAxisApplicationsSql = ` SELECT * FROM public.idfc_bank_applications_table where ca_main_table is null `;
					let getAllAxisApplicationsData = await pool.query(getAllAxisApplicationsSql);
					//console.log(getAllAxisApplicationsData.rows , "getAllAxisApplicationsSqlgetAllAxisApplicationsSql");
					let updateAxisApplicationDataSql = ` `;
					if (getAllAxisApplicationsData && getAllAxisApplicationsData.rows.length > 0) {
						let getAllAxisApplicationsAllData = getAllAxisApplicationsData.rows;
						// console.log(getAllAxisApplicationsAllData , "getAllAxisApplicationsDatagetAllAxisApplicationsData");
						//console.log(getAllAxisApplicationsAllData.length , "getAllAxisApplicationsAllData.length")
						for (let b = 0; b < getAllAxisApplicationsAllData.length > 0; b++) {
							getAllAxisApplicationsAllData[b].idfc_application_number.trim();
							let getSheetDataByApplicationId = sheetDataByAppId[getAllAxisApplicationsAllData[b].idfc_application_number];
							//console.log(getSheetDataByApplicationId, "getSheetDataByApplicationId");
							if (getSheetDataByApplicationId) {
								console.log('MATCHED', getSheetDataByApplicationId['APPLICANT MOBILE']);
								let mainTableUserId = allMainUsersDataByPhoneNumber[getSheetDataByApplicationId['APPLICANT MOBILE']];
								console.log(mainTableUserId, "getNumberByApplicationId");
								if (mainTableUserId) {

									updateAxisApplicationDataSql = updateAxisApplicationDataSql + ` update idfc_bank_applications_table set ca_main_table = ${mainTableUserId.id} where idfc_id = ${getAllAxisApplicationsAllData[b].idfc_id}; `;
								}

							} else {
								//console.log('Not matched');
							}


							//allAxisAllApplicationsbyAppId[ getAllAxisApplicationsAllData[b].axis_application_number] = getAllAxisApplicationsAllData[b];
						}
						if (updateAxisApplicationDataSql) {
							console.log(updateAxisApplicationDataSql);
							await pool.query(updateAxisApplicationDataSql);
						}
						return true;
					} else {
						console.log('error');
					}
				} else {
					console.log("ERROR");
				}
			} else {
				console.log("ERROR");
			}

		} catch (err) {
			console.error(err);

		}


	} else {
		console.log('HI I AM In ELSE')
	}

}

modelObj.proccessToGetSheetWithPhoneNumberIDFC = async function (dataBySheet, keyIndex, bankId) {

	//console.log(getIndexValue[1]);
	if (dataBySheet.length > 0 && bankId != '' && keyIndex != '') {
		let queryForBank = '';
		let bankApplicationIndex = '';
		switch (bankId) {
			case 1:
				console.log("hi im in axis");
				queryForBank = `SELECT * FROM public.axis_bank_applications_table 
                left join card_applications_main_table on card_applications_main_table.id = 
                axis_bank_applications_table.ca_main_table where ca_main_table is not null`;
				bankApplicationIndex = 'axis_application_number ';
				break;
			case 2:
				console.log("hi im in bob");
				queryForBank = `SELECT * FROM public.bob_applications_table 
                left join card_applications_main_table on card_applications_main_table.id = 
                bob_applications_table.ca_main_table where ca_main_table is not null`;
				bankApplicationIndex = 'bob_application_number ';
				break;
			case 4:
				console.log("hi im in idfc");
				queryForBank = ` SELECT * FROM public.idfc_bank_applications_table left join card_applications_main_table on card_applications_main_table.id = idfc_bank_applications_table.ca_main_table

                where ca_main_table is not null`;
				bankApplicationIndex = 'idfc_application_number ';
				break;
			case 7:
				console.log("hi im in au");
				queryForBank = `SELECT * FROM public.au_bank_applications_table 
                left join card_applications_main_table on card_applications_main_table.id = 
                au_bank_applications_table.ca_main_table where ca_main_table is not null`;
				bankApplicationIndex = 'au_application_number ';
				break;
			case 11:
				console.log("hi im in yes");
				queryForBank = `SELECT * FROM public.yes_bank_applications_table 
                left join card_applications_main_table on card_applications_main_table.id = 
                yes_bank_applications_table.ca_main_table where ca_main_table is not null`;
				bankApplicationIndex = 'yb_application_created ';
				break;
			default:
				console.log("hi im in default");
				break;
		}


		console.log(queryForBank, "queryForBank");
		if (queryForBank != '') {
			try {
				//console.log(insertQuery);
				let dataFromDb = await pool.query(queryForBank);
				let dataAccordingToApplicationNumber = {};
				console.log(bankApplicationIndex, "bankApplicationIndexbankApplicationIndex");
				console.log(dataFromDb.rows[0][bankApplicationIndex.trim()], "dataFromDb.rows[i][bankApplicationIndex]")
				if (dataFromDb && dataFromDb.rows && dataFromDb.rows.length) {
					for (let i = 0; i < dataFromDb.rows.length; i++) {

						dataAccordingToApplicationNumber[dataFromDb.rows[i][bankApplicationIndex.trim()]] = dataFromDb.rows[i];
					}
					let objKyes = Object.keys(dataBySheet[0]);
					let indexValue = objKyes[keyIndex];
					console.log(indexValue, "indexValueindexValue")
					for (let k = 0; k < dataBySheet.length; k++) {
						if (dataAccordingToApplicationNumber[dataBySheet[k][indexValue]]) {
							let matchedData = dataAccordingToApplicationNumber[dataBySheet[k][indexValue]];
							dataBySheet[k]['phone_number'] = matchedData.phone_number;
						} else {
							dataBySheet[k]['phone_number'] = '';
						}

					}
					//console.log(dataBySheet[0] , "dataBySheet")
					return dataBySheet;
				} else {
					console.log('error 1')
				}

				//console.log(dataAccordingToApplicationNumber , "dataAccordingToApplicationNumber");
			} catch (err) {
				console.error(err);

			}
		} else {
			return [];
		}

	} else {
		return [];
	}
}



modelObj.proccessAndUploadMissingDataYesBank = async function (dataBySheet) {

	console.log(dataBySheet, "dataBySheet");

	if (dataBySheet && dataBySheet.length > 0) {
		let sheetDataByAppId = {};
		let sheetDataByNumber = {};
		let allMainUsersDataByPhoneNumber = {};
		let allAxisAllApplicationsbyAppId = {};
		let insertQuery = ``;
		for (let i = 0; i < dataBySheet.length; i++) {
			if (!dataBySheet[i]['APPLICATION_ID']) {
				dataBySheet[i]['APPLICATION_ID'] = dataBySheet[i]['CUSTOMER_CONTACT'] + '_' + dataBySheet[i]['LAST_LINK_TRIGGER_DATE'];
			}
			dataBySheet[i]['CUSTOMER_CONTACT'] = parseInt(dataBySheet[i]['CUSTOMER_CONTACT']);
			if (dataBySheet[i]['CUSTOMER_CONTACT'] && dataBySheet[i]['CUSTOMER_CONTACT'] > 999999999) {
				sheetDataByAppId[dataBySheet[i]['APPLICATION_ID']] = dataBySheet[i];
				sheetDataByNumber[dataBySheet[i]['CUSTOMER_CONTACT']] = dataBySheet[i];
				// insertQuery = insertQuery + ` INSERT INTO card_applications_main_table (name, phone_number) VALUES ('` + dataBySheet[i]['ADHAR_NAME'] + `' , '` + dataBySheet[i]['CUSTOMER_CONTACT'] + `') ON CONFLICT DO NOTHING ; `
				let pinToAdd = '';
				dataBySheet[i]['MONTHLY_INCOME'] = dataBySheet[i]['MONTHLY_INCOME'].trim();
				dataBySheet[i]['ANNUAL_INCOME'] = dataBySheet[i]['ANNUAL_INCOME'].trim();
				
				if (dataBySheet[i]['AADHAR_PIN'] && dataBySheet[i]['AADHAR_PIN'] != '') {
					pinToAdd = dataBySheet[i]['AADHAR_PIN'];
				} else if (dataBySheet[i]['CURRENT_PIN'] && dataBySheet[i]['CURRENT_PIN'] != ''){
					pinToAdd = dataBySheet[i]['CURRENT_PIN'];
				}
				if (pinToAdd > 0){

				} else {
					pinToAdd = null;
				}
				let income = null;
				

				if (dataBySheet[i]['MONTHLY_INCOME'] && dataBySheet[i]['MONTHLY_INCOME'] != '') {
					income = dataBySheet[i]['MONTHLY_INCOME'];
				} else if (dataBySheet[i]['ANNUAL_INCOME'] && dataBySheet[i]['ANNUAL_INCOME'] > 0) {
					income = dataBySheet[i]['ANNUAL_INCOME'] / 12;
				}
				let companyName = dataBySheet[i]['COMPANY_NAME'];
				let occupation = dataBySheet[i]['OCCUPATION'];
				let creditLimit = dataBySheet[i]['CREDIT_LIMIT'];
				if (companyName == ''){
					companyName = null;
				}
				if (occupation == ''){
					occupation = null;
				}
				if (creditLimit == ''){
					creditLimit = null;
				}
				insertQuery = insertQuery + ` INSERT INTO card_applications_main_table (name, phone_number , monthly_income , company_name , pin_code , occupation , credit_card_max_limit , banks_applied_array) 
				VALUES ('`+ dataBySheet[i]['ADHAR_NAME'] + `', ` + dataBySheet[i]['CUSTOMER_CONTACT'] + `, '${income}' , '${companyName}' , ${pinToAdd} , '${occupation}' , '${creditLimit}' , '{yesbank}')
				ON CONFLICT (phone_number) DO UPDATE 
				  SET name = excluded.name, 
				  company_name = excluded.company_name,
				  pin_code = excluded.pin_code,
				  monthly_income = excluded.monthly_income,
				  banks_applied_array = array_append(card_applications_main_table.banks_applied_array ,'yesbank'),
				  occupation = excluded.occupation,
					  updated_at = (now() AT TIME ZONE 'Asia/Kolkata');`;
			}

		}
		let getAllMainUsersData = ` SELECT * FROM public.card_applications_main_table  `;

		try {
			console.log(insertQuery);
			let dataFromDb = await pool.query(insertQuery);
			let getMainUserData = await commonModelObj.getAllUsersInBachis();
			//let getMainUserData = false;
			if (getMainUserData && getMainUserData.length > 0) {
				let allUsersData = getMainUserData;
				console.log(allUsersData.length);
				if (allUsersData && allUsersData.length > 0) {
					for (let k = 0; k < allUsersData.length; k++) {
						allMainUsersDataByPhoneNumber[allUsersData[k].phone_number] = allUsersData[k];

					}

					let getAllAxisApplicationsSql = ` SELECT * FROM public.yes_bank_applications_table where ca_main_table is null `;
					let getAllAxisApplicationsData = await pool.query(getAllAxisApplicationsSql);
					//console.log(getAllAxisApplicationsData.rows , "getAllAxisApplicationsSqlgetAllAxisApplicationsSql");
					let updateAxisApplicationDataSql = ` `;
					if (getAllAxisApplicationsData && getAllAxisApplicationsData.rows.length > 0) {
						let getAllAxisApplicationsAllData = getAllAxisApplicationsData.rows;
						// console.log(getAllAxisApplicationsAllData , "getAllAxisApplicationsDatagetAllAxisApplicationsData");
						//console.log(getAllAxisApplicationsAllData.length , "getAllAxisApplicationsAllData.length")
						for (let b = 0; b < getAllAxisApplicationsAllData.length > 0; b++) {
							let getSheetDataByApplicationId = sheetDataByAppId[getAllAxisApplicationsAllData[b].yb_application_number];
							console.log(getSheetDataByApplicationId, "getSheetDataByApplicationId");
							if (getSheetDataByApplicationId) {
								console.log('MATCHED', getSheetDataByApplicationId['CUSTOMER_CONTACT']);
								let mainTableUserId = allMainUsersDataByPhoneNumber[getSheetDataByApplicationId['CUSTOMER_CONTACT']];
								console.log(mainTableUserId, "getNumberByApplicationId");
								if (mainTableUserId) {

									updateAxisApplicationDataSql = updateAxisApplicationDataSql + ` update yes_bank_applications_table set ca_main_table = ${mainTableUserId.id} where yb_id = ${getAllAxisApplicationsAllData[b].yb_id}; `;
								}

							} else {
								console.log('Not matched');
							}


							//allAxisAllApplicationsbyAppId[ getAllAxisApplicationsAllData[b].axis_application_number] = getAllAxisApplicationsAllData[b];
						}
						if (updateAxisApplicationDataSql) {
							console.log(updateAxisApplicationDataSql);
							await pool.query(updateAxisApplicationDataSql);
						}
						return true;
					} else {
						console.log('error');
					}
				} else {
					console.log("ERROR");
				}
			} else {
				console.log("ERROR");
			}

		} catch (err) {
			console.error(err);

		}


	} else {
		console.log('HI I AM In ELSE')
	}

}

modelObj.getAllUsersInBachis = async function () {
	let hitLimit = 300000;
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
							console.log(getAllData.rows.length, "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex");
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
							if (allRecord.length == 0) {
								allRecord = getAllData.rows;
							}

							console.log(lastRecordId, "lastRecordIdlastRecordId");
						}

					} else {
						let sqlForRecord = ` SELECT * FROM public.card_applications_main_table where id > ${lastRecordId} ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecordsqlForRecord", i);
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length, "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex ", i);
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
							allRecord.push(...getAllData.rows);

							console.log(lastRecordId, "lastRecordIdlastRecordId", i);
						}
					}
				}
			}
			console.log(allRecord.length, totalCount)
			//if (totalCount != 0);
		}
		return allRecord;
		//console.log(totalCount);
	} catch (e) {
		console.log(e);
		return allRecord;
	}
}

modelObj.getAllUsersInBactesTest = async function () {
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

module.exports = modelObj;