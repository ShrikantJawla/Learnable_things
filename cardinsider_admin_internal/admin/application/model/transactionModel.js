const { query } = require("express")
const { pool } = require("../../../configration/database")

let transactionModelObj = {}

transactionModelObj.getFilteredTransactions = async function (body) {
    let { filterObject, pageNo, sort } = body
    console.log(filterObject)
    let {
        entriesPerPage,
        td_id,
        td_uuid,
        td_status,
        td_user_id,
        td_from_amount,
        td_to_amount,
        td_upi_id,
        td_account,
        td_account_number,
        td_bank_name,
        td_ifsc_code,
        td_method,
        td_from_created_at,
        td_to_created_at,
        td_from_updated_at,
        td_to_updated_at,
        td_message,
        user_name,
        is_upi_valid,
        is_bank_valid,
        upi_valid_name,
        bank_valid_name
    } = filterObject
    sort = sort || "td_id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc'
    }
    let queryToDb = `
    SELECT ca.*  , account_informations.* ,
     (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name 
     from transaction_details ca
    LEFT JOIN account_informations ON account_informations.card_insider_user = ca.td_user_id 
    LEFT JOIN card_insider_users ON ca.td_user_id = card_insider_users.id
    WHERE
     ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    ${is_upi_valid === 'true' ? `account_informations."is_upi_valid" is true AND ` : (is_upi_valid === 'false' ? `account_informations."is_upi_valid" is not true AND ` : ``)}
    ${is_bank_valid === 'true' ? `account_informations."is_bank_valid" is true AND ` : (is_bank_valid === 'false' ? `account_informations."is_bank_valid" is not true AND ` : ``)}
    ${upi_valid_name ? `LOWER (account_informations.upi_valid_name)::Text LIKE '%${upi_valid_name.toLowerCase()}%' AND ` : ''}
    ${bank_valid_name ? `LOWER (account_informations.bank_valid_name)::Text LIKE '%${bank_valid_name.toLowerCase()}%' AND ` : ''}
    ${td_id ? `ca."td_id"::Text='${td_id}' AND ` : ''}
    ${td_uuid ? `ca."td_uuid"::Text='${td_uuid}' AND ` : ''}
    ${td_from_amount ? `ca."td_amount">='${td_from_amount}' AND` : ''}
    ${td_to_amount ? `ca."td_amount"<='${td_to_amount}' AND ` : ''}
    ${td_status ? `ca."td_status"::Text='${td_status}' AND ` : ''}
    ${td_user_id ? `ca."td_user_id"::Text='${td_user_id}' AND ` : ''}
    ${td_upi_id ? `ca."td_upi_id"::Text='${td_upi_id}' AND ` : ''}
    ${td_account ? `ca."td_account_name"::Text='${td_account}' AND ` : ''}
    ${td_account_number ? `ca."td_account_number"::Text='${td_account_number}' AND ` : ''}
    ${td_bank_name ? `ca."td_bank_name"::Text='${td_bank_name}' AND ` : ''}
    ${td_ifsc_code ? `ca."td_ifsc_code"::Text='${td_ifsc_code}' AND ` : ''}
    ${td_method ? `ca."td_method"::Text='${td_method}' AND ` : ''}
    ${td_message ? `ca."td_message"::Text='${td_message}' AND ` : ''}
    ${td_from_created_at ? `ca."td_created_at"  >= '${td_from_created_at} 00:00:01.001' AND ` : ''}   
    ${td_to_created_at ? `ca."td_created_at"<= '${td_to_created_at} 23:59:59.999' AND ` : ''}
    ${td_from_updated_at ? `ca."td_updated_at"  >= '${td_from_updated_at} 00:00:01.001' AND ` : ''}   
    ${td_to_updated_at ? `ca."td_updated_at"<= '${td_to_updated_at} 23:59:59.999' AND ` : ''}
    ORDER By "${sort}" ${ascDesc}
    limit ${entriesPerPage} offset ${offset};
    `
    let countQuery = ` SELECT count(*) 
    from transaction_details ca 
    LEFT JOIN account_informations ON account_informations.card_insider_user = ca.td_user_id 
    LEFT JOIN card_insider_users ON ca.td_user_id = card_insider_users.id
    WHERE 
    ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    ${is_upi_valid === 'true' ? `account_informations."is_upi_valid" is true AND ` : (is_upi_valid === 'false' ? `account_informations."is_upi_valid" is not true AND ` : ``)}
    ${is_bank_valid === 'true' ? `account_informations."is_bank_valid" is true AND ` : (is_bank_valid === 'false' ? `account_informations."is_bank_valid" is not true AND ` : ``)}
    ${upi_valid_name ? `LOWER (account_informations.upi_valid_name)::Text LIKE '%${upi_valid_name.toLowerCase()}%' AND ` : ''}
    ${bank_valid_name ? `LOWER (account_informations.bank_valid_name)::Text LIKE '%${bank_valid_name.toLowerCase()}%' AND ` : ''}
    ${td_id ? `ca."td_id"::Text='${td_id}' AND ` : ''}
    ${td_uuid ? `ca."td_uuid"::Text='${td_uuid}' AND ` : ''}
    ${td_from_amount ? `ca."td_amount">='${td_from_amount}' AND ` : ''}
    ${td_to_amount ? `ca."td_amount"<='${td_to_amount}' AND ` : ''}
    ${td_status ? `ca."td_status"::Text='${td_status}' AND ` : ''}
    ${td_user_id ? `ca."td_user_id"::Text='${td_user_id}' AND ` : ''}
    ${td_upi_id ? `ca."td_upi_id"::Text='${td_upi_id}' AND ` : ''}
    ${td_account ? `ca."td_account_name"::Text='${td_account}' AND ` : ''}
    ${td_account_number ? `ca."td_account_number"::Text='${td_account_number}' AND ` : ''}
    ${td_bank_name ? `ca."td_bank_name"::Text='${td_bank_name}' AND ` : ''}
    ${td_ifsc_code ? `ca."td_ifsc_code"::Text='${td_ifsc_code}' AND ` : ''}
    ${td_method ? `ca."td_method"::Text='${td_method}' AND ` : ''}
    ${td_message ? `ca."td_message"::Text='${td_message}' AND ` : ''}
    ${td_from_created_at ? `ca."td_created_at"  >= '${td_from_created_at} 00:00:01.001' AND ` : ''}   
    ${td_to_created_at ? `ca."td_created_at"<= '${td_to_created_at} 23:59:59.999' AND ` : ''}
    ${td_from_updated_at ? `ca."td_updated_at"  >= '${td_from_updated_at} 00:00:01.001' AND ` : ''}   
    ${td_to_updated_at ? `ca."td_updated_at"<= '${td_to_updated_at} 23:59:59.999' AND ` : ''};
    `
    queryToDb = queryToDb.replace(/AND\s+ORDER/, 'ORDER')
    queryToDb = queryToDb.replace(/WHERE\s+ORDER/, 'ORDER')
    countQuery = countQuery.replace(/AND\s+;/, ';')
    countQuery = countQuery.replace(/WHERE\s+;/, ';')
   // console.log(queryToDb, countQuery)
    try {
        let dataFromQuery = await pool.query(queryToDb)
        let cData = await pool.query(countQuery)
        return { returnDataFromModal: dataFromQuery.rows, count: cData.rows[0].count }
    } catch (err) {
        console.log(err)
        return { returnDataFromModal: [], count: 0 }
    }
}

