
const { pool } = require('../../../configration/database');
const notificationService = require('../common/firebaseService/scheduleNotification');
const commonModel = require('../model/commonModel');
let modelObj = {};



/**
 * It takes a transaction ID as an argument, queries the database for the transaction details, and
 * returns the data
 * @param transactionId - The transaction ID of the transaction you want to get the data for.
 * @returns An array of objects.
 */
async function getTransactionData(transactionId) {

	let returnData = false;

	if (transactionId) {
		let queryToDb = `SELECT * FROM public.transaction_details WHERE td_uuid = $1`;
		try {
			let dataFromDb = await pool.query(queryToDb, [transactionId]);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}
	return returnData;
}


/**
 * This function returns an array of objects containing the data from the junction table for a given
 * transaction id
 * @param transactionId - The transaction ID of the transaction you want to get the data for.
 * @return An array to transaction junction data objects.
 */
async function getTransactionJunctionData(transactionId) {

	let returnData = false;

	if (transactionId) {
		let queryToDb = `SELECT * FROM public.transation_applications_referrals_junction WHERE tarj_transaction_detail = ${transactionId}`;
		console.log(queryToDb , '.......');
		try {
			
			let dataFromDb = await pool.query(queryToDb, );
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}
	return returnData;
}


/**
 * This function updates the cashback applications in the database
 * @param cashBackApplications - An array of card application IDs that are to be updated.
 * @param userSessionId - The user's session ID.
 */
async function updateCashbackApplications(cashBackApplications, userSessionId) {

	let returnData = false;

	if (cashBackApplications.length > 0 && userSessionId) {
		let queryToDb = ``;
		for (let j = 0; j < cashBackApplications.length; j++) {
			queryToDb = queryToDb + `UPDATE card_applications SET "Cashback_paid" = true, updated_at = CURRENT_TIMESTAMP, updated_by = ${userSessionId} where id = ${cashBackApplications[j]} ; `;
		}
		console.log(queryToDb, "----db query ---");
		if (queryToDb != "") {
			try {
				let dataFromDb = await pool.query(queryToDb);
				returnData = dataFromDb;
			} catch (error) {
				console.log(error);
			}
		}

	}
	return returnData;
}

/**
 * It takes an array of user ids and a user session id and updates the database with the user session
 * id and a boolean value
 * @param userReferrals - An array of user ids who have referred the user.
 * @param userSessionId - The user id of the user who is logged in.
 */
async function updateUserreferrals(userReferrals, userSessionId) {

	let returnData = false;

	if (userReferrals.length > 0 && userSessionId) {
		let queryToDb = ``;
		for (let j = 0; j < userReferrals.length; j++) {
			queryToDb = queryToDb + `UPDATE card_insider_users SET "Referral_commission_paid" = true, updated_at = CURRENT_TIMESTAMP, updated_by = ${userSessionId}  where id = ${userReferrals[j]} ; `;
		}
		console.log(queryToDb, "----db query ---");
		if (queryToDb != "") {
			try {
				let dataFromDb = await pool.query(queryToDb);
				returnData = dataFromDb;
			} catch (error) {
				console.log(error);
			}
		}

	}

	return returnData;
}


/**
 * It updates the transaction status and message in the database
 * @param transactionStatus - The status of the transaction.
 * @param transactionMessage - The message to be displayed to the user.
 * @param userSessionId - The user session id of the user who is making the request.
 * @param transactionId - The transaction ID that you want to update.
 */
async function updateTransactionStatus(transactionStatus, transactionMessage, userSessionId, transactionId , transacationUserId) {

	let returnData = false;

	if (transactionStatus && transactionId) {
		let dataToUpdate = {
			transactionStatus: transactionStatus,
			transactionMessage: transactionMessage ?? ""
		};


		let queryToDb = `UPDATE transaction_details SET td_status = $1, td_message = $2, td_updated_at =  CURRENT_TIMESTAMP, td_updated_by = $3 WHERE td_id = $4 returning  *;`;
		let ifFailedQuery = '';
		if (transactionStatus == 'Failed') {
			ifFailedQuery =  ` UPDATE card_insider_users SET cashback_claimed = true ,  updated_at =  CURRENT_TIMESTAMP WHERE id = ${transacationUserId};`
		}
		try {
			let dataFromDb = await pool.query(queryToDb, [dataToUpdate.transactionStatus, dataToUpdate.transactionMessage, userSessionId, transactionId]);
			if (ifFailedQuery){
				console.log(ifFailedQuery , "ifFailedQueryifFailedQuery");
				let dataUpdate = await pool.query(ifFailedQuery);
			}
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}

	return returnData;

}


/**
 * It takes a userId as an argument and returns the user's fcm_token from the database
 * @param userId - The user ID of the user you want to send the push notification to.
 */
async function getUserFcmForPushNotification(userId) {

	if (userId && userId != "") {
		try {
			let query = `SELECT id, fcm_token FROM card_insider_users where id = $1; `
			let queryResponse = await pool.query(query, [userId])
			return queryResponse.rows

		} catch (error) {
			return false
		}

	} else {
		return false
	}
}



/* The above code is used to complete the transaction. */
modelObj.completeTransaction = async function (transactionId, transactionStatus, transactionNote, userSessionId) {
	let returnData = {
		status: false,
		code: 'CIA-Transaction-err-203',
		transactionId : transactionId,
		transactionStatus : transactionStatus,
		transactionNote : transactionNote ,
		userSessionId :userSessionId,
		dataTransaction : ''
	};
	console.log(transactionId, userSessionId, transactionStatus, "-- line 174 in model");
	if (transactionId && userSessionId && transactionStatus) {

		let dataFromTransaction = await getTransactionData(transactionId);
		console.log('11111');
		//console.log(dataFromTransaction, "--- datafrom transaction \n\n\n");
		returnData.dataTransaction = dataFromTransaction;
		if (dataFromTransaction.length > 0 && dataFromTransaction[0].td_status == 'Processing') {
			console.log('22222');
			if (transactionStatus == "Completed") {
				console.log('3333');
				let dataFromTransactionJunction = await getTransactionJunctionData(dataFromTransaction[0].td_id);
				
				let queryForPaymentReport = ` UPDATE approved_payment_tables SET is_paid = true  WHERE transaction_id = '${dataFromTransaction[0].td_id}' `;
				let updatePaymentReport = await commonModel.getDataOrCount(queryForPaymentReport, [], 'U');
				console.log( "--- datafrom transaction junction  \n\n\n");


				let cashbackJunction = [];
				let referralJunction = [];
				let dataFromCashbackjunctionUpdate = false;
				let dataFromReferralJunctionUpdate = false;
				let dataFromTransactionUpdate = false;
				let sendCashbackNotification = false;
				let sendReferralsNotification = false;


				if (dataFromTransactionJunction.length > 0) {
					for (let i = 0; i < dataFromTransactionJunction.length; i++) {

						if (dataFromTransactionJunction[i].tarj_is_referred == true) {
							referralJunction.push(dataFromTransactionJunction[i].tarj_referred_user);

						} else {
							cashbackJunction.push(dataFromTransactionJunction[i].tarj_application);

						}

					}
					//console.log(cashbackJunction, referralJunction, "0----- junctions \n\n\n");

					if (cashbackJunction.length > 0) {
						dataFromCashbackjunctionUpdate = await updateCashbackApplications(cashbackJunction, userSessionId);
						if (dataFromCashbackjunctionUpdate) {
							sendCashbackNotification = true;
						}
					}


					if (referralJunction.length > 0) {
						dataFromReferralJunctionUpdate = await updateUserreferrals(referralJunction, userSessionId);
						if (dataFromReferralJunctionUpdate) {
							sendReferralsNotification = true;
						}
					}

					//console.log(dataFromCashbackjunctionUpdate, dataFromReferralJunctionUpdate, "------- update data from junctions \n\n");


					if (dataFromCashbackjunctionUpdate || dataFromReferralJunctionUpdate) {

						dataFromTransactionUpdate = await updateTransactionStatus("Completed", transactionNote, userSessionId, dataFromTransaction[0].td_id ,  dataFromTransaction[0].td_user_id);

						//console.log(dataFromTransactionUpdate, "----data from transaction update");

						if (dataFromTransactionUpdate) {

							let notificationFcm = ""



							let userFcm = await getUserFcmForPushNotification(dataFromTransaction[0].td_user_id);

							if (userFcm.length > 0) {
								notificationFcm = userFcm[0]['fcm_token']
							}


							//console.log(notificationFcm, "user fcm \n\n");

							//console.log(cashbackJunction.length, sendCashbackNotification, "----- cashback junction ---- \n\n");
							//console.log(referralJunction.length, sendReferralsNotification, "----- referral junction ---- \n\n");

							if (sendCashbackNotification && sendReferralsNotification) {
								// console.log("\n\n\n---- send both notification ---\n\n\n to \n\n\n fcm ------ ", notificationFcm)

								let notificationResponse = await notificationService.sendCashbackReferralsNotification({
									notificationTitle: "Your CASHBACK💰 Has been paid!🤩",
									body: "Congrats! We have transferred the cashback which you have earned via Card Insider App to your Account. If you liked the service please take time to rate us",
									imgUrl: "https://cardinsider.com/wp-content/uploads/2022/09/cardinsiderapp.jpg",
									token: notificationFcm
								});
								//console.log("\n\n ", notificationResponse, "\n\n\n")

							} else if (sendCashbackNotification) {
								// console.log("\n\n\n---- send sendCashbackNotification notification ---\n\n\n to \n\n\n fcm ------ ", notificationFcm)

								let notificationResponse = await notificationService.sendCashbackReferralsNotification({
									notificationTitle: "Your CASHBACK💰 Has been paid!🤩",
									body: "Congrats! We have transferred the cashback which you have earned via Card Insider App to your Account. If you liked the service please take time to rate us",
									imgUrl: "https://cardinsider.com/wp-content/uploads/2022/09/cardinsiderapp.jpg",
									token: notificationFcm,

								});
								//console.log("\n\n ", notificationResponse, "\n\n\n")

							} else if (sendReferralsNotification) {
								// console.log("\n\n\n---- send sendReferralsNotification notification ---\n\n\n to \n\n\n fcm ------ ", notificationFcm)

								let notificationResponse = await notificationService.sendCashbackReferralsNotification({
									notificationTitle: "Your Referral Commission💰 Has been paid!🤩",
									body: "Congrats! We have transferred the Referral Commission which you have earned via Card Insider App to your Account. If you liked the service please take time to rate us.",
									imgUrl: "https://cardinsider.com/wp-content/uploads/2022/09/cardinsiderapp.jpg",
									token: notificationFcm,

								})
								console.log("\n\n ", notificationResponse, "\n\n\n")
							}

							// Unsubscribe claim_cashback_request topic here

							let unsubcribeResponse = notificationService.unSubscribeFromTopic(notificationFcm, "claim_cashback_request")

							//console.log("unsubsribe response -----: - ", unsubcribeResponse)

							returnData.status = true;
							returnData.code = 'CIA-Transaction-success-204';
							return returnData;




						} else {
							returnData.status = false;
							returnData.code = 'CIA-Transaction-err-210';
							return returnData;


						}

						//console.log("\n\n\n hello world!!! \n\n\n");



					} else {
						returnData.status = false;
						returnData.code = 'CIA-Transaction-err-211';
						return returnData;

					}

				} else {
					returnData.status = false;
					returnData.code = 'CIA-Transaction-err-206';
					return returnData;

				}

			} else if (transactionStatus == "Failed") {

				let dataFromTransactionUpdate = await updateTransactionStatus("Failed", transactionNote, userSessionId, dataFromTransaction[0].td_id ,  dataFromTransaction[0].td_user_id);

				console.log(dataFromTransactionUpdate, "----data from transaction update");

				if (dataFromTransactionUpdate) {
					returnData.status = true;
					returnData.code = 'CIA-Transaction-success-207';
					return returnData;

				} else {
					returnData.status = false;
					returnData.code = 'CIA-Transaction-err-208';
					return returnData;

				}

			} else if (transactionStatus == "Hold") {

				//TODO: have to work here for transaction status hold 

				//console.log("hi im in hold transaction ");
				returnData.status = false;
				returnData.code = 'CIA-Transaction-err-210';
				return returnData;



			} else {
				returnData.status = false;
				returnData.code = 'CIA-Transaction-err-209';
				return returnData;
			}





		} else {
			returnData.status = false;
			returnData.code = 'CIA-Transaction-err-205';
			return returnData;

		}

	} else {

		return returnData;
	}

}


module.exports = modelObj;