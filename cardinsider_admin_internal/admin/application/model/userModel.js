const { pool } = require("../../../configration/database")

let userModelObj = {}


/* ===========>>>>>>>>>    fetching all users  list <<<<<<<<<<<======================= */

userModelObj.fetchCiUsers = async function () {
    // let returnData = []
    // try {
    //     const query = await pool.query("SELECT card_insider_users.*, ((card_insider_users.id  * 555)+ 555) as params_id from card_insider_users;")
    //     returnData = query.rows
    // } catch (error) {
    //     returnData = error
    // }

    // return returnData
    return userModelObj.getAllUsersInBachis();
}
userModelObj.getAllUsersInBachis = async function () {
	let hitLimit = 30000;
	let totalCount = 0;
	let totalHitLength = 0;
	let getCountOfAllDataSql = ` SELECT Count(*) FROM public.card_insider_users ;`;
	let lastRecordId;
	let allRecord = [];
	try {
		let getCount = await pool.query(getCountOfAllDataSql);
		if (getCount && getCount.rows && getCount.rows.length > 0 && getCount.rows[0].count) {
			totalCount = getCount.rows[0].count;
			console.log(totalCount, "totalCounttotalCount");
			totalHitLength = totalCount / hitLimit;
			let checkTheDecimalValue = totalHitLength % 1;
			if (checkTheDecimalValue != 0) {
				totalHitLength = ~~totalHitLength;
				totalHitLength = totalHitLength + 1;
			}
			console.log(totalHitLength, "totalHitLengthtotalHitLength");
			if (totalHitLength > 0) {
				for (let i = 0; i < totalHitLength; i++) {
					if (i == 0) {
						let sqlForRecord = ` SELECT card_insider_users.*, ((card_insider_users.id  * 555)+ 555) as params_id  FROM public.card_insider_users ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecord");
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex");
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
							if (allRecord.length == 0){
								allRecord = getAllData.rows;
							}
							
							console.log(lastRecordId, "lastRecordIdlastRecordId");
						}

					} else {
						let sqlForRecord = ` SELECT card_insider_users.*, ((card_insider_users.id  * 555)+ 555) as params_id  FROM public.card_insider_users where id > ${lastRecordId} ORDER BY id LIMIT ${hitLimit} `;
						console.log(sqlForRecord, "sqlForRecordsqlForRecordsqlForRecord" , i);
						let getAllData = await pool.query(sqlForRecord);
						if (getAllData.rows.length > 0) {
							let lastDataIndex = getAllData.rows.length - 1;
							console.log(getAllData.rows.length , "getAllData.rows.lengthgetAllData.rows.length");
							console.log(lastDataIndex, "lastDataIndex " , i);
							//console.log(getAllData.rows[lastDataIndex], "lastRecord");
							lastRecordId = getAllData.rows[lastDataIndex].id;
							allRecord.push(...getAllData.rows);
							
							console.log(lastRecordId, "lastRecordIdlastRecordId" , i);
						}
					}
				}
			}
			console.log(allRecord.length ,totalCount )
			//if (totalCount != 0);
		}
		return allRecord;
		//console.log(totalCount);
	} catch (e) {
		console.log(e);
		return allRecord;
	}
}


userModelObj.getFilteredCiUsers = async function (body) {
    let { filterObject, pageNo, sort } = body
    let {
        id,
        params_id,
        ciu_first_name,
        ciu_last_name,
        ciu_email,
        ciu_number,
        ciu_verified,
        from_created_at,
        to_created_at,
        from_updated_at,
        to_updated_at,
        published_at,
        entriesPerPage
    } = filterObject
    id = id || ""
    ciu_first_name = ciu_first_name || ""
    ciu_last_name = ciu_last_name || ""
    ciu_email = ciu_email || ""
    ciu_number = ciu_number || ""
    published_at =
        published_at === undefined || published_at === "any" ? "" : published_at
    entriesPerPage = entriesPerPage || 10
    sort = sort || "id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc'
    }
    from_updated_at_date = new Date(from_updated_at)
    from_updated_at = from_updated_at ? `${from_updated_at_date.getFullYear()}-${(from_updated_at_date.getMonth() + 1).toString().padStart(2, 0)}-${(from_updated_at_date.getDate()).toString().padStart(2, 0)} 00:00:01.001 +0530` : `1970-01-01 00:00:01.001 +0530`

    to_updated_at_date = to_updated_at ? new Date(to_updated_at) : new Date()
    to_updated_at = `${to_updated_at_date.getFullYear()}-${(to_updated_at_date.getMonth() + 1).toString().padStart(2, 0)}-${(to_updated_at_date.getDate()).toString().padStart(2, 0)} 23:59:59.999 +0530`

    from_created_at_date = new Date(from_created_at)
    from_created_at = from_created_at ? `${from_created_at_date.getFullYear()}-${(from_created_at_date.getMonth() + 1).toString().padStart(2, 0)}-${(from_created_at_date.getDate()).toString().padStart(2, 0)} 00:00:01.001 +0530` : `1970-01-01 00:00:01.001 +0530`

    to_created_at_date = to_created_at ? new Date(to_created_at) : new Date()
    to_created_at = `${to_created_at_date.getFullYear()}-${(to_created_at_date.getMonth() + 1).toString().padStart(2, 0)}-${(to_created_at_date.getDate()).toString().padStart(2, 0)} 23:59:59.999 +0530`

    let returnDataFromModal = []
    let cData
    try {
        const query = `
        SELECT *, ((ciu.id  * 555)+ 555) as params_id  from card_insider_users ciu
            where
            ${id ? `ciu."id"::Text = '${id}' AND` : ''}
            ${params_id ? `((ciu.id  * 555)+ 555)::Text = '${params_id}' AND` : ''}
            ${ciu_number ? `ciu."ciu_number"::Text = '${ciu_number}' AND` : ''}
            ${ciu_first_name ? `LOWER(ciu."ciu_first_name")::Text Like '%${ciu_first_name.toLowerCase()}%' AND` : ''}
            ${ciu_last_name ? `LOWER(ciu."ciu_last_name")::Text Like '%${ciu_last_name.toLowerCase()}%' AND` : ''}
            ${ciu_email ? `LOWER(ciu."ciu_email")::Text Like '%${ciu_email.toLowerCase()}%' AND` : ''}
            ${ciu_verified !== undefined ? `"ciu_verified"='${ciu_verified}' AND ` : ``}
            ciu."created_at"  >= '${from_created_at}' AND  ciu."created_at"<= '${to_created_at}' AND
            ciu."updated_at"  >= '${from_updated_at}' AND  ciu."updated_at"<= '${to_updated_at}' 
            ${(published_at === 'Draft') ? "AND ciu.published_at IS NULL" : (published_at === 'Published' ? "AND ciu.published_at IS NOT NULL" : "")}
            ORDER By "${sort}" ${ascDesc}
            limit ${entriesPerPage} offset ${offset};
        `
        const qData = await pool.query(query)
        returnDataFromModal = qData.rows
        cData = await pool.query(
            `SELECT count(*)
                 from card_insider_users ciu
            where
            ${id ? `ciu."id"::Text = '${id}' AND` : ''}
            ${params_id ? `((ciu.id  * 555)+ 555)::Text = '${params_id}' AND` : ''}
            ${ciu_number ? `ciu."ciu_number"::Text = '${ciu_number}' AND` : ''}
            ${ciu_first_name ? `LOWER(ciu."ciu_first_name")::Text Like '%${ciu_first_name.toLowerCase()}%' AND` : ''}
            ${ciu_last_name ? `LOWER(ciu."ciu_last_name")::Text Like '%${ciu_last_name.toLowerCase()}%' AND` : ''}
            ${ciu_email ? `LOWER(ciu."ciu_email")::Text Like '%${ciu_email.toLowerCase()}%' AND` : ''}
            ${ciu_verified !== undefined ? `"ciu_verified"='${ciu_verified}' AND ` : ``}
            ciu."created_at"  >= '${from_created_at}' AND  ciu."created_at"<= '${to_created_at}' AND
            ciu."updated_at"  >= '${from_updated_at}' AND  ciu."updated_at"<= '${to_updated_at}' 
            ${(published_at === 'Draft') ? "AND ciu.published_at IS NULL" : (published_at === 'Published' ? "AND ciu.published_at IS NOT NULL" : "")}
            `)
        return { returnDataFromModal, count: cData.rows[0].count }
    }
    catch (err) {
        console.error(err)
        return []
    }
}

userModelObj.fetchInternalUsers = async function () {
    let returnData = []
    try {
        const qData = await pool.query("select * from user_admin; ")
        returnData = qData.rows
    } catch (err) {
        console.error(err)
        //console.log(err)
    }
    return returnData
}

userModelObj.fetchCiUserById = async function (id) {
    let returnData = {}
    let refferId
    const q1 = `SELECT * FROM card_insider_users where id='${id}'`
    const q2 = `SELECT method,account_name,account_number,bank_name,ifsc_code,upi_id FROM account_informations where card_insider_user='${id}'`
    const q3 = `SELECT  id,"Application_number" FROM card_applications where card_insider_user='${id}'`
    const q4 = `SELECT ciuc."credit-card_id" as id,cc."CreditCardName" FROM card_insider_users__credit_cards ciuc left join credit_cards cc on cc.id=ciuc."credit-card_id" where ciuc."card_insider_user_id"='${id}'`

    try {
        const runq1 = await pool.query(q1)
        refferId = runq1.rows[0]['referred_by']
        const q5 = `Select card_insider_users.id, (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '')
        THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as "FullName"
        from card_insider_users where id='${refferId}'`
        const runq2 = await pool.query(q2)
        const runq3 = await pool.query(q3)
        const runq4 = await pool.query(q4)
        const runq5 = refferId ? await pool.query(q5) : ""
        returnData = { ...runq1.rows[0], account_information: { ...runq2.rows[0] }, creditCards: runq4.rows, cardApplications: runq3.rows, refferedBy: runq5 ? runq5.rows : [] }

    } catch (error) {
        console.error(error)
        returnData = error
    }
    return returnData
}

userModelObj.getRefferalNamesForRelation = async function () {
    let rData = []
    let qToDB = `Select card_insider_users.id, (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '')
THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as "FullName"
from card_insider_users where "published_at" IS NOT null and ciu_verified = true and ciu_first_name is NOT NULL ORDER by ciu_first_name asc;`
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        return rData
    } catch (err) {
        console.error(err)
    }
}
userModelObj.getCardApplicationsForRelation = async function () {
    let rData = []
    let qToDB = `Select id,"Application_number" FROM card_applications where "published_at" IS NOT NULL ORDER by "Application_number" ASC;`
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        return rData
    } catch (err) {
        console.error(err)
    }
}
userModelObj.fetchAccountInformations = async function () {
    let returnData = []
    try {
        const query = await pool.query(`SELECT account_informations.*, card_insider_users.id as ciu_id,
            (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name 
            FROM account_informations
            LEFT JOIN card_insider_users ON account_informations.card_insider_user = card_insider_users.id ORDER BY ID ASC;`)
        returnData = query.rows
    } catch (err) {
        //console.log(err)
    }
    return returnData
}

userModelObj.updateCiUserById = async function (userId, updatedUser, strapi_id) {
    const {
        ciu_first_name,
        ciu_last_name,
        ciu_email,
        ciu_number,
        ciu_verified,
        Referral_commission_paid,
        cashback_claimed,
        iOSCheck,
        ciu_pancard,
        ciu_dob,
        ciu_address1,
        ciu_address2,
        ciu_pincode,
        ciu_gender,
        ciu_annual_income,
        fcm_token,
        Referrers_approved,
        refer_amount,
        account_information
    } = updatedUser
    const {
        method,
        account_name,
        account_number,
        bank_name,
        ifsc_code,
        upi_id,
    } = account_information
    const q1 = `
        UPDATE card_insider_users SET
        "ciu_first_name"= $$${ciu_first_name}$$,
        "ciu_last_name"= $$${ciu_last_name}$$,
        "ciu_email"= $$${ciu_email}$$,
        ${ciu_number ? `"ciu_number"= '${ciu_number}',` : ''}
        "ciu_pancard"= $$${ciu_pancard}$$,
        "ciu_address1"= $$${ciu_address1}$$,
        "ciu_address2"= $$${ciu_address2}$$,
        ${ciu_pincode ? `"ciu_pincode"= '${ciu_pincode}',` : ''}
        "ciu_gender"= '${ciu_gender}',
        "ciu_annual_income"= '${ciu_annual_income}',
        "fcm_token"= $$${fcm_token}$$,
        ${Referrers_approved ? `"Referrers_approved"= '${Referrers_approved}',` : ''}
        ${refer_amount ? `"refer_amount"= '${refer_amount}',` : ''}
        "ciu_verified"= '${ciu_verified}',
        "Referral_commission_paid"= '${Referral_commission_paid}',
        "cashback_claimed"= '${cashback_claimed}',
        ${ciu_dob ? `"ciu_dob"= '${ciu_dob}',` : ''}
        "iOSCheck"= '${iOSCheck}',
        "updated_by"='${strapi_id}'
         WHERE ID =  ${userId}
        RETURNING *;
        `
    const q2 = `
    INSERT into account_informations ("method","account_name","account_number","bank_name","ifsc_code","upi_id","updated_by","card_insider_user") values ('${method}',$$${account_name}$$,$$${account_number}$$,'${bank_name}','${ifsc_code}','${upi_id}','${strapi_id}','${userId}') 
    ON CONFLICT ("card_insider_user") DO
    UPDATE SET
        "method"=excluded."method",
        "account_name"=excluded."account_name",
        "account_number"=excluded."account_number",
        "bank_name"=excluded."bank_name",
        "ifsc_code"=excluded."ifsc_code",
        "upi_id"=excluded."upi_id",
        "updated_by"=excluded."updated_by"
        RETURNING *;
    `

    try {
        // console.log(q1)
        let runq1 = await pool.query(q1)
        console.log(q2)
        let runq2 = await pool.query(q2)
        // console.log(runq2.rows)
        return 'success'
    } catch (err) {
        console.error(err)
        return 'failed'
    }
}

userModelObj.fetchAllUsersFcmTokens = async function () {
    let returnData = []
    try {
        const query = await pool.query(`Select "card_insider_users".id, "card_insider_users".fcm_token from "card_insider_users"; `)
        returnData = query.rows
    } catch (error) {
        //console.log(error);

    }
    return returnData
}


module.exports = userModelObj