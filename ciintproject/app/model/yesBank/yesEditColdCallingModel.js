/* Importing the `pool` object from the `database.js` file. */
const { pool } = require("../../utils/configs/database");
/* Creating an empty object. */
let modelObj = {};


/* A function that is being exported to the controller. */
modelObj.getYesEditColdCallingData = async function({idToFind}){
	/* Creating an empty array. */
	let returnData = [];
	/* A query to the database. */
	let queryToDb = `SELECT card_applications_main_table.*, cold_calling.*  FROM card_applications_main_table 
	LEFT JOIN cold_calling ON cold_calling.cc_main_table_id = card_applications_main_table.id
	where card_applications_main_table.id = $1; `;
	try {
		/* Using the `pool` object to query the database. */
		let dataFromDb = await pool.query(queryToDb, [idToFind]);
		returnData = dataFromDb.rows;
		return returnData;

		
	} catch (error) {
		console.log(error);
		return returnData;
	}
}




/* Exporting the modelObj to the controller. */
module.exports = modelObj;


