const { pool } = require("../../utils/configs/database");
const commonModel = require('../commonModel');
////////////////////////////////////////////////////////////////////////////////////////////////
let modelObj = {};
modelObj.getFilteredAxisApplications = async function (body, user) {
  let returnData = {
    applicationsData: [],
    count: [],
  };
  let { filterObject, pageNo, sort } = body;

  let intCheck = [
    "axis_id",
    "axis_date",
    "ca_main_table",
    "created_at",
    "updated_at",
    "axis_ipa_status_bool",
    "axis_revised_date",
    "telecallers",
    "tad_call_decline_counter",
    "tad_sms_counter",
    "axis_activation",
    "tad_activation_call_counter",
    "axis_activation",
    "tad_automated_call_counter"
  ];

  let {
    entriesPerPage,
    from_axis_revised_date,
    to_axis_revised_date,
    axis_id,
    axis_application_number,
    from_axis_date,
    to_axis_date,
    axis_name,
    axis_mobile_number,
    axis_card_type,
    axis_ipa_status,
    axis_final_status,
    ca_main_table,
    from_created_at,
    from_updated_at,
    to_created_at,
    to_updated_at,
    axis_ipa_status_bool,
    axis_ipa_original_status_sheet,
    tad_axis_ipa_original_status_sheet,
    telecallers,
    notNull,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_activation,
    axis_live_feedback_status,
    axis_send_to_channel,
    tad_call_status,
    tad_call_decline_counter,
    tad_sms_counter,
    from_tad_updated_at,
    to_tad_updated_at,
    tad_activation_call_counter,
    tad_automated_call_counter,
    tad_automated_call_status,
    tad_final_call_status

  } = filterObject;

  const likeFields = { axis_application_number, axis_name };

  const selectFields = {
    axis_card_type,
    axis_ipa_status,
    axis_final_status,
    axis_ipa_original_status_sheet,
    tad_axis_ipa_original_status_sheet,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_live_feedback_status,
    axis_send_to_channel,
    tad_call_status,
    tad_automated_call_counter,
    tad_automated_call_status,
    tad_final_call_status
  };

  const equalFields = {
    axis_id,
    axis_mobile_number,
    ca_main_table,
    axis_ipa_status_bool,
    tad_call_decline_counter,
    tad_sms_counter,
    axis_activation,
    tad_activation_call_counter,
    tad_automated_call_counter
  };

  const fromDatefields = {
    from_axis_date,
    from_axis_revised_date,
    from_created_at,
    from_updated_at,
    from_tad_updated_at
  };
  const toDatefields = {
    to_axis_date,
    to_axis_revised_date,
    to_created_at,
    to_updated_at,
    to_tad_updated_at
  };
  Object.keys(fromDatefields).map((field) => {
    let field_date = new Date(fromDatefields[field]);
    fromDatefields[field] = fromDatefields[field]
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 00:00:01.001`
      : ``;
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``;
    toDatefields[field] = field_date
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 23:59:59.999`
      : ``;
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "axis_ipa_status_bool")
      equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });
  const isFalseField = (field) =>
    field === null || field === undefined || field === "";
  entriesPerPage = entriesPerPage || 10;
  sort = sort || "axis_id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }
  let query = '';
  if (user.ua_role === 3) {
    query = `SELECT * FROM tele_callers_applications_axis camt where admin_user=${user.ua_id} AND `;
  }
  else if (user.ua_role === 1) {
    query = `SELECT * FROM tele_callers_applications_axis camt where `;
  }
  if (telecallers) {
    lastFilter = telecallers.length;
    if (telecallers.length > 1) {
      for (let i = 0; i < telecallers.length; i++) {
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = admin_user `;
        } else {
          query += `${telecallers[i]} = admin_user OR `;
        }
      }
    }
    else {
      query += `${telecallers} = admin_user `;
    }
  }
  try {
    if (telecallers.length === 0) {
      if (user.ua_role === 3) {
        query = `SELECT * FROM tele_callers_applications_axis camt where admin_user=${user.ua_id} AND `;
      }
      else if (user.ua_role === 1) {
        query = `SELECT * FROM tele_callers_applications_axis camt where `;
      }
    }
  } catch (err) {
    // console.log("No Telecallers")
  }
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `"${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `"${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "axis_ipa_status_bool")
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `);
    else {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ""
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `);
    }
  });

  Object.keys(likeFields).map((field, index) => {
    query =
      query +
      (likeFields[field]
        ? `(Lower("${field}")::Text Like '%${likeFields[
          field
        ].toLowerCase()}%' ) AND `
        : ``);
  });
  Object.keys(selectFields).map((field) => {
    let string = "";

    for (
      let i = 0;
      i < (selectFields[field] ? selectFields[field].length : 0);
      i++
    ) {
      string += `'${selectFields[field][i]}',`;
    }
    string = string.slice(0, -1);
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``);
  });
  let stringFields = [
    "axis_application_number",
    "axis_name",
    "axis_mobile_number",
    "axis_card_type",
    "axis_ipa_status",
    "axis_final_status",
    "axis_ipa_original_status_sheet",
    "tad_axis_ipa_original_status_sheet",
    "axis_existing_c",
  ];

  notNull.forEach((elem) => {
    if (elem) {
      if (elem === "telecallers") {
        query += `0 != ANY(telecallers)`;
      } else if (elem === "-telecallers") {
        query += `0 = ANY(telecallers)`;
      }
      if (
        elem.includes("-") &&
        elem != "telecallers" &&
        elem != "-telecallers"
      ) {
        let NULL = elem.slice(1);
        if (intCheck.includes(NULL)) {
          query = query + `${NULL} IS NULL AND `;
        } else {
          query = query + `(${NULL} IS NULL OR ${NULL}= '')AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query + `(${elem} IS NOT NULL AND ${elem}!= '')`;
        }
      }
    }
  });
  let countQuery = query.replace("SELECT *", "SELECT count(*)");
  query =
    query +
    ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  query = query.replace(/AND\s+ORDER/, `ORDER`);
  query = query.replace(/where\s+ORDER/, "ORDER");

  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  try {
    console.log(query, "---------->>> \n\n\n\n");
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
      user: user
    };

  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: [] };
  }
  return returnData;
};

modelObj.getApplicationDataById = async function (id) {
  let query = `SELECT * FROM axis_bank_applications_table where axis_id=${id}`;
  let query2 = `SELECT * FROM tele_applications_data where tad_card_applications=${id}`;
  let returnData = {};
  try {
    let qReturn = await pool.query(query);
    let qReturn2 = await pool.query(query2);
    returnData = {
      ...qReturn.rows[0],
      ...qReturn2.rows[0],
    };
  } catch (err) {
    console.log(err);
    returnData = {};
  }
  return returnData;
};



modelObj.getFilteredAxisApplicationsWithIpaOriginalStatusDistinct = async function (body, user) {
  let returnData = {
    applicationsData: [],
    count: [],
  };
  let { filterObject, pageNo, sort } = body;

  let intCheck = [
    "axis_id",
    "axis_date",
    "ca_main_table",
    "created_at",
    "updated_at",
    "axis_ipa_status_bool",
    "axis_revised_date",
    "telecallers",
    "tad_call_decline_counter",
    "tad_sms_counter",
    "axis_activation",
    "tad_activation_call_counter",
    "axis_activation",
    "tad_automated_call_counter"
  ];

  let {
    entriesPerPage,
    from_axis_revised_date,
    to_axis_revised_date,
    axis_id,
    axis_application_number,
    from_axis_date,
    to_axis_date,
    axis_name,
    axis_mobile_number,
    axis_card_type,
    axis_ipa_status,
    axis_final_status,
    ca_main_table,
    from_created_at,
    from_updated_at,
    to_created_at,
    to_updated_at,
    axis_ipa_status_bool,
    axis_ipa_original_status_sheet,
    tad_axis_ipa_original_status_sheet,
    telecallers,
    notNull,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_activation,
    axis_live_feedback_status,
    axis_send_to_channel,
    tad_call_status,
    tad_call_decline_counter,
    tad_sms_counter,
    from_tad_updated_at,
    to_tad_updated_at,
    tad_activation_call_counter,
    tad_automated_call_counter,
    tad_final_call_status,
    tad_automated_call_status

  } = filterObject;

  const likeFields = { axis_application_number, axis_name };

  const selectFields = {
    axis_card_type,
    axis_ipa_status,
    axis_final_status,
    axis_ipa_original_status_sheet,
    tad_axis_ipa_original_status_sheet,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_live_feedback_status,
    axis_send_to_channel,
    tad_call_status,
    tad_automated_call_status,
    tad_automated_call_counter,
    tad_final_call_status
  };

  const equalFields = {
    axis_id,
    axis_mobile_number,
    ca_main_table,
    axis_ipa_status_bool,
    tad_call_decline_counter,
    tad_sms_counter,
    axis_activation,
    tad_activation_call_counter,
    tad_automated_call_counter
  };

  const fromDatefields = {
    from_axis_date,
    from_axis_revised_date,
    from_created_at,
    from_updated_at,
    from_tad_updated_at
  };
  const toDatefields = {
    to_axis_date,
    to_axis_revised_date,
    to_created_at,
    to_updated_at,
    to_tad_updated_at
  };
  Object.keys(fromDatefields).map((field) => {
    let field_date = new Date(fromDatefields[field]);
    fromDatefields[field] = fromDatefields[field]
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 00:00:01.001`
      : ``;
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``;
    toDatefields[field] = field_date
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 23:59:59.999`
      : ``;
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "axis_ipa_status_bool")
      equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });
  const isFalseField = (field) =>
    field === null || field === undefined || field === "";
  entriesPerPage = entriesPerPage || 10;
  sort = sort || "axis_id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }
  let query = '';
  if (user.ua_role === 3) {
    query = `SELECT * FROM tele_callers_applications_axis_ipa_original_status_distinct camt where admin_user=${user.ua_id} AND `;
  }
  else if (user.ua_role === 1) {
    query = `SELECT * FROM tele_callers_applications_axis_ipa_original_status_distinct camt where `;
  }
  if (telecallers) {
    lastFilter = telecallers.length;
    if (telecallers.length > 1) {
      for (let i = 0; i < telecallers.length; i++) {
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = admin_user `;
        } else {
          query += `${telecallers[i]} = admin_user OR `;
        }
      }
    }
    else {
      query += `${telecallers} = admin_user `;
    }
  }
  try {
    if (telecallers.length === 0) {
      if (user.ua_role === 3) {
        query = `SELECT * FROM tele_callers_applications_axis_ipa_original_status_distinct camt where admin_user=${user.ua_id} AND `;
      }
      else if (user.ua_role === 1) {
        query = `SELECT * FROM tele_callers_applications_axis_ipa_original_status_distinct camt where `;
      }
    }
  } catch (err) {
    console.log(err);
  }
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `"${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `"${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "axis_ipa_status_bool")
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `);
    else {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ""
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `);
    }
  });

  Object.keys(likeFields).map((field, index) => {
    query =
      query +
      (likeFields[field]
        ? `(Lower("${field}")::Text Like '%${likeFields[
          field
        ].toLowerCase()}%' ) AND `
        : ``);
  });
  Object.keys(selectFields).map((field) => {
    let string = "";

    for (
      let i = 0;
      i < (selectFields[field] ? selectFields[field].length : 0);
      i++
    ) {
      string += `'${selectFields[field][i]}',`;
    }
    string = string.slice(0, -1);
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``);
  });
  let stringFields = [
    "axis_application_number",
    "axis_name",
    "axis_mobile_number",
    "axis_card_type",
    "axis_ipa_status",
    "axis_final_status",
    "axis_ipa_original_status_sheet",
    "tad_axis_ipa_original_status_sheet",
    "axis_existing_c",
  ];

  notNull.forEach((elem) => {
    if (elem) {
      if (elem === "telecallers") {
        query += `0 != ANY(telecallers)`;
      } else if (elem === "-telecallers") {
        query += `0 = ANY(telecallers)`;
      }
      if (
        elem.includes("-") &&
        elem != "telecallers" &&
        elem != "-telecallers"
      ) {
        let NULL = elem.slice(1);
        if (intCheck.includes(NULL)) {
          query = query + `${NULL} IS NULL AND `;
        } else {
          query = query + `(${NULL} IS NULL OR ${NULL}= '')AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query + `(${elem} IS NOT NULL AND ${elem}!= '')`;
        }
      }
    }
  });
  let countQuery = query.replace("SELECT *", "SELECT count(*)");
  query =
    query +
    ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  query = query.replace(/AND\s+ORDER/, `ORDER`);
  query = query.replace(/where\s+ORDER/, "ORDER");

  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  try {
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
      user: user
    };

  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: [] };
  }
  return returnData;
};





modelObj.getAxisTeleColumns = async function(){
  let returnData = {
    allIssuers : [],
    allTr : [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		let queryForTr = `SELECT 
    CONCAT('edit-tele-axis-application-ui?id=',tele_callers_applications_axis.axis_id) as "Edit",
    '' as "array|telecallers|Assigned To",
    tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
    tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
    tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
    tad_call_status as "multiple|tad_call_status|Call Status",
    tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
    tad_activation_call_counter as "int|tad_activation_call_counter|Activation Call Counter",
    tad_sms_counter as "int|tad_sms_counter|Sms Counter",
    axis_id as "int|axis_id|Id",
    ca_main_table as "int|ca_main_table|Main Table Id",
    axis_name as "string|axis_name|Axis Name",
    axis_mobile_number as "string|axis_mobile_number|Mobile Number",
    axis_application_number as "string|axis_application_number|Application Number",
    axis_activation as "bool|axis_activation|Axis Activation",
    CAST(axis_date as varchar) as "date|axis_date|Application Date",
    axis_card_type as "multiple|axis_card_type|Card Type",
    axis_ipa_status as "multiple|axis_ipa_status|Ipa Status",
    axis_final_status as "multiple|axis_final_status|Final Status",
    axis_ipa_original_status_sheet as "multiple|axis_ipa_original_status_sheet|Ipa Original Sheet Status",
    tad_axis_ipa_original_status_sheet as "multiple|tad_axis_ipa_original_status_sheet|Assigned Ipa Original Sheet Status",
    axis_existing_c as "multiple|axis_existing_c|Existing C",
    axis_send_to_channel as "multiple|axis_send_to_channel|Send To Channel",
    axis_blaze_output as "multiple|axis_blaze_output|Blaze Output",
    axis_lead_error_log as "multiple|axis_lead_error_log|Lead Error Log",
    axis_live_feedback_status as "multiple|axis_live_feedback_status|Live Feedback Status",
    CAST(tad_updated_at as varchar) as "date|tad_updated_at|Last Updated At"
		FROM tele_callers_applications_axis limit 1`;
		let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
		let selectOptions = {
			axis_card_type : [],
			axis_ipa_status : [],
			axis_final_status : [],
			axis_ipa_original_status_sheet : [],
			axis_ipa_original_status_sheet_initial : [],
			axis_existing_c : [],
			axis_send_to_channel : [],
			axis_blaze_output : [],
			axis_lead_error_log : [],
			axis_live_feedback_status : [],
      telecallers : [],
			tad_automated_call_status : [],
			tad_call_status : [],
			tad_final_call_status : []
		};

    let getAllTeleUsersQuery  = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`; 
    selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
    selectOptions.axis_card_type = await commonModel.getDistinctValuesCommon('axis_card_type', "tele_callers_applications_axis");
    selectOptions.axis_ipa_status = await commonModel.getDistinctValuesCommon('axis_ipa_status', "tele_callers_applications_axis");
    selectOptions.axis_final_status = await commonModel.getDistinctValuesCommon('axis_final_status', "tele_callers_applications_axis");
    selectOptions.axis_ipa_original_status_sheet = await commonModel.getDistinctValuesCommon('axis_ipa_original_status_sheet', "tele_callers_applications_axis");
    selectOptions.axis_ipa_original_status_sheet_initial = await commonModel.getDistinctValuesCommon('axis_ipa_original_status_sheet_initial', "tele_callers_applications_axis");
    selectOptions.axis_existing_c = await commonModel.getDistinctValuesCommon('axis_existing_c', "tele_callers_applications_axis");
    selectOptions.axis_send_to_channel = await commonModel.getDistinctValuesCommon('axis_send_to_channel', "tele_callers_applications_axis");
    selectOptions.axis_blaze_output = await commonModel.getDistinctValuesCommon('axis_blaze_output', "tele_callers_applications_axis");
    selectOptions.axis_lead_error_log = await commonModel.getDistinctValuesCommon('axis_lead_error_log', "tele_callers_applications_axis");
    selectOptions.axis_live_feedback_status = await commonModel.getDistinctValuesCommon('axis_live_feedback_status', "tele_callers_applications_axis");
    selectOptions.tad_automated_call_status = await commonModel.getDistinctValuesCommon('tad_automated_call_status', "tele_callers_applications_axis");
    selectOptions.tad_call_status = await commonModel.getDistinctValuesCommon('tad_call_status', "tele_callers_applications_axis");
    selectOptions.tad_final_call_status = await commonModel.getDistinctValuesCommon('tad_final_call_status', "tele_callers_applications_axis");
    
    returnData.allIssuers = allIssuers;
    returnData.allTr = allTr;
    returnData.selectOptions = selectOptions;
    return returnData;
		
}




module.exports = modelObj;
