const { pool } = require("../utils/configs/database");
const q = require('q');
let commonModelObj = {}


/* ===========>>>>>>>>>    fetching all users  list <<<<<<<<<<<======================= */

commonModelObj.getSideBarData = async function () {
    let returnData = []
    try {
        const query = await pool.query("SELECT * FROM admin_sidebar ORDER BY as_id ASC ")
        returnData = query.rows
    } catch (error) {
        returnData = error
    }

    return returnData
}
commonModelObj.getUserAdminRole = async function (userId) {
    let resultData = {}
    let returnData = false
    let query = `SELECT ua_role from "user_admin" where ua_id = ` + userId
    try {
        let queryData = await pool.query(query)
        resultData = queryData.rows
    } catch (err) {
        //console.log(err);
    }
    returnData = resultData
    return returnData
}


commonModelObj.checkIsHavePermission = async function (roleId, cUrl) {
    let havePermission = false
    if (roleId == 1) {
        havePermission = true
    } else {
        let query =
            `SELECT * from "user_admin_panel_permissions" where uap_module_id = '` +
            cUrl +
            `' AND uap_uar = ` +
            roleId;
        // console.log(query, "permission query ");
        let queryData = await pool.query(query)
        if (queryData && queryData.rows.length > 0) {
            havePermission = queryData.rows[0];
        }
    }
    return havePermission
}


/**
* This helper is using to get Data or count 
* @param     : 
* @returns   : object or number
* @developer : Rahul Bhatia
*/
commonModelObj.getDataOrCount = async function (sql = '', data = '', need = 'D', consoleData = false) {
   // console.log('sfddff...................',sql,data)

    let deferred = q.defer();

    if (sql != '') {

        try {
            let result = await pool.query(sql, data);
           // console.log(result);
            if (result) {

                if (need != '') {

                    if (need == 'L' && result.rows.length > 0) {
                        deferred.resolve(result.rows.length);
                    } else if (need == 'D' && result.rows.length > 0) {
                        deferred.resolve(result.rows);
                    } else if (need == 'U') {
                        deferred.resolve(result);
                    } else {
                        deferred.resolve(false);
                    }

                } else {
                    deferred.resolve(false);
                }

            } else {
                deferred.resolve(false);
            }
        } catch (e) {
            deferred.resolve(false);
        }


    }

    return deferred.promise;

}

