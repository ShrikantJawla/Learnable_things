let { pool } = require("../../utils/configs/database");
///////////////////////////////////////
let modelObj = {};

modelObj.getAllBanksInApplications = async function (body) {
  let returnData = {
    applicationsData: [],
    count: "",
  };
  let { filterObject, pageNo, sort } = body;
  let { entriesPerPage } = filterObject;

  entriesPerPage = entriesPerPage || 10;
  sort = sort || "id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }
  //console.log({ pageNo, sort, entriesPerPage, ascDesc, filterObject, offset });

  let dbQuery = `SELECT * FROM ci_internal_all_banks ORDER By ci_internal_all_banks."${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  let countQuery = `SELECT count(*) FROM ci_internal_all_banks`;

  try {
    let dataFromDb = await pool.query(dbQuery);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rows[0].count,
      applicationsData: dataFromDb.rows,
    };
  } catch (error) {
    //console.log(error);
  }
  return returnData;
};

modelObj.updateApplySmsStatus = async function ({
  bankId,
  applyStatus,
  smsStatus,
}) {
  //console.log(bankId, applyStatus, smsStatus);
  let returnData = false;

  if (bankId != null || bankId != undefined || bankId != "" || bankId != 0) {
    let dbQuery = `UPDATE ci_internal_all_banks SET is_apply_active = ${applyStatus}, is_sms_active = ${smsStatus} WHERE id = ${bankId};`;
    try {
      let dataFromDb = await pool.query(dbQuery);
      returnData = dataFromDb.rows;
    } catch (error) {
      //console.log(error);
      return false;
    }
    //console.log(returnData, "dgef");
    return returnData;
  }
};

modelObj.getAllBanksForMissingUploadData = async function () {
  let returnData = false;

  let queryToDb = `SELECT id, bank_name  FROM ci_internal_all_banks where is_apply_active = true`;
  try {
    let dataFromQuery = await pool.query(queryToDb);
    returnData = dataFromQuery.rows;
  } catch (err) {
    console.error(err);
  }

  return returnData;
};

module.exports = modelObj;
