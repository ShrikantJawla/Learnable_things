let offerModelObj = {}
const res = require("express/lib/response")
const { pool } = require("../../../configration/database")
const htmlToFormattedText = require("html-to-formatted-text")
/* ===========>>>>>>>>>    Fetching  offers  here....   <<<<<<<<<<<======================= */



offerModelObj.fetchOfferById = async function (data) {
    if (data) {
        let returnData = []
        //TODO: have to work here
        try {
            const dbData = await pool.query(

                `SELECT offers.*,ua."ua_name" FROM offers
                LEFT JOIN user_admin ua on offers."updated_by"=ua."strapi_user_id"
                where id = ${data}`
            )
            // console.log({ "StartDate": dbData.rows[0].StartDate })
            // console.log({ "StartDate": dbData.rows[0].StartDate.toString() })
            // console.log({ "StartDate": dbData.rows[0].StartDate.toLocaleString() })
            // console.log(new Date(dbData.rows[0].StartDate.toString()))



            //WRONG WAY OF DOING THIS 

            const ccData = await pool.query(
                `SELECT offer_id,array_agg("credit-card_id") as credit_cards,
                    array_agg("credit_cards"."CreditCardName") as credit_names 
                    from "credit_cards_offers__offers_credit_cards" 
                    LEFT JOIN "credit_cards" ON "credit_cards_offers__offers_credit_cards"."credit-card_id" = "credit_cards".id 
                    where "offer_id" = ${data} and published_at IS NOT NULL Group by "offer_id";`
            )
            const bData = await pool.query(
                `SELECT offer_id,array_agg("brand_id") as brand_ids,
                    array_agg("brands"."BrandName") as brand_names 
                    from "brands_offers__offers_brands" 
                    LEFT JOIN "brands" ON "brands_offers__offers_brands"."brand_id" = "brands".id 
                    where "offer_id" = ${data} and published_at IS NOT NULL Group by "offer_id";`
            )
            const ciData = await pool.query(
                `SELECT offer_id,array_agg("card-issuer_id") as card_issuers_ids,
                    array_agg("card_issuers"."IssuerName") as card_issuer_names 
                    from "card_issuers_offers__offers_card_issuers" 
                    LEFT JOIN "card_issuers" ON "card_issuers_offers__offers_card_issuers"."card-issuer_id" = "card_issuers".id 
                    where "offer_id" = ${data} and published_at IS NOT NULL Group by "offer_id";`
            )
            let component_type, field, component_id, cardComponentType


            if (dbData.rows.length < 0 || dbData.rows == null || dbData.rows == "") {
                returnData = []
            } else {
                returnData = dbData.rows
                if (ccData.rows.length > 0 && ccData.rows[0].credit_names.length > 0) {
                    returnData[0].creditCards = []
                    for (i = 0; i < ccData.rows[0].credit_names.length; i++) {
                        returnData[0].creditCards.push({
                            id: ccData?.rows[0]?.credit_cards[i],
                            CreditCardName: ccData?.rows[0]?.credit_names[i]
                        })
                    }
                }
                if (bData.rows.length > 0 && bData.rows[0].brand_names.length > 0) {
                    returnData[0].brands = []
                    for (i = 0; i < bData.rows[0].brand_names.length; i++) {
                        returnData[0].brands.push({
                            id: bData?.rows[0]?.brand_ids[i],
                            BrandName: bData?.rows[0]?.brand_names[i]
                        })
                    }
                }
                if (ciData.rows.length > 0 && ciData.rows[0].card_issuer_names.length > 0) {
                    returnData[0].cardIssuers = []
                    for (i = 0; i < ciData.rows[0].card_issuer_names.length; i++) {
                        returnData[0].cardIssuers.push({
                            id: ciData?.rows[0]?.card_issuers_ids[i],
                            IssuerName: ciData?.rows[0]?.card_issuer_names[i]
                        })
                    }
                }
            }
            const cardNetworksData = await pool.query(
                `select field,component_type,component_id   from offers_components oc 
                    where oc.offer_id = ${data} `
            )
            if (cardNetworksData.rows && cardNetworksData.rows.length) {

                ({ component_type, field, component_id } = cardNetworksData.rows[0])
                let cctypedata
                if (component_type && component_id) {
                    if (component_type === 'components_visa_visas') {
                        cctypedata = await pool.query(
                            `select "ct"."Type" as cardcomponenttype from ${component_type} ct 
                               where ct.id = ${component_id};`
                        )
                    }
                    else if (component_type === 'components_rupay_rupays') {
                        cctypedata = await pool.query(
                            `select "ct"."Rupay" as cardcomponenttype from ${component_type} ct 
                               where ct.id = ${component_id};`
                        )
                    }
                    else {
                        cctypedata = await pool.query(
                            `select "ct"."MasterCard" as cardcomponenttype from ${component_type} ct 
                               where ct.id = ${component_id};`
                        )
                    }
                    let { cardcomponenttype } = cctypedata.rows[0]
                    cardComponentType = cardcomponenttype
                    returnData[0].field = field
                    returnData[0].cardComponentType = cardComponentType
                }
            }
        } catch (err) {
            //console.log(err)
        }
        var offset = new Date(returnData.StartDate).getTimezoneOffset()
        // console.log(offset)
        var offset2 = new Date(returnData.created_at).getTimezoneOffset()
        // console.log(offset2)
        // console.log(returnData)
        return returnData
    } else {
        return []
    }
}

