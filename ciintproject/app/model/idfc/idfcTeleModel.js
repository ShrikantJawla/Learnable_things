const { pool } = require("../../utils/configs/database");
const commonModel = require("../commonModel");
////////////////////////////////////////////////////////////////////////////////////////////////
let modelObj = {};
modelObj.getFilteredIdfcApplications = async function (body, user) {
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
    "phone_number",
    "telecallers",
    "tad_call_decline_counter",
    "tad_activation_call_counter"
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
    idfc_sub_status,
    idfc_sub_status_initial,
    tad_idfc_sub_status,
    from_idfc_date,
    to_idfc_date,
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
    tad_call_status,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_final_call_status,
    tad_automated_call_status,
    from_tad_updated_at,
    to_tad_updated_at
  } = filterObject;

  const selectFields = {
    idfc_location_city,
    idfc_choice_credit_card,
    idfc_status,
    idfc_sub_status,
    idfc_sub_status_initial,
    tad_idfc_sub_status,
    idfc_lead_from,
    idfc_reason,
    tad_call_status,
    tad_final_call_status,
    tad_automated_call_status,
    idfc_utm_campaign,
    idfc_splitted_utm
  };
  const likeFields = {

  };
  const equalFields = {
    idfc_id,
    ca_main_table,
    idfc_application_number,
    idfc_crm_team_lead_id,
    idfc_date_ipa_status,
    phone_number,
    name,
    tad_call_decline_counter,
    tad_activation_call_counter
  };
  const fromDatefields = { from_created_at, from_updated_at, from_idfc_date , from_tad_updated_at};
  const toDatefields = { to_created_at, to_updated_at, to_idfc_date , to_tad_updated_at};
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

 

  let query = '';
  if(user.ua_role === 3){
    query = `SELECT * FROM tele_callers_applications_idfc camt where admin_user=${user.ua_id} AND `;
  }
  else if(user.ua_role === 1){
    query = `SELECT * FROM tele_callers_applications_idfc camt where `;
  }
  if(telecallers){
    lastFilter = telecallers.length;
    if(telecallers.length > 1){
      for(let i = 0; i < telecallers.length; i++){
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = admin_user AND `;
        } else{
          query += `${telecallers[i]} = admin_user OR `;
        }
      }
    }
    else{
      query += `${telecallers} = admin_user AND `;
    }
  }
  try{
    if(telecallers.length === 0){
      if(user.ua_role === 3){
        query = `SELECT * FROM tele_callers_applications_idfc camt where admin_user=${user.ua_id} AND `;
      }
      else if(user.ua_role === 1){
        query = `SELECT * FROM tele_callers_applications_idfc camt where `;
      }
    }
    }catch(err){
      console.log("No Telecallers")
    }

  query = query += `${
    !from_idfc_credit_limit
      ? ""
      : `"${from_idfc_credit_limit}"  >= '${fromDatefields[from_idfc_credit_limit]}' AND`
  }`;
  query = query += `${
    !to_idfc_credit_limit
      ? ""
      : `"${to_idfc_credit_limit}"  >= '${fromDatefields[to_idfc_credit_limit]}' AND`
  }`;
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
    "idfc_lead_from",
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
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  console.log(query)
  try {
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
      user: user,
    };
  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: []};
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


modelObj.getFilteredIdfcApplicationsWithSubStatusDistinct = async function (body, user) {
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
    "phone_number",
    "telecallers",
    "tad_call_decline_counter",
    "tad_activation_call_counter"
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
    idfc_sub_status,
    idfc_sub_status_initial,
    from_idfc_date,
    to_idfc_date,
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
    tad_call_status,
    tad_final_call_status,
    tad_automated_call_status,
    tad_call_decline_counter,
    tad_activation_call_counter,
    from_tad_updated_at,
    to_tad_updated_at
  } = filterObject;

  const selectFields = {
    idfc_location_city,
    idfc_choice_credit_card,
    idfc_status,
    idfc_sub_status,
    idfc_sub_status_initial,
    idfc_lead_from,
    idfc_reason,
    tad_call_status,
    tad_final_call_status,
    tad_automated_call_status,
    idfc_utm_campaign,
    idfc_splitted_utm
  };
  const likeFields = {

  };
  const equalFields = {
    idfc_id,
    ca_main_table,
    idfc_application_number,
    idfc_crm_team_lead_id,
    idfc_date_ipa_status,
    phone_number,
    name,
    tad_call_decline_counter,
    tad_activation_call_counter
  };
  const fromDatefields = { from_created_at, from_updated_at, from_idfc_date , from_tad_updated_at};
  const toDatefields = { to_created_at, to_updated_at, to_idfc_date , to_tad_updated_at};
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

 

  let query = '';
  if(user.ua_role === 3){
    query = `SELECT * FROM tele_callers_applications_idfc_sub_status_distinct camt where admin_user=${user.ua_id} AND `;
  }
  else if(user.ua_role === 1){
    query = `SELECT * FROM tele_callers_applications_idfc_sub_status_distinct camt where `;
  }
  if(telecallers){
    lastFilter = telecallers.length;
    if(telecallers.length > 1){
      for(let i = 0; i < telecallers.length; i++){
        if (i === telecallers.length - 1) {
          query += `${telecallers[i]} = admin_user AND `;
        } else{
          query += `${telecallers[i]} = admin_user OR `;
        }
      }
    }
    else{
      query += `${telecallers} = admin_user AND `;
    }
  }
  try{
    if(telecallers.length === 0){
      if(user.ua_role === 3){
        query = `SELECT * FROM tele_callers_applications_idfc_sub_status_distinct camt where admin_user=${user.ua_id} AND `;
      }
      else if(user.ua_role === 1){
        query = `SELECT * FROM tele_callers_applications_idfc_sub_status_distinct camt where `;
      }
    }
    }catch(err){
      console.log("No Telecallers")
    }

  query = query += `${
    !from_idfc_credit_limit
      ? ""
      : `"${from_idfc_credit_limit}"  >= '${fromDatefields[from_idfc_credit_limit]}' AND`
  }`;
  query = query += `${
    !to_idfc_credit_limit
      ? ""
      : `"${to_idfc_credit_limit}"  >= '${fromDatefields[to_idfc_credit_limit]}' AND`
  }`;
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
    "idfc_lead_from",
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
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
  console.log(query)
  try {
    let appData = await pool.query(query);
    let countData = await pool.query(countQuery);
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
      user: user,
    };
  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: []};
  }
  return returnData;
};


modelObj.getIdfcTeleColumns = async function(){
  let returnData = {
    allIssuers : [],
    allTr : [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		let queryForTr = `SELECT 
    CONCAT('edit-tele-idfc-application-ui?id=',tele_callers_applications_idfc.idfc_id) as "Edit",
    '' as "array|telecallers|Assigned To",
    tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
    tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
    tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
    tad_call_status as "multiple|tad_call_status|Call Status",
    tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
    tad_activation_call_counter as "int|tad_activation_call_counter|Activation Call Counter",
    tad_sms_counter as "int|tad_sms_counter|Sms Counter",
    idfc_id as "int|idfc_id|Id",
    ca_main_table as "int|ca_main_table|Main Table Id",
    CAST(idfc_date as varchar) as "date|idfc_date|Application Date",
    name as "string|name|Name",
    phone_number as "string|phone_number|Mobile Number",
    idfc_application_number as "string|idfc_application_number|Application Number",
    idfc_choice_credit_card as "multiple|idfc_choice_credit_card|Choice Credit Card",
    tad_idfc_sub_status as "multiple|tad_idfc_sub_status|Assigned Sub Status",
    idfc_sub_status as "multiple|idfc_sub_status|Sub Status",
    idfc_status as "multiple|idfc_status|Final Status",
    idfc_stage_integration_status as "multiple|idfc_stage_integration_status|Stage Integration Status",
    idfc_reason as "multiple|idfc_reason|Reason",
    idfc_date_ipa_status as "bool|idfc_date_ipa_status|Date IPA Status",
    idfc_location_city as "multiple|idfc_location_city|Location City",
    idfc_credit_limit as "int|idfc_credit_limit|Credit Limit",
    CAST(auj_updated_at as varchar) as "date|auj_updated_at|Assigned At",
    CAST(tad_updated_at as varchar) as "date|tad_updated_at|Last Updated At"
		FROM tele_callers_applications_idfc limit 1`;
   console.log(queryForTr);
		let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
		let selectOptions = {
			tad_automated_call_status : [],
			tad_call_status : [],
			tad_final_call_status : [],
      idfc_choice_credit_card: [],
      idfc_sub_status_initial: [],
      tad_idfc_sub_status: [],
      idfc_sub_status: [],
      idfc_status: [],
      idfc_stage_integration_status: [],
      idfc_reason: [],
      idfc_location_city: [],
		};

    let getAllTeleUsersQuery  = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`; 
    selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
    selectOptions.tad_automated_call_status = await commonModel.getDistinctValuesCommon('tad_automated_call_status', "tele_callers_applications_idfc");
    selectOptions.tad_call_status = await commonModel.getDistinctValuesCommon('tad_call_status', "tele_callers_applications_idfc");
    selectOptions.tad_final_call_status = await commonModel.getDistinctValuesCommon('tad_final_call_status', "tele_callers_applications_idfc");
    selectOptions.idfc_choice_credit_card = await commonModel.getDistinctValuesCommon('idfc_choice_credit_card', "tele_callers_applications_idfc");
    selectOptions.idfc_sub_status_initial = await commonModel.getDistinctValuesCommon('idfc_sub_status_initial', "tele_callers_applications_idfc");
    selectOptions.tad_idfc_sub_status = await commonModel.getDistinctValuesCommon('tad_idfc_sub_status', "tele_callers_applications_idfc");
    selectOptions.idfc_sub_status = await commonModel.getDistinctValuesCommon('idfc_sub_status', "tele_callers_applications_idfc");
    selectOptions.idfc_status = await commonModel.getDistinctValuesCommon('idfc_status', "tele_callers_applications_idfc");
    selectOptions.idfc_stage_integration_status = await commonModel.getDistinctValuesCommon('idfc_stage_integration_status', "tele_callers_applications_idfc");
    selectOptions.idfc_reason = await commonModel.getDistinctValuesCommon('idfc_reason', "tele_callers_applications_idfc");
    selectOptions.idfc_location_city = await commonModel.getDistinctValuesCommon('idfc_location_city', "tele_callers_applications_idfc");
    
    returnData.allIssuers = allIssuers;
    returnData.allTr = allTr;
    returnData.selectOptions = selectOptions;
    return returnData;
		
}



module.exports = modelObj;
