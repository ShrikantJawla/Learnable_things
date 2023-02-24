const { pool } = require("../../../configration/database")
let loungeModelObj = {}


/* ===========>>>>>>>>>    fetching airports list <<<<<<<<<<<======================= */
loungeModelObj.getFilteredAirports = async function (body) {
    let { filterObject, pageNo, sort } = body
    let {
        entriesPerPage,
        id,
        AirportName,
        AirportID,
        AirportLocation,
        AirportCity,
        published_at,
    } = filterObject
    id = id || ""
    AirportName = AirportName || ""
    AirportID = AirportID || ""
    AirportLocation = AirportLocation || ""
    AirportCity = AirportCity || ""

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
            `SELECT airports.* , upload_file.url as airportImage  FROM airports 
                LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "airports"."id" 
                And upload_file_morph.related_type = 'airports' And upload_file_morph.field = 'AirportImage'
                LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id
                where
                 ${id ? `airports."id"::Text = '${id}' AND` : ''}
                LOWER(airports."AirportName")::Text Like '%${AirportName.toLowerCase()}%' AND
                LOWER(airports."AirportID")::Text Like '%${AirportID.toLowerCase()}%' AND
                LOWER(airports."AirportLocation")::Text Like '%${AirportLocation.toLowerCase()}%' AND
                LOWER(airports."AirportCity")::Text Like '%${AirportCity.toLowerCase()}%' 
                ${(published_at === 'Draft') ? "AND airports.published_at IS NULL" : (published_at === 'Published' ? "AND airports.published_at IS NOT NULL" : "")}
                ORDER By "${sort}" ${ascDesc}
                limit ${entriesPerPage} offset ${offset};
                `
        )
        returnDataFromModal = qData.rows
        cData = await pool.query(
            `SELECT count(*)
                FROM airports
                where
                 ${id ? `airports."id"::Text = '${id}' AND` : ''}
                LOWER(airports."AirportName")::Text Like '%${AirportName.toLowerCase()}%' AND
                LOWER(airports."AirportID")::Text Like '%${AirportID.toLowerCase()}%' AND
                LOWER(airports."AirportLocation")::Text Like '%${AirportLocation.toLowerCase()}%' AND
                LOWER(airports."AirportCity")::Text Like '%${AirportCity.toLowerCase()}%' 
                ${(published_at === 'Draft') ? "AND airports.published_at IS NULL" : (published_at === 'Published' ? "AND airports.published_at IS NOT NULL" : "")}
                ;
                `
        )
        return { returnDataFromModal, count: cData.rows[0].count }
    } catch (err) {
        console.error(err)
    }
}

loungeModelObj.fetchAirportsList = async function () {
    let returnData = []

    try {
        const res = await pool.query(`SELECT * FROM airports ORDER BY "AirportName" ASC`)
        returnData = res.rows
        return returnData
    } catch (error) {
        console.error(error)
    }
}

loungeModelObj.fetchAirportById = async function (id) {
    let rData = {}
    let lquery = `SELECT id,lounge_details."LoungeName" from lounge_details where airport=${id} and published_at IS NOT NULL`
    try {
        let qData = await pool.query(`SELECT airports.*,ua."ua_name", upload_file.url as airport_image FROM airports
        LEFT JOIN user_admin ua on airports."updated_by"=ua."strapi_user_id"
        LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "airports"."id" 
        And upload_file_morph.related_type = 'airports' And upload_file_morph.field = 'AirportImage'
        LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id WHERE airports.id = ${id}`)
        let ldata = await pool.query(lquery)
        rData = qData.rows
        rData[0].lounges = ldata.rows
        return rData
    } catch (err) {
        console.error(err)

    }
}

