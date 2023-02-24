const { pool } = require("../../../configration/database")
const notificationService = require('../common/firebaseService/scheduleNotification')
const upiVerificationService = require('../common/upiVerification/upiVerification');
const commonModel = require('../model/commonModel');


let cashbackModelObj = {}

cashbackModelObj.getcashbackClaims = async function (userId) {
    let returnData = []
    let qData = `
    SELECT card_insider_users.id as user_id , card_insider_users.ciu_number, card_insider_users.ciu_first_name, card_insider_users.cashback_claimed,
	account_informations.id as account_info_id, account_informations.method, account_informations.account_name, account_informations.account_number,
	account_informations.bank_name, account_informations.ifsc_code, account_informations.upi_id
	from  card_insider_users
	LEFT JOIN account_informations ON card_insider_users.id = account_informations.card_insider_user 
	where card_insider_users.cashback_claimed = true
    `
    if (userId != "") {
        qData = qData + " AND card_insider_users.id = " + userId
    }
    try {
        const query = await pool.query(qData)
        ////console.log(query);
        returnData = query.rows
    } catch (err) {
        ////console.log(err);
        returnData = err
    }
    return returnData
}
cashbackModelObj.getTotalRefrealSql = async function (userId) {
    let returnData = []
    const qData =
        `
    SELECT * FROM card_insider_users where "referred_by" = ` +
        userId +
        ` AND "Referrers_approved" = 1 AND ("Referral_commission_paid" IS NULL OR "Referral_commission_paid" = false);
    `
    try {

        const query = await pool.query(qData)
        // console.log(query);
        returnData = query.rows
    } catch (err) {
        ////console.log(err);
        returnData = err
    }
    return returnData
}
cashbackModelObj.getTotalApplicationsCBSql = async function (userId) {
    let returnData = []
    const qData =
        `
    SELECT * FROM card_applications where  "card_insider_user" = ` +
        userId +
        ` AND "Application_Status" = 'Approved' AND ("Cashback_paid" IS NULL OR "Cashback_paid" = false)
    `
    try {
        const query = await pool.query(qData)
        ////console.log(query);
        returnData = query.rows
    } catch (err) {
        ////console.log(err);
        returnData = err
    }
    return returnData
}