offerModelObj.updateOfferById = async function (offerId, updatedOffer, updated_by) {
    const { Description, OfferName, BrandPrivate, SelectCardIssuer, StartDate, EndDate, OfferCategory, OfferType, FromWhere, Link, CouponCode, OfferLink, brands, creditCards, cardIssuers } = updatedOffer
    let brandReturn = []
    let cardIssuersReturn = []
    let creditCardReturn = []
    // console.log({ StartDate, EndDate })

    try {
        const q1 = `
        UPDATE offers SET 
        "Description" = $$${Description}$$ ,
        "OfferName" = $$${OfferName}$$ ,
        "BrandPrivate" = $$${BrandPrivate}$$ ,
        "SelectCardIssuer" = $$${SelectCardIssuer}$$ ,
        "StartDate" = '${StartDate}' ,
        "EndDate" = '${EndDate}' ,
        "OfferCategory" = '${OfferCategory}' ,
        "OfferType" = '${OfferType}' ,
        "updated_at"=current_timestamp,
        "updated_by"=${updated_by},
        ${Link ? `"Link" = $$${Link}$$,` : `"Link"=null,`}
        ${CouponCode ? `"CouponCode" = $$${CouponCode}$$,` : `"CouponCode"=null,`}
        ${OfferLink ? `"OfferLink" = $$${OfferLink}$$,` : `"OfferLink"=null,`}

        "FromWhere" = '${FromWhere}' 
        WHERE ID = ${offerId}
        RETURNING *;
        `
        await pool.query(q1)

        const ccData = await pool.query(
            `SELECT offer_id,array_agg("credit-card_id") as credit_cards,
                    array_agg("credit_cards"."CreditCardName") as credit_names 
                    from "credit_cards_offers__offers_credit_cards" 
                    LEFT JOIN "credit_cards" ON "credit_cards_offers__offers_credit_cards"."credit-card_id" = "credit_cards".id 
                    where "offer_id" = ${offerId} Group by "offer_id";`
        )
        const bData = await pool.query(
            `SELECT offer_id,array_agg("brand_id") as brand_ids,
                    array_agg("brands"."BrandName") as brand_names 
                    from "brands_offers__offers_brands" 
                    LEFT JOIN "brands" ON "brands_offers__offers_brands"."brand_id" = "brands".id 
                    where "offer_id" = ${offerId} Group by "offer_id";`
        )
        const ciData = await pool.query(
            `SELECT offer_id,array_agg("card-issuer_id") as card_issuers_ids,
                    array_agg("card_issuers"."IssuerName") as card_issuer_names 
                    from "card_issuers_offers__offers_card_issuers" 
                    LEFT JOIN "card_issuers" ON "card_issuers_offers__offers_card_issuers"."card-issuer_id" = "card_issuers".id 
                    where "offer_id" = ${offerId} Group by "offer_id";`
        )
        let prevBrands = bData.rows
        let prevCreditCards = ccData.rows
        let prevCardIssuers = ciData.rows
        if (JSON.stringify(prevBrands) !== JSON.stringify(brands)) {
            await pool.query(`delete from brands_offers__offers_brands 
                                            where offer_id =${offerId}`)
            if (brands && brands.length) {
                for (i = 0; i < brands.length; i++) {
                    let brandQData = await pool.query(`INSERT INTO brands_offers__offers_brands ("offer_id" , "brand_id") VALUES ('${offerId}' , '${brands[i].id}') RETURNING *;`)
                    brandReturn.push(brandQData.rows)
                }
            }

        }
        if (JSON.stringify(prevCreditCards) !== JSON.stringify(creditCards)) {
            await pool.query(`delete from credit_cards_offers__offers_credit_cards 
                                                where offer_id =${offerId}`)
            if (creditCards && creditCards.length) {
                for (i = 0; i < creditCards.length; i++) {
                    let creditCardQData = await pool.query(`INSERT INTO credit_cards_offers__offers_credit_cards ("offer_id" , "credit-card_id") VALUES ('${offerId}' , '${creditCards[i].id}') RETURNING *;`)
                    creditCardReturn.push(creditCardQData.rows)
                }
            }
        }
        if (JSON.stringify(prevCardIssuers) !== JSON.stringify(cardIssuers)) {
            await pool.query(`delete from card_issuers_offers__offers_card_issuers 
                                                where offer_id =${offerId}`)
            if (cardIssuers && cardIssuers.length) {
                for (i = 0; i < cardIssuers.length; i++) {
                    let cardIssuerQData = await pool.query(`INSERT INTO card_issuers_offers__offers_card_issuers ("offer_id" , "card-issuer_id") VALUES ('${offerId}' , '${updatedOffer.cardIssuers[i].id}') RETURNING *;`)
                    cardIssuersReturn.push(cardIssuerQData.rows)
                }
            }
        }
        let poc = await pool.query(`DELETE FROM offers_components where offer_id=${offerId} returning *`)
        if (poc && poc.rows.length > 0) {
            let { component_type, component_id } = poc.rows[0]
            await pool.query(`DELETE FROM ${component_type} where id=${component_id}`)

        }
        if (updatedOffer.visa) {
            let visaQData = await pool.query(`INSERT INTO components_visa_visas("Type")
                            VALUES('${updatedOffer.visa}') returning *`)
            await pool.query(` INSERT INTO offers_components("field", "order", "component_type", "component_id", "offer_id")
                            VALUES('Visa', 1, 'components_visa_visas', ${visaQData.rows[0].id}, ${offerId}) returning *;`)
        }
        if (updatedOffer.rupay) {
            let rupayQData = await pool.query(`INSERT INTO components_rupay_rupays("Rupay")
                            VALUES('${updatedOffer.rupay}') returning *`)
            await pool.query(` INSERT INTO offers_components("field", "order", "component_type", "component_id", "offer_id")
                            VALUES('Rupay', 1, 'components_rupay_rupays', ${rupayQData.rows[0].id}, ${offerId}) returning *;`)
        }
        if (updatedOffer.masterCard) {
            let masterCardQData = await pool.query(`INSERT INTO components_master_card_master_cards("MasterCard")
                            VALUES('${updatedOffer.masterCard}') returning *`)
            await pool.query(` INSERT INTO offers_components("field", "order", "component_type", "component_id", "offer_id")
                            VALUES('Mastercard', 1, 'components_master_card_master_cards', ${masterCardQData.rows[0].id}, ${offerId}) returning *;`)
        }
        return "success"
    } catch (err) {
        console.error(err)
        return 'error'
    }
}