loungeModelObj.fetchLoungeById = async function (id) {
    let rData = {}
    try {
        let qData = await pool.query(`SELECT lounge_details.*,ua.ua_name, upload_file.url as lounge_image,airports."AirportName",airports."AirportCity" FROM lounge_details
        LEFT JOIN user_admin ua on lounge_details."updated_by"=ua."strapi_user_id"
        LEFT JOIN "upload_file_morph" ON "upload_file_morph"."related_id" = "lounge_details"."id" 
        And upload_file_morph.related_type = 'lounge_details' And upload_file_morph.field = 'LoungeImages'
        LEFT JOIN "upload_file" ON upload_file.id = upload_file_morph.upload_file_id
        LEFT JOIN "airports" ON lounge_details.airport=airports.id
        WHERE lounge_details.id = ${id}`)



        let aData = await pool.query(`
        SELECT * FROM components_lounge_amenities_amenities cll
        LEFT JOIN lounge_details_components ldc ON ldc."component_id"=cll.id
        WHERE ldc."lounge_detail_id" = ${id} `)
        let ccData = await pool.query(`SELECT cld."credit-card_id" as id,cc."CreditCardName" FROM credit_cards_lounge_details__lounge_details_credit_cards cld
        LEFT JOIN credit_cards cc on cc.id=cld."credit-card_id"
        WHERE cld."lounge-detail_id" = ${id} and cc."published_at" IS NOT NULL`)
        let lnData = await pool.query(`SELECT cld."lounge-network-list_id" as id,cc."ListName" FROM lounge_details_lounge_network_lists__lounge_network_lists_loung cld
        LEFT JOIN lounge_network_lists cc on cc.id=cld."lounge-network-list_id"
        WHERE cld."lounge-detail_id" = ${id}and cc."published_at" IS NOT NULL`)
        rData = {
            ...qData.rows[0], Amenties: aData.rows[0], creditCards: ccData.rows, loungeNetworks: lnData.rows
        }
        rData.airport = [{ id: rData.airport, AirportName: `${rData.AirportCity} | ${rData.AirportName}` }]
        rData.AirportName = undefined
        rData.AirportCity = undefined
        return rData
    } catch (err) {
        console.error(err)

    }
}

/* ===========>>>>>>>>>    fetching lounges list <<<<<<<<<<<======================= */

loungeModelObj.getFilteredLounges = async function (body) {
    let { filterObject, pageNo, sort } = body
    let {
        entriesPerPage,
        id,
        LoungeName,
        Airport,
        TerminalsSelect,
        published_at,
        AirportCity /*from_published_date, to_published_date*/,
    } = filterObject

    id = id || ""
    LoungeName = LoungeName || ""
    AirportCity = AirportCity || ""
    Airport = Airport === undefined || Airport === "any" ? "" : Airport
    TerminalsSelect =
        TerminalsSelect === undefined || TerminalsSelect === "any" ?
            "" :
            TerminalsSelect
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
    let returnDataFromModel = []
    let cData
    try {
        const qData = await pool.query(
            `SELECT lounge_details.*,airports."AirportName",airports."AirportCity"
            FROM lounge_details
            LEFT JOIN airports ON lounge_details.airport = airports.id
                where
                 ${id ? `lounge_details."id"::Text = '${id}' AND` : ''}
               ( LOWER(airports."AirportCity")::Text Like '%${AirportCity.toLowerCase()}%' OR airports."AirportCity" IS NULL )AND
                LOWER(lounge_details."LoungeName")::Text Like '%${LoungeName.toLowerCase()}%' AND
                lounge_details."TerminalsSelect"::Text Like '%${TerminalsSelect}%' AND
               ( airports."AirportName"::Text Like '%${Airport}%' OR airports."AirportName" IS NULL )
                ${(published_at === 'Draft') ? "AND lounge_details.published_at IS NULL" : (published_at === 'Published' ? "AND lounge_details.published_at IS NOT NULL" : "")}
                
                ORDER By "${sort}" ${ascDesc}
                limit ${entriesPerPage} offset ${offset};
                `
        )
        returnDataFromModel = qData.rows
        cData = await pool.query(
            `SELECT count(*)
            FROM lounge_details
            LEFT JOIN airports ON lounge_details.airport = airports.id
                where
                 ${id ? `lounge_details."id"::Text = '${id}' AND` : ''}
               ( LOWER(airports."AirportCity")::Text Like '%${AirportCity.toLowerCase()}%' OR airports."AirportCity" IS NULL )AND
                LOWER(lounge_details."LoungeName")::Text Like '%${LoungeName.toLowerCase()}%' AND
                lounge_details."TerminalsSelect"::Text Like '%${TerminalsSelect}%' AND
               ( airports."AirportName"::Text Like '%${Airport}%' OR airports."AirportName" IS NULL )
                ${(published_at === 'Draft') ? "AND lounge_details.published_at IS NULL" : (published_at === 'Published' ? "AND lounge_details.published_at IS NOT NULL" : "")}
                
                `
        )
        return { returnDataFromModel, count: cData.rows[0].count }
    } catch (err) {
        console.error(err)
    }
}

