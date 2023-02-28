const { pool } = require("../../utils/configs/database");
const commonModel = require("../../model/commonModel");
const e = require("express");

let modelObj = {};

/**
 * It takes in a number, a boolean value and a currentUser and returns a boolean value
 */
async function addNewCallerId({ number, isEnabled, currentUser }) {
  let queryToDb = `INSERT INTO tele_caller_ids(tc_phone_number, tc_enabled, created_by, updated_by) 
	VALUES($1, $2, $3, $4)  returning *;`;

  try {
    let dataFromDb = await pool.query(queryToDb, [
      number,
      isEnabled,
      currentUser,
      currentUser,
    ]);
    // console.log(dataFromDb.rows);
    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

async function postNewCallerId({ number }) {
  let queryToDb = `SELECT * FROM tele_caller_ids WHERE tc_phone_number = '${number}';`;
  try {
    let dataFromDb = await pool.query(queryToDb);

    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * It takes in bankId, callerId and currentUser as arguments and returns the data from the database
 */
async function entryToBankTeleCallerJunction({
  bankId,
  callerId,
  currentUser,
}) {
  // console.log(bankId, callerId, "in private method");

  let queryToDb = `INSERT INTO all_banks_tele_caller_ids_junction_table(bank_id, tele_caller_ids_id, created_by, updated_by) 
						VALUES($1, $2, $3, $4) returning *;`;
  try {
    // console.log(queryToDb, "dsfdgi");
    let dataFromDb = await pool.query(queryToDb, [
      bankId,
      callerId,
      currentUser,
      currentUser,
    ]);
    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

/**
 * It takes in an object with three properties: userId, callerId and currentUser. It then inserts the
 * values of these properties into the user_admin_tele_caller_ids_junction table
 */
async function entryToUserAdminTeleCallerJunction({
  userId,
  callerId,
  currentUser,
}) {

  let queryToDb = `INSERT INTO user_admin_tele_caller_ids_junction(user_admin_id, tele_caller_ids_id, created_by, updated_by) 
						VALUES($1, $2, $3, $4) ;`;
  try {

    let dataFromDb = await pool.query(queryToDb, [
      userId,
      callerId,
      currentUser,
      currentUser,
    ]);

    return dataFromDb.rows;
  } catch (error) {
    console.log(error);
    return false;
  }
}

modelObj.postNewCallerIdOLDONE = async function ({ postData }) {
  let { issuer, number, telecaller } = postData;

  let currentUserId = postData.loggedUser.ua_id;

  try {
    for (let i = 0; i < number.length; i++) {
      let telecallerEntryData = await postNewCallerId({ number: number[i] });
      if (telecallerEntryData) {
        let dataFromUserCallerJunction = await entryToUserAdminTeleCallerJunction({
          userId: telecaller,
          callerId: telecallerEntryData[0].tc_id,
          currentUser: currentUserId,
        });
      }
    }
  } catch (err) {
    return false;
  }
  finally {
    return true;
  }
};
modelObj.postNewCallerId = async function ({ postData }) {
  let { issuer, number, telecaller } = postData;
  let returnData = false;
  let currentUserId = postData.loggedUser.ua_id;

  let getTellyDataSql = `SELECT user_admin_tele_caller_ids_junction.* , tele_caller_ids.tc_phone_number , tele_caller_ids.tc_id
  FROM public.user_admin_tele_caller_ids_junction left join tele_caller_ids on tele_caller_ids.tc_id = tele_caller_ids_id
  where user_admin_id = ${telecaller}`;
  let getTellyData = await commonModel.getDataOrCount(getTellyDataSql, [], 'D');

  let tellyDataByNumber = {};
  if (getTellyData && getTellyData.length > 0) {
    for (let i = 0; i < getTellyData.length; i++) {
      let currentData = getTellyData[i];
      tellyDataByNumber[currentData.tc_id] = currentData;
    }
  }
  // console.log(tellyDataByNumber , "tellyDataByNumbertellyDataByNumber");
  let queryToDb = ``;
  if (number.length > 0) {
    for (let i = 0; i < number.length; i++) {
      if (tellyDataByNumber[number[i]]) {
      } else {
        queryToDb = queryToDb + ` INSERT INTO user_admin_tele_caller_ids_junction(user_admin_id, tele_caller_ids_id, created_by, updated_by) 
						VALUES(${telecaller}, ${number[i]}, ${currentUserId}, ${currentUserId}) ; `;
      }
    }
  }
  if (queryToDb != '') {
    let insertData = await commonModel.getDataOrCount(queryToDb, [], 'U');
    if (insertData) {
      returnData = true;
    }
  }
  return returnData;
};

modelObj.addNewCallerId = async function ({ postData }) {
  let { issuer, number, isEnabled } = postData;

  let currentUserId = postData.loggedUser.ua_id;

  let telecallerEntryData = await addNewCallerId({
    number: number,
    isEnabled: isEnabled,
    currentUser: currentUserId,
  });

  // console.log(telecallerEntryData);

  if (telecallerEntryData) {
    let dataFromBankCallerJunction = await entryToBankTeleCallerJunction({
      bankId: issuer,
      callerId: telecallerEntryData[0].tc_id,
      currentUser: currentUserId,
    });
    return true;
  } else {
    return false;
  }
};
modelObj.unassignCallerId = async function (id) {

  let queryToDb = `DELETE FROM user_admin_tele_caller_ids_junction WHERE id = ${id}`;

  let deleteData = await commonModel.getDataOrCount(queryToDb, [], 'U');

  if (deleteData) {
    return true
  } else {
    return false
  }
};

module.exports = modelObj;