/* ===========>>>>>>>>>      POsting new offer   here....   <<<<<<<<<<<======================= */

offerModelObj.postNewOfferDataToDB = async function (dataToDB, strapi_id) {

    let rData = {}
    let brandReturn = []
    let cardIssuersReturn = []
    let creditCardReturn = []
    // console.log(dataToDB.StartDate, dataToDB.EndDate)
    let qToDb = `INSERT INTO Offers 
    ("OfferName","Description","OfferCategory","OfferType","CouponCode", "StartDate", "EndDate", "Link", "OfferLink", "BrandPrivate", "SelectCardIssuer", "FromWhere","created_by","updated_by")
    VALUES ($$${dataToDB.OfferName}$$, $$${dataToDB.Description}$$, $$${dataToDB.OfferCategory}$$, $$${dataToDB.OfferType}$$,$$${dataToDB.CouponCode}$$, '${dataToDB.StartDate}', '${dataToDB.EndDate}', $$${dataToDB.Link}$$, $$${dataToDB.OfferLink}$$, $$${dataToDB.BrandPrivate}$$, $$${dataToDB.SelectCardIssuer}$$, '${dataToDB.FromWhere}',${strapi_id},${strapi_id} )
    RETURNING *;`
    try {
        let qData = await pool.query(qToDb)
        rData = qData.rows
    } catch (err) {
        console.error(err)
    }
    if (rData[0].id) {
        let offerId = rData[0].id
        if (dataToDB.brands && dataToDB.brands.length) {
            try {
                for (i = 0; i < dataToDB.brands.length; i++) {
                    let brandQData = await pool.query(`INSERT INTO brands_offers__offers_brands ("offer_id" , "brand_id") VALUES ('${offerId}' , '${dataToDB.brands[i]['id']}') RETURNING *;`)
                    brandReturn.push(brandQData.rows)
                }
            } catch (err) {
                console.error(err)
            }
        }
        if (dataToDB.cardIssuers && dataToDB.cardIssuers.length) {
            try {
                for (i = 0; i < dataToDB.cardIssuers.length; i++) {
                    let cardIssuerQData = await pool.query(`INSERT INTO card_issuers_offers__offers_card_issuers ("offer_id" , "card-issuer_id") VALUES ('${offerId}' , '${dataToDB.cardIssuers[i]['id']}') RETURNING *;`)
                    cardIssuersReturn.push(cardIssuerQData.rows)
                }
            } catch (err) {
                console.error(err)
            }
        }
        if (dataToDB.creditCards && dataToDB.creditCards.length) {
            try {
                for (i = 0; i < dataToDB.creditCards.length; i++) {
                    let creditCardQData = await pool.query(`INSERT INTO credit_cards_offers__offers_credit_cards ("offer_id" , "credit-card_id") VALUES ('${offerId}' , '${dataToDB.creditCards[i].id}') RETURNING *;`)
                    creditCardReturn.push(creditCardQData.rows)
                }
            } catch (err) {
                console.error(err)
            }
        }
        // if (dataToDB.visa) {
        //     try {
        //         let visaQData = await pool.query(`INSERT INTO components_visa_visas("Type")
        //         VALUES('${dataToDB.visa}') returning *`)
        //         await pool.query(` INSERT INTO offers_components("field", "order", "component_type", "component_id", "offer_id")
        //         VALUES('Visa', 1, 'components_visa_visas', ${visaQData.rows[0].id}, ${offerId}) returning *;`)
        //     }
        //     catch (err) {
        //         console.error(err)
        //     }
        // }
        // if (dataToDB.rupay) {
        //     try {
        //         let rupayQData = await pool.query(`INSERT INTO components_rupay_rupays("Rupay")
        //         VALUES('${dataToDB.rupay}') returning *`)
        //         await pool.query(` INSERT INTO offers_components("field", "order", "component_type", "component_id", "offer_id")
        //         VALUES('Rupay', 1, 'components_rupay_rupays', ${rupayQData.rows[0].id}, ${offerId}) returning *;`)
        //     }
        //     catch (err) {
        //         console.error(err)
        //     }
        // }
        // if (dataToDB.masterCard) {
        //     try {
        //         let masterCardQData = await pool.query(`INSERT INTO components_master_card_master_cards("MasterCard")
        //         VALUES('${dataToDB.masterCard}') returning *`)
        //         await pool.query(` INSERT INTO offers_components("field", "order", "component_type", "component_id", "offer_id")
        //         VALUES('Mastercard', 1, 'components_master_card_master_cards', ${masterCardQData.rows[0].id}, ${offerId}) returning *;`)
        //     }
        //     catch (err) {
        //         console.error(err)
        //     }
        // }
    }
    return { id: rData[0].id }
}