/**
* This helper is using to get Data or count 
* @param     : 
* @returns   : object or number
* @developer : Rahul Bhatia
*/
commonModelObj.getDataByPagination = async function ({ body, currenUserId, selectColumns, tableName, shortByColumn, leftJoin = '' , tableNameQuery = ''}) {
    
    let returnData = {
        applicationsData: [],
        count: 0,
        lastId: ""
    };

    let limit = ' limit 10';
    let whereCondition = '';
    let selectoptions = selectColumns;
    let offset = 0;
    let sortingBy = `${tableName}.${shortByColumn}`;
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
    let changeInQuery = false;
    let newChanges = '';


    let stringData = ``;
    if (body) {
        if (body.sort_asec && body.sort_asec.length > 0) {
            sortingBy = '';
            sortingBy = ` ${tableName}.` + body.sort_asec;
            sortOrder = 'ASC';
        }
        if (body.sort_desc && body.sort_desc.length > 0) {
            sortingBy = '';
            sortingBy = ` ${tableName}.` + body.sort_desc;
            sortOrder = 'DESC';
        }
        if (body.null && body.null.length > 0) {
            for (let l = 0; l < body.null.length; l++) {
                if (isNullCondition && isNullCondition != '') {
                    isNullCondition = isNullCondition + ` AND `;
                }
                let myArray = body.null[l].split("-");
                console.log(myArray, "myArraymyArray")
                if (myArray[myArray.length - 1] == 'string') {
                    body.null[l] = myArray[0];
                    isNullCondition = isNullCondition + ` ( ` + body.null[l] + ` is null OR ${body.null[l]} = '' ) `;

                } else if (myArray[myArray.length - 1] == 'array') {
                    body.null[l] = myArray[0];
                    isNullCondition = isNullCondition + ` ( ` + body.null[l] + ` is null or ${body.null[l]}  = '{}' or ${body.null[l]}  = '{null}' ) `;
                } else {
                    isNullCondition = isNullCondition + ` ( ` + body.null[l] + ` is null  ) `;
                }


            }
        }
        if (body.notNull && body.notNull.length > 0) {
            for (let l = 0; l < body.notNull.length; l++) {
                if (isNotNullCondition && isNotNullCondition != '') {
                    isNotNullCondition = isNotNullCondition + ` AND `;
                }
                let myArray = body.notNull[l].split("-");
                console.log(myArray, "myArraymyArray")
                if (myArray[myArray.length - 1] == 'string') {
                    body.notNull[l] = myArray[0];
                    isNotNullCondition = isNotNullCondition + ` (` + body.notNull[l] + ` is not null AND (${body.notNull[l]} <> '' ) )`;

                } else if (myArray[myArray.length - 1] == 'array') {
                    body.notNull[l] = myArray[0];
                    isNotNullCondition = isNotNullCondition + ` (` + body.notNull[l] + ` is not null AND  ${body.notNull[l]}  != '{}' AND ${body.notNull[l]}  != '{null}')`;
                } else {
                    isNotNullCondition = isNotNullCondition + ` (` + body.notNull[l] + ` is not null )`;
                }

            }
        }
        if (body.string && Object.keys(body.string).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.string)) {
                let valueOk = false;
                if (value) {
                    valueOk = true;
                }
                if (valueOk && otherFilter && otherFilter != '') {
                    otherFilter = otherFilter + ` AND `;
                }
                if (valueOk) {
                    otherFilter = otherFilter + ` lower(${key}) LIKE lower('%${value}%')`;
                }


                numLoop++;
            }
        }
        if (body.int && Object.keys(body.int).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.int)) {
                if (value && otherFilter && otherFilter != '') {
                    otherFilter = otherFilter + ` AND `;
                }
                if (value) {
                    otherFilter = otherFilter + ` ${key} = ${value}`;
                }


                numLoop++;
            }
        }
        if (body.bool && Object.keys(body.bool).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.bool)) {
                if (value && otherFilter && otherFilter != '') {
                    otherFilter = otherFilter + ` AND `;
                }
                if (value) {
                    if (value == 'true') {
                        otherFilter = otherFilter + ` ${key} = '${value}'`;
                    } else {
                        otherFilter = otherFilter + ` (${key} = '${value}' or ${key} is null ) `;

                    }

                }


                numLoop++;
            }
        }





     


        if (body.select && Object.keys(body.select).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.select)) {
                console.log(`${key}: ${value}`);
                if (value && value.length > 0) {
                    if (otherFilter && otherFilter != '') {
                        otherFilter = otherFilter + ` AND `;
                    }
                    let values = value;
                    for (let u = 0; u < values.length; u++) {
                        if (u == 0) {
                            otherFilter = otherFilter + ` (`;
                        }

                        if (u == values.length - 1) {
                            otherFilter = otherFilter + ` ${key} = '${values[u]}' )`;
                        } else {
                            otherFilter = otherFilter + ` ${key} = '${values[u]}' OR `;
                        }
                    }
                }
                numLoop++;

            }
        }
        if (body.array && Object.keys(body.array).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.array)) {
                console.log(`${key}: ${value}`);
                if (value && value.length > 0) {
                    if (otherFilter && otherFilter != '') {
                        otherFilter = otherFilter + ` AND `;
                    }
                    let values = value;
                    for (let u = 0; u < values.length; u++) {
                        if (u == 0) {
                            otherFilter = otherFilter + ` (`;
                        }

                        if (u == values.length - 1) {
                            otherFilter = otherFilter + ` '${values[u]}' = any(${key}) )`;
                        } else {
                            otherFilter = otherFilter + ` '${values[u]}' = any(${key}) OR `;
                        }
                    }
                }
                numLoop++;

            }
        }
        if (body.date && Object.keys(body.date).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.date)) {
                if (dateFiltter && dateFiltter != '') {
                    dateFiltter = dateFiltter + ` AND `;
                }
                console.log(`${key}: ${value}`);
                let splitedValue = value.split('to');
                console.log(splitedValue, "splitedValuesplitedValue");
                if (splitedValue && splitedValue.length > 1) {
                    dateFiltter = dateFiltter + ` ${tableName}.${key}::date >= date '${splitedValue[0]}' AND ${tableName}.${key}::date <= date '${splitedValue[1]}'`;
                } else {
                    dateFiltter = dateFiltter + ` ${tableName}.${key} ::date = date '${value}'`;
                }

                numLoop++;

            }
        }
        if (body.range && Object.keys(body.range).length > 0) {
            let numLoop = 0;
            for (const [key, value] of Object.entries(body.range)) {
                
                console.log(`${key}: ${value}`);
                let splitedValue = value.split('to');
                console.log(splitedValue, "splitedValuesplitedValue");
                if (otherFilter && otherFilter != '') {
                    otherFilter = otherFilter + ` AND `;
                }
                if (splitedValue && splitedValue.length > 1) {
                    otherFilter = otherFilter + ` ( ${key}  >= '${splitedValue[0].trim()}' AND ${key}  <= '${splitedValue[1].trim()}' ) `;
                } else {
                    otherFilter = otherFilter + ` ( ${key} = ${splitedValue[0]}) `;
                }

                numLoop++;

            }
        }
    }

    // Showing table data according to telecaller logged in
     if(currenUserId){
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + ` admin_user = ${currenUserId} `;
        } else {
            whereCondition = ` WHERE ` + ` admin_user = ${currenUserId} `;
        }
    }

    if (isNullCondition && isNullCondition != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + isNullCondition;
        } else {
            whereCondition = ` WHERE ` + isNullCondition;
        }

    }
    if (isNotNullCondition && isNotNullCondition != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + isNotNullCondition;
        } else {
            whereCondition = ` WHERE ` + isNotNullCondition;
        }
    }

    if (otherFilter && otherFilter != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + otherFilter;
        } else {
            whereCondition = ` WHERE ` + otherFilter;
        }

    }

    if (arrayFilter && arrayFilter != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + arrayFilter;
        } else {
            whereCondition = ` WHERE ` + arrayFilter;
        }

    }
    if (dateFiltter && dateFiltter != '') {
        if (whereCondition != '') {
            whereCondition = whereCondition + ` AND ` + dateFiltter;
        } else {
            whereCondition = ` WHERE ` + dateFiltter;
        }

    }
   

    // console.log(whereCondition, "isNullConditionisNullCondition");


    let newSelect = ``;
    if (tableNameQuery == ''){
        tableNameQuery = tableName;
    }
    let queryLastValues = ` ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset} `;
    let getAllApplicationsSql = `SELECT ${selectoptions} ${newSelect} FROM ${tableNameQuery} ${leftJoin}   ${whereCondition} 
        `;
    let finalQuery = getAllApplicationsSql + queryLastValues;

    console.log(finalQuery, "<<<<<<<< Final Query to DB")
    let result = await commonModelObj.getDataOrCount(finalQuery, [], 'D');


    let queryForCount = `SELECT Count(*) FROM ${tableNameQuery} ${leftJoin}  ${whereCondition}`;
    let totalCount = await commonModelObj.getDataOrCount(queryForCount, [], 'D');

    if (totalCount && totalCount.length > 0) {
        returnData.count = totalCount[0].count;
    }
    returnData.applicationsData = result;
    return returnData;
}

