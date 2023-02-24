const { pool } = require("../../../configration/database")
const q = require('q');
const { async } = require("q");
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

/**
* This helper is using to get Data or count 
* @param     : 
* @returns   : object or number
* @developer : Rahul Bhatia
*/
commonModelObj.getDataOrCount = async function (sql = '', data = '', need = 'D', consoleData = false) {
    let deferred = q.defer();

    if (sql != '') {

        let result = await pool.query(sql, data);
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

    }

    return deferred.promise;

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
            fakeval = fakeval + `'` + data[key] + `'` + comma;
            console.log(key, data[key]);

        });
        let sql = `INSERT INTO ` + tablename + `(` + col + `) VALUES(` + fakeval + `)`;
        console.log(sql, 'sql');
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

commonModelObj.addDataToPaymentReport = async function (newData) {
    console.log(newData);
    let insertQuery = '';
    if (newData.length > 0) {
        let finalInsertData = await commonModelObj.checkIfAlreadyExist(newData);
        if (Object.keys(finalInsertData).length > 0) {
            for (const key in finalInsertData) {

                console.log(`${key}: ${finalInsertData[key]}`);
                if (finalInsertData[key].user_id > 0) {

                    if (finalInsertData[key].application_id > 0) {
                        insertQuery = insertQuery + ` INSERT INTO approved_payment_tables(user_id, payment_type, payment_amount, bank_name, application_number, 
                            notes, created_by, updated_by , application_id) 
                            VALUES(${finalInsertData[key].user_id}, 'cashback', ${finalInsertData[key].amount}, '${finalInsertData[key].issuer_id}', '${finalInsertData[key].application_number}', 'Upload by sheet', 1, 1 , ${finalInsertData[key].application_id});`
                    } else {
                        let getApplicationIdQuery = ` SELECT * FROM public.card_applications where "Application_number" = '${finalInsertData[key].application_number}'`;
                        let applicationId = await commonModelObj.getDataOrCount(getApplicationIdQuery, [], 'D');
                        if (applicationId && applicationId.length > 0) {
                            insertQuery = insertQuery + ` INSERT INTO approved_payment_tables(user_id, payment_type, payment_amount, bank_name, application_number, 
                                notes, created_by, updated_by , application_id) 
                                VALUES(${finalInsertData[key].user_id}, 'cashback', ${finalInsertData[key].amount}, '${finalInsertData[key].issuer_id}', '${finalInsertData[key].application_number}', 'Upload by sheet', 1, 1 , ${applicationId[0].id});`
                        }
                    }
                }
            }
        }
        console.log(insertQuery, "insertQueryinsertQuery")
        if (insertQuery != '') {
            let insertData = await commonModelObj.getDataOrCount(insertQuery, [], 'U');
            console.log(insertData);
        }

    }
}
commonModelObj.checkIfAlreadyExist = async function (newData) {
    let selectQuer = ' SELECT * FROM public.approved_payment_tables where ';
    let newDataObjByApplicationId = {};
    for (let i = 0; i < newData.length; i++) {
        newData[i].application_number = newData[i].application_number.trim();
        newDataObjByApplicationId[newData[i].application_number] = newData[i];
        //console.log(newData[i], "newDatanewData");
        if (i != newData.length - 1) {
            selectQuer = selectQuer + ` application_number = '${newData[i].application_number}' OR `;
        } else {
            selectQuer = selectQuer + ` application_number = '${newData[i].application_number}'`;
        }

    }
    console.log(Object.keys(newDataObjByApplicationId).length, "oldCount");
    let data = await commonModelObj.getDataOrCount(selectQuer, [], 'D');
    console.log(selectQuer, "selectQuerselectQuerselectQuer");
    if (data && data.length > 0) {
        for (let k = 0; k < data.length; k++) {
            delete newDataObjByApplicationId[data[k].application_number];
        }
    }
    console.log(Object.keys(newDataObjByApplicationId).length, "newCount");
    return newDataObjByApplicationId;
    //console.log(  newDataObjByApplicationId, "newDataObjByApplicationId3333333");
}


module.exports = commonModelObj