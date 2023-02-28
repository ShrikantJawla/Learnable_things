let { pool } = require('../../utils/configs/database')
//////////////////////////////////////////
let modelObj = {}
modelObj.getFilteredCitiApplications = async function (body) {
    let returnData = {
        applicationsData: [],
        count: []
    }
    let { filterObject, pageNo, sort } = body

    let {
        entriesPerPage,
        citi_id,
        citi_application_id,
        from_citi_date,
        to_citi_date,
        citi_application_status,
        citi_tracking_id,
        ca_main_table,
        citi_permit_to_telly,
        from_updated_at,
        to_updated_at,
        from_created_at,
        to_created_at,
        citi_utm_source,
        citi_batch_no,
        citi_reject_reason
    } = filterObject
    const likeFields = {
        ca_main_table,
        citi_reject_reason,
        citi_batch_no,
    }
    const equalFields = {
        citi_id,
        citi_application_id,
        citi_application_status,
        citi_tracking_id,
        citi_utm_source,
        citi_permit_to_telly
    }
    const fromDatefields = { from_citi_date, from_created_at, from_updated_at }
    const toDatefields = { to_citi_date, to_created_at, to_updated_at }
    Object.keys(fromDatefields).map(field => {
        let field_date = new Date(fromDatefields[field])
        fromDatefields[field] = fromDatefields[field] ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 00:00:01.001` : `1970-01-01 00:00:01.001`
    })
    Object.keys(toDatefields).map(field => {
        let field_date = toDatefields[field] ? new Date(toDatefields[field]) : new Date()
        toDatefields[field] = `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 23:59:59.999`
    })
    Object.keys(equalFields).map(field => {
        if (field !== 'citi_permit_to_telly')
            equalFields[field] = equalFields[field] || ''
    })
    Object.keys(likeFields).map(field => {
        likeFields[field] = likeFields[field] || ''
    })
    const isFalseField = (field) => field === null || field === undefined || field === ''
    entriesPerPage = entriesPerPage || 10
    sort = sort || "citi_id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc NULLS FIRST'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc NULLS LAST'
    }
    let query = `
	SELECT * FROM citi_applications_table camt where `
    Object.keys(fromDatefields).map(fromField => {
        const field = fromField.replace('from_', '')
        query = query += `camt."${field}"  >= '${fromDatefields[fromField]}' AND `
    })
    Object.keys(toDatefields).map(toField => {
        const field = toField.replace('to_', '')
        query = query += `camt."${field}"  <= '${toDatefields[toField]}' AND `
    })


    Object.keys(equalFields).map(field => {

        if (field !== 'citi_permit_to_telly')
            query = query + (isFalseField(equalFields[field]) ? `` : `camt."${field}"::Text = '${equalFields[field]}' AND `)
        else {
            query = query + (equalFields[field] === undefined || equalFields[field] === '' ? `` : `camt."${field}"::Text = '${equalFields[field]}' AND `)
        }
    })

    Object.keys(likeFields).map((field, index) => {
        if (field === 'ca_main_table') {
            query = query + `(camt."${field}"::Text Like '%${likeFields[field]}%' OR camt."${field}" IS NULL ) AND `
        }
        else if (index !== Object.keys(likeFields).length - 1)
            query = query + `(Lower(camt."${field}")::Text Like '%${likeFields[field].toLowerCase()}%' OR camt."${field}" IS NULL ) AND `
        else
            query = query + `(Lower(camt."${field}")::Text Like '%${likeFields[field].toLowerCase()}%' OR camt."${field}" IS NULL ) `
    })
    let countQuery = query.replace('SELECT *', 'SELECT count(*)')
    query = query + `ORDER By camt."${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`
    query = query.replace(`AND ORDER`, `ORDER`)
    //console.log(query)
    try {
        let appData = await pool.query(query)
        let countData = await pool.query(countQuery)
        //console.log({ countData })
        //console.log(countData.rows[0].count, appData.rows)
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
        citi_id,
        citi_application_id,
        from_citi_date,
        to_citi_date,
        citi_application_status,
        citi_tracking_id,
        ca_main_table,
        citi_permit_to_telly,
        from_updated_at,
        to_updated_at,
        from_created_at,
        to_created_at,
        citi_utm_source,
        citi_batch_no,
        citi_reject_reason
    } = filterObject
    const likeFields = {
        ca_main_table,
        citi_reject_reason,
        citi_batch_no,
    }
    const equalFields = {
        citi_id,
        citi_application_id,
        citi_application_status,
        citi_tracking_id,
        citi_utm_source,
        citi_permit_to_telly
    }
    const fromDatefields = { from_citi_date, from_created_at, from_updated_at }
    const toDatefields = { to_citi_date, to_created_at, to_updated_at }
    Object.keys(fromDatefields).map(field => {
        let field_date = new Date(fromDatefields[field])
        fromDatefields[field] = fromDatefields[field] ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 00:00:01.001` : `1970-01-01 00:00:01.001`
    })
    Object.keys(toDatefields).map(field => {
        let field_date = toDatefields[field] ? new Date(toDatefields[field]) : new Date()
        toDatefields[field] = `${field_date.getFullYear()}-${(field_date.getMonth() + 1).toString().padStart(2, 0)}-${(field_date.getDate()).toString().padStart(2, 0)} 23:59:59.999`
    })
    Object.keys(equalFields).map(field => {
        if (field !== 'citi_permit_to_telly')
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
	SELECT ${columnString} FROM citi_applications_table camt where
	`
    Object.keys(fromDatefields).map(fromField => {
        const field = fromField.replace('from_', '')
        query = query += `camt."${field}"  >= '${fromDatefields[fromField]}' AND `
    })
    Object.keys(toDatefields).map(toField => {
        const field = toField.replace('to_', '')
        query = query += `camt."${field}"  <= '${toDatefields[toField]}' AND `
    })


    Object.keys(equalFields).map(field => {

        if (field !== 'citi_permit_to_telly')
            query = query + (isFalseField(equalFields[field]) ? `` : `camt."${field}"::Text = '${equalFields[field]}' AND `)
        else {
            query = query + (equalFields[field] === undefined || equalFields[field] === '' ? `` : `camt."${field}"::Text = '${equalFields[field]}' AND `)
        }
    })

    Object.keys(likeFields).map((field, index) => {
        if (field === 'ca_main_table') {
            query = query + `(camt."${field}"::Text Like '%${likeFields[field]}%' OR camt."${field}" IS NULL ) AND `
        }
        else if (index !== Object.keys(likeFields).length - 1)
            query = query + `(Lower(camt."${field}")::Text Like '%${likeFields[field].toLowerCase()}%' OR camt."${field}" IS NULL ) AND `
        else
            query = query + `(Lower(camt."${field}")::Text Like '%${likeFields[field].toLowerCase()}%' OR camt."${field}" IS NULL ) `
    })
    query = query + ';'

    query = query.replace(`AND ;`, `;`)
    query = query.replace(`AND  ;`, `;`)
    try {
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
    let query = `SELECT * FROM citi_applications_table where id=${id}`
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
module.exports = modelObj