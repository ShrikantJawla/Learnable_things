const { pool } = require("../../utils/configs/database");
const commonModel = require("../../model/commonModel");
////////////////////////////////////////////////////////////////////////////////////////////////
let modelObj = {};
modelObj.getFilteredAuApplications = async function (body, user) {
  let returnData = {
    applicationsData: [],
    count: [],
  };
  let { filterObject, pageNo, sort } = body;

  let intCheck = [
    "au_id",
    "au_initiation_date",
    "ca_main_table",
    "created_at",
    "updated_at",
    "au_ipa_status",
    "au_revised_date",
    "telecallers",
    "tad_call_decline_counter",
    "tad_activation_call_counter",
    "tad_automated_call_counter"
  ];

  let {
    entriesPerPage,
    au_id,
    au_customer_name,
    au_application_number,
    au_bank_assisted,
    from_au_initiation_date,
    to_au_initiation_date,
    au_card_variant,
    au_current_status,
    au_drop_off_page,
    au_drop_off_page_initial,
    tad_au_dropoff_page,
    au_reject_reason,
    au_utm_source,
    au_utm_medium,
    au_utm_campaign,
    au_utm_term,
    au_final_status,
    ca_main_table,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    au_ipa_status,
    from_au_revised_date,
    to_au_revised_date,
    au_permit_to_telly,
    au_phone_number,
    notNull,
    telecallers,
    tad_call_status,
    tad_call_decline_counter,
    tad_activation_call_counter,
    from_tad_updated_at,
    to_tad_updated_at,
    tad_automated_call_counter,
    tad_automated_call_status,
    tad_final_call_status,
    auj_created_at,
    from_auj_created_at,
    to_auj_created_at
  } = filterObject;

  const likeFields = {
    au_customer_name,
    au_application_number,
    au_bank_assisted
  };
  const selectFields = {
    tad_call_status,
    tad_automated_call_status,
    tad_final_call_status,
    au_card_variant,
    au_current_status,
    au_drop_off_page,
    au_drop_off_page_initial,
    tad_au_dropoff_page,
    au_final_status,
    au_utm_term,
    au_reject_reason,
  }
  const equalFields = {
    au_id,
    ca_main_table,
    au_utm_source,
    au_utm_medium,
    au_utm_campaign,
    au_ipa_status,
    au_phone_number,
    au_permit_to_telly,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_automated_call_counter
  };
  const fromDatefields = {
    from_au_revised_date,
    from_created_at,
    from_updated_at,
    from_au_initiation_date,
    from_tad_updated_at,
    from_auj_created_at,

  };
  const toDatefields = {
    to_au_revised_date,
    to_created_at,
    to_updated_at,
    to_au_initiation_date,
    to_tad_updated_at,
    to_auj_created_at
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
      : ``
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``
    toDatefields[field] = field_date
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 23:59:59.999`
      : ``
  })
  Object.keys(equalFields).map((field) => {
    if (field !== 'au_ipa_status') equalFields[field] = equalFields[field] || ''
  })
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || ''
  })
  const isFalseField = (field) =>
    field === null || field === undefined || field === ''
  entriesPerPage = entriesPerPage || 10
  sort = sort || 'au_id'
  let offset = (pageNo - 1) * entriesPerPage
  let ascDesc = 'asc NULLS FIRST'
  if (sort.startsWith('-')) {
    sort = sort.substring(1)
    ascDesc = 'desc NULLS LAST'
  }

  let query = '';
  if (user.ua_role === 3) {
    query = `SELECT * FROM tele_callers_applications_au camt where admin_user=${user.ua_id} AND `;
  }
  else if (user.ua_role === 1) {
    query = `SELECT * FROM tele_callers_applications_au camt where `;
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
    }
    else {
      query += `${telecallers} = admin_user AND `;
    }
  }
  try {
    if (telecallers.length === 0) {
      if (user.ua_role === 3) {
        query = `SELECT * FROM tele_callers_applications_au camt where admin_user=${user.ua_id} AND `;
      }
      else if (user.ua_role === 1) {
        query = `SELECT * FROM tele_callers_applications_au camt where `;
      }
    }
  } catch (err) {
    console.log("No Telecallers")
  }
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace('from_', '')
    query =
      query +
      (fromDatefields[fromField]
        ? `"${field}" >= '${fromDatefields[fromField]}' AND `
        : ``)
  })
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace('to_', '')
    query =
      query +
      (toDatefields[toField]
        ? `"${field}" <= '${toDatefields[toField]}' AND `
        : ``)
  })
  Object.keys(equalFields).map((field) => {
    if (field !== 'au_ipa_status')
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `)
    else {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ''
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `)
    }
  })
  Object.keys(likeFields).map((field, index) => {
    query =
      query +
      (likeFields[field]
        ? `(Lower("${field}")::Text Like '%${likeFields[
          field
        ].toLowerCase()}%' ) AND `
        : ``)
  })
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
    'au_customer_name',
    'au_application_number',
    'au_bank_assisted',
    'au_card_variant',
    'au_current_status',
    'au_drop_off_page',
    'au_drop_off_page_initial',
    'tad_au_dropoff_page',
    'au_reject_reason',
    'au_utm_source',
    'au_utm_medium',
    'au_utm_campaign',
    'au_utm_term',
    'au_final_status',
    'au_phone_number'
  ]
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
  let countQuery = query.replace("SELECT *", "SELECT count(*)");
  query =
    query +
    ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`
  query = query.replace(/AND\s+ORDER/, `ORDER`)
  query = query.replace(/where\s+ORDER/, 'ORDER')
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith('where')
    ? countQuery.trimEnd().replace('where', '')
    : countQuery
  countQuery = countQuery.trimEnd().endsWith('AND')
    ? countQuery.trimEnd().replace(/AND$/, '')
    : countQuery
  // console.log(query, "<<<<<<<<<<<")
  try {
    let appData = await pool.query(query)
    let countData = await pool.query(countQuery)
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
      user: user,
    }
  } catch (err) {
    console.error(err)
    returnData = {
      count: 0,
      applicationsData: [],
      user: user
    }
  }
  return returnData
}

modelObj.getApplicationDataById = async function (id) {
  let query = `SELECT * FROM tele_callers_applications_au where au_id=${id}`
  let returnData = {}
  try {
    let qReturn = await pool.query(query)
    returnData = qReturn.rows[0]
  } catch (err) {
    console.log(err)
    returnData = {}
  }
  return returnData
}


modelObj.getFilteredAuApplicationsWithDropoffDifference = async function (body, user) {
  let returnData = {
    applicationsData: [],
    count: [],
  };
  let { filterObject, pageNo, sort } = body;

  let intCheck = [
    "au_id",
    "au_initiation_date",
    "ca_main_table",
    "created_at",
    "updated_at",
    "au_ipa_status",
    "au_revised_date",
    "telecallers",
    "tad_call_decline_counter",
    "tad_activation_call_counter",
    "tad_automated_call_counter"
  ];

  let {
    entriesPerPage,
    au_id,
    au_customer_name,
    au_application_number,
    au_bank_assisted,
    from_au_initiation_date,
    to_au_initiation_date,
    au_card_variant,
    au_current_status,
    au_drop_off_page,
    au_drop_off_page_initial,
    tad_au_dropoff_page,
    au_reject_reason,
    au_utm_source,
    au_utm_medium,
    au_utm_campaign,
    au_utm_term,
    au_final_status,
    ca_main_table,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    au_ipa_status,
    from_au_revised_date,
    to_au_revised_date,
    au_permit_to_telly,
    au_phone_number,
    notNull,
    telecallers,
    tad_call_status,
    tad_call_decline_counter,
    tad_activation_call_counter,
    from_tad_updated_at,
    to_tad_updated_at,
    tad_automated_call_counter,
    tad_automated_call_status,
    tad_final_call_status,
    auj_created_at,
    from_auj_created_at,
    to_auj_created_at
  } = filterObject;

  const likeFields = {
    au_customer_name,
    au_application_number,
    au_bank_assisted,
  };
  const selectFields = {
    tad_call_status,
    tad_automated_call_status,
    tad_final_call_status,
    au_card_variant,
    au_current_status,
    au_drop_off_page,
    au_drop_off_page_initial,
    tad_au_dropoff_page,
    au_final_status,
    au_utm_term,
    au_reject_reason,
  }
  const equalFields = {
    au_id,
    ca_main_table,
    au_utm_source,
    au_utm_medium,
    au_utm_campaign,
    au_ipa_status,
    au_phone_number,
    au_permit_to_telly,
    tad_call_decline_counter,
    tad_activation_call_counter,
    tad_automated_call_counter
  };
  const fromDatefields = {
    from_au_revised_date,
    from_created_at,
    from_updated_at,
    from_au_initiation_date,
    from_tad_updated_at,
    from_auj_created_at,

  };
  const toDatefields = {
    to_au_revised_date,
    to_created_at,
    to_updated_at,
    to_au_initiation_date,
    to_tad_updated_at,
    to_auj_created_at
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
      : ``
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``
    toDatefields[field] = field_date
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 23:59:59.999`
      : ``
  })
  Object.keys(equalFields).map((field) => {
    if (field !== 'au_ipa_status') equalFields[field] = equalFields[field] || ''
  })
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || ''
  })
  const isFalseField = (field) =>
    field === null || field === undefined || field === ''
  entriesPerPage = entriesPerPage || 10
  sort = sort || 'au_id'
  let offset = (pageNo - 1) * entriesPerPage
  let ascDesc = 'asc NULLS FIRST'
  if (sort.startsWith('-')) {
    sort = sort.substring(1)
    ascDesc = 'desc NULLS LAST'
  }

  let query = '';
  if (user.ua_role === 3) {
    query = `SELECT * FROM tele_callers_applications_au_dropoff_page_distinct camt where admin_user=${user.ua_id} AND `;
  }
  else if (user.ua_role === 1) {
    query = `SELECT * FROM tele_callers_applications_au_dropoff_page_distinct camt where `;
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
    }
    else {
      query += `${telecallers} = admin_user AND `;
    }
  }
  try {
    if (telecallers.length === 0) {
      if (user.ua_role === 3) {
        query = `SELECT * FROM tele_callers_applications_au_dropoff_page_distinct camt where admin_user=${user.ua_id} AND `;
      }
      else if (user.ua_role === 1) {
        query = `SELECT * FROM tele_callers_applications_au_dropoff_page_distinct camt where `;
      }
    }
  } catch (err) {
    console.log("No Telecallers")
  }
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace('from_', '')
    query =
      query +
      (fromDatefields[fromField]
        ? `"${field}" >= '${fromDatefields[fromField]}' AND `
        : ``)
  })
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace('to_', '')
    query =
      query +
      (toDatefields[toField]
        ? `"${field}" <= '${toDatefields[toField]}' AND `
        : ``)
  })
  Object.keys(equalFields).map((field) => {
    if (field !== 'au_ipa_status')
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `)
    else {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ''
          ? ``
          : `"${field}"::Text = '${equalFields[field]}' AND `)
    }
  })
  Object.keys(likeFields).map((field, index) => {
    query =
      query +
      (likeFields[field]
        ? `(Lower("${field}")::Text Like '%${likeFields[
          field
        ].toLowerCase()}%' ) AND `
        : ``)
  })
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
    'au_customer_name',
    'au_application_number',
    'au_card_variant',
    'au_current_status',
    'au_drop_off_page',
    'au_drop_off_page_initial',
    'tad_au_dropoff_page',
    'au_reject_reason',
    'au_utm_source',
    'au_utm_medium',
    'au_utm_campaign',
    'au_utm_term',
    'au_final_status',
    'au_phone_number'
  ]
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
  let countQuery = query.replace("SELECT *", "SELECT count(*)");
  query =
    query +
    ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`
  query = query.replace(/AND\s+ORDER/, `ORDER`)
  query = query.replace(/where\s+ORDER/, 'ORDER')
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith('where')
    ? countQuery.trimEnd().replace('where', '')
    : countQuery
  countQuery = countQuery.trimEnd().endsWith('AND')
    ? countQuery.trimEnd().replace(/AND$/, '')
    : countQuery

  try {
    let appData = await pool.query(query)
    let countData = await pool.query(countQuery)
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
      user: user,
    }
  } catch (err) {
    console.error(err)
    returnData = {
      count: 0,
      applicationsData: [],
      user: user
    }
  }
  return returnData
}

modelObj.getAuTeleColumns = async function () {
  let returnData = {
    allIssuers: [],
    allTr: [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
  let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
  let queryForTr = `SELECT 
  CONCAT('edit-tele-au-application-ui?id=',tele_callers_applications_au.au_id) as "Edit",
  '' as "array|telecallers|Assigned To",
  tad_automated_call_counter as "int|tad_automated_call_counter|Automated Call Counter",
  tad_automated_call_status as "multiple|tad_automated_call_status|Automated Call Status",
  tad_call_decline_counter as "int|tad_call_decline_counter|Call Counter",
  tad_call_status as "multiple|tad_call_status|Call Status",
  tad_final_call_status as "multiple|tad_final_call_status|Final Call Status",
  tad_sms_counter as "int|tad_sms_counter|Sms Counter",
  au_id as "int|au_id|Id",
  ca_main_table as "int|ca_main_table|Main Table Id",
  au_customer_name as "string|au_customer_name|Name",
  au_phone_number as "string|au_phone_number|Phone Number",
  au_application_number as "string|au_application_number|Application Number",
  CAST (au_initiation_date as varchar) as "date|au_initiation_date|Initiation Date",
  au_card_variant as "multiple|au_card_variant|Card Variant",
  tad_au_dropoff_page as "multiple|tad_au_dropoff_page|Assigned Dropoff Page",
  au_drop_off_page as "multiple|au_drop_off_page|Dropoff Page",
  au_current_status as "multiple|au_current_status|Current Status",
  au_final_status as "multiple|au_final_status|Final Status",
  au_reject_reason as "multiple|au_reject_reason|Reject Reason",
  CAST (tad_updated_at as varchar) as "date|tad_updated_at|Last Updated At",
  CAST (auj_created_at as varchar)  as "date|auj_created_at|Assigned At"
		FROM tele_callers_applications_au limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
  let selectOptions = {
    au_drop_off_page_initial: [],
    au_drop_off_page: [],
    au_final_status: [],
    au_ipa_status: [],
    au_card_variant: [],
    au_current_status: [],
    au_utm_source: [],
    au_utm_medium: [],
    au_lead_from: [],
    telecallers: [],
    tad_automated_call_status: [],
    tad_call_status: [],
    tad_final_call_status: [],
    au_reject_reason : []
  };
  let getAllTeleUsersQuery = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`;
  selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
  selectOptions.au_drop_off_page_initial = await commonModel.getDistinctValuesCommon('au_drop_off_page_initial', 'tele_callers_applications_au');
  selectOptions.au_drop_off_page = await commonModel.getDistinctValuesCommon('au_drop_off_page', 'tele_callers_applications_au');
  selectOptions.au_current_status = await commonModel.getDistinctValuesCommon('au_current_status', 'tele_callers_applications_au');
  selectOptions.au_final_status = await commonModel.getDistinctValuesCommon('au_final_status', 'tele_callers_applications_au');
  selectOptions.au_ipa_status = await commonModel.getDistinctValuesCommon('au_ipa_status', 'tele_callers_applications_au');
  selectOptions.au_card_variant = await commonModel.getDistinctValuesCommon('au_card_variant', 'tele_callers_applications_au');
  selectOptions.au_utm_source = await commonModel.getDistinctValuesCommon('au_utm_source', 'tele_callers_applications_au');
  selectOptions.au_utm_medium = await commonModel.getDistinctValuesCommon('au_utm_medium', 'tele_callers_applications_au');
  selectOptions.au_lead_from = await commonModel.getDistinctValuesCommon('au_lead_from', 'tele_callers_applications_au');
  selectOptions.tad_automated_call_status = await commonModel.getDistinctValuesCommon('tad_automated_call_status', "tele_callers_applications_au");
  selectOptions.tad_call_status = await commonModel.getDistinctValuesCommon('tad_call_status', "tele_callers_applications_au");
  selectOptions.tad_final_call_status = await commonModel.getDistinctValuesCommon('tad_final_call_status', "tele_callers_applications_au");
  selectOptions.au_reject_reason = await commonModel.getDistinctValuesCommon('au_reject_reason', "tele_callers_applications_au");

  returnData.allIssuers = allIssuers;
  returnData.allTr = allTr;
  returnData.selectOptions = selectOptions;
  return returnData;

}


module.exports = modelObj
