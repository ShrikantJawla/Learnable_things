let { pool } = require("../../utils/configs/database");
const commonModel = require("../commonModel");
//////////////////////////////////////////
let modelObj = {};
modelObj.getFilteredIdfcApplications = async function (body) {
  let returnData = {
    applicationsData: [],
    count: [],
  };
  let { filterObject, pageNo, sort } = body;
  let intCheck = [
    "idfc_id",
    "idfc_credit_limit",
    "idfc_date",
    "created_at",
    "updated_at",
    "ca_main_table",
    "idfc_date_ipa_status",
    "phone_number"
  ];
  let {
    entriesPerPage,
    idfc_id,
    idfc_application_number,
    idfc_crm_team_lead_id,
    idfc_utm_campaign,
    idfc_splitted_utm,
    idfc_location_city,
    idfc_choice_credit_card,
    from_idfc_credit_limit,
    to_idfc_credit_limit,
    idfc_reason,
    idfc_status,
    idfc_stage_integration_status,
    idfc_sub_status,
    idfc_sub_status_initial,
    from_idfc_date,
    to_idfc_date,
    idfc_full_name,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    ca_main_table,
    idfc_date_ipa_status,
    idfc_lead_from,
    telecallers,
    notNull,
    phone_number,
    name,
  } = filterObject;
  const selectFields = {
    idfc_location_city,
    idfc_choice_credit_card,
    idfc_status,
    idfc_sub_status,
    idfc_sub_status_initial,
    idfc_lead_from,
    idfc_reason,
    idfc_stage_integration_status
  };
  const likeFields = {
    idfc_utm_campaign,
    idfc_splitted_utm,
    idfc_full_name,
  };
  const equalFields = {
    idfc_id,
    ca_main_table,
    idfc_application_number,
    idfc_crm_team_lead_id,
    idfc_date_ipa_status,
    phone_number,
    name,
  };
  const fromDatefields = { from_created_at, from_updated_at, from_idfc_date };
  const toDatefields = { to_created_at, to_updated_at, to_idfc_date };
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
    if (field !== "idfc_date_ipa_status")
      equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });

  const isFalseField = (field) =>
    field === null || field === undefined || field === "";
  entriesPerPage = entriesPerPage || 50;
  sort = sort || "idfc_id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }

  let query = `
	SELECT new_applications.*, card_applications_main_table.phone_number, card_applications_main_table.name FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM idfc_bank_applications_table camt
        LEFT JOIN applications_users_junction auj on auj.application_id = idfc_id and auj.issuer_id = 4
        GROUP BY (camt.idfc_id)
        ) as new_applications
		LEFT JOIN card_applications_main_table ON card_applications_main_table.id = new_applications.ca_main_table WHERE `;
  if (body.statusDifference) {
    query += ` idfc_sub_status_initial  IS DISTINCT FROM  idfc_sub_status AND  `;
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
          SELECT new_applications.*, card_applications_main_table.phone_number, card_applications_main_table.name FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM idfc_bank_applications_table camt
        LEFT JOIN applications_users_junction auj on auj.application_id = idfc_id and auj.issuer_id = 4
        GROUP BY (camt.idfc_id)
        ) as new_applications
		LEFT JOIN card_applications_main_table ON card_applications_main_table.id = new_applications.ca_main_table WHERE `;
      if (body.statusDifference) {
        query += ` idfc_sub_status_initial  IS DISTINCT FROM  idfc_sub_status AND  `;
      }
    }
  } catch (err) {
    console.log("No Telecallers");
  }
  query = query += `${!from_idfc_credit_limit
      ? ""
      : `"${from_idfc_credit_limit}"  >= '${fromDatefields[from_idfc_credit_limit]}' AND`
    }`;
  query = query += `${!to_idfc_credit_limit
      ? ""
      : `"${to_idfc_credit_limit}"  >= '${fromDatefields[to_idfc_credit_limit]}' AND`
    }`;
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `new_applications."${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `new_applications."${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });

  Object.keys(equalFields).map((field) => {
    if (field !== "idfc_date_ipa_status")
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
  try {
    Object.keys(likeFields).map((field, index) => {
      query =
        query +
        `(Lower("${field}")::Text Like '%${likeFields[
          field
        ].toLowerCase()}%' OR "${field}" IS NULL ) AND `;
    });
  } catch (err) {
    console.log("to Lower Case")
  }
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
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``);
  });
  let stringFields = [
    "phone_number",
    "idfc_application_number",
    "idfc_crm_team_lead_id",
    "idfc_utm_campaign",
    "idfc_splitted_utm",
    "idfc_location_city",
    "idfc_choice_credit_card",
    "idfc_reason",
    "idfc_status",
    "idfc_sub_status",
    "idfc_sub_status_initial",
    "idfc_full_name",
    "idfc_lead_from",
  ];

  notNull.forEach((elem) => {
    if (elem != "name" && elem != "phone_number" && elem != "-name" && elem != "-phone_number") {
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
          query = query + `(${NULL} IS NULL OR ${NULL}= '' OR ${NULL}='undefined') AND `;
        }
      } else {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query +
            `(${elem} IS NOT NULL AND ${elem}!= '' AND ${elem} != 'undefined') AND `;
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

  countQuery = countQuery.trimEnd().endsWith("WHERE")
    ? countQuery.trimEnd().replace("WHERE", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  try {
    console.log(query, "------ query here");
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = { count: countData.rowCount, applicationsData: appData.rows };
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
    "idfc_id",
    "idfc_credit_limit",
    "idfc_date",
    "created_at",
    "updated_at",
    "ca_main_table",
    "idfc_date_ipa_status",
    "phone_number"
  ];
  let {
    phone_number,
    name,
    idfc_id,
    idfc_application_number,
    idfc_crm_team_lead_id,
    idfc_utm_campaign,
    idfc_splitted_utm,
    idfc_location_city,
    idfc_choice_credit_card,
    from_idfc_credit_limit,
    to_idfc_credit_limit,
    idfc_reason,
    idfc_status,
    idfc_stage_integration_status,
    idfc_sub_status,
    idfc_sub_status_initial,
    from_idfc_date,
    to_idfc_date,
    idfc_full_name,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    ca_main_table,
    idfc_date_ipa_status,
    idfc_lead_from,
    notNull,
  } = filterObject;

  const selectFields = {
    idfc_location_city,
    idfc_choice_credit_card,
    idfc_status,
    idfc_sub_status,
    idfc_sub_status_initial,
    idfc_lead_from,
    idfc_reason,
    idfc_stage_integration_status
  };
  const likeFields = {
    idfc_utm_campaign,
    idfc_splitted_utm,
    idfc_full_name,
  };
  const equalFields = {
    idfc_id,
    ca_main_table,
    idfc_application_number,
    idfc_crm_team_lead_id,
    idfc_date_ipa_status,
    phone_number,
    name,
  };
  const fromDatefields = { from_created_at, from_updated_at, from_idfc_date };
  const toDatefields = { to_created_at, to_updated_at, to_idfc_date };
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
    if (field !== "idfc_date_ipa_status")
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
	SELECT new_applications.*, card_applications_main_table.phone_number, card_applications_main_table.name FROM (SELECT camt.* FROM idfc_bank_applications_table camt
    LEFT JOIN applications_users_junction auj on auj.application_id = idfc_id and auj.issuer_id = 4
    GROUP BY (camt.idfc_id)
    ) as new_applications
LEFT JOIN card_applications_main_table ON card_applications_main_table.id = new_applications.ca_main_table WHERE `;
  query = query += `${!from_idfc_credit_limit
      ? ""
      : `"${from_idfc_credit_limit}"  >= '${fromDatefields[from_idfc_credit_limit]}' AND`
    }`;
  query = query += `${!to_idfc_credit_limit
      ? ""
      : `"${to_idfc_credit_limit}"  >= '${fromDatefields[to_idfc_credit_limit]}' AND`
    }`;
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `new_applications."${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `new_applications."${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });

  Object.keys(equalFields).map((field) => {
    if (field !== "idfc_date_ipa_status")
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

  try {
    Object.keys(likeFields).map((field, index) => {
      query =
        query +
        (likeFields[field]
          ? `(Lower(camt."${field}")::Text Like '%${likeFields[
            field
          ].toLowerCase()}%' ) AND `
          : ``);
    });
  } catch (err) {
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
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``);
  });
  let stringFields = [
    "idfc_application_number",
    "idfc_crm_team_lead_id",
    "idfc_utm_campaign",
    "idfc_splitted_utm",
    "idfc_location_city",
    "idfc_choice_credit_card",
    "idfc_reason",
    "idfc_status",
    "idfc_sub_status",
    "idfc_sub_status_initial",
    "idfc_full_name",
    "idfc_lead_from",
  ];
  notNull.forEach((elem) => {
    if (elem != "name" && elem != "phone_number" && elem != "-name" && elem != "-phone_number") {
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
  let query = `SELECT * FROM idfc_bank_applications_table where idfc_id=${id}`;
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


modelObj.getIdfcColumns = async function () {
  let returnData = {
    allIssuers: [],
    allTr: [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
  let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
  let queryForTr = `SELECT 
    CONCAT('edit-idfc-application-ui?id=',idfc_bank_applications_table.idfc_id) as "Edit",  
    idfc_bank_applications_table.idfc_id as select,
    '' as "array|telecallers|telecallers",
    idfc_bank_applications_table.idfc_id as "int|idfc_id|Id",
    idfc_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
    card_applications_main_table.name as "string|name|Name",
    card_applications_main_table.phone_number as "string|phone_number|Phone Number",
	  CAST(idfc_bank_applications_table.idfc_date as varchar) as "date|idfc_date|Application Date",
    idfc_bank_applications_table.idfc_application_number as "string|idfc_application_number|Application Number",
    idfc_bank_applications_table.idfc_choice_credit_card as "multiple|idfc_choice_credit_card|Choice Credit Card",
	  idfc_bank_applications_table.idfc_sub_status_initial as "multiple|idfc_sub_status_initial|Sub Stage Initial",
    idfc_bank_applications_table.idfc_sub_status as "multiple|idfc_sub_status|Sub Stage",
    idfc_bank_applications_table.idfc_stage_integration_status as "multiple|idfc_stage_integration_status|Stage Integration Status",
    idfc_bank_applications_table.idfc_status as "multiple|idfc_status|Final Stage",
    idfc_bank_applications_table.idfc_reason as "multiple|idfc_reason|Reason",
    idfc_bank_applications_table.idfc_date_ipa_status as "bool|idfc_date_ipa_status|Date Ipa Status",
    idfc_bank_applications_table.idfc_utm_campaign as "string|idfc_utm_campaign|Utm Campaign",
    idfc_bank_applications_table.idfc_splitted_utm as "string|idfc_splitted_utm|Splitted Utm",
    idfc_bank_applications_table.idfc_crm_team_lead_id as "string|idfc_crm_team_lead_id|Crm Team Lead Id",
    idfc_bank_applications_table.idfc_location_city as "multiple|idfc_location_city|Location City",
    idfc_bank_applications_table.idfc_credit_limit as "int|idfc_credit_limit|Credit Limit",
    idfc_bank_applications_table.idfc_lead_from as "multiple|idfc_lead_from|Lead From",
    CAST(idfc_bank_applications_table.created_at as varchar) as "date|created_at|Created At",
    CAST(idfc_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
	  FROM idfc_bank_applications_table
    LEFT JOIN card_applications_main_table ON card_applications_main_table.id = idfc_bank_applications_table.ca_main_table
		limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
  let selectOptions = {
    idfc_choice_credit_card: [],
    idfc_sub_status: [],
    idfc_sub_status_initial: [],
    idfc_stage_integration_status: [],
    idfc_status: [],
    idfc_reason: [],
    idfc_location_city: [],
    idfc_lead_from: [],
    telecallers: []
  };
  let getAllTeleUsersQuery = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`;
  selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
  selectOptions.idfc_choice_credit_card = await commonModel.getDistinctValuesCommon('idfc_choice_credit_card', "idfc_bank_applications_table");
  selectOptions.idfc_sub_status = await commonModel.getDistinctValuesCommon('idfc_sub_status', "idfc_bank_applications_table");
  selectOptions.idfc_sub_status_initial = await commonModel.getDistinctValuesCommon('idfc_sub_status_initial', "idfc_bank_applications_table");
  selectOptions.idfc_stage_integration_status = await commonModel.getDistinctValuesCommon('idfc_stage_integration_status', "idfc_bank_applications_table");
  selectOptions.idfc_status = await commonModel.getDistinctValuesCommon('idfc_status', "idfc_bank_applications_table");
  selectOptions.idfc_reason = await commonModel.getDistinctValuesCommon('idfc_reason', "idfc_bank_applications_table");
  selectOptions.idfc_location_city = await commonModel.getDistinctValuesCommon('idfc_location_city', "idfc_bank_applications_table");
  selectOptions.idfc_lead_from = await commonModel.getDistinctValuesCommon('idfc_lead_from', "idfc_bank_applications_table");
  returnData.allIssuers = allIssuers;
  returnData.allTr = allTr;
  returnData.selectOptions = selectOptions;
  return returnData;

}



module.exports = modelObj;