cashbackModelObj.getFilteredApprovedApplications = async function (body) {
    let { filterObject, pageNo, sort } = body

    let {
        entriesPerPage,
        id,
        Application_number,
        Phone_Number,
        card_issuer,
        credit_card,
        Cashback_applicable,
        Cashback_to_be_paid,
        Cashback_paid,
        from_application_date,
        to_application_date,
        user_name
    } = filterObject
    sort = sort || "id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc'
    }
    // console.log({ from_application_date, to_application_date })
    let queryToDb = `
    SELECT ca.* , ci."IssuerName", cc."CreditCardName" ,
    (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name
    FROM "card_applications" ca
    LEFT JOIN "card_issuers" ci ON ca."card_issuer"= ci."id"
    LEFT JOIN "credit_cards" cc ON ca."credit_card"=cc."id"
    LEFT JOIN card_insider_users ON ca."card_insider_user" = card_insider_users.id

    where 
     ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    ca."Application_Status" = 'Approved' AND 
    ca."application_through" = 'ciapp' AND
    ${id ? `ca."id"::Text='${id}' AND ` : ''}
    ${Application_number ? `ca."Application_number"::Text='${Application_number}' AND \n` : ''}
    ${Phone_Number ? `ca."Phone_Number"::Text='${Phone_Number}' AND \n` : ''}
    ${card_issuer ? `ca."card_issuer"::Text='${card_issuer}' AND \n` : ''}
    ${credit_card ? `ca."credit_card"::Text='${credit_card}' AND \n` : ''}
    ${Cashback_to_be_paid ? `ca."Cashback_to_be_paid"::Text='${Cashback_to_be_paid}' AND \n` : ''}
    ${from_application_date ? `ca."Application_date">='${from_application_date}' AND ` : ``}
    ${to_application_date ? `ca."Application_date"<='${to_application_date}' AND ` : ``}
    ${Cashback_paid === 'true' ? `ca."Cashback_paid" = true AND` : (Cashback_paid === 'false' ? `(ca."Cashback_paid" is not true) AND` : ``)}
    ${Cashback_applicable === 'true' ? `ca."Cashback_applicable" = true AND` : (Cashback_applicable === 'false' ? `(ca."Cashback_paid" is not true) AND` : ``)}
    ORDER By "${sort}" ${ascDesc}
    limit ${entriesPerPage} offset ${offset};
    ;
    `
    let countQuery = `
    SELECT count(*)
    FROM "card_applications" ca
    LEFT JOIN "card_issuers" ci ON ca."card_issuer" = ci."id"
    LEFT JOIN "credit_cards" cc ON ca."credit_card" = cc."id"
    LEFT JOIN card_insider_users ON ca."card_insider_user" = card_insider_users.id

    where
     ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    ca."Application_Status" = 'Approved' AND
    ca."application_through" = 'ciapp' AND
    ${id ? `ca."id"::Text='${id}' AND ` : ''}
    ${Application_number ? `ca."Application_number"::Text='${Application_number}' AND \n` : ''}
    ${Phone_Number ? `ca."Phone_Number"::Text='${Phone_Number}' AND \n` : ''}
    ${card_issuer ? `ca."card_issuer"::Text='${card_issuer}' AND \n` : ''}
    ${credit_card ? `ca."credit_card"::Text='${credit_card}' AND \n` : ''}
    ${Cashback_to_be_paid ? `ca."Cashback_to_be_paid"::Text = '${Cashback_to_be_paid}' AND \n` : ''}
    ${from_application_date ? `ca."Application_date">='${from_application_date}' AND ` : ``}
    ${to_application_date ? `ca."Application_date"<='${to_application_date}' AND ` : ``}
    ${Cashback_paid === 'true' ? `ca."Cashback_paid" = true AND` : (Cashback_paid === 'false' ? `(ca."Cashback_paid" is not true) AND` : ``)}
    ${Cashback_applicable === 'true' ? `ca."Cashback_applicable" = true AND` : (Cashback_applicable === 'false' ? `(ca."Cashback_paid" is not true) AND` : ``)}
    ;
    `

    queryToDb = queryToDb.replace(/AND\s+ORDER/, 'ORDER')
    countQuery = countQuery.replace(/AND\s+;/, ';')
    // console.log(queryToDb)
    // console.log("\n\n ", countQuery);
    try {
        let dataFromQuery = await pool.query(queryToDb)
        let cData = await pool.query(countQuery)
        return { returnDataFromModal: dataFromQuery.rows, count: cData.rows[0].count }
    } catch (err) {
        console.log(err)
        return { returnDataFromModal: [], count: 0 }
    }
}


// approved mark as paid here...........

cashbackModelObj.approvedMarkAsPaid = async function (list) {
    // console.log(list)
    let returnData = false
    let idString = ``
    list.forEach(elem => {
        idString += `${elem.id},`
    })
    idString = idString.slice(0, -1)
    let queryToDb = `UPDATE "card_applications" SET "Cashback_paid" = ${!list[0]['Cashback_paid']} WHERE ID in (${idString});`
    if (list.length > 0) {

        try {
            const query = await pool.query(queryToDb)
            ////console.log(query);
            returnData = query.rows
        } catch (err) {
            //console.log(err);
            returnData = false
        }
    }
    return returnData
}


cashbackModelObj.getUserFcmForPushNotification = async function (userId) {
    if (userId && userId != "") {

        try {
            let query = `SELECT id, fcm_token FROM card_insider_users where id = $1; `
            let queryResponse = await pool.query(query, [userId])
            return queryResponse.rows

        } catch (error) {
            return false
        }

    } else {
        return false
    }
}


