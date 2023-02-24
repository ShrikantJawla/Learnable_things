const { pool } = require("../../../configration/database")

let creditCardModel = {}

/* ===========>>>>>>>>>    fetching Credit cards list <<<<<<<<<<<======================= */

creditCardModel.getFilteredCreditCards = async function (body) {
    console.log(body, "bodybodybodybodybodybody");
    let { filterObject, pageNo, sort } = body
    let {
        entriesPerPage,
        id,
        CreditCardName,
        applyNow,
        Highlights,
        updated_by,
        card_issuer,
        published_at,
        creditreportshowcard,
    } = filterObject
    console.log(filterObject , "filterObjectfilterObject");
    id = id || ""
    CreditCardName = CreditCardName || ""
    applyNow = applyNow === undefined || applyNow === "any" ? "any" : applyNow
    Highlights = Highlights || ""
    updated_by = updated_by || ""
    card_issuer = card_issuer || ""
    published_at =
        published_at === undefined || published_at === "any" ? "" : published_at
    entriesPerPage = entriesPerPage || 10
    card_issuer =
        card_issuer === undefined || card_issuer === "any" ? "" : card_issuer
    sort = sort || "id";
    creditreportshowcard = creditreportshowcard === undefined || creditreportshowcard === "any" ? "any" : creditreportshowcard

    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc NULLS FIRST'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc NULLS LAST'
    }
    let returnDataFromModel = []
    let cData
    // 
    try {
        // credit_cards."updated_by"::Text Like '%${updated_by}%' AND
        let sqlQuery = `SELECT credit_cards.*,card_issuers."IssuerName" , upload_file.url as cardImage ,ua1.ua_name AS updated_by_admin_name, 
        ua2.ua_name AS created_by_admin_name FROM credit_cards
        LEFT JOIN user_admin AS ua1 
        ON ua1.strapi_user_id = credit_cards.updated_by
        LEFT JOIN user_admin AS ua2 
        ON ua2.strapi_user_id = credit_cards.created_by
        LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "credit_cards"."id" 
        And upload_file_morph.related_type = 'credit_cards' And upload_file_morph.field = 'CreditCardImage'
        LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id 
        LEFT JOIN card_issuers ON credit_cards.card_issuer = card_issuers.id 
        where
        ${id ? `credit_cards."id"::Text = '${id}' AND` : ''}
        (Lower(ua1.ua_name)::Text Like '%${updated_by.toLowerCase()}%' OR ua1.ua_name IS NULL) AND
        (Lower(credit_cards."CreditCardName")::Text Like '%${CreditCardName.toLowerCase()}%' OR credit_cards."CreditCardName" IS NULL )AND
        (Lower(credit_cards."Highlights")::Text Like '%${Highlights.toLowerCase()}%'
        OR credit_cards."Highlights" IS NULL) AND
        ${applyNow === 'any' ? '' : `credit_cards."applyNow" IS ${applyNow === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
        ${creditreportshowcard === 'any' ? '' : `credit_cards."creditreportshowcard" IS ${creditreportshowcard === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
        (Lower(card_issuers."IssuerName")::Text Like '%${card_issuer.toLowerCase()}%' OR card_issuers."IssuerName" IS NULL)
        ${(published_at === 'Draft') ? "AND credit_cards.published_at IS NULL" : (published_at === 'Published' ? "AND credit_cards.published_at IS NOT NULL" : "")}
        ORDER By "${sort}" ${ascDesc}
        limit ${entriesPerPage} offset ${offset};`;
        console.log(sqlQuery, "sqlQuerysqlQuerysqlQuery");
        const qData = await pool.query(
            sqlQuery
        )
        returnDataFromModel = qData.rows
        cData = await pool.query(

            `SELECT count(*)
                FROM credit_cards
                LEFT JOIN user_admin AS ua1
                ON ua1.strapi_user_id = credit_cards.updated_by
                LEFT JOIN user_admin AS ua2
                ON ua2.strapi_user_id = credit_cards.created_by
                LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "credit_cards"."id"
                And upload_file_morph.related_type = 'credit_cards' And upload_file_morph.field = 'CreditCardImage'
                LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id
                LEFT JOIN card_issuers ON credit_cards.card_issuer = card_issuers.id
                where
                ${id ? `credit_cards."id"::Text = '${id}' AND` : ''}
                (Lower(ua1.ua_name)::Text Like '%${updated_by.toLowerCase()}%' OR ua1.ua_name IS NULL) AND
                (Lower(credit_cards."CreditCardName")::Text Like '%${CreditCardName.toLowerCase()}%' OR credit_cards."CreditCardName" IS NULL )AND
                (Lower(credit_cards."Highlights")::Text Like '%${Highlights.toLowerCase()}%'
                OR credit_cards."Highlights" IS NULL) AND
                ${applyNow === 'any' ? '' : `credit_cards."applyNow" IS ${applyNow === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
                ${creditreportshowcard === 'any' ? '' : `credit_cards."creditreportshowcard" IS ${creditreportshowcard === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
                (Lower(card_issuers."IssuerName")::Text Like '%${card_issuer.toLowerCase()}%' OR card_issuers."IssuerName" IS NULL)
                ${(published_at === 'Draft') ? "AND credit_cards.published_at IS NULL" : (published_at === 'Published' ? "AND credit_cards.published_at IS NOT NULL" : "")}
                `

        )
    } catch (err) {
        console.error(err)
    }
    return { returnDataFromModel, count: cData.rows[0].count }
}

creditCardModel.getFilteredCardIssuers = async function (body) {
   // 
    let { filterObject, pageNo, sort } = body
    console.log(filterObject , "filterObjectfilterObject");
    let { entriesPerPage, id, IssuerName, ApplyNow, published_at , creditreportshow} = filterObject

    id = id || ""
    IssuerName = IssuerName || ""
    ApplyNow = ApplyNow === undefined || ApplyNow === "any" ? "any" : ApplyNow
    creditreportshow = creditreportshow === undefined || creditreportshow === "any" ? "any" : creditreportshow;
    published_at =
        published_at === undefined || published_at === "any" ? "" : published_at
    entriesPerPage = entriesPerPage || 10
    sort = sort || "id"


    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc NULLS FIRST'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc NULLS LAST'
    }
    let returnDataFromModel = []
    let cData
    //
    try {

        const qData = await pool.query(
            `SELECT card_issuers.* FROM card_issuers
                where
                ${id ? `card_issuers."id"::Text = '${id}' AND` : ''}
                ${ApplyNow === 'any' ? '' : `card_issuers."ApplyNow" IS ${ApplyNow === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
                ${creditreportshow === 'any' ? '' : `card_issuers."creditreportshow" IS ${creditreportshow === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
                (Lower(card_issuers."IssuerName")::Text Like '%${IssuerName.toLowerCase()}%' OR card_issuers."IssuerName" IS NULL)
                 ${(published_at === 'Draft') ? "AND card_issuers.published_at IS NULL" : (published_at === 'Published' ? "AND card_issuers.published_at IS NOT NULL" : "")}
                ORDER By "${sort}" ${ascDesc}
                limit ${entriesPerPage} offset ${offset};`
        )
        returnDataFromModel = qData.rows
        cData = await pool.query(
            `SELECT count(*)
                FROM card_issuers
                where
                ${id ? `card_issuers."id"::Text = '${id}' AND` : ''}
                ${ApplyNow === 'any' ? '' : `card_issuers."ApplyNow" IS ${ApplyNow === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
                ${creditreportshow === 'any' ? '' : `card_issuers."creditreportshow" IS ${creditreportshow === 'true' ? 'TRUE' : 'NOT TRUE'} AND`}
                (Lower(card_issuers."IssuerName")::Text Like '%${IssuerName.toLowerCase()}%' OR card_issuers."IssuerName" IS NULL)
                 ${(published_at === 'Draft') ? "AND card_issuers.published_at IS NULL" : (published_at === 'Published' ? "AND card_issuers.published_at IS NOT NULL" : "")};
                `
        )
    } catch (err) {
        console.error(err)
    }
    return { returnDataFromModel, count: cData.rows[0].count }
}
creditCardModel.fetchCreditCardsList = async function () {
    let returnData = []

    try {
        const query = await pool.query("SELECT * from credit_cards")
        returnData = query.rows
    } catch (error) {
        console.error(error)
    }


    return returnData
}

creditCardModel.fetchCreditCardByCardIssuer = async function (issuerId) {
    let returnData = []
    if (issuerId) {
        let id = issuerId
        try {
            const query = await pool.query(`select id, "CreditCardName"  , "sheet_name" from credit_cards where card_issuer = '${id}'  ORDER BY "CreditCardName" asc`)
            returnData = query.rows
        } catch (error) {
            console.error(error)
        }

    }
    return returnData
}


creditCardModel.fetchCreditCardNamesForRelation = async function () {
    let rData = []
    let qToDB = `SELECT credit_cards.id, credit_cards."CreditCardName" FROM credit_cards where "published_at" IS NOT NULL  ORDER BY "CreditCardName" ASC;`
    try {
        const qdata = await pool.query(qToDB)
        rData = qdata.rows

    } catch (error) {
        console.error(error)
    }
    return rData
}

creditCardModel.fetchCreditCardNamesForRelationPresentInCardApplications = async function () {
    let rData = []
    let qToDB = `
                SELECT credit_cards.id, credit_cards."CreditCardName" FROM  credit_cards  WHERE
                id IN (
                    SELECT credit_card
                    FROM card_applications  
                )
                ORDER BY "CreditCardName" ASC
                `
    try {
        const qdata = await pool.query(qToDB)
        rData = qdata.rows

    } catch (error) {
        console.error(error)
    }
    return rData
}

/* ===========>>>>>>>>>    fetching Credit Issuers list <<<<<<<<<<<======================= */

creditCardModel.fetchCardIssuersList = async function (req, res, next) {
    let returnData = []
    try {
        const rrData = await pool.query(`SELECT * from card_issuers  where "published_at" IS NOT NULL ORDER BY "IssuerName" asc;`)
        returnData = rrData.rows
    } catch (error) {
        console.error(error)
    }

    return returnData
}
creditCardModel.fetchCardIssuersListPresentInCardApplications = async function (req, res, next) {
    let returnData = []
    try {
        const rrData = await pool.query(`
                SELECT * from card_issuers WHERE
                id IN (
                    SELECT card_issuer
                    FROM card_applications  
                )
                ORDER BY "IssuerName" asc;`
        )
        returnData = rrData.rows
    } catch (error) {
        console.error(error)
    }

    return returnData
}
creditCardModel.fetchCardIssuerById = async function (id) {
    let rData = {}
    try {
        const qData = await pool.query(`  SELECT  card_issuers.*, upload_file.url as issuer_logo,ua."ua_name", ucii.url as bank_image FROM public.card_issuers 
         LEFT JOIN user_admin ua on card_issuers."updated_by"=ua."strapi_user_id"
        LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "card_issuers"."id" 
        And upload_file_morph.related_type = 'card_issuers' And upload_file_morph.field = 'Logo'
        LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id 
        LEFT JOIN "upload_file_morph" as cil ON "cil"."related_id" = "card_issuers"."id" 
        And cil.related_type = 'card_issuers' And cil.field = 'BankImage'
        LEFT JOIN "upload_file" as ucii ON ucii.id = cil.upload_file_id  WHERE card_issuers.id = ${id}`)
        const ccData = await pool.query(`Select id,"CreditCardName" from credit_cards WHERE card_issuer=${id} and published_at IS NOT NULL`)
        const oData = await pool.query(`
                               Select cio."offer_id" as id,offers."OfferName" from public.card_issuers_offers__offers_card_issuers cio
                                LEFT JOIN offers  on offers."id"= cio."offer_id"
                                WHERE cio."card-issuer_id"=${id}  and published_at IS NOT NULL`)
        rData = { ...qData.rows[0], creditCards: ccData.rows, offers: oData.rows }
        console.log(rData)
    } catch (err) {

        console.error(err)
        rData = err
    }

    return rData
}
creditCardModel.updateCardIssuerById = async function (id, updatedCardIssuer, updated_by) {
    let { IssuerName,
        Website,
        CustomerCareNumbers,
        Description,
        CustomerCareEmail,
        StartingColor,
        EndColor,
        UniqueID,
        ApplyNow,
        ApplySequence,
        sequence,
        URL_launch_apply,
        Application_Tracking_Link,
        creditCards,
        creditreportshow,
        offers } = updatedCardIssuer
        console.log(updatedCardIssuer , "updatedCardIssuerupdatedCardIssuerupdatedCardIssuer");
    ApplyNow = ApplyNow || false
    URL_launch_apply = URL_launch_apply || false
    let applyNowSeqDuplicateRowsData, applyNowSeqDuplicateRows, SequenceDuplicateRowsData, SequenceDuplicateRows, uniqueIdSeqDuplicateRowsData, uniqueIdSeqDuplicateRows
    let errMsg = ''
    try {
        if (ApplySequence) {
            applyNowSeqDuplicateRowsData = await pool.query(`SELECT * FROM card_issuers where "ApplySequence"='${ApplySequence}'`)
            applyNowSeqDuplicateRows = applyNowSeqDuplicateRowsData.rows
        }
        if (sequence) {
            SequenceDuplicateRowsData = await pool.query(`SELECT * FROM card_issuers where "sequence"='${sequence}'`)
            SequenceDuplicateRows = SequenceDuplicateRowsData.rows
        }

        if (UniqueID) {
            uniqueIdSeqDuplicateRowsData = await pool.query(`SELECT * FROM card_issuers where "UniqueID"='${UniqueID}'`)
            uniqueIdSeqDuplicateRows = uniqueIdSeqDuplicateRowsData.rows
        }

        if (uniqueIdSeqDuplicateRows && uniqueIdSeqDuplicateRows.length && uniqueIdSeqDuplicateRows[0]['id'] * 1 !== id * 1) {
            errMsg += `Please choose a unique value for UNIQUE ID other than '${UniqueID}'.\n`
        }
        if (applyNowSeqDuplicateRows && applyNowSeqDuplicateRows.length && applyNowSeqDuplicateRows[0]['id'] * 1 !== id * 1) {
            errMsg += `Please choose a unique value for APPLY SEQUENCE other than '${ApplySequence}'.\n`
        }
        if (SequenceDuplicateRows && SequenceDuplicateRows.length && SequenceDuplicateRows[0]['id'] * 1 !== id * 1) {
            errMsg += `Please choose a unique value for SEQUENCE other than'${sequence}'.`
        }
        if (errMsg.length > 0) {
            return { 'msg': errMsg }
        }
        await pool.query(`
            UPDATE public.card_issuers SET
            "IssuerName"=$$${IssuerName}$$,
            "Website"=$$${Website}$$,
            "creditreportshow"=${creditreportshow},
            "CustomerCareNumbers"=$$${CustomerCareNumbers}$$,
            "Description"=$$${Description}$$,
            "CustomerCareEmail"=$$${CustomerCareEmail}$$,
            "StartingColor"=$$${StartingColor}$$,
            "EndColor"=$$${EndColor}$$,
            "ApplyNow"='${ApplyNow}',
            ${ApplySequence ? `"ApplySequence"='${ApplySequence}',` : '"ApplySequence"=null,'}
            ${sequence ? `"sequence"='${sequence}',` : '"sequence"=null,'}
            ${UniqueID ? `"UniqueID"='${UniqueID}',` : '"UniqueID"=null,'}
            "URL_launch_apply"='${URL_launch_apply}',
            "Application_Tracking_Link"=$$${Application_Tracking_Link}$$,
            "updated_at"=current_timestamp,
            "updated_by"=${updated_by}
            where id ='${id}'

        `)
        const ccData = await pool.query(`Select id,"CreditCardName" from credit_cards WHERE card_issuer=${id}`)
        const oData = await pool.query(`
                                Select cio."offer_id" as id,offers."OfferName" from public.card_issuers_offers__offers_card_issuers cio
                                    LEFT JOIN offers  on offers."id"= cio."offer_id"
                                    WHERE cio."card-issuer_id"=${id}`)

        let prevCreditCards = ccData.rows
        let prevOffers = oData.rows
        //QUERY IS FAILING AND DELETING MULTIPLE OFFERS AND MULTIPLE CREDIT CARDS // DONT UNCOMMENT THIS QUERY UNLESS YOU KNOW WHAT YOU ARE DOING
        // if (JSON.stringify(prevCreditCards) !== JSON.stringify(creditCards)) {
        //     await pool.query(`UPDATE credit_cards 
        //         SET card_issuer= null
        //         where card_issuer= ${id}`)
        //     for (i = 0; i < creditCards.length; i++) {
        //         await pool.query(`
        //         UPDATE credit_cards 
        //         SET card_issuer= ${id}
        //         where id=${creditCards[i].id}
        //         `)
        //     }

        // }
        // else {
        //     //console.log("Card Issuers----------- EQUAL")
        // }

        // if (JSON.stringify(prevOffers) !== JSON.stringify(offers)) {
        //     await pool.query(` DELETE FROM card_issuers_offers__offers_card_issuers where "card-issuer_id"= ${id}`)
        //     for (i = 0; i < offers.length; i++) {
        //         await pool.query(`INSERT INTO card_issuers_offers__offers_card_issuers  
        //         ("offer_id","card-issuer_id")
        //         VALUES ('${offers[i]['id']}','${id}')
        //         `)
        //     }

        // }
        // else {
        //     //console.log("Offers----------- EQUAL")
        // }
    }
    catch (err) {
        console.error(err)
    }
}
creditCardModel.postNewCardIssuerDataToDB = async function (dataToDB, strapi_id) {
    let rData = {}
    let { IssuerName,
        Website,
        CustomerCareNumbers,
        Description,
        CustomerCareEmail,
        StartingColor,
        EndColor,
        ApplyNow,
        UniqueID,
        ApplySequence,
        sequence,
        URL_launch_apply,
        Application_Tracking_Link,
        creditCards,
        offers } = dataToDB
    let IssuerId
    ApplyNow = ApplyNow || false
    URL_launch_apply = URL_launch_apply || false
    let qToDb = `INSERT INTO card_issuers 
    (
        "IssuerName",
        "Website",
        "CustomerCareNumbers",
        "Description",
        "CustomerCareEmail",
        "StartingColor",
        "EndColor",
        "ApplyNow",
        "ApplySequence",
        "sequence",
        "UniqueID",
        "URL_launch_apply",
        "Application_Tracking_Link",
        "created_by",
        "updated_by"
    )
    VALUES (
        $$${IssuerName}$$,
        $$${Website}$$,
        $$${CustomerCareNumbers}$$,
        $$${Description}$$,
        $$${CustomerCareEmail}$$,
        $$${StartingColor}$$,
        $$${EndColor}$$,
        '${ApplyNow}',
        ${ApplySequence ? `'${ApplySequence}',` : 'null,'}
        ${sequence ? `'${sequence}',` : 'null,'}
        ${UniqueID ? `'${UniqueID}',` : 'null,'}
        '${URL_launch_apply}',
        $$${Application_Tracking_Link}$$,
        ${strapi_id},
        ${strapi_id})
        RETURNING *
    `
    try {
        let applyNowSeqDuplicateRowsData, applyNowSeqDuplicateRows, SequenceDuplicateRowsData, SequenceDuplicateRows, uniqueIdSeqDuplicateRowsData, uniqueIdSeqDuplicateRows

        if (ApplySequence) {
            applyNowSeqDuplicateRowsData = await pool.query(`SELECT * FROM card_issuers where "ApplySequence"='${ApplySequence}'`)
            applyNowSeqDuplicateRows = applyNowSeqDuplicateRowsData.rows
        }
        if (sequence) {
            SequenceDuplicateRowsData = await pool.query(`SELECT * FROM card_issuers where "sequence"='${sequence}'`)
            SequenceDuplicateRows = SequenceDuplicateRowsData.rows
        }

        if (UniqueID) {
            uniqueIdSeqDuplicateRowsData = await pool.query(`SELECT * FROM card_issuers where "UniqueID"='${UniqueID}'`)
            uniqueIdSeqDuplicateRows = uniqueIdSeqDuplicateRowsData.rows
        }

        let errMsg = ''
        if (uniqueIdSeqDuplicateRows && uniqueIdSeqDuplicateRows.length) {
            errMsg += `Please choose a unique value for Unique ID other than ${UniqueID}.\n`
        }
        if (applyNowSeqDuplicateRows && applyNowSeqDuplicateRows.length) {
            errMsg += `Please choose a unique value for Apply Sequence other than ${ApplySequence}.\n`
        }
        if (SequenceDuplicateRows && SequenceDuplicateRows.length) {
            errMsg += `Please choose a unique value for Sequence other than ${sequence}.`
        }
        if (errMsg.length > 0) {
            return { 'msg': errMsg }
        }
        let qdata = await pool.query(qToDb)
        rData = qdata.rows[0]
        IssuerId = rData.id
        for (i = 0; i < creditCards.length; i++) {
            await pool.query(`
            UPDATE credit_cards 
            SET card_issuer= ${IssuerId}
            where id=${creditCards[i].id}
            `)
        }
        for (i = 0; i < offers.length; i++) {
            await pool.query(`INSERT INTO card_issuers_offers__offers_card_issuers  
            ("offer_id","card-issuer_id")
            VALUES ('${offers[i]['id']}','${IssuerId}')
            `)
        }


    }
    catch (err) {
        console.error(err)
    }
    return { id: IssuerId }
}


creditCardModel.fetchCreditCardById = async function (id) {
    let rData = {}
    let lData, oData, bsData, fData, feeData, cctData
    try {
        const qData = await pool.query(`
        SELECT credit_cards.*,card_issuers."IssuerName" ,ln."ListName",ua."ua_name" ,upload_file.url as cardImage FROM credit_cards
        LEFT JOIN user_admin ua on credit_cards."updated_by"=ua."strapi_user_id"
        LEFT JOIN "lounge_network_lists" ln on ln.id=credit_cards."lounge_network_list"
        LEFT JOIN card_issuers ON credit_cards.card_issuer = card_issuers.id
        LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "credit_cards"."id" 
        And upload_file_morph.related_type = 'credit_cards' And upload_file_morph.field = 'CreditCardImage'
        LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id 
        WHERE "credit_cards".id=${id}`)

        lData = await pool.query(`Select ccl."lounge-detail_id" as id, lounge_details."LoungeName" from
        credit_cards_lounge_details__lounge_details_credit_cards ccl
        left join lounge_details on ccl."lounge-detail_id"= lounge_details.id
        where ccl."credit-card_id"=${id} and published_at IS NOT NULL
        `)
        oData = await pool.query(`SELECT co."offer_id" as id,offers."OfferName" from 
        public.credit_cards_offers__offers_credit_cards co
        left join offers on co."offer_id" = offers."id"
        where co."credit-card_id"=${id} and published_at IS NOT NULL`)



        const bsComponentData = await pool.query(`SELECT ccc."component_id" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='BestSuitedFor'`)
        const featuresComponentData = await pool.query(`SELECT ccc."component_id" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='Features'`)
        const feeComponentData = await pool.query(`SELECT ccc."component_id" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='Fees'`)
        const cctComponentData = await pool.query(`SELECT ccc."component_id",ccc."component_type" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='CreditCardType'`)

        bsData = await pool.query(`SELECT cbs.* from components_best_suited_for_best_suited_fors cbs where id=${bsComponentData.rows[0].component_id}`)
        fData = await pool.query(`SELECT * from components_features_features where id=${featuresComponentData.rows[0].component_id}`)
        feeData = await pool.query(`SELECT * from components_fees_fees where id=${feeComponentData.rows[0].component_id}`)
        cctData = await pool.query(`Select * from ${cctComponentData.rows[0].component_type} where id=${cctComponentData.rows[0].component_id}`)

        let BestSuitedFor = bsData.rows[0]
        BestSuitedFor.id = undefined
        let Features = fData.rows[0]
        Features.id = undefined
        let Fees = feeData.rows[0]
        Fees.id = undefined
        Fees.Renewalfees = undefined
        Fees.RewardRedemption = undefined
        let CreditCardType = cctData.rows[0]
        CreditCardType.id = undefined
        if (CreditCardType.Type) {
            CreditCardType.Visa = CreditCardType.Type
            CreditCardType.Type = undefined
        }



        rData = { ...qData.rows[0], lounges: lData.rows, offers: oData.rows, BestSuitedFor, Features, ...Fees, CreditCardType }
        if (rData.card_issuer) {
            rData.card_issuer = [{
                id: rData.card_issuer,
                IssuerName: rData.IssuerName
            }]
            rData.IssuerName = undefined
        }
        if (rData.lounge_network_list) {
            rData.lounge_network_list = [{
                id: rData.lounge_network_list,
                ListName: rData.ListName
            }]
            rData.ListName = undefined
        }
        // rData = {
        //     ...qData.rows[0], lounges: lData.rows, offers: oData.rows,
        // }
    }
    catch (err) {
        console.error(err)
        rData = err
    }
    return rData
}
creditCardModel.postNewCreditCardDataToDB = async function (dataToDB, strapi_id) {
    let rData = {}
    let {
        CreditCardName,
        applyNow,
        CardRating,
        Applynowsequence,
        Apply_Link,
        featured_text,
        Highlights,
        WelcomeOffers,
        FeeReversal,
        JoiningFees,
        RenewalFees,
        BestSuitedFor,
        Features,
        card_issuer,
        lounge_network_list,
        lounges,
        offers,
        CreditCardType,
    } = dataToDB


    let { Movies, Travel, Dining, Fuel, Shopping } = BestSuitedFor
    Movies = Movies || 'false'
    Travel = Travel || 'false'
    Dining = Dining || 'false'
    Fuel = Fuel || 'false'
    Shopping = Shopping || 'false'
    applyNow = applyNow || 'false'
    const cctypes = {
        "AMEX": "components_amex_american_expresses",
        "DinersClub": "components_diners_club_diners_clubs",
        "MasterCard": "components_master_card_master_cards",
        "Visa": "components_visa_visas",
        "Rupay": "components_rupay_rupays",
    }
    //     creditCard: {
    //     CreditCardName: '123Name',
    //     applyNow: true,
    //     CardRating: '123',
    //     Applynowsequence: '123',
    //     Apply_Link: '123.com',
    //     featured_text: '123featuredText',
    //     Highlights: ' 123Highlights',
    //     WelcomeOffers: ' 123WelcomeOffers',
    //     FeeReversal: ' 123',
    //     JoiningFees: '123',
    //     RenewalFees: '123',
    //     BestSuitedFor: {
    //       Movies: true,
    //       Travel: true,
    //       Dining: true,
    //       Fuel: true,
    //       Shopping: true
    //     },
    //     Features: {
    //       Rewards: ' 123',
    //       Movie: ' 123',
    //       Dining: ' 123',
    //       Travel: ' 123',
    //       Lounge: ' 123',
    //       Golf: ' 123',
    //       Fuel: ' 123',
    //       RewardRedemption: ' 123'
    //     },
    //     card_issuer: '7',
    //     lounge_network_list: '3',
    //     lounges: [],
    //     offers: [],
    //     CreditCardType: {
    //       Visa: 'VisaClassic',
    //       Rupay: '',
    //       MasterCard: '',
    //       AMEX: false,
    //       DinersClub: false
    //     }
    //   }
    // }
    let qToDB = `INSERT into credit_cards 
    (
        "CreditCardName",        
        "applyNow",    
        "CardRating",    
        ${Applynowsequence ? `"Applynowsequence",` : ""}
        ${card_issuer && card_issuer.length ? `"card_issuer",` : ""}
        ${lounge_network_list && lounge_network_list.length ? `"lounge_network_list",` : ""}
        "Apply_Link",
        "featured_text",
        "Highlights",
        "WelcomeOffers",
        "FeeReversal",
        "created_by",
        "updated_by"
    )
    VALUES (
        $$${CreditCardName}$$,
        '${applyNow}',
        '${CardRating}',
        ${Applynowsequence ? `'${Applynowsequence}',` : ''}
        ${card_issuer && card_issuer.length ? `'${card_issuer[0]['id']}',` : ''}
        ${lounge_network_list && lounge_network_list.length ? `'${lounge_network_list[0]['id']}',` : ''}
        $$${Apply_Link}$$,
        $$${featured_text}$$,
        $$${Highlights}$$,
        $$${WelcomeOffers}$$,
        $$${FeeReversal}$$,
        ${strapi_id},
        ${strapi_id}     
    ) RETURNING *
    `
    try {
        let qData = await pool.query(qToDB)
        rData = qData.rows[0]
        for (i = 0; i < lounges.length; i++) {
            await pool.query(`INSERT INTO credit_cards_lounge_details__lounge_details_credit_cards
            ("lounge-detail_id","credit-card_id")
            VALUES ('${lounges[i]['id']}','${rData.id}')
            `)
        }
        for (i = 0; i < offers.length; i++) {
            await pool.query(`INSERT INTO credit_cards_offers__offers_credit_cards
            ("offer_id","credit-card_id")
            VALUES ('${offers[i]['id']}','${rData.id}')
            `)
        }
        const bsData = await pool.query(`
                Insert INTO public.components_best_suited_for_best_suited_fors
                (
                    "Movies",
                    "Travel",
                    "Dining",
                    "Fuel",
                    "Shopping"
                )
                VALUES
                (
                    '${Movies}',
                    '${Travel}',
                    '${Dining}',
                    '${Fuel}',
                    '${Shopping}'
                )
                Returning id
            `)
        await pool.query(`
                    INSERT INTO credit_cards_components
                    (
                        "field",
                        "order",
                        "component_type",
                        "component_id",
                        "credit_card_id"
                    )
                    VALUES
                    (
                        'BestSuitedFor',
                        '${1}',
                        'components_best_suited_for_best_suited_fors',
                        '${bsData.rows[0].id}',
                        '${rData.id}'
                    )
        `)
        const feeData = await pool.query(`
                    INSERT INTO public.components_fees_fees
                    (
                        "JoiningFees",
                        "RenewalFees"
                    )
                    VALUES
                    (
                        '${JoiningFees}',
                        '${RenewalFees}'
                    )
                    Returning id
            `)
        await pool.query(`
                    INSERT INTO credit_cards_components
                    (
                        "field",
                        "order",
                        "component_type",
                        "component_id",
                        "credit_card_id"
                    )
                    VALUES
                    (
                        'Fees',
                        '${1}',
                        'components_fees_fees',
                        '${feeData.rows[0].id}',
                        '${rData.id}'
                    )
        `)
        const featureData = await pool.query(`
                    INSERT INTO public.components_features_features
                    (
                        "Rewards",
                        "Movie",
                        "Dining",
                        "Travel",
                        "Lounge",
                        "Golf",
                        "Fuel",
                        "RewardRedemption"
                    )
                    VALUES
                    (
                        $$${Features['Rewards']}$$,
                        $$${Features['Movie']}$$,
                        $$${Features['Dining']}$$,
                        $$${Features['Travel']}$$,
                        $$${Features['Lounge']}$$,
                        $$${Features['Golf']}$$,
                        $$${Features['Fuel']}$$,
                        $$${Features['RewardRedemption']}$$

                    )
                    RETURNING id
            `)
        await pool.query(`
                    INSERT INTO credit_cards_components
                    (
                        "field",
                        "order",
                        "component_type",
                        "component_id",
                        "credit_card_id"
                    )
                    VALUES
                    (
                        'Features',
                        '${1}',
                        'components_features_features',
                        '${featureData.rows[0].id}',
                        '${rData.id}'
                    )
        `)
        let selectedCCType, selectedCCTypeTableName, selectedCCTypeColumnName
        Object.keys(CreditCardType).map(key => {
            if (CreditCardType[key] || CreditCardType[key].length) {
                selectedCCType = key
            }
        })
        switch (selectedCCType) {
            case 'Visa':
                selectedCCTypeTableName = 'components_visa_visas'
                break
            case 'Rupay':
                selectedCCTypeTableName = 'components_rupay_rupays'
                break
            case 'MasterCard':
                selectedCCTypeTableName = 'components_master_card_master_cards'
                break
            case 'AMEX':
                selectedCCTypeTableName = 'components_amex_american_expresses'
                break
            case 'DinersClub':
                selectedCCTypeTableName = 'components_diners_club_diners_clubs'
                break
            default:
                selectedCCTypeTableName = ''
        }

        if (selectedCCType === 'Visa')
            selectedCCTypeColumnName = 'Type'
        else
            selectedCCTypeColumnName = selectedCCType

        const ccTypeinsertQuery = await pool.query(`INSERT into ${selectedCCTypeTableName} 
        ("${selectedCCTypeColumnName}") VALUES ('${CreditCardType[selectedCCType]}') RETURNING id`)
        await pool.query(`
                    INSERT INTO credit_cards_components
                    (
                        "field",
                        "order",
                        "component_type",
                        "component_id",
                        "credit_card_id"
                    )
                    VALUES
                    (
                        'CreditCardType',
                        '${1}',
                        '${selectedCCTypeTableName}',
                        '${ccTypeinsertQuery.rows[0].id}',
                        '${rData.id}'
                    )
        `)
    }
    catch (err) {
        console.error(err)
    }
    return { id: rData.id }

}
creditCardModel.updateCreditCardById = async function (id, updatedCreditCard, updated_by) {
    const {
        CreditCardName,
        applyNow,
        CardRating,
        Applynowsequence,
        show_on_home,
        Apply_Link,
        featured_text,
        Highlights,
        WelcomeOffers,
        FeeReversal,
        JoiningFees,
        RenewalFees,
        BestSuitedFor,
        Features,
        card_issuer,
        lounge_network_list,
        lounges,
        offers,
        CreditCardType,
        creditreportshowcard
    } = updatedCreditCard

    console.log(updatedCreditCard , "updatedCreditCardupdatedCreditCardupdatedCreditCard");
    const { Movies, Travel, Dining, Fuel, Shopping } = BestSuitedFor
    const cctypes = {
        "AMEX": "components_amex_american_expresses",
        "DinersClub": "components_diners_club_diners_clubs",
        "MasterCard": "components_master_card_master_cards",
        "Visa": "components_visa_visas",
        "Rupay": "components_rupay_rupays",
    }

    try {
        // const applyNowSeqDuplicateRowsData = await pool.query(`SELECT * FROM credit_cards where "Applynowsequence"=${Applynowsequence}`)
        // const applyNowSeqDuplicateRows = applyNowSeqDuplicateRowsData.rows
        // if (applyNowSeqDuplicateRows && applyNowSeqDuplicateRows.length) {
        //     return { 'msg': `${Applynowsequence} exists. Please choose a unique value for Apply Sequence` }
        // }

        await pool.query(`
        UPDATE credit_cards SET
        "CreditCardName"=$$${CreditCardName}$$,
        "applyNow"='${applyNow}',
        "creditreportshowcard"=${creditreportshowcard},
        "CardRating"='${CardRating}',
        "Apply_Link"=$$${Apply_Link}$$,
        "featured_text"=$$${featured_text}$$,
        "Highlights"=$$${Highlights}$$,
        "show_on_home"=$$${show_on_home}$$,
        "WelcomeOffers"=$$${WelcomeOffers}$$,
        ${card_issuer && card_issuer.length ? `"card_issuer"='${card_issuer[0]['id']}',` : `"card_issuer" = null,`}
        ${Applynowsequence ? `"Applynowsequence"='${Applynowsequence}',` : ''}
        ${lounge_network_list && lounge_network_list.length ? `"lounge_network_list"='${lounge_network_list[0]['id']}',` : `"lounge_network_list" = null,`}
        "FeeReversal"=$$${FeeReversal}$$,
        "updated_at"=current_timestamp,
        "updated_by"=${updated_by}
        where id='${id}'
        `)
        lData = await pool.query(`Select ccl."lounge-detail_id" as id, lounge_details."LoungeName" from
        credit_cards_lounge_details__lounge_details_credit_cards ccl
        left join lounge_details on ccl."lounge-detail_id"= lounge_details.id
        where ccl."credit-card_id"=${id}
        `)
        oData = await pool.query(`SELECT co."offer_id" as id,offers."OfferName" from 
        public.credit_cards_offers__offers_credit_cards co
        left join offers on co."offer_id" = offers."id"
        where co."credit-card_id"=${id}`)
        let prevLounges = lData.rows
        let prevOffers = oData.rows
        if (JSON.stringify(prevLounges) !== JSON.stringify(lounges)) {
            await pool.query(` DELETE FROM credit_cards_lounge_details__lounge_details_credit_cards where "credit-card_id"= ${id}`)
            for (i = 0; i < lounges.length; i++) {
                await pool.query(`INSERT INTO credit_cards_lounge_details__lounge_details_credit_cards
            ("lounge-detail_id","credit-card_id")
            VALUES ('${lounges[i]['id']}','${id}')
            `)
            }

        }
        else {
            //console.log("Lounges----------- EQUAL")
        }
        if (JSON.stringify(prevOffers) !== JSON.stringify(offers)) {
            await pool.query(` DELETE FROM credit_cards_offers__offers_credit_cards where "credit-card_id"= ${id}`)
            for (i = 0; i < offers.length; i++) {
                await pool.query(`INSERT INTO credit_cards_offers__offers_credit_cards
            ("offer_id","credit-card_id")
            VALUES ('${offers[i]['id']}','${id}')
            `)
            }

        }
        else {
            //console.log("Offers----------- EQUAL")
        }

        const bsComponentData = await pool.query(`SELECT ccc."component_id" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='BestSuitedFor'`)
        const featuresComponentData = await pool.query(`SELECT ccc."component_id" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='Features'`)
        const feeComponentData = await pool.query(`SELECT ccc."component_id" from credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='Fees'`)

        await pool.query(`UPDATE public.components_fees_fees SET "JoiningFees"='${JoiningFees}',
        "RenewalFees"='${RenewalFees}' where id='${feeComponentData.rows[0].component_id}'`)
        await pool.query(`UPDATE public.components_best_suited_for_best_suited_fors SET
        "Movies"='${Movies}',
        "Travel"='${Travel}',
        "Dining"='${Dining}',
        "Fuel"='${Fuel}',
        "Shopping"='${Shopping}'
        where id='${bsComponentData.rows[0].component_id}'
        `)
        await pool.query(`UPDATE public.components_features_features SET
        "Rewards"=$$${Features.Rewards}$$,
        "Movie"=$$${Features.Movie}$$,
        "Dining"=$$${Features.Dining}$$,
        "Travel"=$$${Features.Travel}$$,
        "Lounge"=$$${Features.Lounge}$$,
        "Golf"=$$${Features.Golf}$$,
        "Fuel"=$$${Features.Fuel}$$,
        "RewardRedemption"=$$${Features.RewardRedemption}$$
        where id='${featuresComponentData.rows[0].component_id}'
        `)
        let selectedCCType, selectedCCTypeColumnName, selectedCCTypeTableName
        Object.keys(CreditCardType).map(key => {
            if (CreditCardType[key] || CreditCardType[key].length) {
                selectedCCType = key
            }
        })
        switch (selectedCCType) {
            case 'Visa':
                selectedCCTypeTableName = 'components_visa_visas'
                break
            case 'Rupay':
                selectedCCTypeTableName = 'components_rupay_rupays'
                break
            case 'MasterCard':
                selectedCCTypeTableName = 'components_master_card_master_cards'
                break
            case 'AMEX':
                selectedCCTypeTableName = 'components_amex_american_expresses'
                break
            case 'DinersClub':
                selectedCCTypeTableName = 'components_diners_club_diners_clubs'
                break
            default:
                selectedCCTypeTableName = ''
        }

        if (selectedCCType === 'Visa')
            selectedCCTypeColumnName = 'Type'
        else
            selectedCCTypeColumnName = selectedCCType

        const query = await pool.query(`SELECT * FROM credit_cards_components where "credit_card_id"=${id} AND field='CreditCardType' `)
        const { component_id, component_type } = query.rows[0]
        const deleteQuery = await pool.query(`DELETE FROM ${component_type} where "id"='${component_id}' 
        RETURNING *`)

        const insertQuery = await pool.query(`INSERT into ${selectedCCTypeTableName} 
        ("${selectedCCTypeColumnName}") VALUES ('${CreditCardType[selectedCCType]}') RETURNING *`)
        const updatedCardComponent = await pool.query(`UPDATE credit_cards_components SET 
        "component_type"='${selectedCCTypeTableName}',
        "component_id"='${insertQuery.rows[0].id}'
        where
        "credit_card_id"=${id} AND field='CreditCardType' 
        RETURNING *` )
        return 'success'
    }
    catch (err) {
        console.error(err)
    }

}


creditCardModel.deleteCreditCardById = async function (id) {
    try {
        // await pool.query(` DELETE FROM credit_cards_lounge_details__lounge_details_credit_cards where "credit-card_id"= ${id}`)
        // await pool.query(` DELETE FROM credit_cards_offers__offers_credit_cards where "credit-card_id"= ${id}`)
        // const bsComponentData = await pool.query(`Delete FROM  credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='BestSuitedFor' returning *`)
        // const featuresComponentData = await pool.query(`Delete FROM  credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='Features' returning *`)
        // const feeComponentData = await pool.query(`Delete FROM  credit_cards_components ccc where ccc."credit_card_id"=${id} AND ccc.field='Fees' returning *`)

        // await pool.query(`DELETE FROM public.components_fees_fees  where id='${feeComponentData.rows[0].component_id}' returning *`)
        // await pool.query(`DELETE FROM public.components_best_suited_for_best_suited_fors 
        // where id='${bsComponentData.rows[0].component_id}' returning *
        // `)
        // await pool.query(`DELETE FROM public.components_features_features 
        // where id='${featuresComponentData.rows[0].component_id}' returning *
        // `)
        // const query = await pool.query(`DELETE FROM credit_cards_components where "credit_card_id"=${id} AND field='CreditCardType' returning *`)
        // const { component_id, component_type } = query.rows[0]
        // await pool.query(`DELETE FROM ${component_type} where "id"='${component_id}' returning *`)
        // await pool.query(`DELETE FROM credit_cards where id='${id}'`)
        await pool.query(`UPDATE credit_cards set published_at=null where id=${id}`)
    }
    catch (err) {
        console.error(err)
    }
}

creditCardModel.deleteCardIssuerById = async function (id) {
    try {
        // await pool.query(`UPDATE credit_cards 
        //     SET 
        //     card_issuer= null,
        //     published_at=null
        //     where card_issuer= ${id}`)
        // await pool.query(` DELETE FROM card_issuers_offers__offers_card_issuers where "card-issuer_id"= ${id}`)
        // await pool.query(`DELETE FROM card_issuers where id='${id}'`)
        await pool.query(`UPDATE card_issuers set published_at=null where id=${id}`)
    } catch (err) {
        console.error(err)
    }
}

module.exports = creditCardModel