offerModelObj.getFilteredOffers = async function (body) {
    let { filterObject, pageNo, sort } = body
    let {
        entriesPerPage,
        id,
        OfferName,
        Description,
        BrandPrivate,
        UpdatedBy,
        published_at_type,
        FromWhere,
        OfferCategory,
        CardIssuer,
        OfferType,
        from_updated_at,
        from_End_Date,
        to_updated_at,
        to_End_Date,

    } = filterObject
    console.log({ pageNo })
    id = id || ""
    OfferName = OfferName || ""
    Description = Description || ""
    BrandPrivate = BrandPrivate || ""
    UpdatedBy = UpdatedBy || ""


    published_at_type =
        published_at_type === undefined || published_at_type === "any" ?
            "" :
            published_at_type
    FromWhere = FromWhere === undefined || FromWhere === "any" ? "" : FromWhere
    OfferCategory =
        OfferCategory === undefined || OfferCategory === "any" ? "" : OfferCategory
    CardIssuer =
        CardIssuer === undefined || CardIssuer === "any" ? "" : CardIssuer
    OfferType = OfferType === undefined || OfferType === "any" ? "" : OfferType

    entriesPerPage = entriesPerPage || 10
    sort = sort || "id"


    console.log({ from_updated_at, from_End_Date })
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc NULLS FIRST'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc NULLS LAST'
    }
    let returnDataFromModal = []
    let cData
    let dataQuery = `SELECT offers.*, ua1.ua_name AS updated_by_admin_name, 
                ua2.ua_name AS created_by_admin_name 
                FROM offers
                LEFT JOIN user_admin AS ua1 
                ON ua1.strapi_user_id = offers.updated_by
                LEFT JOIN user_admin AS ua2 
                ON ua2.strapi_user_id = offers.created_by
                where
                ${id ? `offers."id"::Text = '${id}' AND` : ''}
                ${OfferName ? `Lower(offers."OfferName")::Text Like '%${OfferName.toLowerCase()}%' AND` : ''}
                ${BrandPrivate ? `(LOWER(offers."BrandPrivate")::Text Like '%${BrandPrivate.toLowerCase()}%' OR offers."BrandPrivate" IS NULL) AND` : ''}
                ${from_updated_at ? `offers."updated_at"  >= '${from_updated_at}'::date AND` : ''}   
                ${to_updated_at ? `offers."updated_at"<= '${to_updated_at}'::date AND` : ''}
                ${from_End_Date ? `offers."EndDate"  >= '${from_End_Date}'::date AND` : ''}
                ${to_End_Date ? `offers."EndDate"<= '${to_End_Date}'::date AND` : ""} 
                ${UpdatedBy ? `LOWER(ua1."ua_name")::Text Like '%${UpdatedBy.toLowerCase()}%' AND` : ``}
                ${FromWhere ? `offers."FromWhere"::Text Like '%${FromWhere}%' AND` : ''}
                ${OfferCategory ? `offers."OfferCategory"::Text Like '%${OfferCategory}%' AND` : ""}
                ${CardIssuer ? `LOWER(offers."SelectCardIssuer")::Text ='${CardIssuer.toLowerCase()}' AND` : ''}
                ${OfferType ? `offers."OfferType"::Text Like '%${OfferType}%' AND` : ''}
                ${(published_at_type === 'Draft') ? "offers.published_at IS NULL" : (published_at_type === 'Published' ? "offers.published_at IS NOT NULL" : "")}
                ORDER By offers."${sort}" ${ascDesc}
                limit ${entriesPerPage} offset ${offset};`
    let countQuery = `SELECT count(*)
                FROM offers
                LEFT JOIN user_admin AS ua1
                ON ua1.strapi_user_id = offers.updated_by
                LEFT JOIN user_admin AS ua2
                ON ua2.strapi_user_id = offers.created_by
                where
               ${id ? `offers."id"::Text = '${id}' AND` : ''}
                ${OfferName ? `Lower(offers."OfferName")::Text Like '%${OfferName.toLowerCase()}%' AND` : ''}
                ${BrandPrivate ? `(LOWER(offers."BrandPrivate")::Text Like '%${BrandPrivate.toLowerCase()}%' OR offers."BrandPrivate" IS NULL) AND` : ''}
                ${from_updated_at ? `offers."updated_at"  >= '${from_updated_at}'::date AND` : ''}   
                ${to_updated_at ? `offers."updated_at"<= '${to_updated_at}'::date AND` : ''}
                ${from_End_Date ? `offers."EndDate"  >= '${from_End_Date}'::date AND` : ''}
                ${to_End_Date ? `offers."EndDate"<= '${to_End_Date}'::date AND` : ""} 
                ${UpdatedBy ? `LOWER(ua1."ua_name")::Text Like '%${UpdatedBy.toLowerCase()}%' AND` : ``}
                ${FromWhere ? `offers."FromWhere"::Text Like '%${FromWhere}%' AND` : ''}
                ${OfferCategory ? `offers."OfferCategory"::Text Like '%${OfferCategory}%' AND` : ""}
                ${CardIssuer ? `LOWER(offers."SelectCardIssuer")::Text ='${CardIssuer.toLowerCase()}' AND` : ''}
                ${OfferType ? `offers."OfferType"::Text Like '%${OfferType}%' AND` : ''}
                ${(published_at_type === 'Draft') ? "offers.published_at IS NULL" : (published_at_type === 'Published' ? "offers.published_at IS NOT NULL" : "")}
                ;`
    try {
        // offers."published_at" >= '${from_published_date}'::date AND  offers."published_at" <= '${to_published_date}'::date AND
        // offers."StartDate" >= '${from_start_date}'::date AND  offers."StartDate" <= '${to_start_date}'::date AND
        // offers."EndDate" >= '${from_expiry_date}'::date AND  offers."EndDate" <= '${to_expiry_date}':: date 
        dataQuery = dataQuery.replace(/where\s+ORDER/, 'ORDER')
        countQuery = countQuery.replace(/where\s+;/, ';')
        dataQuery = dataQuery.replace(/AND\s+ORDER/, 'ORDER')
        countQuery = countQuery.replace(/AND\s+;/, ';')
        console.log({ dataQuery, countQuery })
        const qData = await pool.query(dataQuery)
        // (LOWER(ua1."ua_name")::Text Like '%${UpdatedBy.toLowerCase()}%' OR ua1."ua_name" IS NULL) AND
        returnDataFromModal = qData.rows
        cData = await pool.query(countQuery)
        return {
            returnDataFromModal, count: cData.rows[0].count
        }
    } catch (err) {
        console.error(err)
    }

}
/* ===========>>>>>>>>>    Fetching  Brands   here....   <<<<<<<<<<<======================= */

