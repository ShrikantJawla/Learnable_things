const { pool } = require("../../utils/configs/database");
const commonModel = require("../../model/commonModel");
////////////////////////////////////////////////////////////////////////////////////////////////
let modelObj = {};
modelObj.getFilteredYesApplications = async function (body, user) {
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
    "tad_call_decline_counter",
    "tad_activation_call_counter",
    "tad_yestomated_call_counter"
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
    tad_yes_application_status,
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
    telecallers,
    name,
    tad_call_status,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_yestomated_call_counter,
    tad_yestomated_call_status,
    tad_final_call_status,
    from_tad_updated_at,
    to_tad_updated_at,
    occupation
  } = filterObject;

  const selectFields = {
    yb_ekyc_status,
    yb_application_status,
    yb_application_status_initial,
    tad_yes_application_status,
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
    tad_call_status,
    tad_yestomated_call_status,
    tad_final_call_status
  };

  const likeFields = {
    yb_decision_date,
    name,
    occupation
  };

  const equalFields = {
    yb_id,
    ca_main_table,
    yb_application_number,
    yb_aps_ref_number,
    yb_real_application_id,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_yestomated_call_counter
  };


  const fromDatefields = {
    from_yb_application_created,
    from_yb_last_update_on,
    from_created_at,
    from_updated_at,
    from_tad_updated_at,
  };
  const toDatefields = {
    to_yb_application_created,
    to_yb_last_update_on,
    to_created_at,
    to_updated_at,
    to_tad_updated_at,
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
      : `1970-01-01 00:00:01.001`;
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field]
      ? new Date(toDatefields[field])
      : new Date();
    toDatefields[field] = `${field_date.getFullYear()}-${(
      field_date.getMonth() + 1
    )
      .toString()
      .padStart(2, 0)}-${field_date
        .getDate()
        .toString()
        .padStart(2, 0)} 23:59:59.999`;
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "yb_ipa_status")
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

  let query = "";
  if (user.ua_role === 3) {
    query = `SELECT * FROM tele_callers_applications_yes camt where admin_user=${user.ua_id} AND `;
  } else if (user.ua_role === 1) {
    query = `SELECT * FROM tele_callers_applications_yes camt where `;
  }
  if (telecallers) {
    lastFilter = telecallers.length;
    if (telecallers.length > 1) {
      for (let i = 0; i < telecallers.length; i++) {
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = admin_user AND `;
        } else {
          query += `${telecallers[i]} = admin_user OR `;
        }
      }
    } else {
      query += `${telecallers} = admin_user AND `;
    }
  }
  try {
    if (telecallers.length === 0) {
      if (user.ua_role === 3) {
        query = `SELECT * FROM tele_callers_applications_yes camt where admin_user=${user.ua_id} AND `;
      } else if (user.ua_role === 1) {
        query = `SELECT * FROM tele_callers_applications_yes camt where `;
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
    // console.log({ string });
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
    "tad_yes_application_status",
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
    `ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  query = query.replace(/AND\s+ORDER/, `ORDER`);
  query = query.replace(/where\s+ORDER/, "ORDER");
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  try {
    // console.log(query);
    // console.log(countQuery);
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    // console.log(countData.rows);
    returnData = {
      count: countData.rows[0].count * 1,
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
  let query = `SELECT * FROM tele_callers_applications_yes where yb_id=${id}`;
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



modelObj.getFilteredYesApplicationsWithYesApplicationStatusDistinct = async function (body, user) {
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
    "tad_call_decline_counter",
    "tad_activation_call_counter",
    "tad_yestomated_call_counter"
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
    tad_yes_application_status,
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
    telecallers,
    name,
    tad_call_status,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_yestomated_call_counter,
    tad_yestomated_call_status,
    tad_final_call_status,
    from_tad_updated_at,
    to_tad_updated_at,
    occupation
  } = filterObject;

  const selectFields = {
    yb_ekyc_status,
    yb_application_status,
    tad_yes_application_status,
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
    tad_call_status,
    tad_yestomated_call_status,
    tad_final_call_status
  };

  const likeFields = {
    yb_decision_date,
    name,
    occupation
  };

  const equalFields = {
    yb_id,
    ca_main_table,
    yb_application_number,
    yb_aps_ref_number,
    yb_real_application_id,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_yestomated_call_counter
  };


  const fromDatefields = {
    from_yb_application_created,
    from_yb_last_update_on,
    from_created_at,
    from_updated_at,
    from_tad_updated_at,
  };
  const toDatefields = {
    to_yb_application_created,
    to_yb_last_update_on,
    to_created_at,
    to_updated_at,
    to_tad_updated_at,
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
      : `1970-01-01 00:00:01.001`;
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field]
      ? new Date(toDatefields[field])
      : new Date();
    toDatefields[field] = `${field_date.getFullYear()}-${(
      field_date.getMonth() + 1
    )
      .toString()
      .padStart(2, 0)}-${field_date
        .getDate()
        .toString()
        .padStart(2, 0)} 23:59:59.999`;
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "yb_ipa_status")
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

  let query = "";
  if (user.ua_role === 3) {
    query = `SELECT * FROM tele_callers_applications_yes_application_status_distinct camt where admin_user=${user.ua_id} AND `;
  } else if (user.ua_role === 1) {
    query = `SELECT * FROM tele_callers_applications_yes_application_status_distinct camt where `;
  }
  if (telecallers) {
    lastFilter = telecallers.length;
    if (telecallers.length > 1) {
      for (let i = 0; i < telecallers.length; i++) {
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = admin_user AND `;
        } else {
          query += `${telecallers[i]} = admin_user OR `;
        }
      }
    } else {
      query += `${telecallers} = admin_user AND `;
    }
  }
  try {
    if (telecallers.length === 0) {
      if (user.ua_role === 3) {
        query = `SELECT * FROM tele_callers_applications_yes_application_status_distinct camt where admin_user=${user.ua_id} AND `;
      } else if (user.ua_role === 1) {
        query = `SELECT * FROM tele_callers_applications_yes_application_status_distinct camt where `;
      }
    }
  } catch (err) {
    // console.log("No Telecallers");
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
    // console.log({ string });
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
    "tad_yes_application_status",
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
    `ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  query = query.replace(/AND\s+ORDER/, `ORDER`);
  query = query.replace(/where\s+ORDER/, "ORDER");
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  try {
    // console.log(query);
    // console.log(countQuery);
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    // console.log(countData.rows);
    returnData = {
      count: countData.rows[0].count * 1,
      applicationsData: appData.rows,
      user: user
    };

  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: [] };
  }
  return returnData;
};

modelObj.getYesTeleColumns = async function () {
  let returnData = {
    allIssuers: [],
    allTr: [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
  let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
  let queryForTr = `SELECT
  CONCAT('edit-tele-yes-application-ui?id=',tele_callers_applications_yes.yb_id) as "Edit",
	'' as "array|telecallers|Assigned To",
	tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
	tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
	tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
	tad_call_status as "multiple|tad_call_status|Call Status",
	tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
	tad_activation_call_counter as "int|tad_activation_call_counter|Activation Call Counter",
	tad_sms_counter as "int|tad_sms_counter|Sms Counter",
	tele_callers_applications_yes.yb_id as "int|yb_id|Id",
	tele_callers_applications_yes.yb_real_application_id as "string|yb_real_application_id|Application Id",
	tele_callers_applications_yes.ca_main_table as "int|ca_main_table|Main Table",
	tele_callers_applications_yes.yb_mobile_number as "int|yb_mobile_number|Mobile Number",
	card_applications_main_table.name as "string|name|Name",
	CAST(tele_callers_applications_yes.yb_application_created as varchar) as "date|yb_application_created|Application Created",
	tele_callers_applications_yes.yb_application_number as "string|yb_application_number|Application Number",
	tele_callers_applications_yes.yb_aps_ref_number as "string|yb_aps_ref_number|Aps Ref Number",
	tele_callers_applications_yes.yb_ekyc_status as "multiple|yb_ekyc_status|Ekyc Status",
	tele_callers_applications_yes.tad_yes_application_status as "multiple|tad_yes_application_status|Assigned Status Initial",
	tele_callers_applications_yes.yb_application_status as "multiple|yb_application_status|Application Status",
	card_applications_main_table.occupation as "select|occupation|Occupation",
	card_applications_main_table.monthly_income as "range|monthly_income|Monthly Income",
	card_applications_main_table.company_name as "string|company_name|Company Name",
	tele_callers_applications_yes.yb_final_status as "multiple|yb_final_status|Final Status",
	tele_callers_applications_yes.yb_ipa_status as "multiple|yb_ipa_status|Ipa Status",
	tele_callers_applications_yes.yb_dedupe_status as "multiple|yb_dedupe_status|Dedupe Status",
	tele_callers_applications_yes.yb_policy_check_status as "multiple|yb_policy_check_status|Policy Check Status",
	tele_callers_applications_yes.yb_cibil_check_status as "multiple|yb_cibil_check_status|Cibil Check Status",
	tele_callers_applications_yes.yb_idv as "select|yb_idv|Idv",
	CAST(tele_callers_applications_yes.yb_last_update_on as varchar) as "date|yb_last_update_on|Last Update On",
	tele_callers_applications_yes.yb_apply_through as "multiple|yb_apply_through|Apply Through",
	tele_callers_applications_yes.yb_credit_limit as "string|yb_credit_limit|Credit Limit",
	tele_callers_applications_yes.yb_vkyc_unable_reject_reasons as "string|yb_vkyc_unable_reject_reasons|Vkyc Enable Reject Reason",
	CAST(tele_callers_applications_yes.yb_decision_date as varchar) as "date|yb_decision_date|Decision Date",
	tele_callers_applications_yes.yb_decline_reson as "multiple|yb_decline_reson|Decline Reason",
	tele_callers_applications_yes.yb_dip_reject_reason as "multiple|yb_dip_reject_reason|Dip Reject Reason",
	CAST(tele_callers_applications_yes.created_at as varchar) as "date|created_at|Created At",
	CAST(tele_callers_applications_yes.updated_at as varchar) as "date|updated_at|Updated At"
  FROM tele_callers_applications_yes
  LEFT JOIN card_applications_main_table ON card_applications_main_table.id = tele_callers_applications_yes.ca_main_table
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
    telecallers: [],
    tad_automated_call_status: [],
    tad_call_status: [],
    tad_final_call_status: []
  };
  let getAllTeleUsersQuery = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`;
  selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
  selectOptions.yb_ekyc_status = await commonModel.getDistinctValuesCommon('yb_ekyc_status', 'tele_callers_applications_yes');
  selectOptions.yb_application_status = await commonModel.getDistinctValuesCommon('yb_application_status', 'tele_callers_applications_yes');
  selectOptions.yb_application_status_initial = await commonModel.getDistinctValuesCommon('yb_application_status_initial', 'tele_callers_applications_yes');
  selectOptions.yb_final_status = await commonModel.getDistinctValuesCommon('yb_final_status', 'tele_callers_applications_yes');
  selectOptions.yb_ipa_status = await commonModel.getDistinctValuesCommon('yb_ipa_status', 'tele_callers_applications_yes');
  selectOptions.yb_dedupe_status = await commonModel.getDistinctValuesCommon('yb_dedupe_status', 'tele_callers_applications_yes');
  selectOptions.yb_policy_check_status = await commonModel.getDistinctValuesCommon('yb_policy_check_status', 'tele_callers_applications_yes');
  selectOptions.yb_cibil_check_status = await commonModel.getDistinctValuesCommon('yb_cibil_check_status', 'tele_callers_applications_yes');
  selectOptions.yb_idv = await commonModel.getDistinctValuesCommon('yb_idv', 'tele_callers_applications_yes');
  selectOptions.yb_apply_through = await commonModel.getDistinctValuesCommon('yb_apply_through', 'tele_callers_applications_yes');
  selectOptions.yb_decline_reson = await commonModel.getDistinctValuesCommon('yb_decline_reson', 'tele_callers_applications_yes');
  selectOptions.yb_dip_reject_reason = await commonModel.getDistinctValuesCommon('yb_dip_reject_reason', 'tele_callers_applications_yes');
  selectOptions.occupation = await commonModel.getDistinctValuesCommon('occupation', 'card_applications_main_table');
  selectOptions.tad_automated_call_status = await commonModel.getDistinctValuesCommon('tad_automated_call_status', "tele_callers_applications_yes");
  selectOptions.tad_call_status = await commonModel.getDistinctValuesCommon('tad_call_status', "tele_callers_applications_yes");
  selectOptions.tad_final_call_status = await commonModel.getDistinctValuesCommon('tad_final_call_status', "tele_callers_applications_yes");

  returnData.allIssuers = allIssuers;
  returnData.allTr = allTr;
  returnData.selectOptions = selectOptions;
  return returnData;

}

module.exports = modelObj;
