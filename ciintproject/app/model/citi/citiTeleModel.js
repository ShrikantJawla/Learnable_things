const { pool } = require('../../utils/configs/database')
////////////////////////////////////////////////////////////////////////////////////////////////
let modelObj = {}
modelObj.getFilteredYesApplications = async function (body, user) {
    console.log({ user })
    let returnData = {
        applicationsData: [],
        count: []
    }
    let { filterObject, pageNo, sort } = body

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
        notNull
    } = filterObject
    // console.log(filterObject)
    const likeFields = {
        yb_decision_date,

    }
    const equalFields = {
        yb_id, ca_main_table,
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
        yb_apply_through,
        yb_vkyc_unable_reject_reasons,
        yb_decline_reson,
        yb_dip_reject_reason,
        yb_mobile_number,
        yb_final_original_status,
        yb_real_application_id
    }
    const fromDatefields = { from_yb_application_created, from_yb_last_update_on, from_created_at, from_updated_at }
    const toDatefields = { to_yb_application_created, to_yb_last_update_on, to_created_at, to_updated_at }
    Object.keys(fromDatefields).map(field => {
        let field_date = new Date(fromDatefields[field])
        fromDatefields[field] = fromDatefields[field] ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 00:00:01.001` : ``
    })
    Object.keys(toDatefields).map(field => {
        let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``
        toDatefields[field] = field_date ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 23:59:59.999` : ``
    })
    Object.keys(equalFields).map(field => {
        equalFields[field] = equalFields[field] || ''
    })
    Object.keys(likeFields).map(field => {
        likeFields[field] = likeFields[field] || ''
    })

    const isFalseField = (field) => field === null || field === undefined || field === ''
    entriesPerPage = entriesPerPage || 10
    sort = sort || "yb_id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc NULLS FIRST'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc NULLS LAST'
    }
    let query = `
	SELECT * FROM tele_callers_applications_yes camt where admin_user=${user} AND `
    Object.keys(fromDatefields).map(fromField => {
        const field = fromField.replace('from_', '')
        query = query + (fromDatefields[fromField] ? `"${field}" >= '${fromDatefields[fromField]}' AND ` : ``)
    })
    Object.keys(toDatefields).map(toField => {
        const field = toField.replace('to_', '')
        query = query + (toDatefields[toField] ? `"${field}" <= '${toDatefields[toField]}' AND ` : ``)
    })
    Object.keys(equalFields).map(field => {

        query = query + (equalFields[field] === undefined || equalFields[field] === '' ? `` : `"${field}"::Text = '${equalFields[field]}' AND `)
    })

    Object.keys(likeFields).map((field, index) => {
        query = query + (likeFields[field] ? `(Lower("${field}")::Text Like '%${likeFields[field].toLowerCase()}%' ) AND ` : ``)
    })
    let stringFields = [
        'yb_application_number',
        'yb_aps_ref_number',
        'yb_ekyc_status',
        'yb_application_status',
        'yb_application_status_initial',
        'yb_final_status',
        'yb_ipa_status',
        'yb_dedupe_status',
        'yb_policy_check_status',
        'yb_cibil_check_status',
        'yb_idv',
        'yb_apply_through',
        'yb_credit_limit',
        'yb_vkyc_unable_reject_reasons',
        'yb_final_original_status',
        'yb_decision_date',
        'yb_decline_reson',
        'yb_dip_reject_reason',
        'yb_real_application_id'
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
    let countQuery = query.replace('SELECT *', 'SELECT count(*)')
    query = query + `ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`
    query = query.replace(/AND\s+ORDER/, `ORDER`)
    query = query.replace(/where\s+ORDER/, 'ORDER')
    // console.log(countQuery)
    countQuery = countQuery.trimEnd().endsWith('where') ? countQuery.trimEnd().replace('where', '') : countQuery
    countQuery = countQuery.trimEnd().endsWith('AND') ? countQuery.trimEnd().replace(/AND$/, '') : countQuery
    try {
        console.log(query)
        console.log(countQuery)
        let appData = await pool.query(query)
        let countData = await pool.query(countQuery)
        console.log(countData.rows)
        returnData = { count: countData.rows[0].count * 1, applicationsData: appData.rows }
        // //console.log({ returnData })
    }
    catch (err) {
        console.error(err)
        returnData = { count: 0, applicationsData: [] }
    }
    return returnData
}

modelObj.getApplicationDataById = async function (id) {
    let query = `SELECT * FROM yes_bank_applications_table where yb_id=${id}`
    let returnData = {}
    try {
        let qReturn = await pool.query(query)
        returnData = qReturn.rows[0]
    }
    catch (err) {
        console.log(err)
        returnData = {}
    }
    return returnData
}
module.exports = modelObj