/* Importing the `pool` object from the `database.js` file. */
const { pool } = require("../../utils/configs/database");

/* Creating an empty object. */
let modelObj = {};

/* A function which is used to get the data of banks from the database. */
modelObj.getBanksDataForManagingCallerIds = async function () {
  /* Creating an object with two keys `status` and `payload`. */
  let returnData = {
    status: false,
    payload: [],
  };

  /* A query to the database. */
  let queryToDb = `SELECT id, bank_name, bank_short_value FROM ci_internal_all_banks
	WHERE is_sms_active = true AND is_apply_active = true
	ORDER BY id ASC;`;

  /* This is a try catch block. */
  try {
    /* Executing the query and storing the result in the `dataFromDb` variable. */
    let dataFromDb = await pool.query(queryToDb);
    /* Setting the status to true and the payload to the data from the database. */
    returnData.status = true;
    returnData.payload = dataFromDb.rows;
  } catch (error) {
    /* Logging the error and setting the status to false. */
    console.log(error);
    returnData.status = false;
  }
  /* Returning the `returnData` object. */
  return returnData;
};

/**
 * It gets the data of a single bank from the database
 *
 * Returns:
 *   the data from the database.
 */
async function getSingleBankData({ issuer }) {
  let queryToDb = `SELECT id, bank_name, bank_short_value FROM ci_internal_all_banks
	WHERE is_sms_active = true AND is_apply_active = true AND id = $1 
	ORDER BY id ASC;`;
  try {
    /* Executing the query and storing the result in the `dataFromDb` variable. */
    let dataFromDb = await pool.query(queryToDb, [issuer]);
    /* Setting the status to true and the payload to the data from the database. */
    return dataFromDb.rows;
  } catch (error) {
    /* Logging the error and setting the status to false. */
    console.log(error);
    return false;
  }
}

/* A function which is used to get the data of the tele users where the issuer is active. */
modelObj.getTeleUsersWhereIsuerIsActive = async function ({ issuerId, bank }) {
  // console.log(issuerId, bank);

  let queryToDb = `SELECT user_admin.ua_id, user_admin.ua_name
	FROM user_admin
	RIGHT JOIN tele_teams ON tele_teams.user_id = user_admin.ua_id
	WHERE user_admin.ua_role = 3 AND tele_teams.${bank} = true;`;

  try {
    let dataFromDb = await pool.query(queryToDb);
    // console.log(dataFromDb.rows, "+++++++++");
    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
};

modelObj.getAllCallerId = async function (issuer, filter) {
  // query to get all caller ids from db
  let queryToDb = `SELECT tele_caller_ids.* , all_banks_tele_caller_ids_junction_table.bank_id , all_banks_tele_caller_ids_junction_table.tele_caller_ids_id , user_admin_tele_caller_ids_junction.user_admin_id , user_admin_tele_caller_ids_junction.id, user_admin.ua_name, ci_internal_all_banks.bank_name FROM tele_caller_ids 
  LEFT JOIN all_banks_tele_caller_ids_junction_table ON tele_caller_ids.tc_id = all_banks_tele_caller_ids_junction_table.tele_caller_ids_id
  LEFT JOIN user_admin_tele_caller_ids_junction ON all_banks_tele_caller_ids_junction_table.tele_caller_ids_id = user_admin_tele_caller_ids_junction.tele_caller_ids_id
  LEFT JOIN user_admin ON user_admin_tele_caller_ids_junction.user_admin_id = user_admin.ua_id
  LEFT JOIN ci_internal_all_banks ON all_banks_tele_caller_ids_junction_table.bank_id = ci_internal_all_banks.id
  WHERE tc_enabled = 'true' AND all_banks_tele_caller_ids_junction_table.bank_id = ${issuer ? issuer : 1
    }`;

  // appending query for more filters
  if (filter) {
    for (const [key, value] of Object.entries(filter)) {
      if (value.length > 0) {
        if (key === "tc_phone_number" || key === "ua_name") {
          queryToDb += ` AND ${key} = '${value}' `;
        } else if (key === "id") {
          queryToDb += ` AND user_admin_tele_caller_ids_junction.${key} = ${value} `;
        } else {
          queryToDb += ` AND ${key} = ${value} `;
        }
      }
    }
  }

  try {
    let dataFromDb = await pool.query(queryToDb);
    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
};

modelObj.getAllCallerIdUnique = async function (issuer, filter) {
  // query to get all caller ids from db
  let queryToDb = `SELECT tele_caller_ids.tc_phone_number , tele_caller_ids.tc_id, all_banks_tele_caller_ids_junction_table.bank_id  FROM tele_caller_ids 
	LEFT JOIN all_banks_tele_caller_ids_junction_table ON tele_caller_ids.tc_id = all_banks_tele_caller_ids_junction_table.tele_caller_ids_id
	WHERE tc_enabled = 'true' AND all_banks_tele_caller_ids_junction_table.bank_id = ${issuer ? issuer : 1
    };`;

  // console.log(queryToDb, "<<<<<<<<<<<");
  try {
    let dataFromDb = await pool.query(queryToDb);
    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
};
/* Exporting the `modelObj` object. */
module.exports = modelObj;
