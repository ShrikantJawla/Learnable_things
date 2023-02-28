let { pool } = require("../../utils/configs/database");
const commonModel = require("../../model/commonModel");
//////////////////////////////////////////
let modelObj = {};
modelObj.getFilteredAuApplications = async function (body) {
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
    "au_bank_assisted",
    "au_revised_date",
    "telecallers",
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
    au_lead_from,
    from_au_revised_date,
    to_au_revised_date,
    au_permit_to_telly,
    au_phone_number,
    telecallers,
    notNull,
  } = filterObject;

  const likeFields = {
    au_customer_name,
    au_application_number,
  };
  const selectFields = {
    au_card_variant,
    au_current_status,
    au_drop_off_page,
    au_drop_off_page_initial,
    au_utm_source,
    au_utm_medium,
    au_final_status,
    au_lead_from,
    au_reject_reason,
    au_utm_term,
    au_utm_campaign,
    au_bank_assisted
  };
  const equalFields = {

    au_customer_name,
    au_id,
    ca_main_table,
    au_final_status,
    au_ipa_status,
    au_bank_assisted,
    au_phone_number,
    au_permit_to_telly,
  };
  const fromDatefields = {
    from_au_revised_date,
    from_created_at,
    from_updated_at,
    from_au_initiation_date,
  };
  const toDatefields = {
    to_au_revised_date,
    to_created_at,
    to_updated_at,
    to_au_initiation_date,
  }
  Object.keys(fromDatefields).map((field) => {
    let field_date = new Date(fromDatefields[field])
    fromDatefields[field] = fromDatefields[field]
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 00:00:01.001`
      : ``
  })
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
    if (field !== 'au_bank_assisted') equalFields[field] = equalFields[field] || ''
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
  let query = `
	SELECT * FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM au_bank_applications_table camt
        left join applications_users_junction auj on auj.application_id = au_id and auj.issuer_id = 7
        GROUP BY (camt.au_id)
        ) as new_applications where `;


  if (body.statusDifference) {
    query += ` au_drop_off_page_initial IS DISTINCT FROM au_drop_off_page AND `;
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
      SELECT * FROM (SELECT camt.*,array_agg(case when auj.admin_user is null then 0 else auj.admin_user end) telecallers FROM au_bank_applications_table camt
      left join applications_users_junction auj on auj.application_id = au_id and auj.issuer_id = 7
      GROUP BY (camt.au_id)
      ) as new_applications where `;
      if (body.statusDifference) {
        query += ` au_drop_off_page_initial IS DISTINCT FROM au_drop_off_page AND `;
      }
    }
    console.log(query, "queryquery")
  } catch (err) {
    console.log("No Telecallers");
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
    if (field !== 'au_bank_assisted')
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
    let string = ''

    for (
      let i = 0;
      i < (selectFields[field] ? selectFields[field].length : 0);
      i++
    ) {
      string += `'${selectFields[field][i]}',`
    }
    string = string.slice(0, -1)
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``)
  })

  let stringFields = [
    'au_customer_name',
    'au_application_number',
    'au_bank_assisted',
    'au_card_variant',
    'au_current_status',
    'au_drop_off_page',
    'au_reject_reason',
    'au_utm_source',
    'au_utm_medium',
    'au_utm_campaign',
    'au_utm_term',
    'au_final_status',
    'au_phone_number',
    'au_lead_from',
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

  let countQuery = query.replace('SELECT *', 'SELECT count(*)')
  query =
    query +
    ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`
  query = query.replace(/AND\s+ORDER/, `ORDER`)
  query = query.replace(/where\s+ORDER/, 'ORDER')
  countQuery = countQuery.trimEnd().endsWith('where')
    ? countQuery.trimEnd().replace('where', '')
    : countQuery
  countQuery = countQuery.trimEnd().endsWith('AND')
    ? countQuery.trimEnd().replace(/AND$/, '')
    : countQuery

  try {
    console.log(query, "----- au query ");
    let appData = await pool.query(query)
    let countData = await pool.query(countQuery)
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
    }
  } catch (err) {
    console.error(err)
    returnData = { count: 0, applicationsData: [] }
  }
  return returnData
}

modelObj.exportCsv = async function ({ allFieldsArray, filterObject }) {
  let returnData = {
    applicationsData: [],
  };
  let intCheck = [
    "au_id",
    "au_initiation_date",
    "ca_main_table",
    "created_at",
    "updated_at",
    "au_ipa_status",
    "au_revised_date",
    "au_bank_assisted",
    "telecallers",
  ];
  let {
    au_id,
    au_customer_name,
    au_application_number,
    au_bank_assisted,
    from_au_initiation_date,
    to_au_initiation_date,
    au_card_variant,
    au_current_status,
    au_drop_off_page,
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
    au_lead_from,
    from_au_revised_date,
    to_au_revised_date,
    au_permit_to_telly,
    au_phone_number,
    notNull,
  } = filterObject;

  const likeFields = {
    au_customer_name,
    au_application_number,
    au_bank_assisted
  };
  const selectFields = {
    au_card_variant,
    au_current_status,
    au_drop_off_page,
    au_utm_source,
    au_utm_medium,
    au_final_status,
    au_lead_from,
    au_reject_reason,
    au_drop_off_page,
    au_utm_term,
    au_utm_campaign,
    au_bank_assisted
  };
  const equalFields = {
    au_customer_name,
    au_id,
    ca_main_table,
    au_final_status,
    au_ipa_status,
    au_bank_assisted,
    au_phone_number,
    au_permit_to_telly,
  };
  const fromDatefields = {
    from_au_revised_date,
    from_created_at,
    from_updated_at,
    from_au_initiation_date,
  };
  const toDatefields = {
    to_au_revised_date,
    to_created_at,
    to_updated_at,
    to_au_initiation_date,
  }
  Object.keys(fromDatefields).map((field) => {
    let field_date = new Date(fromDatefields[field])
    fromDatefields[field] = fromDatefields[field]
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 00:00:01.001`
      : ``
  })
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
    if (field !== 'au_bank_assisted') equalFields[field] = equalFields[field] || ''
  })
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || ''
  })
  const isFalseField = (field) =>
    field === null || field === undefined || field === ''
  let columnString = ``
  allFieldsArray.map((field) => {
    columnString += `${field.column_name},`
  })
  columnString = columnString.slice(0, -1)

  let query = `
	SELECT ${columnString} FROM au_bank_applications_table camt where
	`
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
          : `camt."${field}"::Text = '${equalFields[field]}' AND `)
    if (field !== 'au_bank_assisted')
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `)
    else {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ''
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `)
    }
  })
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
    console.log(err)
  }

  Object.keys(selectFields).map((field) => {
    let string = ''

    for (
      let i = 0;
      i < (selectFields[field] ? selectFields[field].length : 0);
      i++
    ) {
      string += `'${selectFields[field][i]}',`
    }
    string = string.slice(0, -1)
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``)
  })
  let stringFields = [
    "au_customer_name",
    "au_application_number",
    "au_bank_assisted",
    "au_card_variant",
    "au_current_status",
    "au_drop_off_page",
    "au_reject_reason",
    "au_utm_source",
    "au_utm_medium",
    "au_utm_campaign",
    "au_utm_term",
    "au_final_status",
    "au_phone_number",
    "au_lead_from",
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
    console.log(query, "queryquery");
    let appData = await pool.query(query);
    returnData = { applicationsData: appData.rows };
  } catch (err) {
    console.error(err);
    returnData = { applicationsData: [] };
  }
  return returnData;
};
modelObj.getApplicationDataById = async function (id) {
  let query = `SELECT * FROM au_bank_applications_table where au_id=${id}`;
  let returnData = {};
  try {
    let qReturn = await pool.query(query);
    returnData = qReturn.rows[0];
  } catch (err) {
    returnData = {};
  }
  return returnData;
};



