
let auUploadModel = require('../../model/au/auFileUploadModel');
let commonController = require("../../controller/commonController");
let hitexternalApi = require("../../common/hitExternalApi");

let accessMiddleware = require('../../common/checkAccessMiddleware');
let commonModel = require('../../model/commonModel');
let commonModel2 = require('../../model/commonModel/commonModel');
////////////////////////////////////////////////////////////////////////////////////

let controllerObj = {};

controllerObj.uploadApplicationsUi = async function (req, res, next) {



	let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("au/auFileUpload", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}


}

controllerObj.demoData = async function (req, res, next) {

	let getAllApplications = await commonModel2.getAllUsersInBachis();

	let allUserDataByPhoneNumber = {};
	for (let i = 0; i < getAllApplications.length; i++) {
		allUserDataByPhoneNumber[getAllApplications[i].phone_number.trim()] = getAllApplications[i].id;
		//console.log(getAllApplications);
	}
	console.log(allUserDataByPhoneNumber);
	let updateQuery = ``;
	let getAuApplicationSql = `SELECT * FROM public.au_bank_applications_table where ca_main_table is null AND au_phone_number is not null 
	AND au_phone_number != ''
	ORDER BY au_id ASC `;
	let getAuApplications = await commonModel.getDataOrCount(getAuApplicationSql, [], 'D');
	for (let k = 0; k < getAuApplications.length; k++) {
		if (allUserDataByPhoneNumber[getAuApplications[k].au_phone_number.trim()]) {
			let matchedData = allUserDataByPhoneNumber[getAuApplications[k].au_phone_number.trim()];
			updateQuery = updateQuery + ` UPDATE au_bank_applications_table set ca_main_table = ${matchedData} where au_id = ${getAuApplications[k].au_id} ; `
		}
	}
	let updateData = await commonModel.getDataOrCount(updateQuery, [], 'U');
	console.log(updateQuery, "updateQueryupdateQuery");

	// 	console.log('hi i am in this ');
	// 	let getAuData = `SELECT * FROM public.au_bank_applications_table where ca_main_table is null AND au_phone_number is not null 
	// AND au_phone_number != ''
	// ORDER BY au_id ASC `;
	// 	let updateQuery = '';
	// 	let insertDb = '';
	// 	let commonModelData = await commonModel.getDataOrCount(getAuData , [] ,'D');
	// 	console.log(commonModelData , "commonModelcommonModel");
	// 	for(let i = 0; i < commonModelData.length; i++){
	// 		console.log(Math.abs(commonModelData[i].au_phone_number));
	// 		let number = Math.abs(commonModelData[i].au_phone_number);
	// 		// updateQuery = updateQuery + ` UPDATE au_bank_applications_table set au_phone_number = '${number}' where au_id = ${commonModelData[i].au_id} ; `;

	// 		insertDb = insertDb + ` INSERT INTO card_applications_main_table (name, phone_number ) 
	// 		VALUES ('${commonModelData[i].au_customer_name}', '${number}')
	// 		ON CONFLICT (phone_number) DO NOTHING;`;
	// 	}

	// 	//let updateData = await commonModel.getDataOrCount(updateQuery, [], 'U');
	// 	let insertUpdateData = await commonModel.getDataOrCount(insertDb, [], 'U');
	// 	//console.log(updateData);
	// 	console.log(insertUpdateData);
	res.send('HI    ..')
}

