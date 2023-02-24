
const { pool } = require('../../../configration/database');

const upiVerification = require('../common/upiVerification/upiVerification');
const bankAccVerification = require('../common/bankAccVerification/bankAccVerification');
const commonModel = require('../model/commonModel');

let modelObj = {};


/**
 * It takes a userId as an argument, queries the database for the user's payment details, and returns
 * the data
 * @param userId - The user's ID.
 * @returns An array of objects.
 */
async function getPaymentDetails(userId) {

	let returnData = false;

	if (userId) {
		let queryToDb = `SELECT * FROM public.account_informations WHERE card_insider_user = $1`;
		try {
			let dataFromDb = await pool.query(queryToDb, [userId]);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}

	return returnData;

}

/**
 * It takes in the data returned from the UPI API and the accountId of the user and updates the
 * database with the data
 * @param verifyData - The response from the UPI API.
 * @param accountId - The account id of the user.
 */
async function updatePaymentDetailsWithUpi(verifyData, accountId, userSessionId) {

	let returnData = false;

	if (verifyData && accountId) {
		let dataToAdd = {
			upiStatus: verifyData.valid ?? false,
			upiName: verifyData.name ?? verifyData.message ?? ""
		};



		console.log(dataToAdd, accountId, "---- dataToAdd ");

		let queryToDb = `UPDATE account_informations SET is_upi_valid = $1, upi_valid_name = $2, updated_at =  CURRENT_TIMESTAMP, updated_by = $3 WHERE id = $4 returning  *;`;
		try {
			let dataFromDb = await pool.query(queryToDb, [dataToAdd.upiStatus, dataToAdd.upiName, userSessionId, accountId]);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}

	return returnData;

}


/**
 * It takes in the data from the bank verification API, the account id and the user session id and
 * updates the account information table with the bank verification data
 * @param verifyData - The response from the bank verification API.
 * @param accountId - The account ID of the account you want to update.
 * @param userSessionId - The user's session ID.
 */
async function updatePaymentDetailsWithBank(verifyData, accountId, userSessionId) {

	let returnData = false;

	if (verifyData && accountId) {
		let dataToAdd = {
			bankVaildStatus: verifyData.valid ?? false,
			validbankName: (verifyData.name ?? verifyData.message ?? "") + " " + (verifyData.status ?? "")
		};


		console.log(dataToAdd, accountId, "---- dataToAdd ");

		let queryToDb = `UPDATE account_informations SET is_bank_valid = $1, bank_valid_name = $2, updated_at =  CURRENT_TIMESTAMP, updated_by = $3 WHERE id = $4 returning  *;`;
		try {
			let dataFromDb = await pool.query(queryToDb, [dataToAdd.bankVaildStatus, dataToAdd.validbankName, userSessionId, accountId]);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}

	return returnData;

}


/**
 * It returns all the approved card applications for a user that have not been paid cashback for
 * @param userId - The user's ID
 */
async function getUserApplicationForCashback(userId) {

	let returnData = false;

	if (userId) {
		let queryToDb = `SELECT * FROM card_applications where  "card_insider_user" = $1 AND "Application_Status" = 'Approved' AND ("Cashback_paid" IS NULL OR "Cashback_paid" = false) ;`;
		try {
			let dataFromDb = await pool.query(queryToDb, [userId]);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}

	return returnData;

}


/**
 * This function returns an array of users who have been referred by the user with the userId passed in
 * as an argument
 * @param userId - The user id of the user who referred the users we're looking for.
 * @returns An array of objects.
 */
async function getUsersForReferrals(userId) {

	let returnData = false;

	if (userId) {
		let queryToDb = `SELECT * FROM card_insider_users where "referred_by" = ${userId} AND "Referrers_approved" = 1 AND ("Referral_commission_paid" IS NULL OR "Referral_commission_paid" = false);`;
		console.log(queryToDb);
		try {
			let dataFromDb = await pool.query(queryToDb);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}

	return returnData;

}




/**
 * Adding the transaction details to the database.
 * @param userId - The userId of the user who is making the payment.
 * @param totalAmountOfUser - The total amount of the user.
 * @param userPaymentDetails - This is the object that contains the payment details of the user.
 * @param userSessionId - The user session id of the user who is making the payment.
 * @returns the data from the database.
 */
async function addTransactionDetails(userId, totalAmountOfUser, userPaymentDetails, userSessionId) {

	let returnData = false;


	/* Checking if the userId, totalAmountOfUser, userPaymentDetails, and userSessionId are not null. If
	they are not null, it is adding the data to the database. */
	if (userId && totalAmountOfUser && userPaymentDetails && userSessionId) {


		console.log("\n\n\n", userPaymentDetails, "\n\n\n in method");

		if (userPaymentDetails.method == "upi") {

			let dataToAdd = {
				userId: userId,
				status: 'Processing',
				amount: totalAmountOfUser,
				upiId: userPaymentDetails.upi_id,
				method: userPaymentDetails.method,
				created_by: userSessionId,
				updated_by: userSessionId
			};
			let queryToDb = `INSERT INTO transaction_details(td_status, td_user_id, td_amount, td_upi_id, td_method, td_created_by, td_updated_by) 
			values($1, $2, $3, $4, $5, $6, $7) returning *;`;
			console.log(queryToDb, "queryToDbqueryToDb");
			try {
				let dataFromDb = await pool.query(queryToDb, [dataToAdd.status, dataToAdd.userId, dataToAdd.amount, dataToAdd.upiId, dataToAdd.method, dataToAdd.created_by, dataToAdd.updated_by]);
				returnData = dataFromDb.rows;
			} catch (error) {
				console.log(error);
			}

		} else if (userPaymentDetails.method == "bank") {
			let dataToAdd = {
				userId: userId,
				status: 'Processing',
				amount: totalAmountOfUser,
				accountName: userPaymentDetails.account_name,
				accountNumber: userPaymentDetails.account_number,
				accountBank: userPaymentDetails.bank_name,
				ifscCode: userPaymentDetails.ifsc_code,
				method: userPaymentDetails.method,
				created_by: userSessionId,
				updated_by: userSessionId
			};
			let queryToDb = `INSERT INTO transaction_details(td_status, td_user_id, td_amount, td_account_name, td_account_number, td_bank_name, td_ifsc_code, td_method, td_created_by, td_updated_by) 
			values($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) returning *;`;
			try {
				let dataFromDb = await pool.query(queryToDb, [dataToAdd.status, dataToAdd.userId, dataToAdd.amount, dataToAdd.accountName, dataToAdd.accountNumber, dataToAdd.accountBank, dataToAdd.ifscCode, dataToAdd.method, dataToAdd.created_by, dataToAdd.updated_by]);
				returnData = dataFromDb.rows;
			} catch (error) {
				console.log(error);
			}

		}
	}
	return returnData;

}



/**
 * It takes in the transaction data, applications data and referrals data and inserts them into the
 * junction table
 * @param transactionData - This is the data that is returned from the transactionEntry function.
 * @param applicationsData - This is an array of objects that contains the application id and the
 * cashback amount for each application.
 * @param referralsData - This is an array of objects that contains the user id and the amount to be
 * paid to the user.
 * @param userSessionId - The user's session ID.
 */
async function transactionsJuntionEntry(transactionData, applicationsData, referralsData, userSessionId) {

	let returnData = false;

	if (transactionData.length > 0) {

		let dbQuery = ``;

		if (applicationsData.length > 0) {
			for (let i = 0; i < applicationsData.length; i++) {
				dbQuery = dbQuery + `INSERT INTO transation_applications_referrals_junction (tarj_transaction_detail, tarj_application, tarj_application_cashback,  tarj_is_referred, tarj_created_by, tarj_updated_by) 
				values(${transactionData[0].td_id}, ${applicationsData[i].id}, ${applicationsData[i]['Cashback_to_be_paid']}, ${false}, ${userSessionId}, ${userSessionId}); `;

			}
		}
		if (referralsData.length > 0) {
			for (let i = 0; i < referralsData.length; i++) {
				dbQuery = dbQuery + `INSERT INTO transation_applications_referrals_junction (tarj_transaction_detail, tarj_referred_user, tarj_referred_amount,  tarj_is_referred, tarj_created_by, tarj_updated_by) 
				values(${transactionData[0].td_id}, ${referralsData[i].id}, ${referralsData[i]['refer_amount']}, ${true}, ${userSessionId}, ${userSessionId}); `;
			}
		}
		if (dbQuery != "") {
			console.log("\n\n executing query --- \n\n");
			try {
				let dataFromDb = await pool.query(dbQuery);
				returnData = dataFromDb;
			} catch (error) {

				console.log(error);

			}
		}
	}
	return returnData;
}



/**
 * It updates the user's claim status to false and returns the updated user data
 * @param userId - The user's ID
 * @param userSessionId - The user's session ID.
 */
async function updateUserClaim(userId, userSessionId) {

	let returnData = false;

	if (userId && userSessionId) {

		let queryToDb = `UPDATE card_insider_users SET cashback_claimed = $1,  updated_at =  CURRENT_TIMESTAMP, updated_by = $2 WHERE id = $3 returning  *;`;
		try {
			let dataFromDb = await pool.query(queryToDb, [false, userSessionId, userId]);
			returnData = dataFromDb.rows;
		} catch (error) {
			console.log(error);
		}
	}
	console.log(returnData, "return data -----");
	return returnData;
}


/**
 * It checks if a transaction has already been created for a given application
 * @param whereQueryForApplicationId - This is the where clause for the query.
 * @param userId - The user id of the user who is making the payment.
 * @param getAllApplicationsToBePaidArray - This is an array of application ids that are to be paid.
 */
async function checkIfTransactionAlreadyCreatedForApplications(whereQueryForApplicationId, userId, getAllApplicationsToBePaidArray) {

	let returnData = false;
	let queryToDb = `SELECT *  FROM public.transation_applications_referrals_junction 
	left join transaction_details on td_id = tarj_transaction_detail 
	where ${whereQueryForApplicationId} AND (td_status = 'Processing' or td_status = 'Completed' ) ; `;
	console.log(queryToDb, "queryToDbqueryToDb");
	let existingApplications = {};
	let notMatchedApplications = [];
	let isAlreadyExistAllApplications = false;
	try {
		if (whereQueryForApplicationId) {
			let dataFromDb = await pool.query(queryToDb, []);
			returnData = dataFromDb.rows;
			if (returnData && returnData.length > 0) {
				for (let i = 0; i < returnData.length; i++) {
					if (returnData[i].tarj_application && returnData[i].tarj_application != null && returnData[i].tarj_application > 0) {
						existingApplications[returnData[i].tarj_application] = returnData[i];
					}

				}
				isAlreadyExistAllApplications = true;
				if (getAllApplicationsToBePaidArray && getAllApplicationsToBePaidArray.length > 0) {

					for (let k = 0; k < getAllApplicationsToBePaidArray.length; k++) {
						if (!existingApplications[getAllApplicationsToBePaidArray[k]]) {
							notMatchedApplications.push(getAllApplicationsToBePaidArray[k]);
							isAlreadyExistAllApplications = false;
						}
					}
				}
			} else {
				isAlreadyExistAllApplications = false;
				notMatchedApplications = getAllApplicationsToBePaidArray;
			}
			//console.log(notMatchedApplications, "notMatchedApplications");

		}
		return { notMatchedApplications, isAlreadyExistAllApplications };
	} catch (error) {
		console.log(error);
	}
	return returnData;
}

/**
 * It checks if the transaction is already created for the refferals
 * @param referedToId - This is an array of user ids that are being referred to.
 * @param refferalIdsQuery - This is a string that contains the IDs of the users that you want to check
 * if they have already been referred.
 * @param userId - The user id of the user who is creating the transaction.
 */
async function checkIfTransactionAlreadyCreatedForRefferals(referedToId, refferalIdsQuery, userId) {

	let returnData = false;
	let queryToDb = `SELECT * FROM public.transation_applications_referrals_junction 
	left join transaction_details on td_id = tarj_transaction_detail 
	where ( ${refferalIdsQuery}) and td_user_id = ${userId} AND (td_status = 'Processing' or td_status = 'Completed' )`;
	console.log(queryToDb, "queryToDbqueryToDb");
	let alreadyReferedUsers = {};
	let notMatchedRefferls = [];
	let isAlreadyExistAllRefrels = false;
	try {
		let dataFromDb = await pool.query(queryToDb, []);
		returnData = dataFromDb.rows;
		//console.log(returnData, "returnDatareturnDatareturnData");

		if (returnData && returnData.length > 0) {
			for (let i = 0; i < returnData.length; i++) {
				alreadyReferedUsers[returnData[i].tarj_referred_user] = returnData[i];
			}
			isAlreadyExistAllRefrels = true;
			if (referedToId && referedToId.length > 0) {
				for (let k = 0; k < referedToId.length; k++) {
					if (!alreadyReferedUsers[referedToId[k]]) {
						isAlreadyExistAllRefrels = false;
						notMatchedRefferls.push(referedToId[k]);
					}
				}
			}
		} else {
			isAlreadyExistAllRefrels = false;
			notMatchedRefferls = refferalIdsQuery;
		}
		console.log(notMatchedRefferls, isAlreadyExistAllRefrels);
		return { notMatchedRefferls, isAlreadyExistAllRefrels };
	} catch (error) {
		console.log(error);
	}
	return returnData;
}


modelObj.processTransactionNew = async function (paymentReportId, userSessionId) {
	let transactionNeedToInsert = false;
	let returnObj = {
		allDone : false,
		message : 'SOMETHING WENTS WRONG'

	}
	let paymentReportQuery = ` SELECT approved_payment_tables.*  , card_insider_users.cashback_claimed , account_informations.method , account_informations.upi_id , account_informations.is_upi_valid ,  
    account_informations.is_bank_valid , account_informations.upi_valid_name , account_informations.id as accountInformationId 
	, account_informations.account_number , account_informations.ifsc_code , account_informations.bank_name as user_bank_name , account_informations.account_name
	FROM public.approved_payment_tables  
    LEFT JOIN card_insider_users ON card_insider_users.id = approved_payment_tables.user_id
    LEFT JOIN account_informations ON account_informations.card_insider_user = card_insider_users.id where approved_payment_tables.id = ${paymentReportId} ;`;
	let paymentReport = await commonModel.getDataOrCount(paymentReportQuery, [], 'D');
	let paymnetMode = '';
	if (paymentReport && paymentReport.length > 0) {
		let paymentReportResult = paymentReport[0];
		if (paymentReportResult.is_paid != true && paymentReportResult.transaction_id == null) {
			paymnetMode = paymentReportResult.method;
			if (paymentReportResult.method == 'upi') {
				if (paymentReportResult.upi_id != null) {
					if (paymentReportResult.is_upi_valid == true) {
						transactionNeedToInsert = true;
					} else {
						let verifyUpiResult = await upiVerification.verifyUpiId(paymentReportResult.upi_id);
						console.log(verifyUpiResult , "verifyUpiResultverifyUpiResultverifyUpiResult")
						if (verifyUpiResult) {
							let upiUpdateResponse = await updatePaymentDetailsWithUpi(verifyUpiResult, paymentReportResult.accountinformationid, userSessionId);
							if ( verifyUpiResult.upiStatus == true || verifyUpiResult.valid == true){
								transactionNeedToInsert = true;
							} else {
								returnObj.message = 'UPI ID NOT VALID 1';
							}
							
						} else {
							returnObj.message = 'UPI ID NOT VALID';
						}
					}
				} else {
					returnObj.message = 'UPI ID NOT EXIST';
				}

			} else if (paymentReportResult.method == 'bank') {
				if (paymentReportResult.account_number && paymentReportResult.ifsc_code) {
					if ( paymentReportResult.is_bank_valid == true) {
						transactionNeedToInsert = true;
					} else {
						let verifyBankResult = await bankAccVerification.verifiyBankAcc(paymentReportResult.account_number, paymentReportResult.ifsc_code);
						console.log(verifyBankResult , "verifyBankResultverifyBankResultverifyBankResultverifyBankResult");
						if (verifyBankResult) {

							let bankUpdateResponse = await updatePaymentDetailsWithBank(verifyBankResult, paymentReportResult.accountinformationid, userSessionId);
							if (verifyBankResult.bankVaildStatus == true || verifyUpiResult.valid == true){
								transactionNeedToInsert = true;
							} else {
								returnObj.message = 'BANK INFORMATION NOT VAILD';
							}
							
						} else {
							returnObj.message = 'BANK INFORMATION NOT VAILD';
						}
					}
				} else {
					returnObj.message = 'BANK INFORMATION NOT EXIST';
				}
			} else {
				returnObj.message = 'ACCOUNT INFORMATION NOT EXIST';
			}
		} else {
			returnObj.message = 'PAYMENT ALLREADY DONE  OR IN PROCESS';
		}
		if (  transactionNeedToInsert){
			let insertedData = {
				td_status : 'Processing',
				td_method : paymnetMode,
				td_user_id : paymentReportResult.user_id,
				td_amount : paymentReportResult.payment_amount,
				td_created_by : userSessionId
			};
			let insertinJunction = {
				tarj_transaction_detail : '',
				
				tarj_created_by : userSessionId
	
			}
			if (paymnetMode == 'upi'){
				insertedData.td_upi_id = paymentReportResult.upi_id;
			} else if(paymnetMode == 'bank') {
				insertedData.td_account_name = paymentReportResult.account_name;
				insertedData.td_account_number = paymentReportResult.account_number;
				insertedData.td_bank_name = paymentReportResult.user_bank_name;
				insertedData.td_ifsc_code = paymentReportResult.ifsc_code;
			}
				
			if (paymentReportResult.payment_type == 'cashback'){
				insertinJunction.tarj_application = paymentReportResult.application_id;
				insertinJunction.tarj_application_cashback = paymentReportResult.payment_amount;
				insertinJunction.tarj_is_referred = false;
			} else if(paymentReportResult.payment_type == 'referral') {
				insertinJunction.tarj_referred_user = paymentReportResult.referred_to_id;
				insertinJunction.tarj_referred_amount = paymentReportResult.payment_amount;
				insertinJunction.tarj_is_referred = true;
			}
			console.log(insertedData , "insertedDatainsertedDatainsertedData");
			let inserQueryOfTransaction = await commonModel.insert('transaction_details' , insertedData , true);
			inserQueryOfTransaction = inserQueryOfTransaction + ` returning *`;
			let insertedDataTransaction = await commonModel.getDataOrCount(inserQueryOfTransaction, [], 'D');
			console.log(insertedDataTransaction , "insertedDataTransaction");
			if (insertedDataTransaction  && insertedDataTransaction.length > 0){
				insertinJunction.tarj_transaction_detail = insertedDataTransaction[0].td_id;
				let inserQueryOfTransactionJunction = await commonModel.insert('transation_applications_referrals_junction' , insertinJunction , true);
				inserQueryOfTransactionJunction = inserQueryOfTransactionJunction + ` returning *`;
				let insertedDataTransactionJunction = await commonModel.getDataOrCount(inserQueryOfTransactionJunction, [], 'D');
				console.log(insertedDataTransactionJunction , "insertedDataTransactionJunctioninsertedDataTransactionJunction");

				let queryForPaymentReport = ` UPDATE approved_payment_tables SET transaction_id = ${insertinJunction.tarj_transaction_detail}  WHERE id = ${paymentReportId}`;
				console.log(queryForPaymentReport , "queryForPaymentReportqueryForPaymentReportqueryForPaymentReport");
				let updatePaymentReport = await commonModel.getDataOrCount(queryForPaymentReport, [], 'U');
				returnObj.allDone = true;
				returnObj.message = " ALL OK";
			}
		}
	} else {
		returnObj.message = 'INVALID ENTRY';
	}
	return returnObj;
}
modelObj.processTransaction = async function (userId, userSessionId) {
	/* Creating an object called returnData and assigning it a value of false. */
	let returnData = {
		status: false,
		code: 'CIA-Transaction-err-102',
		message: '',
	};


	if (userId != "") {

		// have to get the user payment details 
		/* Calling the getPaymentDetails function and assigning the result to the userPaymentDetails
		variable. */
		let userPaymentDetails = await getPaymentDetails(userId);
		//console.log(userPaymentDetails, "--- userpayment Details \n\n");

		// have to check if we have to verify the upi or not 



		if (userPaymentDetails.length > 0) {

			console.log(userPaymentDetails[0], "RAHUL");
			/*  */
			if (userPaymentDetails[0].method == "upi" && !userPaymentDetails[0].is_upi_valid && userPaymentDetails[0].upi_id != "" && userPaymentDetails[0].upi_id != null) {
				let verifyUpiResult = await upiVerification.verifyUpiId(userPaymentDetails[0].upi_id);
				//console.log(verifyUpiResult, "---- upi verification result \n\n ");

				// updating upi verification detials in account table 
				if (verifyUpiResult) {
					let upiUpdateResponse = await updatePaymentDetailsWithUpi(verifyUpiResult, userPaymentDetails[0].id, userSessionId);
					//console.log(upiUpdateResponse, "upi update response \n\n");
					userPaymentDetails = upiUpdateResponse;


				}

			}

			if (userPaymentDetails[0].method == "bank" && !userPaymentDetails[0].is_bank_valid && userPaymentDetails[0].account_name && userPaymentDetails[0].account_number && userPaymentDetails[0].ifsc_code) {

				console.log("\n\n\n have to valid bank account here.... \n\n\n");

				let verifyBankResult = await bankAccVerification.verifiyBankAcc(userPaymentDetails[0].account_number, userPaymentDetails[0].ifsc_code);
				console.log(verifyBankResult, "---- account verification result \n\n ");

				if (verifyBankResult) {

					let bankUpdateResponse = await updatePaymentDetailsWithBank(verifyBankResult, userPaymentDetails[0].id, userSessionId);
					console.log(bankUpdateResponse, "bank update response \n\n");
					userPaymentDetails = bankUpdateResponse;

				}

			}



			if ((userPaymentDetails[0].method == "upi" && userPaymentDetails[0].is_upi_valid) || (userPaymentDetails[0].method == "bank" && userPaymentDetails[0].is_bank_valid)) {

				//console.log(userPaymentDetails);

				//have to check the user cashbacks here....

				let userApprovedApplicationsEligibleForCashback = await getUserApplicationForCashback(userId);

				console.log(userApprovedApplicationsEligibleForCashback, "user applications cashback \n\n");


				//have  to check user referrals here....

				let userReferralsEligibleForReferral = await getUsersForReferrals(userId);
				console.log(userReferralsEligibleForReferral, "user referrals \n\n");


				let cashbackAmount = 0;
				let referralAmount = 0;
				let totalAmountOfUser = 0;
				let getAllApplicationsToBePaid = {};
				let getAllRefferlsToBePaid = {};
				let getAllApplicationsToBePaidArray = [];
				let whereQueryForApplicationId = ``;
				let referedToId = [];
				let refferalIdsQuery = ``;


				if (userApprovedApplicationsEligibleForCashback.length > 0) {
					for (let i = 0; i < userApprovedApplicationsEligibleForCashback.length; i++) {
						cashbackAmount = cashbackAmount + userApprovedApplicationsEligibleForCashback[i].Cashback_to_be_paid;
						getAllApplicationsToBePaid[userApprovedApplicationsEligibleForCashback[i].id] = userApprovedApplicationsEligibleForCashback[i];
						getAllApplicationsToBePaidArray.push(userApprovedApplicationsEligibleForCashback[i].id);
						if (whereQueryForApplicationId && whereQueryForApplicationId != '') {
							whereQueryForApplicationId = whereQueryForApplicationId + ` or tarj_application = ${userApprovedApplicationsEligibleForCashback[i].id} `;
						} else {
							whereQueryForApplicationId = ` tarj_application = ${userApprovedApplicationsEligibleForCashback[i].id} `;
						}
					}
				}

				if (userReferralsEligibleForReferral.length > 0) {
					for (let i = 0; i < userReferralsEligibleForReferral.length; i++) {
						referralAmount = referralAmount + userReferralsEligibleForReferral[i].refer_amount;
						referedToId.push(userReferralsEligibleForReferral[i].id);
						getAllRefferlsToBePaid[userReferralsEligibleForReferral[i].id] = userReferralsEligibleForReferral[i];
						if (refferalIdsQuery && refferalIdsQuery != '') {
							refferalIdsQuery = refferalIdsQuery + ` or tarj_referred_user = ${userReferralsEligibleForReferral[i].id} `;
						} else {
							refferalIdsQuery = ` tarj_referred_user = ${userReferralsEligibleForReferral[i].id} `;
						}
					}
				}


				totalAmountOfUser = cashbackAmount + referralAmount;

				// console.log(cashbackAmount);
				// console.log(referralAmount);
				// console.log(totalAmountOfUser);
				console.log(cashbackAmount, "cashbackAmountcashbackAmount");
				console.log(referralAmount, 'referralAmountreferralAmount');
				console.log(totalAmountOfUser, 'totalAmountOfUsertotalAmountOfUser');

				let checkTransactionAllReadyExist = false;
				let checkPendingApplicationsArray = [];
				let checkTransactionAllredyExistForRefferal = false;
				let checkPendingRefferalsArray = [];
				if (getAllApplicationsToBePaidArray.length > 0) {
					let checkTransactionAllReadyExistResult = await checkIfTransactionAlreadyCreatedForApplications(whereQueryForApplicationId, userId, getAllApplicationsToBePaidArray);
					if (checkTransactionAllReadyExistResult.notMatchedApplications) {
						checkTransactionAllReadyExist = checkTransactionAllReadyExistResult.isAlreadyExistAllApplications;
						checkPendingApplicationsArray = checkTransactionAllReadyExistResult.notMatchedApplications;
					}
					console.log(checkTransactionAllReadyExistResult, "checkTransactionAllReadyExistResult");
				}
				if (referedToId.length > 0) {
					let checkTransactionAllredyExistForRefferalResult = await checkIfTransactionAlreadyCreatedForRefferals(referedToId, refferalIdsQuery, userId);
					if (checkTransactionAllredyExistForRefferalResult.notMatchedRefferls) {
						checkTransactionAllredyExistForRefferal = checkTransactionAllredyExistForRefferalResult.isAlreadyExistAllRefrels;
						checkPendingRefferalsArray = checkTransactionAllredyExistForRefferalResult.notMatchedRefferls;
					}
					console.log(checkTransactionAllredyExistForRefferalResult, "checkTransactionAllredyExistForRefferalResultcheckTransactionAllredyExistForRefferalResult");
				}


				let transactionDataNeedToAdd = true;
				cashbackAmount = 0;
				referralAmount = 0;
				totalAmountOfUser = 0;
				if (checkTransactionAllReadyExist) {
					transactionDataNeedToAdd = false;
				} else {
					if (checkPendingApplicationsArray.length > 0) {
						//console.log(userApprovedApplicationsEligibleForCashback, "userApprovedApplicationsEligibleForCashback");
						console.log(checkPendingApplicationsArray, "checkPendingApplicationsArray");
						let userApprovedApplicationsEligibleForCashbackNew = [];
						for (let q = 0; q < checkPendingApplicationsArray.length; q++) {
							if (getAllApplicationsToBePaid[checkPendingApplicationsArray[q]]) {
								let dataToAdd = getAllApplicationsToBePaid[checkPendingApplicationsArray[q]];
								userApprovedApplicationsEligibleForCashbackNew.push(dataToAdd);
								cashbackAmount = cashbackAmount + dataToAdd.Cashback_to_be_paid;
							}
						}
						userApprovedApplicationsEligibleForCashback = userApprovedApplicationsEligibleForCashbackNew;
						console.log(userApprovedApplicationsEligibleForCashback, "userApprovedApplicationsEligibleForCashback");
					}
					transactionDataNeedToAdd = true;
				}

				if (checkTransactionAllredyExistForRefferal) {
					transactionDataNeedToAdd = false;
				} else {
					if (checkPendingRefferalsArray.length > 0) {
						console.log(userReferralsEligibleForReferral, "userReferralsEligibleForReferral");
						let userReferralsEligibleForReferralNew = [];
						for (let p = 0; p < checkPendingRefferalsArray.length; p++) {
							if (getAllRefferlsToBePaid[checkPendingRefferalsArray[p]]) {
								let dataToAdd = getAllRefferlsToBePaid[checkPendingRefferalsArray[p]];
								userReferralsEligibleForReferralNew.push(dataToAdd);
								referralAmount = referralAmount + dataToAdd.refer_amount;
							}
						}
						userReferralsEligibleForReferral = userReferralsEligibleForReferralNew;
						console.log(userReferralsEligibleForReferral, "userReferralsEligibleForReferral");
					}
					transactionDataNeedToAdd = true;
				}
				if (checkTransactionAllredyExistForRefferal && checkTransactionAllReadyExist) {
					transactionDataNeedToAdd = false;
				} else {
					transactionDataNeedToAdd = true;
				}
				totalAmountOfUser = cashbackAmount + referralAmount;
				console.log(cashbackAmount, "cashbackAmountcashbackAmountNN");
				console.log(referralAmount, 'referralAmountreferralAmountNN');
				console.log(totalAmountOfUser, 'totalAmountOfUsertotalAmountOfUserNN');
				// if (checkTransactionAllReadyExist || checkTransactionAllredyExistForRefferal) {
				// 	transactionDataNeedToAdd = false;

				// } else {
				// 	cashbackAmount = 0;
				// 	referralAmount = 0;
				// 	totalAmountOfUser = 0;
				// 	if (checkPendingApplicationsArray.length > 0) {
				// 		console.log(userApprovedApplicationsEligibleForCashback, "userApprovedApplicationsEligibleForCashback");
				// 		console.log(checkPendingApplicationsArray, "checkPendingApplicationsArray");
				// 		let userApprovedApplicationsEligibleForCashbackNew = [];
				// 		for (let q = 0; q < checkPendingApplicationsArray.length; q++) {
				// 			if (getAllApplicationsToBePaid[checkPendingApplicationsArray[q]]) {
				// 				let dataToAdd = getAllApplicationsToBePaid[checkPendingApplicationsArray[q]];
				// 				userApprovedApplicationsEligibleForCashbackNew.push(dataToAdd);
				// 				cashbackAmount = cashbackAmount + dataToAdd.Cashback_to_be_paid;
				// 			}
				// 		}
				// 		userApprovedApplicationsEligibleForCashback = userApprovedApplicationsEligibleForCashbackNew;
				// 		console.log(userApprovedApplicationsEligibleForCashback, "userApprovedApplicationsEligibleForCashback");
				// 	}
				// 	if (checkPendingRefferalsArray.length > 0) {
				// 		console.log(userReferralsEligibleForReferral, "userReferralsEligibleForReferral");
				// 		let userReferralsEligibleForReferralNew = [];
				// 		for (let p = 0; p < checkPendingRefferalsArray.length; p++) {
				// 			if (getAllRefferlsToBePaid[checkPendingRefferalsArray[p]]) {
				// 				let dataToAdd = getAllRefferlsToBePaid[checkPendingRefferalsArray[p]];
				// 				userReferralsEligibleForReferralNew.push(dataToAdd);
				// 				referralAmount = referralAmount + dataToAdd.refer_amount;
				// 			}
				// 		}
				// 		userReferralsEligibleForReferral = userReferralsEligibleForReferralNew;
				// 		console.log(userReferralsEligibleForReferral, "userReferralsEligibleForReferral");
				// 	}
				// 	totalAmountOfUser = cashbackAmount + referralAmount;
				// 	console.log(cashbackAmount, "cashbackAmountcashbackAmountNN");
				// 	console.log(referralAmount, 'referralAmountreferralAmountNN');
				// 	console.log(totalAmountOfUser, 'totalAmountOfUsertotalAmountOfUserNN');
				// }
				console.log(transactionDataNeedToAdd, "transactionDataNeedToAddtransactionDataNeedToAddtransactionDataNeedToAdd");
				//return true;
				if (totalAmountOfUser > 0 && transactionDataNeedToAdd) {
					let dataFromTransactionInsert = await addTransactionDetails(userId, totalAmountOfUser, userPaymentDetails[0], userSessionId);
					console.log(dataFromTransactionInsert, "-----data from transaction insert \n\n");


					if (dataFromTransactionInsert.length > 0) {

						console.log("hi im in line 407");

						let dataFromTransactionJunctionEntry = await transactionsJuntionEntry(dataFromTransactionInsert, userApprovedApplicationsEligibleForCashback, userReferralsEligibleForReferral, userSessionId);

						console.log(dataFromTransactionJunctionEntry, " ---- transaction junction entry");


						if (dataFromTransactionJunctionEntry) {

							console.log("hi im in line 416");

							let updateclaimData = await updateUserClaim(userId, userSessionId);

							console.log(updateclaimData, "updated claim data");

							if (updateclaimData) {
								returnData.status = true;
								returnData.code = 'CIA-Transaction-success-100';
								console.log("hi im in this");
								return returnData;
							} else {
								returnData.status = false;
								returnData.code = 'CIA-Transaction-err-106';
								console.log("hi im in this line 431");
								return returnData;
							}



						} else {
							returnData.status = false;
							returnData.code = 'CIA-Transaction-err-105';
							console.log("hi im in this line 434");
							return returnData;

						}
					}
				} else if (!checkTransactionAllReadyExist) {
					returnData.status = false;
					returnData.code = 'CIA-Transaction-err-104';
					returnData.message = 'Already exist';
				}

			}
		} else {
			returnData.status = false;
			returnData.code = 'CIA-Transaction-err-103'
		}

		returnData = true;
		return returnData;

	} else {
		return returnData;
	}
}


module.exports = modelObj;