offerModelObj.fetchBrandsList = async function (req, res, next) {
    let returnData = []

    try {
        const rrData = await pool.query("Select brands.* from brands")
        returnData = rrData.rows
    } catch (err) {
        console.error(err)
        returnData = err
    }
    return returnData
}

offerModelObj.getFilteredBrands = async function (body) {
    let { filterObject, pageNo, sort } = body
    let {
        entriesPerPage,
        id,
        BrandName,
        BrandWebsite,
        BrandAlexa,
        updated_by,
        published_at,
    } = filterObject
    id = id || ""
    BrandName = BrandName || ""
    BrandAlexa = BrandAlexa || ""
    BrandWebsite = BrandWebsite || ""
    updated_by = updated_by || ""
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
    let returnDataFromModal = []
    let cData
    try {
        const qData = await pool.query(
            `SELECT brands.*,ua1.ua_name AS updated_by_admin_name 
                FROM brands
                LEFT JOIN user_admin AS ua1 
                ON ua1.strapi_user_id = brands.updated_by
                where
                ${id ? `brands."id"::Text = '${id}' AND` : ''}
                (LOWER(brands."BrandName")::Text Like '%${BrandName.toLowerCase()}%' OR brands."BrandName" IS NULL) AND
                (LOWER(brands."BrandWebsite")::Text Like '%${BrandWebsite.toLowerCase()}%' OR brands."BrandWebsite" IS NULL) AND
                (Lower(ua1.ua_name)::Text Like '%${updated_by.toLowerCase()}%' OR ua1.ua_name IS NULL) AND
                (brands."BrandAlexa"::Text Like '%${BrandAlexa}%' OR brands."BrandAlexa" IS NULL)
                ${(published_at === 'Draft') ? "AND brands.published_at IS NULL" : (published_at === 'Published' ? "AND brands.published_at IS NOT NULL" : "")}
                ORDER By brands."${sort}" ${ascDesc}
                limit ${entriesPerPage} offset ${offset};`
        )
        returnDataFromModal = qData.rows
        cData = await pool.query(
            `SELECT count(*)
                FROM brands
                LEFT JOIN user_admin AS ua1
                ON ua1.strapi_user_id = brands.updated_by
                where
                ${id ? `brands."id"::Text = '${id}' AND` : ''}
                (LOWER(brands."BrandName")::Text Like '%${BrandName.toLowerCase()}%' OR brands."BrandName" IS NULL) AND
                (LOWER(brands."BrandWebsite")::Text Like '%${BrandWebsite.toLowerCase()}%' OR brands."BrandWebsite" IS NULL) AND
                (Lower(ua1.ua_name)::Text Like '%${updated_by.toLowerCase()}%' OR ua1.ua_name IS NULL) AND
                (brands."BrandAlexa"::Text Like '%${BrandAlexa}%' OR brands."BrandAlexa" IS NULL)
                ${(published_at === 'Draft') ? "AND brands.published_at IS NULL" : (published_at === 'Published' ? "AND brands.published_at IS NOT NULL" : "")}
    `
        )
        return { returnDataFromModal, count: cData.rows[0].count }
    } catch (err) {
        console.error(err)
    }
}

