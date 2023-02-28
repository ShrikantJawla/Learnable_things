const { pool } = require('../../utils/configs/database');

let modelObj = {};


modelObj.postPincodesData = async function ({ insertData, bankName, bankId, user }) {
	console.log(insertData, bankId, bankName);
	let bankColumn = '';
	switch (bankId) {
		case 1:
			bankColumn = `mp_axis_available`;

			break;
		case 2:
			bankColumn = `mp_bob_available`;
			break;
		case 4:
			bankColumn = `mp_idfc_available`;
			break;
		case 7:
			bankColumn = `mp_au_available`;
			break;
		case 11:
			bankColumn = `mp_yes_available`;
			break;
		default:
			break;
	}
	if (bankColumn != '') {

		let insertQuery = ``;
		//let pincodeCount = {};
		for (let i = 0; i < insertData.length; i++) {
			// if (pincodeCount[insertData[i]['pincode']]) {
			// 	pincodeCount[insertData[i]['pincode']] = pincodeCount[insertData[i]['pincode']] + 1;
			// } else {
			// 	pincodeCount[insertData[i]['pincode']] = 1
			// }
			insertQuery = insertQuery + `INSERT INTO manage_pincodes (mp_pincode, ${bankColumn} , created_by, updated_by)  values('${insertData[i]['pincode']}', true, ${user}, ${user})
		ON CONFLICT (mp_pincode) DO UPDATE 
		SET ${bankColumn} = true,
		updated_by = ${user},
		updated_at = (now() AT TIME ZONE 'Asia/Kolkata'::text);`;
		}

		try {
			//console.log(pincodeCount, "inserst vsdgfbef vdf ");
			console.log(insertData.length, 'insertData')
			let dataFromDb = await pool.query(insertQuery);
			//console.log(dataFromDb);
			return true;

		} catch (err) {
			console.error(err);
			return false

		}
	} else {
		return false;
	}

}



module.exports = modelObj;