transactionModelObj.fetchTransactionDetailsById = async function (id) {
    let queryToDb = `
    SELECT td.*,ciu.ciu_first_name,ciu.ciu_last_name,ua."ua_name", ciu.ciu_number FROM transaction_details td
    LEFT JOIN card_insider_users ciu ON ciu.id=td.td_user_id
    LEFT JOIN user_admin ua on td."td_updated_by"=ua."strapi_user_id"
    WHERE td_uuid= '${id}'`
    let breakUpQueryToDb = `
    SELECT tarj.*,ca."Application_number",CONCAT(ciu."ciu_first_name",' ',ciu."ciu_last_name") as referred_user_name,ci."IssuerName",cc."CreditCardName" FROM transation_applications_referrals_junction tarj
    LEFT JOIN card_applications ca ON tarj."tarj_application"=ca."id"
    LEFT JOIN card_issuers ci ON ca."card_issuer"=ci."id"
    LEFT JOIN credit_cards cc on ca."credit_card"=cc."id"
    LEFT JOIN card_insider_users ciu ON tarj."tarj_referred_user"=ciu."id"
    WHERE tarj_transaction_detail = `;
    let transaction = {}

    console.log(queryToDb,"\n\n");
    console.log(breakUpQueryToDb, "\n\n");
    try {
        let transactionDataFromDb = await pool.query(queryToDb);
        console.log(transactionDataFromDb.rows);
        if(transactionDataFromDb.rows.length > 0){
            breakUpQueryToDb = breakUpQueryToDb + `${transactionDataFromDb.rows[0].td_id}`;
          let breakupDataFromDb = await pool.query(breakUpQueryToDb);
          transaction = { ...transactionDataFromDb.rows[0], breakup: [...breakupDataFromDb.rows] }

        }
     
        // "td_account_name": "Rahul Mehndiratta", "td_bank_name": "SBI", "td_account_number": "2344352", td_ifsc_code: "sadda12213",
       
        // transaction.td_created_at = transaction.td_created_at.toLocaleString("en-Us", { timeZone: "Asia/Kolkata" })
        // transaction.td_updated_at = transaction.td_updated_at.toLocaleString("en-Us", { timeZone: "Asia/Kolkata" })
       // console.log(transaction, "degerutnoi");
    }
    catch (err) {
        console.log(err)
    }
    return transaction
}

