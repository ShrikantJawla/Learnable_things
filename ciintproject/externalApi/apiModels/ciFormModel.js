//////////// imports here...

const { pool } = require('../../app/utils/configs/database');


//////////////////////////////

let modelObj = {};

modelObj.postDataFromFormIntoDb = async function (postData) {
	//console.log("im in model");
	let returnData = false;
	let emailRegex = new RegExp('[a-z0-9]+@[a-z]+\.[a-z]{2,3}');
	//console.log(postData, " -------------------<<<<<<<<< post data in model");
	let parsedPhone = parseInt(postData.ci_phone);
	//console.log(parsedPhone, "dsoifnodno");
	//console.log(typeof (postData.ci_name), typeof (postData.ci_email), typeof (parsedPhone));
	if (emailRegex.test(postData.ci_email) && typeof (postData.ci_name) == "string" && (parsedPhone > 5000000000 && parsedPhone < 10000000000) && postData.ci_form_filled != "") {

		let sqlValues = [postData.ci_name, postData.ci_email, parsedPhone, postData.ci_form_filled, postData.ci_device];
		let attachInserColumns = ' ';
		let attachedValue = ' ';
		let updateQuery = ' ';
		// if (postData.ci_tracking_id && postData.ci_pincode && postData.ci_city && postData.ci_state) {
		// 	attachInserColumns = ` , tracking_id, pin_code, city, state`;
		// 	attachedValue = ` , $4, $5, $6, $7`;
		// 	updateQuery = ` , tracking_id = excluded.tracking_id,
		// 	pin_code = excluded.pin_code,
		// 	city = excluded.city,
		// 	state = excluded.state`;
		// } else {

		// }

		if (postData.ci_tracking_id) {
			attachInserColumns = attachInserColumns + ` , tracking_id`;
			sqlValues.push(postData.ci_tracking_id);
			let valueLength = sqlValues.length;
			attachedValue = attachedValue + ` , $` + valueLength;
			updateQuery = updateQuery + ` , tracking_id = excluded.tracking_id `;
		}

		if (postData.ci_pincode) {
			attachInserColumns = attachInserColumns + ` , pin_code`;
			sqlValues.push(postData.ci_pincode);
			let valueLength = sqlValues.length;
			attachedValue = attachedValue + ` , $` + valueLength;
			updateQuery = updateQuery + ` , 	pin_code = excluded.pin_code `;
		}

		if (postData.ci_city) {
			attachInserColumns = attachInserColumns + ` , city`;
			sqlValues.push(postData.ci_city);
			let valueLength = sqlValues.length;
			attachedValue = attachedValue + ` , $` + valueLength;
			updateQuery = updateQuery + ` , 	city = excluded.city `;
		}

		if (postData.ci_state) {
			attachInserColumns = attachInserColumns + ` , state`;
			sqlValues.push(postData.ci_state);
			let valueLength = sqlValues.length;
			attachedValue = attachedValue + ` , $` + valueLength;
			updateQuery = updateQuery + ` , 	state = excluded.state `;
		}

		//console.log("executing this  main query" , sqlValues);
		let withoutCommas = attachInserColumns.replaceAll(',', '');

		let dbQuery = ` INSERT INTO card_applications_main_table (name, email, phone_number, form_filled_array , device_type` + attachInserColumns + `) 
			VALUES ($1, $2, $3, Array[$4] , $5 `+ attachedValue + `)
			ON CONFLICT (phone_number) DO UPDATE 
			  SET name = excluded.name, 
				  email = excluded.email,
				  updated_at = (now() AT TIME ZONE 'Asia/Kolkata'),
				  form_filled_array =  array( select distinct unnest(card_applications_main_table.form_filled_array || excluded.form_filled_array)), 
				  device_type = '`+ postData.ci_device + `'
				 `+updateQuery+`
				  returning *;`;
		// console.log("dsgfsgd--------->>>>>", dbQuery);

		try {
			//console.log("dsgfsgd--------->>>>>", dbQuery);
			let queryData = await pool.query(dbQuery, sqlValues);
			//console.log(queryData);

			returnData = queryData.rows;
		} catch (err) {
			console.log(err);

		}

		//console.log(postData.ci_email, "this is a valid email ");
		return returnData;



	} else {
		//console.log(postData.ci_email, "this is a not  valid email ");
		return returnData;
	}
}

module.exports = modelObj;