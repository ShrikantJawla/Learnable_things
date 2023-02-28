/* Creating an empty object. */
const { pool } = require('../../utils/configs/database');
const commonModel = require('../../model/commonModel');

/* Creating an empty object. */
let modelObj = {};


/**
 * If the string is not a number, return 0, otherwise return the integer value of the string.
 * @param str - The string to check if it's a number.
 * @returns The function isNumericAndParseToInt is being returned.
 */
function isNumericAndParseToInt(str) {
	if (!isNaN(str)) {
		return parseInt(str);
	} else {
		return 0
	}
}



/* Assigning applications to users. */
modelObj.handleAddRemoveAssignments = async function ({
	applicationIdList,
	addUsersList,
	removeUsersList,
	isAssign,
	issuer_id,
	loggedUser

}) {

	let returnBoolean = false;

	issuer_id = isNumericAndParseToInt(issuer_id);
	if (issuer_id >= 0) {
		if (isAssign == 'true') {
			if (issuer_id == 1) {
				try {
					let finalQueryForEntry = ``;
					for (let i = 0; i < applicationIdList.length; i++) {
						let axisSelectQuery = `SELECT * FROM public.axis_bank_applications_table WHERE axis_id = $1 ;`;
						let dataFromAxisSelectQuery = await pool.query(axisSelectQuery, [applicationIdList[i]]);

						if (dataFromAxisSelectQuery.rows.length > 0) {
							for (let j = 0; j < addUsersList.length; j++) {
								let axisIpaOriginalStatusVal = dataFromAxisSelectQuery.rows[0].axis_ipa_original_status_sheet;

								let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
								if (aujData.rows.length == 0) {

									finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} );`;
									finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_axis_ipa_original_status_sheet) values('${issuer_id}','${applicationIdList[i]}','${issuer_id}_${applicationIdList[i]}', '${axisIpaOriginalStatusVal}')
								  ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
								}
							}
						}
					}
					if (finalQueryForEntry != "") {
						console.log(finalQueryForEntry, "queryeryeyryeyrey")
						await pool.query(finalQueryForEntry);
					}
					returnBoolean = true;

				} catch (error) {
					console.log(error);
					returnBoolean = false;
				}

			} else if (issuer_id == 4) {
				try {
					let finalQueryForEntry = ``;
					for (let i = 0; i < applicationIdList.length; i++) {
						let idfcSelectQuery = `SELECT * FROM public.idfc_bank_applications_table WHERE idfc_id = $1 ;`;
						let dataFromIdfcSelectQuery = await pool.query(idfcSelectQuery, [applicationIdList[i]]);

						if (dataFromIdfcSelectQuery.rows.length > 0) {
							for (let j = 0; j < addUsersList.length; j++) {
								let idfcIpaOriginalStatusVal = dataFromIdfcSelectQuery.rows[0].idfc_sub_status;

								let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
								if (aujData.rows.length == 0) {

									finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} );`;
									finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_idfc_sub_status) values('${issuer_id}','${applicationIdList[i]}','${issuer_id}_${applicationIdList[i]}', '${idfcIpaOriginalStatusVal}')
								  ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
								}
							}
						}
					}
					if (finalQueryForEntry != "") {

						await pool.query(finalQueryForEntry);
					}
					returnBoolean = true;

				} catch (error) {
					console.log(error);
					returnBoolean = false;
				}

			} else if (issuer_id == 7) {
				try {
					let finalQueryForEntry = ``;
					for (let i = 0; i < applicationIdList.length; i++) {
						let auSelectQuery = `SELECT * FROM public.au_bank_applications_table WHERE au_id = $1 ;`;
						let dataFromAuSelectQuery = await pool.query(auSelectQuery, [applicationIdList[i]]);

						if (dataFromAuSelectQuery.rows.length > 0) {
							for (let j = 0; j < addUsersList.length; j++) {
								let dropOffPageVal = dataFromAuSelectQuery.rows[0].au_drop_off_page;
								let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
								if (aujData.rows.length == 0) {
									finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} ) ;`;
									finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_au_dropoff_page) values('${issuer_id}','${applicationIdList[i]}','${issuer_id}_${applicationIdList[i]}', '${dropOffPageVal}')
									ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
								}
							}

						}
					}
					if (finalQueryForEntry != "") {

						await pool.query(finalQueryForEntry);

					}
					returnBoolean = true;

				} catch (error) {
					console.log(error);
					returnBoolean = false;
				}
			} else if (issuer_id == 11) {
				try {
					let finalQueryForEntry = ``;
					for (let i = 0; i < applicationIdList.length; i++) {
						let yesSelectQuery = `SELECT * FROM public.yes_bank_applications_table WHERE yb_id = $1 ;`;
						let dataFromYesSelectQuery = await pool.query(yesSelectQuery, [applicationIdList[i]]);

						if (dataFromYesSelectQuery.rows.length > 0) {
							for (let j = 0; j < addUsersList.length; j++) {
								let applicationStatusVal = dataFromYesSelectQuery.rows[0].yb_application_status;
								let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
								if (aujData.rows.length == 0) {

									finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} );`;
									finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_yes_application_status) values('${issuer_id}','${applicationIdList[i]}','${issuer_id}_${applicationIdList[i]}', '${applicationStatusVal}')
								  ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
								}

							}

						}
					}
					if (finalQueryForEntry != "") {

						await pool.query(finalQueryForEntry);
					}
					returnBoolean = true;

				} catch (error) {
					console.log(error);
					returnBoolean = false;
				}
			} else if (issuer_id == 6) {
				if (applicationIdList && applicationIdList.length > 0 && addUsersList) {
					let issuerId = 6;
					let insertedDataQuery = ``;
					for (let i = 0; i < applicationIdList.length; i++) {
						let checkIfAlreadyAssignSql = `SELECT * FROM public.lead_assigning_user_junction 
						where issuer_id = 6 AND is_work_done = false AND lead_id = ${applicationIdList[i]} `;
						let checkIfAlreadyExist = await commonModel.getDataOrCount(checkIfAlreadyAssignSql, [], 'D');
						console.log(checkIfAlreadyExist, "checkIfAlreadyExistcheckIfAlreadyExist");
						if (!checkIfAlreadyExist) {
							let inserdtedData = {
								lead_id: applicationIdList[i],
								user_id: addUsersList,
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
			} else {
				returnBoolean = false;
			}


		} else if (removeUsersList.length > 0) {
			if (issuer_id == 6) {
				// Need Work Here Remove Assignment from ICICI
				returnBoolean = false;
			} else {
				let finalRemoveQuery = ``;
				for (i = 0; i < applicationIdList.length; i++) {
					for (j = 0; j < removeUsersList.length; j++) {
						finalRemoveQuery += ` DELETE FROM public.applications_users_junction where application_id='${applicationIdList[i]}' and admin_user='${removeUsersList[j]}' and issuer_id=${issuer_id}; `;
					}
				}
				try {
					await pool.query(finalRemoveQuery);
					returnBoolean = true;
				} catch (err) {
					console.log(err);
					returnBoolean = false;
				}
			}

		} else {
			returnBoolean = false;
		}

	} else {
		console.log("invalid");
		returnBoolean = false;
	}
	return returnBoolean;

}



/* Updating the admin_user column in the applications_users_junction table. */
modelObj.handleReassignAssignments = async function ({
	applicationIdList,
	reassignFrom,
	reassignTo,
	issuer_id,
	loggedUser
}) {

	let returnBoolean = false;
	issuer_id = isNumericAndParseToInt(issuer_id);
	console.log(issuer_id);
	if (issuer_id >= 0) {

		let finalQueryForReassign = ``;
		for (let i = 0; i < applicationIdList.length; i++) {
			for (let j = 0; j < reassignFrom.length; j++) {
				for (let k = 0; k < reassignTo.length; k++) {
					finalQueryForReassign += ` UPDATE public.applications_users_junction SET admin_user = ${reassignTo[k]} , auj_updated_at = (now() AT TIME ZONE 'Asia/Kolkata') , auj_updated_by =  ${loggedUser.ua_id} WHERE application_id = ${applicationIdList[i]} AND issuer_id = ${issuer_id} AND admin_user = ${reassignFrom[j]}; `;
				}
			}
		}

		try {
			console.log(finalQueryForReassign, "---------->>>>> \n\n\n");
			await pool.query(finalQueryForReassign);
			returnBoolean = true;
		} catch (err) {
			console.log(err);
			returnBoolean = false;
		}


	} else {
		returnBoolean = false;

	}

	return returnBoolean;

}







module.exports = modelObj;