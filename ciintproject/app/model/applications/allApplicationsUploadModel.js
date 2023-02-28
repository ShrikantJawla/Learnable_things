

let { pool } = require('../../utils/configs/database');
//////////////////////////////////////////
let uploadModel = {};

uploadModel.getAllApplicationsDataFromMainTable = async function () {
    let queryToDb = `SELECT * FROM card_applications_main_table `;
    let mainData = [];
    try {
        let dataQuery = await pool.query(queryToDb);
        mainData = dataQuery.rows;
    } catch (error) {
        console.log(error);

    }
    return mainData;
}


uploadModel.getAllAuApplicationsData = async function () {
    console.log("hi im in getAllIdfcApplicationsData");
    returnData = false;
    try {
        const query = await pool.query(`SELECT * FROM public.au_bank_applications_table ;`, []);
        // console.log(query);
        returnData = query.rows;
    } catch (error) {
        // console.error(error);
        returnData = error;
    }
    return returnData;

}



uploadModel.entryToAuFromSheetAjex = async function (insertData, dataByPhoneNumber , commingBankName) {

    let returnData = false;

    let sqlQuery = '';
    let updateQuery  = '';
    console.log(insertData.length, "length ");
    for (let i = 0; i < insertData.length; i++) {
        if (insertData[i].PHONE_NUMBER) {
            if(!insertData[i]['CITY']){
                insertData[i]['CITY'] = "";
            }
            if(!insertData[i]['STATE']){
                insertData[i]['STATE'] = "";
            }
            insertData[i]['PIN'].trim();
            if (!insertData[i]['PIN'] || insertData[i]['PIN'] == '' || insertData[i]['PIN'] < 99999 || insertData[i]['PIN'] > 999999  ){
                insertData[i]['PIN'] = null;
            }
           // console.log(insertData);
            if (!dataByPhoneNumber[insertData[i].PHONE_NUMBER]) {
                
                let formFiledArray = await  uploadModel.manageArrayQuery([], commingBankName);
                sqlQuery = sqlQuery + ` INSERT INTO card_applications_main_table (name, email, phone_number , tracking_id , form_filled_array , created_at, city, state , pin_code ) 
            VALUES ('`+ insertData[i].NAME + `', '` + insertData[i].EMAIL + `', ` + insertData[i].PHONE_NUMBER + `, '` + insertData[i].TRACKING_ID + `' , `+formFiledArray+` , '`+insertData[i].CREATED_DATE+`', '${insertData[i]['CITY']}', '${insertData[i]['STATE']}' , ${insertData[i]['PIN']})
            ON CONFLICT (phone_number) DO UPDATE 
              SET name = excluded.name, 
                  email = excluded.email,
                  city = excluded.city,
                  state = excluded.state,
                  updated_at = (now() AT TIME ZONE 'Asia/Kolkata');`;
            } else {
                let matchedData = dataByPhoneNumber[insertData[i].PHONE_NUMBER];
                if (matchedData['pin_code'] && matchedData['pin_code'] != ''){
                    insertData[i]['PIN'] = matchedData['pin_code'];
                }
                let formFiledArray = await uploadModel.manageArrayQuery(matchedData['form_filled_array'], commingBankName);
                updateQuery = updateQuery + ` UPDATE card_applications_main_table
                SET name = '`+ insertData[i].NAME + `', 
                    email = '` + insertData[i].EMAIL + `',
                    form_filled_array = `+formFiledArray+`,
                    city = '${insertData[i]['CITY']}',
                    state = '${insertData[i]['STATE']}',
                    pin_code = ${insertData[i]['PIN']},
                    updated_at = (now() AT TIME ZONE 'Asia/Kolkata') where id = `+matchedData['id']+`;`;
                    
            }

        } 

    }
    console.log('IN INSERT 444', updateQuery);
    console.log('IN Update MAIN TABLE', updateQuery);
    try {
        let query;
        if (sqlQuery != '') {
            query = await pool.query(sqlQuery, []);
            console.log('IN  query');
        }
        if (updateQuery != '') {
            query = await pool.query(updateQuery, []);
            console.log('IN  updateQuery');
        }
        returnData = true;
    } catch (error) {
        console.error(error);
       // returnData = ;
    }
    return returnData;



}

uploadModel.manageArrayQuery = async function (matchedDataArray , bankName) {
    let formFilledArrayQuery = ``;
    let formFilledArrayArray = [];
    let isAlredayFilledForm = false;
    if (matchedDataArray && matchedDataArray.length > 0) {
        for (let j = 0; j < matchedDataArray.length; j++) {

            if (matchedDataArray[j]) {
                if (matchedDataArray[j] == bankName) {
                    isAlredayFilledForm = true;
                }
                formFilledArrayArray.push(matchedDataArray[j]);
            }

        }
        if (!isAlredayFilledForm) {
            formFilledArrayArray.push(bankName);
        }

    } else {
        formFilledArrayArray.push(bankName);
    }
    formFilledArrayQuery = `ARRAY` + JSON.stringify(formFilledArrayArray).split('"').join("'");
    return formFilledArrayQuery;
}



module.exports = uploadModel;