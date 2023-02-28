/* Importing the pool variable from the database.js file in the utils/configs/database folder. */
let { pool } = require('../../utils/configs/database');
/* Importing the commonModel.js file. */
const commonModel = require("../commonModel");
//////////////////////////////////////////
let modelObj = {}
modelObj.getFilteredBobApplications = async function (body) {
	let returnData = {
		applicationsData: [],
		count: []
	}
	let { filterObject, pageNo, sort } = body

	let {
		entriesPerPage,
		bob_id,
		bob_application_number,
		from_bob_date,
		to_bob_date,
		bob_utm_source,
		bob_application_status,
		bob_email_id,
		bob_card_type,
		bob_state,
		bob_city,
		bob_esign_form_url,
		ca_main_table,
		from_created_at,
		to_created_at,
		from_updated_at,
		to_updated_at,
		bob_name,
		bob_utm_campaign,
		bob_utm_medium,
		bob_stage,
		bob_esign_status,
		bob_dasm_reason,
		bob_reject_reason,
		bob_vkyc_link,
		bob_ipa_status_bool,
		bob_ipa_original_status_sheet,
		telecallers,
		notNull
	} = filterObject
	const likeFields = {
		bob_email_id,
		bob_utm_source,
		bob_esign_form_url,
		bob_dasm_reason,
		bob_name,
		bob_vkyc_link,
		bob_utm_medium,
	}
	const selectFields = {
		bob_application_status,
		bob_card_type,
		bob_state,
		bob_city,
		bob_utm_campaign,
		bob_stage,
		bob_esign_status,
		bob_reject_reason,
		bob_ipa_original_status_sheet
	}
	const equalFields = {
		bob_id,
		ca_main_table,
		bob_application_number,
		bob_ipa_status_bool,
	}
	const fromDatefields = { from_created_at, from_updated_at, from_bob_date }
	const toDatefields = { to_created_at, to_updated_at, to_bob_date }
	Object.keys(fromDatefields).map(field => {
		let field_date = new Date(fromDatefields[field])
		fromDatefields[field] = fromDatefields[field] ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 00:00:01.001` : ``
	})
	Object.keys(toDatefields).map(field => {
		let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``
		toDatefields[field] = field_date ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 23:59:59.999` : ``
	})
	Object.keys(equalFields).map(field => {
		if (field !== 'bob_ipa_status_bool')
			equalFields[field] = equalFields[field] || ''
	})
	Object.keys(likeFields).map(field => {
		likeFields[field] = likeFields[field] || ''
	})
	const isFalseField = (field) => field === null || field === undefined || field === ''
	entriesPerPage = entriesPerPage || 10
	sort = sort || "bob_id"
	let offset = (pageNo - 1) * entriesPerPage
	let ascDesc = 'asc NULLS FIRST'
	if (sort.startsWith('-')) {
		sort = sort.substring(1)
		ascDesc = 'desc NULLS LAST'
	}
	let query = `
	SELECT * from(SELECT camt.*, array_agg(auj.admin_user) telecallers FROM bob_applications_table camt
        left join applications_users_junction auj on auj.application_id = bob_id and auj.issuer_id = 2
        GROUP BY (camt.bob_id)
        ) as new_applications
	where ${telecallers ? `${telecallers} = ANY(telecallers) AND ` : ''}`
	Object.keys(fromDatefields).map(fromField => {
		const field = fromField.replace('from_', '')
		query = query + (fromDatefields[fromField] ? `"${field}" >= '${fromDatefields[fromField]}' AND ` : ``)
	})
	Object.keys(toDatefields).map(toField => {
		const field = toField.replace('to_', '')
		query = query + (toDatefields[toField] ? `"${field}" <= '${toDatefields[toField]}' AND ` : ``)
	})
	Object.keys(equalFields).map(field => {
		if (field !== 'bob_ipa_status_bool')
			query = query + (isFalseField(equalFields[field]) ? `` : `"${field}"::Text = '${equalFields[field]}' AND `)
		else {
			query = query + (equalFields[field] === undefined || equalFields[field] === '' ? `` : `"${field}"::Text = '${equalFields[field]}' AND `)
		}
	})

	Object.keys(likeFields).map((field, index) => {
		query = query + (likeFields[field] ? `(Lower("${field}")::Text Like '%${likeFields[field].toLowerCase()}%' ) AND ` : ``)
	})
	Object.keys(selectFields).map(field => {
		let string = ""

		for (let i = 0; i < (selectFields[field] ? selectFields[field].length : 0); i++) {
			string += `'${selectFields[field][i]}',`
		}
		string = string.slice(0, -1)
		console.log({ string })
		query = query + (selectFields[field] && selectFields[field].length > 0 ? `"${field}"::Text=ANY(ARRAY[${string}]) AND ` : ``)
	})
	let stringFields = ['bob_application_number', 'bob_utm_source', 'bob_application_status', 'bob_email_id', 'bob_card_type', 'bob_state', 'bob_city', 'bob_esign_form_url', 'bob_name', 'bob_utm_campaign', 'bob_utm_medium', 'bob_stage', 'bob_esign_status', 'bob_dasm_reason', 'bob_reject_reason', 'bob_vkyc_link', 'bob_ipa_original_status_sheet',
	]
	notNull.forEach(elem => {
		if (elem === 'telecallers')
			query += `array_to_string(telecallers,',','') <> ''`
		else if (stringFields.includes(elem))
			query += `ltrim(${elem}) <> '' AND `
		else {
			if (elem.includes('-')) {
				let NULL = elem.slice(1)
				query = query + `${NULL} IS NULL AND `
			} else {
				query = query + `${elem} IS NOT NULL AND `
			}
		}
	})
	let countQuery = query.replace('SELECT *', 'SELECT count(*)')
	query = query + ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`
	query = query.replace(/AND\s+ORDER/, `ORDER`)
	query = query.replace(/where\s+ORDER/, 'ORDER')
	// console.log(countQuery)
	countQuery = countQuery.trimEnd().endsWith('where') ? countQuery.trimEnd().replace('where', '') : countQuery
	countQuery = countQuery.trimEnd().endsWith('AND') ? countQuery.trimEnd().replace(/AND$/, '') : countQuery
	console.log(query)
	console.log(countQuery)
	try {
		let appData = await pool.query(query)
		let countData = await pool.query(countQuery)
		returnData = { count: countData.rows[0].count, applicationsData: appData.rows }
	}
	catch (err) {
		console.error(err)
		returnData = { count: 0, applicationsData: [] }
	}
	return returnData
}
modelObj.exportCsv = async function ({ allFieldsArray, filterObject }) {
	let returnData = {
		applicationsData: [],
	}

	let {
		bob_id,
		bob_application_number,
		from_bob_date,
		to_bob_date,
		bob_utm_source,
		bob_application_status,
		bob_email_id,
		bob_card_type,
		bob_state,
		bob_city,
		bob_esign_form_url,
		ca_main_table,
		from_created_at,
		to_created_at,
		from_updated_at,
		to_updated_at,
		bob_name,
		bob_utm_campaign,
		bob_utm_medium,
		bob_stage,
		bob_esign_status,
		bob_dasm_reason,
		bob_reject_reason,
		bob_vkyc_link,
		bob_ipa_status_bool,
		bob_ipa_original_status_sheet,
		notNull
	} = filterObject
	const likeFields = {
		bob_email_id,
		bob_utm_source,
		bob_esign_form_url,
		bob_dasm_reason,
		bob_name,
		bob_vkyc_link,
		bob_utm_medium,
	}
	const selectFields = {
		bob_application_status,
		bob_card_type,
		bob_state,
		bob_city,
		bob_utm_campaign,
		bob_stage,
		bob_esign_status,
		bob_reject_reason,
		bob_ipa_original_status_sheet
	}
	const equalFields = {
		bob_id,
		ca_main_table,
		bob_application_number,
		bob_ipa_status_bool,
	}
	const fromDatefields = { from_created_at, from_updated_at, from_bob_date }
	const toDatefields = { to_created_at, to_updated_at, to_bob_date }
	Object.keys(fromDatefields).map(field => {
		let field_date = new Date(fromDatefields[field])
		fromDatefields[field] = fromDatefields[field] ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 00:00:01.001` : ``
	})
	Object.keys(toDatefields).map(field => {
		let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``
		toDatefields[field] = field_date ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 23:59:59.999` : ``
	})
	Object.keys(equalFields).map(field => {
		if (field !== 'bob_ipa_status_bool')
			equalFields[field] = equalFields[field] || ''
	})
	Object.keys(likeFields).map(field => {
		likeFields[field] = likeFields[field] || ''
	})
	const isFalseField = (field) => field === null || field === undefined || field === ''
	let columnString = ``
	allFieldsArray.map(field => {
		columnString += `${field.column_name},`
	})
	columnString = columnString.slice(0, -1)

	let query = `
	SELECT ${columnString} FROM bob_applications_table camt where
	`
	Object.keys(fromDatefields).map(fromField => {
		const field = fromField.replace('from_', '')
		query = query + (fromDatefields[fromField] ? `camt."${field}" >= '${fromDatefields[fromField]}' AND ` : ``)
	})
	Object.keys(toDatefields).map(toField => {
		const field = toField.replace('to_', '')
		query = query + (toDatefields[toField] ? `camt."${field}" <= '${toDatefields[toField]}' AND ` : ``)
	})


	Object.keys(equalFields).map(field => {
		if (field !== 'bob_ipa_status_bool')
			query = query + (isFalseField(equalFields[field]) ? `` : `camt."${field}"::Text = '${equalFields[field]}' AND `)
		else {
			query = query + (equalFields[field] === undefined || equalFields[field] === '' ? `` : `camt."${field}"::Text = '${equalFields[field]}' AND `)
		}
	})

	Object.keys(likeFields).map((field, index) => {
		query = query + (likeFields[field] ? `(Lower(camt."${field}")::Text Like '%${likeFields[field].toLowerCase()}%' ) AND ` : ``)
	})
	Object.keys(selectFields).map(field => {
		let string = ""

		for (let i = 0; i < (selectFields[field] ? selectFields[field].length : 0); i++) {
			string += `'${selectFields[field][i]}',`
		}
		string = string.slice(0, -1)
		console.log({ string })
		query = query + (selectFields[field] && selectFields[field].length > 0 ? `"${field}"::Text=ANY(ARRAY[${string}]) AND ` : ``)
	})
	let stringFields = ['bob_application_number', 'bob_utm_source', 'bob_application_status', 'bob_email_id', 'bob_card_type', 'bob_state', 'bob_city', 'bob_esign_form_url', 'bob_name', 'bob_utm_campaign', 'bob_utm_medium', 'bob_stage', 'bob_esign_status', 'bob_dasm_reason', 'bob_reject_reason', 'bob_vkyc_link', 'bob_ipa_original_status_sheet',
	]
	notNull.forEach(elem => {
		if (stringFields.includes(elem))
			query += `ltrim(${elem}) <> '' AND `
		else {
			if (elem.includes('-')) {
				let NULL = elem.slice(1)
				query = query + `${NULL} IS NULL AND `
			} else {
				query = query + `${elem} IS NOT NULL AND `
			}
		}
	})
	query = query.trimEnd().endsWith('where') ? query.replace('where', '') : query
	query = query + ';'
	query = query.replace(/AND\s+\;/, `;`)
	try {
		console.log(query)
		let appData = await pool.query(query)
		returnData = { applicationsData: appData.rows }
	}
	catch (err) {
		console.error(err)
		returnData = { applicationsData: [] }
	}
	return returnData
}
modelObj.getApplicationDataById = async function (id) {
	let query = `SELECT * FROM bob_applications_table where bob_id=${id}`
	let returnData = {}
	try {
		let qReturn = await pool.query(query)
		returnData = qReturn.rows[0]
	}
	catch (err) {
		returnData = {}
	}
	return returnData
}



modelObj.getbobColumns = async function () {
	let returnData = {
		allIssuers: [],
		allTr: [],
	};
	let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
	let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
	let queryForTr = `SELECT 
		  CONCAT('edit-bob-application-ui?id=',bob_applications_table.bob_id) as "Edit",  
		  bob_applications_table.bob_id as select,
		  '' as "array|telecallers|telecallers",
		  bob_applications_table.bob_id as "int|bob_id|Id",
		  bob_applications_table.ca_main_table as "int|ca_main_table|Main Table",
		  bob_applications_table.bob_name as "string|bob_name|Name",
		  bob_applications_table.bob_application_number as "string|bob_application_number|Application Number",
		  CAST(bob_applications_table.bob_date as varchar) as "date|bob_date|Application Date",
		  bob_applications_table.bob_application_status as "multiple|bob_application_status|Application Status",
		  bob_applications_table.bob_email_id as "string|bob_email_id|Email Id",
		  bob_applications_table.bob_card_type as "multiple|bob_card_type|Card Type",
		  bob_applications_table.bob_stage as "multiple|bob_stage|Stage",
		  bob_applications_table.bob_esign_status as "multiple|bob_esign_status|Esign Stage",
		  bob_applications_table.bob_dasm_reason as "string|bob_dasm_reason|Dasm Reason",
		  bob_applications_table.bob_reject_reason as "multiple|bob_reject_reason|Reject Reason",
		  bob_applications_table.bob_esign_form_url as "url|bob_esign_form_url|Esign Form Url",
		  bob_applications_table.bob_vkyc_link as "url|bob_vkyc_link|Vkyc Link",
		  bob_applications_table.bob_ipa_original_status_sheet as "string|bob_ipa_original_status_sheet|IPA Original Status Sheet",
		  bob_applications_table.bob_ipa_status_bool as "bool|bob_ipa_status_bool|IPA Status",
		  bob_applications_table.bob_city as "multiple|bob_city|City",
		  bob_applications_table.bob_state as "multiple|bob_state|State",
		  bob_applications_table.bob_utm_source as "string|bob_utm_source|UTM Source",
		  bob_applications_table.bob_utm_campaign as "multiple|bob_utm_campaign|UTM Campaign",
		  bob_applications_table.bob_utm_medium as "string|bob_utm_medium|UTM Medium",
		  CAST(bob_applications_table.created_at as varchar) as "date|created_at|Created At",
		  CAST(bob_applications_table.updated_at as varchar) as "date|updated_at|Updated At"
	  	FROM bob_applications_table  
		limit 1`;
	let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
	let selectOptions = {
		bob_application_status: [],
		bob_card_type: [],
		bob_state: [],
		bob_city: [],
		bob_utm_campaign: [],
		bob_stage: [],
		bob_esign_status: [],
		bob_reject_reason: [],
		telecallers: []
	};
	let getAllTeleUsersQuery = ` Select ua_id as value ,ua_name as telecallers  from user_admin where ua_role= 3  order by ua_name asc ;`;
	selectOptions.telecallers = await commonModel.getDataOrCount(getAllTeleUsersQuery, [], 'D');
	selectOptions.bob_application_status = await commonModel.getDistinctValuesCommon('bob_application_status', "bob_applications_table");
	selectOptions.bob_card_type = await commonModel.getDistinctValuesCommon('bob_card_type', "bob_applications_table");
	selectOptions.bob_state = await commonModel.getDistinctValuesCommon('bob_state', "bob_applications_table");
	selectOptions.bob_city = await commonModel.getDistinctValuesCommon('bob_city', "bob_applications_table");
	selectOptions.bob_utm_campaign = await commonModel.getDistinctValuesCommon('bob_utm_campaign', "bob_applications_table");
	selectOptions.bob_stage = await commonModel.getDistinctValuesCommon('bob_stage', "bob_applications_table");
	selectOptions.bob_esign_status = await commonModel.getDistinctValuesCommon('bob_esign_status', "bob_applications_table");
	selectOptions.bob_reject_reason = await commonModel.getDistinctValuesCommon('bob_reject_reason', "bob_applications_table");
	returnData.allIssuers = allIssuers;
	returnData.allTr = allTr;
	returnData.selectOptions = selectOptions;
	return returnData;

}


module.exports = modelObj