loungeModelObj.fetchLoungesList = async function (req, res, next) {
    let returnData = []

    try {
        const res = await pool.query("SELECT * FROM lounge_details")
        returnData = res.rows
    } catch (error) {
        console.error(error)
        returnData = error
    }
    return returnData
}

loungeModelObj.fetchLoungeDetailById = async function (id) {
    let rData = []
    try {
        const qData = await pool.query(`SELECT  * FROM lounge_details WHERE id = ${id}`)
        rData = qData.rows
    } catch (err) {

        console.error(err)
        rData = err
    }

    return rData

}

loungeModelObj.getLoungesNameForRelation = async function () {
    let rData = []
    let qToDB = `Select lounge_details.id, lounge_details."LoungeName"  from lounge_details where "published_at" IS NOT NULL ORDER by "LoungeName" ASC;`
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        return rData
    } catch (err) {
        console.error(err)
    }
}

loungeModelObj.postNewAirportDataToDB = async function (dataToDB, strapi_id) {
    let rData = {}
    let { AirportName, AirportLocation, AirportID, AirportCity, lounges } = dataToDB
    let qToDb = `INSERT INTO airports
    ("AirportName","AirportLocation","AirportID","AirportCity","created_by","updated_by")
    VALUES ($$${AirportName}$$,$$${AirportLocation}$$,$$${AirportID}$$,$$${AirportCity}$$,${strapi_id},${strapi_id})
    RETURNING *
    `
    try {
        let qdata = await pool.query(qToDb)
        rData = qdata.rows[0]
        for (i = 0; i < lounges.length; i++) {
            await pool.query(`
            UPDATE lounge_details 
            SET airport= ${rData.id}
            where id=${lounges[i].id}
            `)
        }
        return { id: rData.id }
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.postNewLoungeDataToDB = async function (dataToDB, strapi_id) {
    let rData = {}
    let { LoungeName, Location, LoungeNamePublic, TerminalsSelect, LoungeTiming, creditCards, loungeNetworks, airport, Introduction, MainSummary, ImportantInformation, Amenties, Directions } = dataToDB
    let {
        Food,
        DisabledAccess,
        TV,
        SmokingArea,
        NoSmoking,
        AlcoholicDrinks,
        NewspapersMagazines,
        WiFi,
        AirConditioning,
        Television,
    } = Amenties
    Food = Food || false
    DisabledAccess = DisabledAccess || false
    TV = TV || false
    SmokingArea = SmokingArea || false
    NoSmoking = NoSmoking || false
    AlcoholicDrinks = AlcoholicDrinks || false
    NewspapersMagazines = NewspapersMagazines || false
    WiFi = WiFi || false
    AirConditioning = AirConditioning || false
    Television = Television || false

    let loungeId
    let qToDb = `INSERT INTO lounge_details
    ("LoungeName","Location","TerminalsSelect","LoungeNamePublic","airport","Introduction","MainSummary","ImportantInformation","Directions","LoungeTiming","created_by","updated_by")
    VALUES ($$${LoungeName}$$,$$${Location}$$,$$${TerminalsSelect}$$,$$${LoungeNamePublic}$$,$$${airport[0]['id']}$$,$$${Introduction}$$,$$${MainSummary}$$,$$${ImportantInformation}$$,$$${Directions}$$,$$${LoungeTiming}$$,${strapi_id},${strapi_id})
    RETURNING *
    `

    try {
        let qdata = await pool.query(qToDb)
        rData = qdata.rows[0]
        loungeId = rData.id

        const insertAmenties = await pool.query(`INSERT INTO components_lounge_amenities_amenities 
            ("Food", "DisabledAccess", "TV", "SmokingArea", "NoSmoking", "AlcoholicDrinks", "NewspapersMagazines", "WiFi", "AirConditioning", "Television")
        VALUES('${Food}', '${DisabledAccess}', '${TV}', '${SmokingArea}', '${NoSmoking}', '${AlcoholicDrinks}', '${NewspapersMagazines}', '${WiFi}', '${AirConditioning}', '${Television}')
           RETURNING id `)
        await pool.query(`
        INSERT INTO public.lounge_details_components
        (
            "field",
            "order",
            "component_type",
            "component_id",
            "lounge_detail_id"
        )
        VALUES
        (
            'Amenities',
            1,
            'components_lounge_amenities_amenities',
            ${insertAmenties.rows[0]['id']},
            ${loungeId}
        )
        RETURNING component_id
        `)
        for (i = 0; i < creditCards.length; i++) {
            await pool.query(`INSERT INTO credit_cards_lounge_details__lounge_details_credit_cards
            ("lounge-detail_id","credit-card_id")
            VALUES ('${loungeId}','${creditCards[i]['id']}')
            `)
        }
        for (i = 0; i < loungeNetworks.length; i++) {
            await pool.query(`INSERT INTO lounge_details_lounge_network_lists__lounge_network_lists_loung  
            ("lounge-network-list_id","lounge-detail_id")
            VALUES ('${loungeNetworks[i]['id']}','${loungeId}')
            `)
        }
        return { id: loungeId }
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.updateAirportById = async function (airportId, updatedAirport, updated_by) {
    const { AirportName, AirportCity, AirportID, AirportLocation, lounges } = updatedAirport
    const updatedAirportInDb = await pool.query(`
        UPDATE airports SET
        "AirportName"=$$${AirportName}$$,
        "AirportCity"=$$${AirportCity}$$,
        "AirportID"=$$${AirportID}$$,
        "AirportLocation"=$$${AirportLocation}$$,
        "updated_at"=current_timestamp,
        "updated_by"=${updated_by}
        where ID ='${airportId}'
    `)
    let lgetquery = `SELECT id,lounge_details."LoungeName" from lounge_details where airport=${airportId}`
    let lgetdata = await pool.query(lgetquery)
    let prevLounges = lgetdata.rows
    if (JSON.stringify(prevLounges) !== JSON.stringify(lounges)) {
        await pool.query(` UPDATE lounge_details 
            SET airport= null
            where airport= ${airportId}`)
        for (i = 0; i < lounges.length; i++) {
            await pool.query(`
            UPDATE lounge_details 
            SET airport= ${airportId}
            where id=${lounges[i].id}
            `)
        }

    }
    else {
        //console.log("LOUNGES EQUAL")
    }
}

loungeModelObj.updateLoungeById = async function (loungeId, updatedLounge, updated_by) {
    let { LoungeName, Location, LoungeNamePublic, TerminalsSelect, LoungeTiming, creditCards, loungeNetworks, airport, Introduction, MainSummary, ImportantInformation, Amenties, Directions } = updatedLounge
    let {
        Food,
        DisabledAccess,
        TV,
        SmokingArea,
        NoSmoking,
        AlcoholicDrinks,
        NewspapersMagazines,
        WiFi,
        AirConditioning,
        Television,
    } = Amenties
    try {

        const q1 = await pool.query(`
            UPDATE lounge_details SET
            "LoungeName"=$$${LoungeName}$$,
            "Location"=$$${Location}$$,
            "LoungeNamePublic"=$$${LoungeNamePublic}$$,
            "TerminalsSelect"=$$${TerminalsSelect}$$,
            "LoungeTiming"=$$${LoungeTiming}$$,
            "airport"=$$${airport[0]['id']}$$,
            "Introduction"=$$${Introduction}$$,
            "MainSummary"=$$${MainSummary}$$,
            "ImportantInformation"=$$${ImportantInformation}$$,
            "Directions"=$$${Directions}$$,
            "updated_at"=current_timestamp,
            "updated_by"=${updated_by}
            where id =$$${loungeId}$$;
        `)
        console.log(q1.rows)
        // Amenties
        const checkExists = await pool.query(`SELECT * FROM lounge_details_components where lounge_detail_id='${loungeId}'`)
        if (checkExists.rows.length > 0) {
            await pool.query(`
            UPDATE components_lounge_amenities_amenities claa 
            SET
            "Food"='${Food || false}',
            "DisabledAccess"='${DisabledAccess || false}',
            "TV"='${TV || false}',
            "SmokingArea"='${SmokingArea || false}',
            "NoSmoking"='${NoSmoking || false}',
            "AlcoholicDrinks"='${AlcoholicDrinks || false}',
            "NewspapersMagazines"='${NewspapersMagazines || false}',
            "WiFi"='${WiFi || false}',
            "AirConditioning"='${AirConditioning || false}',
            "Television"='${Television || false}'
            FROM lounge_details_components ldc
            where ldc."lounge_detail_id" ='${loungeId}' and ldc."component_id"=claa.id
            returning *;
            `)
        }
        else {
            const insertAmenties = await pool.query(`INSERT INTO components_lounge_amenities_amenities 
            ("Food", "DisabledAccess", "TV", "SmokingArea", "NoSmoking", "AlcoholicDrinks", "NewspapersMagazines", "WiFi", "AirConditioning", "Television")
        VALUES('${Food}', '${DisabledAccess}', '${TV}', '${SmokingArea}', '${NoSmoking}', '${AlcoholicDrinks}', '${NewspapersMagazines}', '${WiFi}', '${AirConditioning}', '${Television}')
           RETURNING id `)
            await pool.query(`
        INSERT INTO public.lounge_details_components
        (
            "field",
            "order",
            "component_type",
            "component_id",
            "lounge_detail_id"
        )
        VALUES
        (
            'Amenities',
            1,
            'components_lounge_amenities_amenities',
            ${insertAmenties.rows[0]['id']},
            ${loungeId}
        )
        RETURNING component_id
        `)
        }


        let ccData = await pool.query(`SELECT cld."credit-card_id" as id,cc."CreditCardName" FROM credit_cards_lounge_details__lounge_details_credit_cards cld
            LEFT JOIN credit_cards cc on cc.id=cld."credit-card_id"
            WHERE cld."lounge-detail_id" = ${loungeId}`)
        let lnData = await pool.query(`SELECT cld."lounge-network-list_id" as id,cc."ListName" FROM lounge_details_lounge_network_lists__lounge_network_lists_loung cld
            LEFT JOIN lounge_network_lists cc on cc.id=cld."lounge-network-list_id"
            WHERE cld."lounge-detail_id" = ${loungeId}`)

        let prevCreditCards = ccData.rows
        let prevLoungeNetworks = lnData.rows
        if (JSON.stringify(prevCreditCards) !== JSON.stringify(creditCards)) {
            await pool.query(` DELETE FROM credit_cards_lounge_details__lounge_details_credit_cards where "lounge-detail_id"= ${loungeId}`)
            for (i = 0; i < creditCards.length; i++) {
                await pool.query(`INSERT INTO credit_cards_lounge_details__lounge_details_credit_cards
                ("lounge-detail_id","credit-card_id")
                VALUES ('${loungeId}','${creditCards[i]['id']}')
                `)
            }

        }
        else {
            //console.log("Credit Cards----------- EQUAL")
        }

        if (JSON.stringify(prevLoungeNetworks) !== JSON.stringify(loungeNetworks)) {
            await pool.query(` DELETE FROM lounge_details_lounge_network_lists__lounge_network_lists_loung where "lounge-detail_id"= ${loungeId}`)
            for (i = 0; i < loungeNetworks.length; i++) {
                await pool.query(`INSERT INTO lounge_details_lounge_network_lists__lounge_network_lists_loung  
                ("lounge-network-list_id","lounge-detail_id")
                VALUES ('${loungeNetworks[i]['id']}','${loungeId}')
                `)
            }

        }
        else {
            //console.log("Lounge Networks----------- EQUAL")
        }
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.fetchLoungeNetworkList = async function (req, res, next) {
    let returnData = []
    try {
        const queryData = await pool.query("SELECT * from lounge_network_lists")
        returnData = queryData.rows
    } catch (error) {
        console.error(error)
        returnData = error
    }
    return returnData
}

loungeModelObj.getLoungeNetworksForRelation = async function (req, res, next) {
    let rData = []
    let qToDB = `Select lounge_network_lists.id, lounge_network_lists."ListName" from lounge_network_lists where "published_at" IS NOT NULL ORDER by "ListName" ASC;`
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        return rData
    } catch (err) {
        console.error(err)
    }
}

loungeModelObj.getAirportsForRelation = async function (req, res, next) {
    let rData = []
    let qToDB = `Select airports.id, airports."AirportName",airports."AirportCity" from airports where "published_at" IS NOT NULL  ORDER by "AirportCity" ASC;`
    try {
        const qData = await pool.query(qToDB)
        rData = qData.rows
        rData.map(item => {
            item.AirportName = `${item.AirportCity} | ${item.AirportName}`
            item.AirportCity = undefined
        })
        return rData
    } catch (err) {
        console.error(err)
    }
}

loungeModelObj.deleteAirportById = async function (airportId) {
    try {
        await pool.query(`UPDATE lounge_details
            SET published_at= null
            where airport= ${airportId}`)
        // await pool.query(`DELETE FROM  airports where id=${airportId}`)
        await pool.query(`UPDATE airports set published_at=null where id='${airportId}'`)
        //Delete Images
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.deleteLoungeById = async function (loungeId) {
    try {
        // await pool.query(` DELETE FROM credit_cards_lounge_details__lounge_details_credit_cards where "lounge-detail_id"= ${loungeId}`)
        // await pool.query(` DELETE FROM credit_cards_lounge_details__lounge_details_credit_cards where "lounge-detail_id"= ${loungeId}`)
        // await pool.query(`DELETE FROM components_lounge_amenities_amenities where id= ${loungeId}`)
        // await pool.query(`DELETE FROM lounge_details where id=${loungeId}`)
        await pool.query(`UPDATE lounge_details set published_at=null where id=${loungeId}`)
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.fetchLoungeNetworkById = async function (loungeNetworkId) {
    if (loungeNetworkId) {
        let returnData = {}
        const lnDataQuery = `SELECT lnl.*,ua."ua_name" FROM public.lounge_network_lists lnl 
                LEFT JOIN user_admin ua on lnl."updated_by"=ua."strapi_user_id"
                where id='${loungeNetworkId}';`
        try {
            const lnData = await pool.query(lnDataQuery)
            returnData = { ...lnData.rows[0] }
            const lData = await pool.query(`
                SELECT pldn."lounge-detail_id" as id,ld."LoungeName" FROM 
                public.lounge_details_lounge_network_lists__lounge_network_lists_loung pldn
                LEFT JOIN lounge_details ld ON ld.id=pldn."lounge-detail_id"
                where pldn."lounge-network-list_id"=${loungeNetworkId} and published_at IS NOT NULL
            `)
            const cData = await pool.query(`
            SELECT id,"CreditCardName" FROM credit_cards where lounge_network_list=${loungeNetworkId} and published_at IS NOT NULL
            `)
            returnData.lounges = lData.rows
            returnData.creditCards = cData.rows
            return returnData
        }
        catch (err) {
            console.error(err)
            return {}
        }
    }
}

loungeModelObj.getFilteredLoungeNetworks = async function (body) {
    let { filterObject, pageNo, sort } = body
    let {
        entriesPerPage,
        id,
        ListName,
        information,
        published_at,
    } = filterObject
    id = id || ""
    ListName = ListName || ""
    information = information || ""
    published_at = published_at === undefined || published_at === "any" ? "" : published_at
    entriesPerPage = entriesPerPage || 10
    sort = sort || "id"
    let offset = (pageNo - 1) * entriesPerPage
    let ascDesc = 'asc NULLS FIRST'
    if (sort.startsWith('-')) {
        sort = sort.substring(1)
        ascDesc = 'desc NULLS LAST'
    }
    let returnDataFromModal = []
    let cData
    try {
        let dQuery = `SELECT lnl.*,  (SELECT Count(*) from lounge_network_lists
        LEFT JOIN lounge_details_lounge_network_lists__lounge_network_lists_loung ON
       lounge_details_lounge_network_lists__lounge_network_lists_loung."lounge-network-list_id" = lounge_network_lists.id
       LEFT JOIN lounge_details ON lounge_details.id = lounge_details_lounge_network_lists__lounge_network_lists_loung."lounge-detail_id" where lounge_network_lists.id = lnl.id  AND lnl.published_at IS NOT NULL AND lounge_details.published_at IS NOT NULL) as lounge_count from lounge_network_lists lnl
        where
         ${id ? `lnl."id"::Text = '${id}' AND` : ''}
        ${(information) ? `Lower(lnl."information")::Text Like '%${information.toLowerCase()}%' AND` : ""}
        Lower(lnl."ListName")::Text Like '%${ListName.toLowerCase()}%' 
        ${(published_at === 'Draft') ? "AND lnl.published_at IS NULL" : (published_at === 'Published' ? "AND lnl.published_at IS NOT NULL" : "")}
        ORDER By lnl."${sort}" ${ascDesc}
        limit ${entriesPerPage} offset ${offset};
        `;
        //    console.log(dQuery, "------------ dquery");
        const qData = await pool.query(dQuery);
        returnDataFromModal = qData.rows;
        let cQuery = `SELECT count(*)
        from lounge_network_lists lnl
            where
              ${id ? `lnl."id"::Text = '${id}' AND` : ''}
            ${(information) ? `Lower(lnl."information")::Text Like '%${information.toLowerCase()}%' AND` : ""}
            Lower(lnl."ListName")::Text Like '%${ListName.toLowerCase()}%' 
            ${(published_at === 'Draft') ? "AND lnl.published_at IS NULL" : (published_at === 'Published' ? "AND lnl.published_at IS NOT NULL" : "")}
           `;
        // console.log(cQuery, "------------ cquery");
        cData = await pool.query(cQuery);
        return {
            returnDataFromModal, count: cData.rows[0].count
        }
    }
    catch (err) {
        console.error(err)
        return {
            returnDataFromModal: [], count: 0
        }
    }
}

loungeModelObj.postNewLoungeNetworkDataToDB = async function (dataToDB, strapi_id) {
    let rData = {}
    let { ListName, information, creditCards, lounges } = dataToDB
    let qToDB = `
    INSERT INTO lounge_network_lists
    ("ListName","information","created_by","updated_by")
    VALUES ($$${ListName}$$,$$${information}$$,${strapi_id},${strapi_id})
    RETURNING *;
    `


    try {
        let qData = await pool.query(qToDB)
        rData = qData.rows
        if (rData[0].id) {
            let loungeNetworkId = rData[0].id
            if (lounges && lounges.length) {
                for (i = 0; i < lounges.length; i++) {
                    await pool.query(`
                    INSERT INTO lounge_details_lounge_network_lists__lounge_network_lists_loung
                    ("lounge-network-list_id","lounge-detail_id")  VALUES ('${loungeNetworkId}','${lounges[i]['id']}') 
                `)
                }
                if (creditCards && creditCards.length) {
                    for (i = 0; i < creditCards.length; i++) {
                        await pool.query(`
                            UPDATE credit_cards SET
                            lounge_network_list = '${loungeNetworkId}'
                            where id='${creditCards[i].id}'
                        `)
                    }
                }
            }
        }
        return { id: rData[0].id }
    } catch (err) {
        console.error(err)
    }
}

loungeModelObj.updateLoungeNetworkById = async function (loungeNetworkId, updatedLoungeNetwork, updated_by) {
    try {

        const { ListName, information, creditCards, lounges } = updatedLoungeNetwork
        await pool.query(`
                UPDATE lounge_network_lists SET
                "ListName"=$$${ListName}$$,
                "information"=$$${information}$$,
                "updated_at"=current_timestamp,
                "updated_by"=${updated_by}
                where id='${loungeNetworkId}'
            `)
        const cData = await pool.query(`
                    SELECT id,"CreditCardName" FROM credit_cards where lounge_network_list=${loungeNetworkId}
                    `)
        const lData = await pool.query(`
                        SELECT pldn."lounge-detail_id" as id,ld."LoungeName" FROM 
                        public.lounge_details_lounge_network_lists__lounge_network_lists_loung pldn
                        LEFT JOIN lounge_details ld ON ld.id=pldn."lounge-detail_id"
                        where pldn."lounge-network-list_id"=${loungeNetworkId}
                    `)
        let prevCreditCards = cData.rows
        let prevLounges = lData.rows
        if (creditCards) {
            console.log(creditCards.length, "<<<<<<<<<<<<")
            await pool.query(`
                    UPDATE credit_cards SET
                    lounge_network_list = NULL
                    where lounge_network_list = '${loungeNetworkId}'
                `)
            for (i = 0; i < creditCards.length; i++) {
                await pool.query(`
                        UPDATE credit_cards SET
                        lounge_network_list = '${loungeNetworkId}'
                        where id='${creditCards[i].id}'
                    `)
            }
        }

        if (JSON.stringify(prevLounges) !== JSON.stringify(lounges)) {
            await pool.query(`
                    DELETE from lounge_details_lounge_network_lists__lounge_network_lists_loung
                    where "lounge-network-list_id" = '${loungeNetworkId}'
                `)
            for (i = 0; i < lounges.length; i++) {
                await pool.query(`
                    INSERT INTO lounge_details_lounge_network_lists__lounge_network_lists_loung
                    ("lounge-network-list_id","lounge-detail_id")  VALUES ('${loungeNetworkId}','${lounges[i]['id']}') 
                `)
            }
        }
        else {
            //console.log('LOUNGES EQUAL')
        }
        return 'success'
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.deleteLoungeNetworkById = async function (loungeNetworkId) {
    try {
        await pool.query(`
            UPDATE credit_cards SET
            lounge_network_list = NULL
            where lounge_network_list = '${loungeNetworkId}'
        `)
        // await pool.query(`
        //     DELETE from lounge_details_lounge_network_lists__lounge_network_lists_loung
        //     where "lounge-network-list_id" = '${loungeNetworkId}'
        // `)
        // await pool.query(`
        //     DELETE FROM lounge_network_lists 
        //     where id='${loungeNetworkId}'
        // `)
        await pool.query(`
        UPDATE lounge_details set published_at=NULL from lounge_details_lounge_network_lists__lounge_network_lists_loung as lnl where lnl."lounge-network-list_id"= ${loungeNetworkId} and lnl."lounge-detail_id"=lounge_details."id"
        `)
        await pool.query(`UPDATE lounge_network_lists set published_at=NULL where id='${loungeNetworkId}' `)
    }
    catch (err) {
        console.error(err)
    }
}

loungeModelObj.getAllAirportCities = async function () {
    try {
        let citiesData = await pool.query(`SELECT DISTINCT("AirportCity") FROM airports order by "AirportCity" asc`)
        let cities = citiesData.rows
        return { cities }
    }
    catch (err) {
        console.error(err)
    }
}
module.exports = loungeModelObj