controllerObj.uploadApplicationsAjex = async function (req, res, next) {


	if (req.body.isForUpdate == 'true') {
		let allParsedData = JSON.parse(req.body.allData);
		console.log("hi im in AU Bank ajax", allParsedData);
		let columnNotFound = [];
		let allColumnExist = true;
		if (typeof allParsedData[0]['LEAD_ID'] === 'undefined') {
			allColumnExist = false;
			columnNotFound.push('LEAD_ID');
		}
		if (typeof allParsedData[0]['SOURCE'] === 'undefined') {
			allColumnExist = false;
			columnNotFound.push('SOURCE');
		}
		if (allParsedData.length > 0 && allColumnExist) {
			let updateQuery = ` `;
			for (let i = 0; i < allParsedData.length; i++) {
				if (allParsedData[i]['LEAD_ID'] && allParsedData[i]['SOURCE']) {
					let sourceByBank = false;
					if (allParsedData[i]['SOURCE'] == 'Assist By Bank') {
						sourceByBank = true;
					}
					updateQuery = updateQuery + ` UPDATE au_bank_applications_table SET au_bank_assisted = ${sourceByBank} WHERE 
					("au_application_number"::Text Like '${allParsedData[i]['LEAD_ID']}%' ); `;
				}
			}
			if (updateQuery != '') {
				let updateData = await commonModel.getDataOrCount(updateQuery, [], 'U');
				console.log(updateData, "updateQueryupdateQuery");
			}
			res.send({ status: true, message: "Operation performed successfully." });
		} else {
			let messageToSend = 'Invalid data';
			if (!allColumnExist) {
				messageToSend = ' Column missing = ' + columnNotFound.toString();
			}
			console.log(messageToSend, "messageToSendmessageToSend")
			res.send({ status: false, message: messageToSend });
		}
		//console.log('HI I AM IN THIS')
	} else {
		if (req.body && req.body.allData) {
			let allParsedData = JSON.parse(req.body.allData);
			let allColumnExist = true;
			let columnNotFound = [];
			// for (let i = 0; i < allParsedData.length; i++) {
			// 	if (allParsedData[i].CARD_CREATION_REQUEST_DATE == '44826') {
			// 		console.log(allParsedData[i]);
			// 		console.log(isNaN(allParsedData[i].CARD_CREATION_REQUEST_DATE) );
			// 		// if (isNaN(utmTerm)) {
			// 		// 	encodedPhoneNumber = utmTerm / 3;
			// 		// 	trackingId = utmTerm;
			// 		// }
			// 	} else if (allParsedData[i].CARD_CREATION_REQUEST_DATE != '0'){
			// 		console.log(allParsedData[i].CARD_CREATION_REQUEST_DATE);
			// 		console.log(isNaN(allParsedData[i].CARD_CREATION_REQUEST_DATE) );
			// 	}
			// }
			console.log(allParsedData[0], 'cccccc');
			if (typeof allParsedData[0]['LEAD_ID'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('LEAD_ID');
			}
			if (typeof allParsedData[0]['CUSTOMER_NAME'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('CUSTOMER_NAME');
			}
			if (typeof allParsedData[0]['APPLICATION_INITIATION_DATE'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('APPLICATION_INITIATION_DATE');
			}
			if (typeof allParsedData[0]['CARD_VARIANT_SELECTED'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('CARD_VARIANT_SELECTED');
			}
			if (typeof allParsedData[0]['CURRENT_STATUS'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('CURRENT_STATUS');
			}
			if (typeof allParsedData[0]['REJECT_REASON'] === 'undefined') {
				if (typeof allParsedData[0]['REJECT RESION'] === 'undefined') {
					allColumnExist = false;
					columnNotFound.push('REJECT_REASON or REJECT RESION');
				}


			}
			if (typeof allParsedData[0]['UTM_SOURCE'] === 'undefined') {
				if (typeof allParsedData[0]['UTM SOURCE'] === 'undefined') {
					allColumnExist = false;
					columnNotFound.push('UTM_SOURCE or UTM SOURCE');
				}
			}
			if (typeof allParsedData[0]['UTM_MEDIUM'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('UTM_MEDIUM');
			}
			if (typeof allParsedData[0]['UTM_CAMPAIGN'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('UTM_CAMPAIGN');
			}
			if (typeof allParsedData[0]['UTM_TERM'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('UTM_TERM');
			}
			if (typeof allParsedData[0]['MONTH'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('MONTH');
			}
			if (typeof allParsedData[0]['CARD_CREATION_REQUEST_DATE'] === 'undefined') {
				
				if (typeof allParsedData[0]['CARD CREATION DATE'] === 'undefined') {
					allColumnExist = false;
					columnNotFound.push('CARD_CREATION_REQUEST_DATE or CARD CREATION DATE' );
				}
			}
			if (typeof allParsedData[0]['ASSITED BY'] === 'undefined') {
				allColumnExist = false;
				columnNotFound.push('ASSITED BY');
			}
			console.log(allColumnExist, columnNotFound);
			if (allParsedData.length > 0 && allColumnExist) {
				console.log('HI I AM IN THIS AU')
				let appApplicationDataByPhoneNumber = {};
				let appApplicationDataByTracking = {};
				let AUApplicationsByMainId = {};
				let AUApplicationsByApplicationId = {};


				let getAllApplicationData = await auUploadModel.getAllApplicationsDataFromMainTable();


				if (getAllApplicationData && getAllApplicationData.length > 0) {
					//console.log(getAllApplicationData[0], "getAllApplicationData in if");
					for (let i = 0; i < getAllApplicationData.length; i++) {
						if (getAllApplicationData[i].tracking_id) {
							appApplicationDataByTracking[getAllApplicationData[i].tracking_id.trim()] = getAllApplicationData[i];
						}
						if (getAllApplicationData[i].phone_number) {
							appApplicationDataByPhoneNumber[getAllApplicationData[i].phone_number.trim()] = getAllApplicationData[i];
						}


					}
				}

				let getAuAllApplicationData = await auUploadModel.getAllAuApplicationsData();

				//let deleteQuery = `  `;
				if (getAuAllApplicationData && getAuAllApplicationData.length > 0) {

					for (let i = 0; i < getAuAllApplicationData.length; i++) {
						if (AUApplicationsByMainId[getAuAllApplicationData[i].ca_main_table]) {
							// deleteQuery = deleteQuery + `  delete from au_bank_applications_table 
							// where au_id = ${getAuAllApplicationData[i].au_id} ; `;
						} else {
							AUApplicationsByMainId[getAuAllApplicationData[i].ca_main_table] = getAuAllApplicationData[i];
						}
						// if (getAuAllApplicationData[i].ca_main_table){

						// } 
						getAuAllApplicationData[i].au_application_number = getAuAllApplicationData[i].au_application_number.trim();
						if (AUApplicationsByApplicationId[getAuAllApplicationData[i].au_application_number]) {
							// /* Deleting duplicate data from the database. */
							//deleteQuery = deleteQuery + `  delete from au_bank_applications_table 
							// where au_id = ${getAuAllApplicationData[i].au_id} ; `;
						} else {
							AUApplicationsByApplicationId[getAuAllApplicationData[i].au_application_number.trim()] = getAuAllApplicationData[i];
						}


					}
				}
				//await auUploadModel.deleteDuplicateData(deleteQuery);
				//console.log(AUApplicationsByApplicationId, "AUApplicationsByApplicationId------");

				let uploadDataInDB = await auUploadModel.entryToAuFromSheetAjex(allParsedData, appApplicationDataByPhoneNumber, AUApplicationsByMainId, AUApplicationsByApplicationId, appApplicationDataByTracking);
				if (uploadDataInDB.ipApproveData && uploadDataInDB.ipApproveData.length > 0) {
					//console.log(uploadDataInDB.ipApproveData , "uploadDataInDB");
					hitexternalApi.hitExternalApibeddlyingdrahomach(uploadDataInDB.ipApproveData);

				}
				//console.log(getAuAllApplicationData);
				//success response here....
				res.send({ status: true, message: "Operation performed successfully." });

			} else {
				let messageToSend = 'Invalid data';
				if (!allColumnExist) {
					messageToSend = ' Column missing = ' + columnNotFound.toString();
				}
				console.log(messageToSend, "messageToSendmessageToSend")
				res.send({ status: false, message: messageToSend });
			}


		} else {
			console.log('HI I AM IN THIS bdjfbdsjh');
			res.send({ status: false, message: "Invalid data" });

		}
	}

}

module.exports = controllerObj;  