cashbackModelObj.setCashbackReferralsPaid = async function (userId, checkCashback, checkReferrals) {
    let returnData = {}
    if (userId != undefined) {
        let notificationFcm = ""
        let sendCashbackNotification = false
        let sendReferralsNotification = false


        let userFcm = await cashbackModelObj.getUserFcmForPushNotification(userId)

        if (userFcm.length > 0) {
            notificationFcm = userFcm[0]['fcm_token']
        }


        if (checkCashback) {
            let totalUserCashBack = await cashbackModelObj.getTotalApplicationsCBSql(userId)

            // console.log(totalUserCashBack, "total cash back")

            let updateCashbackQuery = ""

            if (totalUserCashBack.length > 0) {
                for (let i = 0; i < totalUserCashBack.length; i++) {
                    // console.log(totalUserCashBack[i]['Cashback_to_be_paid'], "----cash----", totalUserCashBack[i]['Cashback_paid'])
                    updateCashbackQuery = updateCashbackQuery + `UPDATE card_applications SET "Cashback_paid" = true where id = ${totalUserCashBack[i]['id']} ;`
                }
            }



            if (totalUserCashBack.length > 0) {
                sendCashbackNotification = true
            }


            try {
                if (updateCashbackQuery != "") {
                    // console.log("in cashback query")
                    // console.log(updateCashbackQuery, "-----")
                    let cashQuery = await pool.query(updateCashbackQuery)
                    returnData.cashback = cashQuery
                }


            } catch (err) {
                console.log(err)
                returnData = false
            }

        }

        if (checkReferrals) {

            let totalUserReferrals = await cashbackModelObj.getTotalRefrealSql(userId)
            // console.log(totalUserReferrals, "total referrals ")

            let updateReferralsQuery = ""

            if (totalUserReferrals.length > 0) {
                for (let i = 0; i < totalUserReferrals.length; i++) {
                    // console.log(totalUserReferrals[i]['refer_amount'], "----cash----", totalUserReferrals[i]['Referral_commission_paid'])
                    updateReferralsQuery = updateReferralsQuery + `UPDATE card_insider_users SET "Referral_commission_paid" = true where id = ${totalUserReferrals[i]['id']} ;`
                }
            }




            if (totalUserReferrals.length > 0) {
                sendReferralsNotification = true

            }

            try {

                if (updateReferralsQuery != "") {
                    // console.log("in referrals query")
                    // console.log(updateReferralsQuery, "-----")
                    const referralQuery = await pool.query(updateReferralsQuery)
                    returnData.referral = referralQuery
                }


            } catch (err) {
                console.log(err)

                returnData = false
            }

        }

        // console.log(userFcm, "userfcm")
        // console.log(sendCashbackNotification, "send cashback notification")

        // console.log(sendReferralsNotification, "send referrals notification")

        // console.log(returnData, "in return data")

        if (sendCashbackNotification && sendReferralsNotification) {
            // console.log("\n\n\n---- send both notification ---\n\n\n to \n\n\n fcm ------ ", notificationFcm)



            // let notificationResponse = await notificationService.sendCashbackReferralsNotification({
            //     notificationTitle: "Your CASHBACK💰 Has been paid!🤩",
            //     body: "Congrats! We have transferred the cashback which you have earned via Card Insider App to your Account. If you liked the service please take time to rate us",
            //     imgUrl: "https://cardinsider.com/wp-content/uploads/2022/09/cardinsiderapp.jpg",
            //     token: notificationFcm
            // })
            // console.log("\n\n ", notificationResponse, "\n\n\n")

        } else if (sendCashbackNotification) {
            // console.log("\n\n\n---- send sendCashbackNotification notification ---\n\n\n to \n\n\n fcm ------ ", notificationFcm)

            // let notificationResponse = await notificationService.sendCashbackReferralsNotification({
            //     notificationTitle: "Your CASHBACK💰 Has been paid!🤩",
            //     body: "Congrats! We have transferred the cashback which you have earned via Card Insider App to your Account. If you liked the service please take time to rate us",
            //     imgUrl: "https://cardinsider.com/wp-content/uploads/2022/09/cardinsiderapp.jpg",
            //     token: notificationFcm,

            // })
            // console.log("\n\n ", notificationResponse, "\n\n\n")

        } else if (sendReferralsNotification) {
            // console.log("\n\n\n---- send sendReferralsNotification notification ---\n\n\n to \n\n\n fcm ------ ", notificationFcm)

            // let notificationResponse = await notificationService.sendCashbackReferralsNotification({
            //     notificationTitle: "Your Referral Commission💰 Has been paid!🤩",
            //     body: "Congrats! We have transferred the Referral Commission which you have earned via Card Insider App to your Account. If you liked the service please take time to rate us.",
            //     imgUrl: "https://cardinsider.com/wp-content/uploads/2022/09/cardinsiderapp.jpg",
            //     token: notificationFcm,

            // })
            // console.log("\n\n ", notificationResponse, "\n\n\n")
        }

        //  Unsubscribe claim_cashback_request topic here

        // let unsubcribeResponse = notificationService.unSubscribeFromTopic(notificationFcm, "claim_cashback_request")

        // console.log("unsubsribe response -----: - ", unsubcribeResponse)



        return returnData


    } else {
        console.error("id required ")
        return returnData
    }

}