offerModelObj.fetchBrandDetailsById = async function (id) {
    let returnData = {}

    try {
        const qdata = await pool.query(`SELECT brands.* ,ua."ua_name" , upload_file.url as brandLogo, ubi.url as brandImage , ubbi.url as bigBrandImage FROM brands 
        LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "brands"."id" 
        And upload_file_morph.related_type = 'brands' And upload_file_morph.field = 'BrandLogo'
        LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id 
        LEFT JOIN "upload_file_morph" as bi ON "bi"."related_id" = "brands"."id" 
        And bi.related_type = 'brands' And bi.field = 'BrandImage'
        LEFT JOIN "upload_file" as ubi ON ubi.id = bi.upload_file_id  
		LEFT JOIN "upload_file_morph" as bbi ON "bbi"."related_id" = "brands"."id" 
        And bbi.related_type = 'brands' And bbi.field = 'BrandbigLogo'
        LEFT JOIN user_admin ua on brands."updated_by" = ua."strapi_user_id"
        LEFT JOIN "upload_file" as ubbi ON ubbi.id = bbi.upload_file_id  where brands.id = ${id} `)
        let qToDB = await pool.query(`Select bo."offer_id" as id, offers."OfferName"
                                    from brands_offers__offers_brands bo
                                    left join offers on bo."offer_id" = offers.id
                                    where bo."brand_id" = ${id} and published_at IS NOT NULL
                                    ORDER by "OfferName" ASC; `)

        returnData = qdata.rows[0]
        returnData = { ...returnData, offers: qToDB.rows }
        //console.log(returnData, "returnData")
    } catch (error) {
        returnData = error
        console.error(error)
    }

    return returnData
}