transactionModelObj.updateTransactionStatus = async function (notVerifiedData) {
    if (notVerifiedData.length > 0) {
        let updateTransactionDataQuery = ` `
        let updateInUser = ` `
        for (let k = 0; k < notVerifiedData.length; k++) {
            //console.log(notVerifiedData.length)
            updateTransactionDataQuery = updateTransactionDataQuery + ` update transaction_details set td_status = 'Failed' , td_message = 'user updated upi details' where td_id = ${notVerifiedData[k].td_id} ; `
            updateInUser = updateInUser + ` UPDATE card_insider_users SET cashback_claimed = true ,  updated_at =  CURRENT_TIMESTAMP WHERE id = ${notVerifiedData[k].td_user_id};`
        }
        console.log(updateTransactionDataQuery)
        console.log(updateInUser)
        try {
            let updateUserData = await pool.query(updateInUser)
            let updateTransactionData = await pool.query(updateTransactionDataQuery)
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }
}

transactionModelObj.exportCsv = async function (idList) {
    let tdIds = ``
    for (let i = 0; i < idList.length; i++) {
        if (i == 0) {
            tdIds = tdIds + ` ( `
        }
        tdIds = tdIds + ` td_id = ${idList[i]}`
        if (i != idList.length - 1) {
            tdIds = tdIds + ` or `
        } else {
            tdIds = tdIds + ` ) `
        }
    }
    let selectQuery = `SELECT CONCAT(ciu."ciu_first_name",' ',ciu."ciu_last_name") as "Payee Contact Name" , 'CUSTOMER' as "Payee Type" , td_amount as "Bill Amount (INR)" , td_uuid as "Bill/Reference No. [optional]" , '' as "TDS (INR) [optional]" ,  td_account_number as "Payee Bank Account No." , td_ifsc_code as "Payee Bank Account IFSC" , td_upi_id as "Payee UPI handle" , ciu_email as "Payee Contact email address [optional]" , ciu_number as "Payee Contact mobile number"  , 'Card Insider App Cashback' as "Purpose [optional]" ,  'Card Insider App Cashback' as "Comments [optional]"   FROM public.transaction_details  LEFT JOIN card_insider_users ciu ON ciu.id= transaction_details.td_user_id where td_status = 'Processing' AND ${tdIds} ; `;
    // console.log(selectQuery);
    try {
        let getTransactionsDetails = await pool.query(selectQuery)
        return getTransactionsDetails.rows
    } catch (err) {
        console.log(err)
        return false
    }
}

transactionModelObj.makeTransactionsComplete = function(){
    
}
module.exports = transactionModelObj
