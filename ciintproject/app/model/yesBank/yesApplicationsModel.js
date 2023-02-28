const { pool } = require("../../utils/configs/database");
const commonModel = require("../commonModel")
let modelObj = {};

modelObj.getYesColumns = async function () {
  let returnData = {
    allIssuers: [],
    allTr: [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
  let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
  let queryForTr = `SELECT
    CONCAT('edit-yes-application-ui?id=',yes_bank_applications_table.yb_id) as "Edit",  
		yes_bank_applications_table.yb_id as select,
    '' as "array|telecallers|telecallers",
		yes_bank_applications_table.yb_id as "int|yb_id|Id",
		yes_bank_applications_table.yb_real_application_id as "string|yb_real_application_id|Application Id",
		yes_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
		yes_bank_applications_table.yb_mobile_number as "int|yb_mobile_number|Mobile Number",
		card_applications_main_table.name as "string|name|Name",
		CAST(yes_bank_applications_table.yb_application_created as varchar) as "date|yb_application_created|Application Created",
		yes_bank_applications_table.yb_application_number as "string|yb_application_number|Application Number",
		yes_bank_applications_table.yb_aps_ref_number as "string|yb_aps_ref_number|Aps Ref Number",
		yes_bank_applications_table.yb_ekyc_status as "multiple|yb_ekyc_status|Ekyc Status",
		yes_bank_applications_table.yb_application_status_initial as "multiple|yb_application_status_initial|Application Status Initial",
		yes_bank_applications_table.yb_application_status as "multiple|yb_application_status|Application Status",
		yes_bank_applications_table.yb_final_status as "multiple|yb_final_status|Final Status",
		yes_bank_applications_table.yb_ipa_status as "multiple|yb_ipa_status|Ipa Status",
		yes_bank_applications_table.yb_dedupe_status as "multiple|yb_dedupe_status|Dedupe Status",
		yes_bank_applications_table.yb_policy_check_status as "multiple|yb_policy_check_status|Policy Check Status",
		yes_bank_applications_table.yb_cibil_check_status as "multiple|yb_cibil_check_status|Cibil Check Status",
		yes_bank_applications_table.yb_idv as "select|yb_idv|Idv",
		CAST(yes_bank_applications_table.yb_last_update_on as varchar) as "date|yb_last_update_on|Last Update On",
		yes_bank_applications_table.yb_apply_through as "multiple|yb_apply_through|Apply Through",
		yes_bank_applications_table.yb_credit_limit as "string|yb_credit_limit|Credit Limit",
		yes_bank_applications_table.yb_vkyc_unable_reject_reasons as "string|yb_vkyc_unable_reject_reasons|Vkyc Enable Reject Reason",
		CAST(yes_bank_applications_table.yb_decision_date as varchar) as "date|yb_decision_date|Decision Date",
		yes_bank_applications_table.yb_decline_reson as "multiple|yb_decline_reson|Decline Reason",
		yes_bank_applications_table.yb_dip_reject_reason as "multiple|yb_dip_reject_reason|Dip Reject Reason",
		card_applications_main_table.occupation as "select|occupation|Occupation",
		card_applications_main_table.aadhar_pin as "string|aadhar_pin|Aadhar Pin",
		card_applications_main_table.monthly_income as "range|monthly_income|Monthly Income",
		card_applications_main_table.company_name as "string|company_name|Company Name",
		CAST(yes_bank_applications_table.created_at as varchar) as "date|created_at|Created At",
		CAST(yes_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
		FROM yes_bank_applications_table
    LEFT JOIN card_applications_main_table ON card_applications_main_table.id = yes_bank_applications_table.ca_main_table
    limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
  let selectOptions = {
    yb_ekyc_status: [],
    yb_application_status: [],
    yb_application_status_initial: [],
    yb_final_status: [],
    yb_ipa_status: [],
    yb_dedupe_status: [],
    yb_policy_check_status: [],
    yb_cibil_check_status: [],
    yb_idv: [],
    yb_apply_through: [],
    yb_decline_reson: [],
    yb_dip_reject_reason: [],
    occupation: [],
    telecallers: []
  };
  let getAllTeleUsersQuery = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`;
  selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
  selectOptions.yb_ekyc_status = await commonModel.getDistinctValuesCommon('yb_ekyc_status', 'yes_bank_applications_table');
  selectOptions.yb_application_status = await commonModel.getDistinctValuesCommon('yb_application_status', 'yes_bank_applications_table');
  selectOptions.yb_application_status_initial = await commonModel.getDistinctValuesCommon('yb_application_status_initial', 'yes_bank_applications_table');
  selectOptions.yb_final_status = await commonModel.getDistinctValuesCommon('yb_final_status', 'yes_bank_applications_table');
  selectOptions.yb_ipa_status = await commonModel.getDistinctValuesCommon('yb_ipa_status', 'yes_bank_applications_table');
  selectOptions.yb_dedupe_status = await commonModel.getDistinctValuesCommon('yb_dedupe_status', 'yes_bank_applications_table');
  selectOptions.yb_policy_check_status = await commonModel.getDistinctValuesCommon('yb_policy_check_status', 'yes_bank_applications_table');
  selectOptions.yb_cibil_check_status = await commonModel.getDistinctValuesCommon('yb_cibil_check_status', 'yes_bank_applications_table');
  selectOptions.yb_idv = await commonModel.getDistinctValuesCommon('yb_idv', 'yes_bank_applications_table');
  selectOptions.yb_apply_through = await commonModel.getDistinctValuesCommon('yb_apply_through', 'yes_bank_applications_table');
  selectOptions.yb_decline_reson = await commonModel.getDistinctValuesCommon('yb_decline_reson', 'yes_bank_applications_table');
  selectOptions.yb_dip_reject_reason = await commonModel.getDistinctValuesCommon('yb_dip_reject_reason', 'yes_bank_applications_table');
  selectOptions.occupation = await commonModel.getDistinctValuesCommon('occupation', 'card_applications_main_table');

  returnData.allIssuers = allIssuers;
  returnData.allTr = allTr;
  returnData.selectOptions = selectOptions;
  return returnData;
}
modelObj.getFilteredYesApplications = async function (body) {
  let returnData = {
    applicationsData: [],
    count: [],
  };
  let { filterObject, pageNo, sort } = body;

  let intCheck = [
    "yb_id",
    "ca_main_table",
    "yb_application_created",
    "yb_last_updated_on",
    "yb_mobile_number",
    "created_at",
    "updated_at",
    "axis_revised_date",
    "telecallers",
  ];

  let {
    entriesPerPage,
    yb_id,
    ca_main_table,
    from_yb_application_created,
    to_yb_application_created,
    yb_application_number,
    yb_aps_ref_number,
    yb_ekyc_status,
    yb_application_status,
    yb_application_status_initial,
    yb_final_status,
    yb_ipa_status,
    yb_dedupe_status,
    yb_policy_check_status,
    yb_cibil_check_status,
    yb_idv,
    from_yb_last_update_on,
    to_yb_last_update_on,
    yb_apply_through,
    yb_real_application_id,
    from_yb_credit_limit,
    to_yb_credit_limit,
    yb_vkyc_unable_reject_reasons,
    yb_final_original_status,
    yb_decision_date,
    yb_decline_reson,
    yb_dip_reject_reason,
    yb_mobile_number,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    telecallers,
    notNull,
    name,
    occupation,
    monthly_income,
    aadhar_pin,
    company_name,
  } = filterObject;

  const likeFields = {
    yb_decision_date,
    monthly_income,
    occupation
  };
  const selectFields = {
    yb_ekyc_status,
    yb_application_status,
    yb_application_status_initial,
    yb_final_status,
    yb_ipa_status,
    yb_dedupe_status,
    yb_policy_check_status,
    yb_cibil_check_status,
    yb_idv,
    yb_apply_through,
    yb_vkyc_unable_reject_reasons,
    yb_final_original_status,
    yb_decline_reson,
    yb_dip_reject_reason,

  };
  const equalFields = {
    yb_id,
    ca_main_table,
    yb_application_number,
    yb_aps_ref_number,
    yb_mobile_number,
    yb_real_application_id,
    name,
    company_name,
    aadhar_pin,
    occupation
  };
  const fromDatefields = {
    from_yb_application_created,
    from_yb_last_update_on,
    from_created_at,
    from_updated_at,
  };
  const toDatefields = {
    to_yb_application_created,
    to_yb_last_update_on,
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
    equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });

  const isFalseField = (field) =>
    field === null || field === undefined || field === "";
  entriesPerPage = entriesPerPage || 50;
  sort = sort || "yb_id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }
  let query = `
	SELECT new_applications.*, card_applications_main_table.name, card_applications_main_table.occupation, card_applications_main_table.aadhar_pin, card_applications_main_table.monthly_income, card_applications_main_table.company_name  FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM yes_bank_applications_table camt
        LEFT JOIN applications_users_junction auj on auj.application_id = yb_id and auj.issuer_id = 11 
        GROUP BY (camt.yb_id)
        ) as new_applications
		LEFT JOIN card_applications_main_table ON card_applications_main_table.id = new_applications.ca_main_table where `;
  if (body.statusDifference) {
    query += ` yb_application_status_initial IS DISTINCT FROM yb_application_status AND `;
  }
  if (telecallers) {
    lastFilter = telecallers.length;
    if (telecallers.length > 1) {
      for (let i = 0; i < telecallers.length; i++) {
        if (i === telecallers.length - 1) {
          Z;
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
		  SELECT new_applications.*, card_applications_main_table.name, card_applications_main_table.occupation, card_applications_main_table.aadhar_pin, card_applications_main_table.monthly_income, card_applications_main_table.company_name  FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM yes_bank_applications_table camt
        LEFT JOIN applications_users_junction auj on auj.application_id = yb_id and auj.issuer_id = 11 
        GROUP BY (camt.yb_id)
        ) as new_applications
		LEFT JOIN card_applications_main_table ON card_applications_main_table.id = new_applications.ca_main_table where `;
      if (body.statusDifference) {
        query += ` yb_application_status_initial IS DISTINCT FROM yb_application_status AND `;
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
    query =
      query +
      (equalFields[field] === undefined || equalFields[field] === ""
        ? ``
        : `"${field}"::Text = '${equalFields[field]}' AND `);
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
    "yb_application_number",
    "yb_aps_ref_number",
    "yb_ekyc_status",
    "yb_application_status",
    "yb_application_status_initial",
    "yb_final_status",
    "yb_ipa_status",
    "yb_dedupe_status",
    "yb_policy_check_status",
    "yb_cibil_check_status",
    "yb_idv",
    "yb_apply_through",
    "yb_credit_limit",
    "yb_vkyc_unable_reject_reasons",
    "yb_final_original_status",
    "yb_decision_date",
    "yb_decline_reson",
    "yb_dip_reject_reason",
    "yb_real_application_id",
  ];
  let newFields = ["aadhar_pin", "-aadhar_pin", "monthly_income", "-monthly_income", "occupation", "-occupation", "company_name", "-company_name", "name", "-name"];

  notNull.forEach((elem) => {
    console.log(newFields.includes(elem))

    if (newFields.includes(elem) === false) {
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
          query = query + `new_applications.${NULL} IS NULL AND `;
        } else {
          query =
            query +
            `(new_applications.${NULL} IS NULL OR new_applications.${NULL}= '') AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `new_applications.${elem} IS NOT NULL AND `;
        } else {
          query =
            query +
            `(new_applications.${elem} IS NOT NULL AND new_applications.${elem}!= '') AND `;
        }
      }
    } else {
      if (elem.includes("-")) {
        let NULL = elem.slice(1);
        if (intCheck.includes(NULL)) {
          query = query + `${NULL} IS NULL AND `;
        } else {
          query = query + `(${NULL} IS NULL OR ${NULL}= '') AND `;
        }
      } else {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query +
            `(${elem} IS NOT NULL AND ${elem}!= '') AND `;
        }
      }
    }
  });

  let countQuery = query.replace("SELECT *", "SELECT count(*)");
  query =
    query +
    `ORDER By "${sort}" ${ascDesc}
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
    // console.log(query, "----- query here..");
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rowCount,
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
  let {
    entriesPerPage,
    yb_id,
    ca_main_table,
    from_yb_application_created,
    to_yb_application_created,
    yb_application_number,
    yb_aps_ref_number,
    yb_ekyc_status,
    yb_application_status,
    yb_application_status_initial,
    yb_final_status,
    yb_ipa_status,
    yb_dedupe_status,
    yb_policy_check_status,
    yb_cibil_check_status,
    yb_idv,
    from_yb_last_update_on,
    to_yb_last_update_on,
    yb_apply_through,
    yb_real_application_id,
    from_yb_credit_limit,
    to_yb_credit_limit,
    yb_vkyc_unable_reject_reasons,
    yb_final_original_status,
    yb_decision_date,
    yb_decline_reson,
    yb_dip_reject_reason,
    yb_mobile_number,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    notNull,
  } = filterObject;
  const likeFields = {
    yb_decision_date,
  };
  const selectFields = {
    yb_ekyc_status,
    yb_application_status,
    yb_application_status_initial,
    yb_final_status,
    yb_ipa_status,
    yb_dedupe_status,
    yb_policy_check_status,
    yb_cibil_check_status,
    yb_idv,
    yb_apply_through,
    yb_vkyc_unable_reject_reasons,
    yb_final_original_status,
    yb_decline_reson,
    yb_dip_reject_reason,
  };
  const equalFields = {
    yb_id,
    ca_main_table,
    yb_application_number,
    yb_aps_ref_number,
    yb_mobile_number,
    yb_real_application_id,
  };
  const fromDatefields = {
    from_yb_application_created,
    from_yb_last_update_on,
    from_created_at,
    from_updated_at,
  };
  const toDatefields = {
    to_yb_application_created,
    to_yb_last_update_on,
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
    equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });
  const isFalseField = (field) =>
    field === null || field === undefined || field === "";

  let columnString = ``;
  allFieldsArray.map((field) => {
    if (field.column_name === "created_at" || field.column_name === "updated_at") {
      columnString += `camt.${field.column_name},`;
    }
    else {
      columnString += `${field.column_name},`;
    }
  });
  columnString = columnString.slice(0, -1);

  let query = `
	SELECT ${columnString} FROM yes_bank_applications_table camt 
  LEFT JOIN card_applications_main_table ON card_applications_main_table.id = camt.ca_main_table
  where
	`;
  console.log(query, "<<<<<<<<<<<<<")
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
    query =
      query +
      (equalFields[field] === undefined || equalFields[field] === ""
        ? ``
        : `camt."${field}"::Text = '${equalFields[field]}' AND `);
  });

  Object.keys(likeFields).map((field, index) => {
    query =
      query +
      (likeFields[field]
        ? `(Lower(camt."${field}")::Text Like '%${likeFields[
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
    "yb_application_number",
    "yb_aps_ref_number",
    "yb_ekyc_status",
    "yb_application_status",
    "yb_application_status_initial",
    "yb_final_status",
    "yb_ipa_status",
    "yb_dedupe_status",
    "yb_policy_check_status",
    "yb_cibil_check_status",
    "yb_idv",
    "yb_apply_through",
    "yb_credit_limit",
    "yb_vkyc_unable_reject_reasons",
    "yb_final_original_status",
    "yb_decision_date",
    "yb_decline_reson",
    "yb_dip_reject_reason",
    "yb_real_application_id",
  ];
  notNull.forEach((elem) => {
    if (stringFields.includes(elem)) query += `ltrim(${elem}) <> '' AND `;
    else {
      if (elem.includes("-")) {
        let NULL = elem.slice(1);
        query = query + `${NULL} IS NULL AND `;
      } else {
        query = query + `${elem} IS NOT NULL AND `;
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
  let query = `SELECT * FROM yes_bank_applications_table where yb_id=${id}`;
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
module.exports = modelObj;