offerModelObj.fetchBrandDetailsByIdForEdit = async function (id) {
    let rData = {}
    let lquery = `SELECT id, lounge_details."LoungeName" from lounge_details where airport = ${id} `
    try {
        let qData = await pool.query(`SELECT * FROM airports WHERE id = ${id} `)
        let ldata = await pool.query(lquery)
        rData = qData.rows
        rData[0].lounges = ldata.rows
    } catch (err) {
        console.error(err)

    }
    return rData
}

offerModelObj.fetchBrandsNameForRelation = async function () {
    let rData = []
    let qToDB = `Select brands.id, brands."BrandName" from brands where "published_at" IS NOT NULL ORDER by "BrandName" ASC; `
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        return rData
    } catch (err) {
        console.error(err)
    }
}

offerModelObj.fetchOfferNameForRelation = async function () {
    let rData = []
    let qToDB = `Select offers.id, offers."OfferName" from offers where "published_at" IS NOT NULL ORDER by "OfferName" ASC; `
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        return rData
    } catch (err) {
        console.error(err)
    }
}

offerModelObj.postNewBrandDataToDB = async function (dataToDB, strapi_id) {
    let rData = {}
    let { BrandName, BrandWebsite, BrandAlexa, URLLauncher_check, offers } = dataToDB.brandData
    // Inserting brands data to brands table here......

    let qToDb = `
        INSERT INTO brands(
        "BrandName",
        ${BrandWebsite ? `"BrandWebsite",` : ""}
        ${BrandAlexa ? `"BrandAlexa",` : ""}
        "URLLauncher_check",
        "created_by",
        "updated_by"
        )
        VALUES(
            $$${BrandName}$$,
             ${BrandWebsite ? `$$${BrandWebsite}$$,` : ''}
             ${BrandAlexa ? `$$${BrandAlexa}$$,` : ''}
            '${URLLauncher_check}',
            ${strapi_id},
            ${strapi_id}
              )
    RETURNING *
        `
    try {
        let qdata = await pool.query(qToDb)
        rData = qdata.rows[0]
        for (i = 0; i < offers.length; i++) {
            await pool.query(`
            INSERT INTO brands_offers__offers_brands
        ("offer_id", "brand_id") VALUES('${offers[i].id}', '${rData.id}')
            `)
        }
        return { id: rData.id }
    }
    catch (err) {
        console.error(err)
    }
}

offerModelObj.uploadBrandImagesData = async function (dataToDB) {
    /// uploading image data to upload file table here......
    let uploadFiles = dataToDB.uploadImages
    // //console.log(uploadFiles, "uploadFilesuploadFiles")
    if (uploadFiles && uploadFiles.length > 0) {
        for (let i = 0; i < uploadFiles.length; i++) {
            uploadFiles[i].relatedType = 'brands'
            //console.log("adfvb fsfsFerwfgvfda", uploadFiles[i], "folesssssafv")
            if (uploadFiles[i].originalname) {
                let getTheName = uploadFiles[i].originalname.split('.')[0]
                uploadFiles[i].relatedField = getTheName
            }

            uploadFiles[i].relatedId = dataToDB.brandId
            offerModelObj.addEachImageData(uploadFiles[i])
        }
    }
    return { id: dataToDB.brandId }
}