/**
* This helper is using to insert data
* @param     : 
* @returns   : 
* @developer : Rahul Bhatia
*/
commonModelObj.insert = async function (tablename, data, onlySqlQuery = false) {
    let deferred = q.defer();

    if (tablename != `` && typeof (data) == `object`) {

        let col = ` `;
        let fakeval = ` `;
        let len = Object.keys(data).length;
        let i = 0;
        Object.keys(data).forEach(key => {
            i++;
            let comma = ` , `;
            if (len == i) {
                comma = ` `;
            }
            col = col + key + comma;
            if (key == 'ca_main_table') {
                fakeval = fakeval + data[key] + comma;
            } else {
                fakeval = fakeval + `'` + data[key] + `'` + comma;
            }

            console.log(key, data[key]);

        });
        let sql = `INSERT INTO ` + tablename + `(` + col + `) VALUES(` + fakeval + `)`;
        //  console.log(sql, 'sql');
        if (onlySqlQuery) {
            deferred.resolve(sql);
        } else {
            let result = await pool.query(sql);
            if (result) {
                deferred.resolve(true);

            } else {
                deferred.resolve(false);
            }
        }



    }

    return deferred.promise;

}
commonModelObj.getDistinctValuesCommon = async function (column, table) {
    // console.log(column,table)
    let returnData = [];
    let query = `SELECT DISTINCT CAST(${column} as varchar) FROM ${table} where ${column} is not null AND ${column} != ''`;
    // let query = `SELECT DISTINCT '${column}' FROM '${table}' where '${column}' is not null AND '${column}' != ''`;
    console.log(query);
    let data = await commonModelObj.getDataOrCount(query, [], 'D');
    if (data) {
        returnData = data;
    }
    // console.log(data)
    return returnData;
};




module.exports = commonModelObj