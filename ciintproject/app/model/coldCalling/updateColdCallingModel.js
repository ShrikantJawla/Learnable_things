/* Importing the pool object from the database.js file. */
const { pool } = require("../../utils/configs/database");
/* Creating an empty object. */
let modelObj = {};


/* This is a function which is used to update the data in the database. */
modelObj.updateColdCallingModel = async function({dataToUpdate}){
	

	let updateQuery = `UPDATE cold_calling SET 
	${dataToUpdate.hasOwnProperty("call_status")
		?  `cc_call_status = '${dataToUpdate.call_status}', ` : ``
	}
	${dataToUpdate.hasOwnProperty("call_notes")
		?  `cc_note = '${dataToUpdate.call_notes}' , ` : ``
	}
	${dataToUpdate.hasOwnProperty("call_counter")
		?  `cc_call_declined_counter = ${dataToUpdate.call_counter == '' ? 0 : dataToUpdate.call_counter} , ` : ``
	}
	${(dataToUpdate.call_schedule != '')
		?  `cc_call_scheduled = '${dataToUpdate.call_schedule == '' ? '' : dataToUpdate.call_schedule}' , ` : ``
	}
	cc_updated_at = (now() AT TIME ZONE 'Asia/Kolkata'),
	cc_updated_by = ${dataToUpdate.loggedUser.ua_id}
	where cc_id = ${dataToUpdate.cc_id} ; 
	`;
	updateQuery = updateQuery.replace(/,\s+where/, " where");

	try {
		// console.log(updateQuery, "--------- update query  ");
		let dataFromdb = await pool.query(updateQuery);
		// console.log(dataFromdb.rows, "dfg");
		if(dataFromdb.rows.length == 0){
			return true;
		}else{
			return false;
		}
		
	} catch (error) {
		console.log(error);
		return false;
		
	}
}



module.exports = modelObj;