const { pool } = require("../../utils/configs/database");
const commonModel = require("../commonModel");

let modelObj = {};
modelObj.getFilteredAxisApplications = async function (body) {
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
    "axis_activation"
  ];
  let {
    entriesPerPage,
    axis_id,
    axis_application_number,
    from_axis_date,
    from_axis_revised_date,
    to_axis_date,
    to_axis_revised_date,
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
    axis_ipa_original_status_sheet_initial,
    telecallers,
    notNull,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_live_feedback_status,
    axis_send_to_channel,
    axis_activation
  } = filterObject;

  const likeFields = { axis_application_number, axis_name };

  const selectFields = {
    axis_card_type,
    axis_ipa_status,
    axis_final_status,
    axis_ipa_original_status_sheet,
    axis_ipa_original_status_sheet_initial,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_live_feedback_status,
    axis_send_to_channel,
  };
  const equalFields = {
    axis_id,
    axis_mobile_number,
    ca_main_table,
    axis_ipa_status_bool,
    axis_activation
  };
  const fromDatefields = {
    from_axis_date,
    from_axis_revised_date,
    from_created_at,
    from_updated_at,
  };
  const toDatefields = {
    to_axis_date,
    to_axis_revised_date,
    to_created_at,
    to_updated_at,
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
  entriesPerPage = entriesPerPage || 50;
  sort = sort || "axis_id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }

  let query = `
	SELECT * FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM axis_bank_applications_table camt
        left join applications_users_junction auj on auj.application_id = axis_id and auj.issuer_id = 1
        GROUP BY (camt.axis_id)
        ) as new_applications where `;
        if(body.statusDifference){
          query += ` axis_ipa_original_status_sheet_initial IS DISTINCT FROM axis_ipa_original_status_sheet AND `;

        }
  if (telecallers) {
    lastFilter = telecallers.length;
    if (telecallers.length > 1) {
      for (let i = 0; i < telecallers.length; i++) {
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = ANY(telecallers) AND `;
        } else {
          query += `${telecallers[i]} = ANY(telecallers) OR `;
        }
      }
    } else {
      query += `${telecallers} = ANY(telecallers) AND `;
    }
  }
  
  try {
    if (telecallers.length === 0) {
      query = `
      SELECT * FROM (SELECT camt.*,array_agg(auj.admin_user) telecallers FROM axis_bank_applications_table camt
            left join applications_users_junction auj on auj.application_id = axis_id and auj.issuer_id = 1
            GROUP BY (camt.axis_id)
            ) as new_applications where `;

            if(body.statusDifference){
              query += ` axis_ipa_original_status_sheet_initial IS DISTINCT FROM axis_ipa_original_status_sheet AND `;
    
            }
    }
  } catch (err) {
    console.log("No Telecallers");
  }
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? ` new_applications."${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? ` new_applications."${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });

  Object.keys(equalFields).map((field) => {
    if (field !== "idfc_date_ipa_status")
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : ` "${field}"::Text = '${equalFields[field]}' AND `);
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
      `(Lower("${field}")::Text Like '%${likeFields[
        field
      ].toLowerCase()}%' OR "${field}" IS NULL ) AND `;
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
    console.log({ string });
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
    "axis_ipa_original_status_sheet_initial",
    "axis_existing_c",
  ];
  notNull.forEach((elem) => {
    if (elem) {
      if (elem === "telecallers") {
        query += `0 != ANY(telecallers) AND `;
      } else if (elem === "-telecallers") {
        query += `0 = ANY(telecallers) AND `;
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
          query = query + `(${NULL} IS NULL OR ${NULL}= '') AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query + `(${elem} IS NOT NULL AND ${elem}!= '') AND `;
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
    console.log(query, "<<<<<<<<<<<,")
  try {
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
    };
  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: [] };
  }
  return returnData;
};

modelObj.exportCsv = async function ({ allFieldsArray, filterObject }) {

  let returnData = {
    applicationsData: [],
  };

  let intCheck = [
    "axis_id",
    "axis_date",
    "ca_main_table",
    "created_at",
    "updated_at",
    "axis_ipa_status_bool",
    "axis_revised_date",
  ];

  let {
    axis_id,
    axis_application_number,
    from_axis_date,
    from_axis_revised_date,
    to_axis_date,
    to_axis_revised_date,
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
    axis_ipa_original_status_sheet_initial,
    telecallers,
    notNull,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_live_feedback_status,
    axis_send_to_channel,
  } = filterObject;

  const likeFields = { axis_application_number, axis_name };

  const selectFields = {
    axis_card_type,
    axis_ipa_status,
    axis_final_status,
    axis_ipa_original_status_sheet,
    axis_ipa_original_status_sheet_initial,
    axis_blaze_output,
    axis_existing_c,
    axis_lead_error_log,
    axis_live_feedback_status,
    axis_send_to_channel,
  };
  const equalFields = {
    axis_id,
    axis_mobile_number,
    ca_main_table,
    axis_ipa_status_bool,
  };
  const fromDatefields = {
    from_axis_date,
    from_axis_revised_date,
    from_created_at,
    from_updated_at,
  };
  const toDatefields = {
    to_axis_date,
    to_axis_revised_date,
    to_created_at,
    to_updated_at,
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

  let columnString = ``;
  allFieldsArray.map((field) => {
    columnString += `${field.column_name},`;
  });
  columnString = columnString.slice(0, -1);

  let query = `
	SELECT ${columnString} FROM axis_bank_applications_table camt where
	`;
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `camt."${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `camt."${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });

  Object.keys(equalFields).map((field) => {
    if (field !== "axis_ipa_status_bool")
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `);
    else {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ""
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `);
    }
  });
  try{
    Object.keys(likeFields).map((field, index) => {
      query =
        query +
        (likeFields[field]
          ? `(Lower(camt."${field}")::Text Like '%${likeFields[
              field
            ].toLowerCase()}%' ) AND `
          : ``);
    });
  }catch(err){
    console.log("to Lower Case")
  }
  
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
    console.log({ string });
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
    "axis_ipa_original_status_sheet_initial"
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
          query = query + `(${NULL} IS NULL OR ${NULL}= '') AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query + `(${elem} IS NOT NULL AND ${elem}!= '') AND `;
        }
      }
    }
  });
  query = query.trimEnd().endsWith("where")
    ? query.replace("where", "")
    : query;
  query = query + ";";
  query = query.replace(/AND\s+\;/, `;`);
  try {
    let appData = await pool.query(query);
    returnData = { applicationsData: appData.rows };
  } catch (err) {
    console.error(err);
    returnData = { applicationsData: [] };
  }

  return returnData;
};

modelObj.getApplicationDataById = async function (id) {
  let query = `SELECT * FROM axis_bank_applications_table where axis_id=${id}`;
  let returnData = {};
  try {
    let qReturn = await pool.query(query);
    returnData = qReturn.rows[0];
  } catch (err) {
    console.log(err);
    returnData = {};
  }
  return returnData;
};




modelObj.getAxisColumns = async function(){
  let returnData = {
    allIssuers : [],
    allTr : [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		let queryForTr = `SELECT 
    CONCAT('edit-axis-application-ui?id=',axis_bank_applications_table.axis_id) as "Edit",
	  axis_bank_applications_table.axis_id as select,
    '' as "array|telecallers|telecallers",
		axis_bank_applications_table.axis_id as "int|axis_id|Id",
		axis_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
		axis_bank_applications_table.axis_name as "string|axis_name|Name",
    axis_bank_applications_table.axis_mobile_number as "string|axis_mobile_number|Mobile Number",
		axis_bank_applications_table.axis_application_number as "string|axis_application_number|Application Number",
    axis_bank_applications_table.axis_activation as "bool|axis_activation|Activation",
    CAST(axis_bank_applications_table.axis_date as varchar) as "date|axis_date|Application Date",
    CAST(axis_bank_applications_table.axis_revised_date as varchar) as "date|axis_revised_date|Revised Date",
    axis_bank_applications_table.axis_card_type as "multiple|axis_card_type|Card Type",
    axis_bank_applications_table.axis_ipa_status as "multiple|axis_ipa_status|IPA Status",
    axis_bank_applications_table.axis_final_status as "multiple|axis_final_status|Final Status",
    axis_bank_applications_table.axis_ipa_original_status_sheet_initial as "multiple|axis_ipa_original_status_sheet_initial|ETE Original Status Sheet Initial",
    axis_bank_applications_table.axis_ipa_original_status_sheet as "multiple|axis_ipa_original_status_sheet|ETE Original Status Sheet",
    axis_bank_applications_table.axis_existing_c as "select|axis_existing_c|ETB/NTB",
    axis_bank_applications_table.axis_send_to_channel as "multiple|axis_send_to_channel|Send To Channel",
    axis_bank_applications_table.axis_blaze_output as "multiple|axis_blaze_output|Blaze Output",
    axis_bank_applications_table.axis_lead_error_log as "multiple|axis_lead_error_log|Lead Error Log",
    axis_bank_applications_table.axis_live_feedback_status as "multiple|axis_live_feedback_status|Live Feedback Status",
    CAST(axis_bank_applications_table.created_at as varchar) as "date|created_at|Created At",
    CAST(axis_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
		FROM axis_bank_applications_table limit 1`;
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
      telecallers : []
			
		};
    let getAllTeleUsersQuery  = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`; 
    selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
    selectOptions.axis_card_type = await commonModel.getDistinctValuesCommon('axis_card_type', "axis_bank_applications_table");
    selectOptions.axis_ipa_status = await commonModel.getDistinctValuesCommon('axis_ipa_status', "axis_bank_applications_table");
    selectOptions.axis_final_status = await commonModel.getDistinctValuesCommon('axis_final_status', "axis_bank_applications_table");
    selectOptions.axis_ipa_original_status_sheet = await commonModel.getDistinctValuesCommon('axis_ipa_original_status_sheet', "axis_bank_applications_table");
    selectOptions.axis_ipa_original_status_sheet_initial = await commonModel.getDistinctValuesCommon('axis_ipa_original_status_sheet_initial', "axis_bank_applications_table");
    selectOptions.axis_existing_c = await commonModel.getDistinctValuesCommon('axis_existing_c', "axis_bank_applications_table");
    selectOptions.axis_send_to_channel = await commonModel.getDistinctValuesCommon('axis_send_to_channel', "axis_bank_applications_table");
    selectOptions.axis_blaze_output = await commonModel.getDistinctValuesCommon('axis_blaze_output', "axis_bank_applications_table");
    selectOptions.axis_lead_error_log = await commonModel.getDistinctValuesCommon('axis_lead_error_log', "axis_bank_applications_table");
    selectOptions.axis_live_feedback_status = await commonModel.getDistinctValuesCommon('axis_live_feedback_status', "axis_bank_applications_table");
    
    returnData.allIssuers = allIssuers;
    returnData.allTr = allTr;
    returnData.selectOptions = selectOptions;
    return returnData;
		
}


module.exports = modelObj;