offerModelObj.addEachImageData = async function (imageData) {
    //console.log(imageData, "imageDataimageDataimageData")
    let uploadInsertData = {
        name: imageData.originalname,
        hash: imageData.key.split('.')[0],
        mime: imageData.mimetype,
        size: imageData.size,
        url: imageData.location,
        provider: 'do',
        ext: "." + imageData.key.split('.')[imageData.key.split('.').length - 1],
    }
    let dataFromUploadFileTable = false

    let uploafFileTableQuery = `INSERT INTO upload_file("name", "hash", "ext", "mime",  "size", "url",  "provider", "created_by", "updated_by")
    values('${uploadInsertData.name}', '${uploadInsertData.hash}', '${uploadInsertData.ext}', '${uploadInsertData.mime}', ${uploadInsertData.size}, '${uploadInsertData.url}', '${uploadInsertData.provider}', 2 , 2) RETURNING *;`
    try {
        let dbQuery = await pool.query(uploafFileTableQuery)
        dataFromUploadFileTable = dbQuery.rows[0]
    } catch (err) {
        //console.log(err, "err")
    }

    // Inserting upload and brand  data to upload file morph relationtable here......
    if (dataFromUploadFileTable) {
        let insertMorphData = {
            uploadFileId: dataFromUploadFileTable.id,
            relatedId: imageData.relatedId,
            relatedType: imageData.relatedType,
            relatedField: imageData.relatedField,
            order: 1
        }
        let dataFromUploadMorphTable = false
        let uploadFileMorphRelationTableQuery = `INSERT INTO upload_file_morph("upload_file_id", "related_id", "related_type", "field", "order") 
        values(${insertMorphData.uploadFileId}, ${insertMorphData.relatedId}, '${insertMorphData.relatedType}', '${insertMorphData.relatedField}', ${insertMorphData.order}) RETURNING *;`

        try {
            let dbQuery = await pool.query(uploadFileMorphRelationTableQuery)
            dataFromUploadMorphTable = dbQuery.rows[0]
        } catch (err) {
            console.error(err)
        }
    }
}

offerModelObj.updateBrandById = async function (brandId, updatedBrand, updated_by) {
    const { BrandName, BrandWebsite, BrandAlexa, URLLauncher_check, offers } = updatedBrand
    try {
        const updatedBrandInDb = await pool.query(`
        UPDATE brands SET
        "BrandName"=$$${BrandName}$$,
        "BrandWebsite"=$$${BrandWebsite}$$,
        "BrandAlexa"=${BrandAlexa ? `'${BrandAlexa}'` : null},
        "URLLauncher_check"='${URLLauncher_check}',
        "updated_at"=current_timestamp,
        "updated_by"=${updated_by}
        where ID ='${brandId}'
        `)
        let lgetquery = `Select bo."offer_id" as id, offers."OfferName"
                                        from brands_offers__offers_brands bo
                                        left join offers on bo."offer_id"=offers.id
                                        where bo."brand_id" = ${brandId}
                                        ORDER by "OfferName" ASC;`
        let lgetdata = await pool.query(lgetquery)
        let prevOffers = lgetdata.rows

        if (JSON.stringify(prevOffers) !== JSON.stringify(offers)) {
            await pool.query(` DELETE FROM brands_offers__offers_brands where "brand_id"= ${brandId}`)
            for (i = 0; i < offers.length; i++) {
                await pool.query(`
                INSERT INTO brands_offers__offers_brands 
            ("offer_id","brand_id") VALUES ('${offers[i].id}','${brandId}')
                `)
            }

        }
    } catch (err) {
        console.error(err)
    }
}

offerModelObj.deleteBrandById = async function (brandId) {
    try {
        // await pool.query(`DELETE FROM brands_offers__offers_brands where "brand_id"= ${brandId}`)
        // await pool.query(`DELETE FROM brands where id='${brandId}'`)

        await pool.query(`
        UPDATE offers set published_at=NULL from brands_offers__offers_brands as bo where bo."brand_id"= ${brandId} and bo."offer_id"=offers."id"
        `)
        await pool.query(`
        UPDATE brands set published_at=NULL where id='${brandId}'
        `)
        //Delete images
    }
    catch (err) {
        console.error(err)
    }
}

offerModelObj.deleteOfferById = async function (offerId) {
    try {
        const q1 = await pool.query(`DELETE FROM brands_offers__offers_brands where "offer_id"=${offerId} returning *`)
        const q2 = await pool.query(`DELETE FROM card_issuers_offers__offers_card_issuers where "offer_id"=${offerId} returning *`)
        const q3 = await pool.query(`DELETE FROM credit_cards_offers__offers_credit_cards where "offer_id"=${offerId} returning *`)
        const deleteccQuery = await pool.query(`DELETE FROM offers_components where "offer_id"=${offerId} Returning *`)
        let deleteccData = deleteccQuery.rows[0]
        if (deleteccData) {
            const { component_type, component_id } = deleteccData
            const q4 = await pool.query(`DELETE FROM ${component_type} where id=${component_id} returning *`)
        }
        const q5 = await pool.query(`DELETE FROM offers where id=${offerId} returning *`)
    }
    catch (err) {
        console.error(err)
    }
}


module.exports = offerModelObj