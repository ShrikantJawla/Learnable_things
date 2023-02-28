const { pool } = require('../../utils/configs/database');
let modelObj = {};




modelObj.getCallerIdForMakeCall = async function ({ userId, issuerId }) {

	//console.log(userId, issuerId, "in caller id to make call");

	let queryToDb = `SELECT tele_caller_ids.* 
	FROM tele_caller_ids
	LEFT JOIN all_banks_tele_caller_ids_junction_table ON all_banks_tele_caller_ids_junction_table.tele_caller_ids_id = tele_caller_ids.tc_id
	LEFT JOIN user_admin_tele_caller_ids_junction ON user_admin_tele_caller_ids_junction.tele_caller_ids_id = tele_caller_ids.tc_id
	where tc_enabled = true AND  all_banks_tele_caller_ids_junction_table.bank_id = $1 AND user_admin_tele_caller_ids_junction.user_admin_id = $2;`;

	let dataFromDb = [];

	try {
		let dbResult = await pool.query(queryToDb, [issuerId, userId]);
		//console.log(dbResult.rows, "single ");
		dataFromDb = dbResult.rows;

	} catch (error) {
		console.log(error);
		return false;
	}

	if (dataFromDb.length == 0) {

		let randomQuery = `SELECT tele_caller_ids.* 
		FROM tele_caller_ids
		LEFT JOIN all_banks_tele_caller_ids_junction_table ON all_banks_tele_caller_ids_junction_table.tele_caller_ids_id = tele_caller_ids.tc_id
		where tc_enabled = true AND  all_banks_tele_caller_ids_junction_table.bank_id = $1 ;`

		try {
			let dataFromDb = await pool.query(randomQuery, [issuerId]);
			// console.log(dataFromDb.rows, "in random");
			// console.log(dataFromDb.rowCount, "count in random");
			if (dataFromDb.rows.length != 0) {

				let randomCallerId = dataFromDb.rows[Math.floor(Math.random() * dataFromDb.rows.length)];
				return randomCallerId.tc_phone_number;

			} else {
				return "No number";

			}
		} catch (error) {
			console.log(error);
			return false;

		}

	} else {
		//console.log("in else part");
		return dataFromDb[0].tc_phone_number;
	}


}

modelObj.makeCallToDestination = async function ({ destinationNumber, agentNumber, callerId}) {
	let returnData = {
		status: false,
		code: "CIP-CALL-ERROR-101",
		message: "Something went wrong",
	}
	const sdk = require('api')('@tatateleservices/v1.0#vth1w3ekx04g6b5');

	await sdk.postV1Click_to_call({
		agent_number: agentNumber,
		destination_number: destinationNumber,
		caller_id: callerId,
		get_call_id: 1
	}, { authorization: process.env.CALL_TOKEN })
		.then(({ data }) => {
			console.log(data, "----- data");
			returnData.status = data.success;
			returnData.message = data.message;
			returnData.code = "CIP-CALL-101";
			returnData.payload = data;

		})
		.catch(err => {
			console.error(err)
			returnData.status = false;
			returnData.code = "CIP-CALL-ERROR-102",
				returnData.message = "Something unexpected occurred";
		});

	return returnData;

}

module.exports = modelObj;