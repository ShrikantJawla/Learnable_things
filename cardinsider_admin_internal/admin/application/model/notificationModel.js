const { pool } = require("../../../configration/database");
const commonModel = require("../model/commonModel");

let notificationModelObj = {}



notificationModelObj.fetchNotificationsData = async function(body){
    console.log(body, "bodybodybodybody")
    let returnData = {
        paymentData: [],
        count: 0,
        lastId: ""
    };

    let limit = ' limit 10';
    let whereCondition = '';
    let selectoptions = 'scheduled_notifications.* ';
    let offset = 0;
    let sortingBy = 'sn_id';
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
                isNullCondition = isNullCondition + 'scheduled_notifications.' + body.null[l] + ` is null `;
                if (l != body.null.length - 1) {
                    isNullCondition = isNullCondition + ` AND `;
                }
            }
        }
        if (body.notNull && body.notNull.length > 0) {
            for (let l = 0; l < body.notNull.length; l++) {
                isNotNullCondition = isNotNullCondition + 'scheduled_notifications.' + body.notNull[l] + ` is not null `;
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
                        otherFilter = otherFilter + ` scheduled_notifications.${key} = ${value}`;
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
                    dateFiltter = dateFiltter + ` scheduled_notifications.${key}::date >= date '${splitedValue[0]}' AND scheduled_notifications.${key}::date <= date '${splitedValue[1]}'`;
                } else {
                    dateFiltter = dateFiltter + ` scheduled_notifications.${key} ::date = date '${value}'`;
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


    // console.log(whereCondition, "isNullConditionisNullCondition");
    // if (body.newClaimedPayment){
    //     if (whereCondition == ''){
    //         whereCondition = whereCondition + ` where `;
    //     } else {
    //         whereCondition = whereCondition + ` AND  `;
    //     }
    //     whereCondition = whereCondition + ` approved_payment_tables.is_paid is not null AND cashback_claimed = 'true' AND (is_upi_valid IS NULL OR is_bank_valid IS NULL)`;
    // }

    // let newSelect = `, CAST(approved_payment_tables.created_at as varchar) , CAST(approved_payment_tables.updated_at as varchar)  , (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name , cashback_claimed , account_informations.method , account_informations.upi_id , account_informations.is_upi_valid , 
    // account_informations.is_bank_valid , account_informations.upi_valid_name`;

    // let leftJoin = ` 
    // LEFT JOIN card_insider_users ON card_insider_users.id = approved_payment_tables.user_id
    // LEFT JOIN account_informations ON account_informations.card_insider_user = card_insider_users.id
    //  `;


    let getAllApplicationsSql = `SELECT ${selectoptions}   FROM public.scheduled_notifications   ${whereCondition}
     ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset}`;
    console.log(getAllApplicationsSql, "getAllApplicationsSqlgetAllApplicationsSql")
    let result = await commonModel.getDataOrCount(getAllApplicationsSql, [], 'D');


    let queryForCount = `SELECT Count(*) FROM public.scheduled_notifications  ${whereCondition}`;
    let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');

    if (totalCount && totalCount.length > 0) {
        returnData.count = totalCount[0].count;
    }
    //console.log(result[6]);
    returnData.paymentData = result;
    return returnData;
}

notificationModelObj.getScheduledNotificationsData = async function () {
    let dataFromQuery = []
    let queryToDb = `Select * from scheduled_notifications`
    try {
        let queryDb = await pool.query(queryToDb)
        dataFromQuery = queryDb.rows
    } catch (err) {
        //console.log(err);
        dataFromQuery = err
    }
    return dataFromQuery

}

module.exports = notificationModelObj;