modelObj.getAuColumns = async function () {
  let returnData = {
    allIssuers: [],
    allTr: [],
  };
  let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
  let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
  let queryForTr = `SELECT 
    CONCAT('edit-au-application-ui?id=',au_bank_applications_table.au_id) as "Edit",
	au_bank_applications_table.au_id as select,
  '' as "array|telecallers|telecallers",
	au_bank_applications_table.au_id as "int|au_id|Id",
	au_bank_applications_table.ca_main_table as "int|ca_main_table|Main Table",
	au_bank_applications_table.au_customer_name as "string|au_customer_name|Name",
	au_bank_applications_table.au_application_number as "string|au_application_number|Application Number",
	au_bank_applications_table.au_phone_number as "int|au_phone_number|Phone Number",
	au_bank_applications_table.au_bank_assisted as "bool|au_bank_assisted|Bank Assisted",
	CAST(au_bank_applications_table.au_initiation_date as varchar) as "date|au_initiation_date|Initiation Date",
	CAST(au_bank_applications_table.au_revised_date as varchar) as "date|au_revised_date|Revised Date",
	au_bank_applications_table.au_card_variant as "multiple|au_card_variant|Card Variant",
	au_bank_applications_table.au_current_status as "multiple|au_current_status| Current Status",
	au_bank_applications_table.au_drop_off_page_initial as "multiple|au_drop_off_page_initial| Drop Off Page Initial",
	au_bank_applications_table.au_drop_off_page as "multiple|au_drop_off|Drop Off Page",
	au_bank_applications_table.au_final_status as "multiple|au_final_status|Final Status",
	au_bank_applications_table.au_reject_reason as "string|au_reject_reason|Reject Reason",
	au_bank_applications_table.au_ipa_status as "multiple|au_ipa_status|Ipa Status",
	au_bank_applications_table.au_utm_source as "multiple|au_utm_source|Utm Source",
	au_bank_applications_table.au_utm_medium as "multiple|au_utm_medium|Utm Medium", 
	au_bank_applications_table.au_utm_campaign as "string|au_utm_campaign|Utm Campaign",
	au_bank_applications_table.au_utm_term as "string|au_utm_term|Utm Term",
	au_bank_applications_table.au_lead_from as "multiple|au_lead_from|Lead From",
	CAST(au_bank_applications_table.created_at as varchar) as "date|created_at|Created at",
	CAST(au_bank_applications_table.updated_at as varchar) as "date|updated_at|Updated at"
		FROM au_bank_applications_table limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
  let selectOptions = {
    au_drop_off_page_initial: [],
    au_drop_off: [],
    au_final_status: [],
    au_ipa_status: [],
    au_card_variant: [],
    au_current_status: [],
    au_utm_source: [],
    au_utm_medium: [],
    au_lead_from: [],
    telecallers: []
  };
  let getAllTeleUsersQuery = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`;
  selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
  selectOptions.au_drop_off_page_initial = await commonModel.getDistinctValuesCommon('au_drop_off_page_initial', 'au_bank_applications_table');
  selectOptions.au_drop_off = await commonModel.getDistinctValuesCommon('au_drop_off', 'au_bank_applications_table');
  selectOptions.au_current_status = await commonModel.getDistinctValuesCommon('au_current_status', 'au_bank_applications_table');
  selectOptions.au_final_status = await commonModel.getDistinctValuesCommon('au_final_status', 'au_bank_applications_table');
  selectOptions.au_ipa_status = await commonModel.getDistinctValuesCommon('au_ipa_status', 'au_bank_applications_table');
  selectOptions.au_card_variant = await commonModel.getDistinctValuesCommon('au_card_variant', 'au_bank_applications_table');
  selectOptions.au_utm_source = await commonModel.getDistinctValuesCommon('au_utm_source', 'au_bank_applications_table');
  selectOptions.au_utm_medium = await commonModel.getDistinctValuesCommon('au_utm_medium', 'au_bank_applications_table');
  selectOptions.au_lead_from = await commonModel.getDistinctValuesCommon('au_lead_from', 'au_bank_applications_table');

  returnData.allIssuers = allIssuers;
  returnData.allTr = allTr;
  returnData.selectOptions = selectOptions;
  return returnData;

}
module.exports = modelObj;