cashbackModelObj.getFilteredCashbackClaims = async function (body) {

    let { filterObject, pageNo, sort } = body

    let {
        entriesPerPage,
        user_id,
        ciu_number,
        user_name,
        payment_method,
        is_upi_valid,
        is_bank_valid,
        upi_valid_name,
        bank_valid_name
    } = filterObject

    sort = sort || "user_id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc'
    }


    let dbQuery = ` SELECT card_insider_users.id as user_id , card_insider_users.ciu_number, card_insider_users.cashback_claimed,
	account_informations.id as account_info_id, account_informations.method as payment_method, account_informations.account_name, account_informations.account_number,
	account_informations.bank_name, account_informations.ifsc_code, account_informations.upi_id,account_informations.is_upi_valid,account_informations.is_bank_valid,account_informations.upi_valid_name,account_informations.bank_valid_name,
    (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name
	from  card_insider_users
	LEFT JOIN account_informations ON card_insider_users.id = account_informations.card_insider_user 
	where 
    ${is_upi_valid === 'true' ? `account_informations."is_upi_valid" is true AND ` : (is_upi_valid === 'false' ? `account_informations."is_upi_valid" is not true AND ` : ``)}
    ${is_bank_valid === 'true' ? `account_informations."is_bank_valid" is true AND ` : (is_bank_valid === 'false' ? `account_informations."is_bank_valid" is not true AND ` : ``)}
    ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    card_insider_users.cashback_claimed = true AND
    ${user_id ? `card_insider_users.id::Text='${user_id}' AND ` : ''}
    ${upi_valid_name ? `LOWER (account_informations.upi_valid_name)::Text LIKE '%${upi_valid_name.toLowerCase()}%' AND ` : ''}
    ${bank_valid_name ? `LOWER (account_informations.bank_valid_name)::Text LIKE '%${bank_valid_name.toLowerCase()}%' AND ` : ''}
    ${ciu_number ? `card_insider_users."ciu_number"::Text='${ciu_number}' AND \n` : ''}
    ${payment_method ? `account_informations."method"::Text='${payment_method}' AND \n` : ''}
    ORDER By "${sort}" ${ascDesc}
    limit ${entriesPerPage} offset ${offset};`


    let countQuery = `SELECT count(*)
    from  card_insider_users
	LEFT JOIN account_informations ON card_insider_users.id = account_informations.card_insider_user 
	where 
    ${is_upi_valid === 'true' ? `account_informations."is_upi_valid" is true AND ` : (is_upi_valid === 'false' ? `account_informations."is_upi_valid" is not true AND ` : ``)}
    ${is_bank_valid === 'true' ? `account_informations."is_bank_valid" is true AND ` : (is_bank_valid === 'false' ? `account_informations."is_bank_valid" is not true AND ` : ``)}
    ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    card_insider_users.cashback_claimed = true AND
    ${user_id ? `AND card_insider_users.id::Text='${user_id}' ` : ''}
    ${upi_valid_name ? `LOWER (account_informations.upi_valid_name)::Text LIKE '%${upi_valid_name.toLowerCase()}%' AND ` : ''}
    ${bank_valid_name ? `LOWER (account_informations.bank_valid_name)::Text LIKE '%${bank_valid_name.toLowerCase()}%' AND ` : ''}
    ${ciu_number ? `AND card_insider_users."ciu_number"::Text='${ciu_number}' AND\n` : ''}
    ${payment_method ? `account_informations."method"::Text='${payment_method}' AND \n` : ''}
    ;`

    dbQuery = dbQuery.replace(/AND\s+ORDER/, 'ORDER')
    countQuery = countQuery.replace(/AND\s+;/, ';')

    console.log(dbQuery, "----- db query \n")
    console.log(countQuery, "----- count query \n")


    try {
        let dataFromQuery = await pool.query(dbQuery)
        let cData = await pool.query(countQuery)
        returnDataFromModal = dataFromQuery.rows
        let dataAddToList = {
            amountFrom: "",
            amount: "",
            refredToId: "",
            refredToName: "",
            applicationNumber: "",
            refredToEmail: "",
        }

        if (returnDataFromModal && returnDataFromModal.length > 0) {
            let getTotalRefrealOfUser = 0
            for (let i = 0; i < returnDataFromModal.length; i++) {
                returnDataFromModal[i].totalCasback = 0
                returnDataFromModal[i].totalReferrelCasback = 0
                returnDataFromModal[i].totalApplicationCasback = 0
                returnDataFromModal[i].refredAndCBList = []
                // //console.log(returnDataFromModal[i].user_id , 'returnDataFromModal[i].user_idreturnDataFromModal[i].user_id');
                let earnReffSqlData = await cashbackModelObj.getTotalRefrealSql(
                    returnDataFromModal[i].user_id
                )
                ////console.log(earnReffSqlData , "earnReffSqlData");
                if (earnReffSqlData && earnReffSqlData.length > 0) {
                    for (let k = 0; k < earnReffSqlData.length; k++) {
                        if (earnReffSqlData[k].refer_amount > 0) {
                            //refredToList.push
                            returnDataFromModal[i].totalReferrelCasback =
                                returnDataFromModal[i].totalReferrelCasback +
                                Number(earnReffSqlData[k].refer_amount)
                            dataAddToList.amountFrom = "Referral"
                            dataAddToList.amount = earnReffSqlData[k].refer_amount
                            dataAddToList.refredToId = earnReffSqlData[k].id
                            dataAddToList.refredToEmail = earnReffSqlData[k].ciu_email
                            dataAddToList.refredToNumber = earnReffSqlData[k].ciu_number
                            dataAddToList.applicationNumber = "-"
                            dataAddToList.refredToName =
                                earnReffSqlData[k].ciu_first_name +
                                " " +
                                earnReffSqlData[k].ciu_last_name

                            returnDataFromModal[i].refredAndCBList.push(JSON.stringify(dataAddToList))
                        }
                    }
                }
                //returnDataFromModal[i].totalCasback = returnDataFromModal[i].totalCasback + returnDataFromModal[i].totalReferrelCasback;
                // getTotalRefrealOfUser = getTotalRefrealOfUser + returnDataFromModal[i].totalCasback;

                let earnApplicationCashBack =
                    await cashbackModelObj.getTotalApplicationsCBSql(returnDataFromModal[i].user_id)
                // //console.log(earnApplicationCashBack , "earnReffSqlData");
                if (earnApplicationCashBack && earnApplicationCashBack.length > 0) {
                    for (let r = 0; r < earnApplicationCashBack.length; r++) {
                        if (earnApplicationCashBack[r].Cashback_to_be_paid > 0) {
                            returnDataFromModal[i].totalApplicationCasback =
                                returnDataFromModal[i].totalApplicationCasback +
                                Number(earnApplicationCashBack[r].Cashback_to_be_paid)
                            dataAddToList.amountFrom = "Application"
                            dataAddToList.amount =
                                earnApplicationCashBack[r].Cashback_to_be_paid
                            dataAddToList.refredToId = "-"
                            dataAddToList.refredToEmail = "-"
                            dataAddToList.refredToNumber = "-"
                            dataAddToList.applicationNumber =
                                earnApplicationCashBack[r].application_number
                            dataAddToList.refredToName = "-"

                            returnDataFromModal[i].refredAndCBList.push(JSON.stringify(dataAddToList))
                        }
                    }
                }
                returnDataFromModal[i].totalCasback =
                    returnDataFromModal[i].totalCasback +
                    returnDataFromModal[i].totalReferrelCasback +
                    returnDataFromModal[i].totalApplicationCasback
                getTotalRefrealOfUser = getTotalRefrealOfUser + returnDataFromModal[i].totalCasback
            }
        }


        return { returnDataFromModal, count: cData.rows[0].count }
    } catch (err) {
        console.log(err)
        return { returnDataFromModal: [], count: 0 }
    }



}


// cashbackModelObj.getTransactionReportData = async function (body) {

//     let returnData = [];
//     let queryToDb = `SELECT approved_payment_tables.*,
//     (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name
//     FROM approved_payment_tables
//     LEFT JOIN card_insider_users ON card_insider_users.id = approved_payment_tables.user_id;`
//     try {
//         console.log(queryToDb);
//         const dataFromDb = await pool.query(queryToDb);
//         returnData = dataFromDb.rows
//     } catch (err) {
//         console.log(err);
//         returnData = [];
//     }
//     return returnData;

// }

cashbackModelObj.getTransactionReportData = async function (body) {
    console.log(body, "bodybodybodybody")
    let returnData = {
        paymentData: [],
        count: 0,
        lastId: ""
    };

    let limit = ' limit 10';
    let whereCondition = '';
    let selectoptions = 'approved_payment_tables.* ';
    let offset = 0;
    let sortingBy = 'id';
    let sortOrder = 'DESC';

    if (body.limit && body.limit > 0) {
        limit = `limit ` + body.limit;
    }

    if (body.pageNo && body.pageNo > 0) {
        offset = (body.pageNo * body.limit) - body.limit;
    }

    let isNullCondition = ``;
    let isNotNullCondition = ``;
    let otherFilter = ``;
    let arrayFilter = ``;
    let dateFiltter = ``;
    if (body) {
        if (body.sort_asec && body.sort_asec.length > 0) {
            sortingBy = '';
            sortingBy = sortingBy + body.sort_asec;
            sortOrder = 'ASC';
        }
        if (body.sort_desc && body.sort_desc.length > 0) {
            sortingBy = '';
            sortingBy = sortingBy = body.sort_desc;
            sortOrder = 'DESC';
        }
        if (body.null && body.null.length > 0) {
            for (let l = 0; l < body.null.length; l++) {
                isNullCondition = isNullCondition + 'approved_payment_tables.' + body.null[l] + ` is null `;
                if (l != body.null.length - 1) {
                    isNullCondition = isNullCondition + ` AND `;
                }
            }
        }
        if (body.notNull && body.notNull.length > 0) {
            for (let l = 0; l < body.notNull.length; l++) {
                isNotNullCondition = isNotNullCondition + 'approved_payment_tables.' + body.notNull[l] + ` is not null `;
                if (l != body.notNull.length - 1) {
                    isNotNullCondition = isNotNullCondition + ` AND `;
                }
            }
        }
        if (body.filter && Object.keys(body.filter).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.filter)) {
                if (value) {
                    console.log(`${key}: ${value}`);
                    if (key == 'id') {
                        otherFilter = otherFilter + ` approved_payment_tables.${key} = ${value}`;
                    } else {
                        if (value == 'false') {
                            otherFilter = otherFilter + `( ${key} = '${value}' OR ${key} IS NULL)`;
                        } else {
                            otherFilter = otherFilter + ` ${key} = '${value}'`;
                        }

                    }

                }


                numLoop++;
                if (otherFilter && otherFilter != '' && numLoop != Object.keys(body.filter).length) {
                    otherFilter = otherFilter + ` AND `;
                }
            }
        }
        if (body.select && Object.keys(body.select).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.select)) {
                console.log(`${key}: ${value}`);
                arrayFilter = arrayFilter + ` '${value}' = any(${key}) `;
                numLoop++;
                if (numLoop != Object.keys(body.select).length) {
                    arrayFilter = arrayFilter + ` AND `;
                }
            }
        }
        if (body.date && Object.keys(body.date).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.date)) {
                console.log(`${key}: ${value}`);
                let splitedValue = value.split('to');
                console.log(splitedValue, "splitedValuesplitedValue");
                if (splitedValue && splitedValue.length > 1) {
                    dateFiltter = dateFiltter + ` approved_payment_tables.${key}::date >= date '${splitedValue[0]}' AND approved_payment_tables.${key}::date <= date '${splitedValue[1]}'`;
                } else {
                    dateFiltter = dateFiltter + ` approved_payment_tables.${key} ::date = date '${value}'`;
                }

                numLoop++;
                if (numLoop != Object.keys(body.date).length) {
                    dateFiltter = dateFiltter + ` AND `;
                }
            }
        }
    }

    if (isNullCondition && isNullCondition != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + isNullCondition;
        } else {
            whereCondition = `where ` + isNullCondition;
        }

    }
    if (isNotNullCondition && isNotNullCondition != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + isNotNullCondition;
        } else {
            whereCondition = `where ` + isNotNullCondition;
        }

    }

    if (otherFilter && otherFilter != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + otherFilter;
        } else {
            whereCondition = `where ` + otherFilter;
        }

    }

    if (arrayFilter && arrayFilter != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + arrayFilter;
        } else {
            whereCondition = `where ` + arrayFilter;
        }

    }
    if (dateFiltter && dateFiltter != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + dateFiltter;
        } else {
            whereCondition = `where ` + dateFiltter;
        }

    }


    console.log(whereCondition, "isNullConditionisNullCondition");
    if (body.newClaimedPayment){
        if (whereCondition == ''){
            whereCondition = whereCondition + ` where `;
        } else {
            whereCondition = whereCondition + ` AND  `;
        }
        whereCondition = whereCondition + ` (approved_payment_tables.is_paid is null OR approved_payment_tables.is_paid = false) AND cashback_claimed = 'true' AND (is_upi_valid IS NULL OR is_bank_valid IS NULL)`;
    }

    let newSelect = `, CAST(approved_payment_tables.created_at as varchar) , CAST(approved_payment_tables.updated_at as varchar)  , (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name , cashback_claimed , account_informations.method , account_informations.upi_id , account_informations.is_upi_valid , 
    account_informations.is_bank_valid , account_informations.upi_valid_name`;

    let leftJoin = ` 
    LEFT JOIN card_insider_users ON card_insider_users.id = approved_payment_tables.user_id
    LEFT JOIN account_informations ON account_informations.card_insider_user = card_insider_users.id
     `;


    let getAllApplicationsSql = `SELECT ${selectoptions} ${newSelect}  FROM public.approved_payment_tables ${leftJoin}   ${whereCondition}
     ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset}`;
    console.log(getAllApplicationsSql, "getAllApplicationsSqlgetAllApplicationsSql")
    let result = await commonModel.getDataOrCount(getAllApplicationsSql, [], 'D');


    let queryForCount = `SELECT Count(*) FROM public.approved_payment_tables ${leftJoin} ${whereCondition}`;
    let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');

    if (totalCount && totalCount.length > 0) {
        returnData.count = totalCount[0].count;
    }
    //console.log(result[6]);
    returnData.paymentData = result;
    return returnData;
}



module.exports = cashbackModelObj