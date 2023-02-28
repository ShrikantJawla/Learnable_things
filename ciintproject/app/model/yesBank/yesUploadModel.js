let { pool } = require('../../utils/configs/database');
//////////////////////////////////////////
let uploadModel = {};

let allApplicationsModel = require('../applications/allApplicationsModel');





uploadModel.entryToAxisFromSheet = async function (insertData) {
    let dataFromMain = await allApplicationsModel.getAllApplicationsForOthers();

    //console.log(dataFromMain, "dataFromMain");
    let returnData = false;
    let dataToDb = [];
    console.log("entryToAxisFromSheet");
    let singleObj = {
        application_id: null,
        date: null,
        name: null,
        mobile_number: null,
        card_type: null,
        ipa_status: null,
        final_status: null,
        main_table: null,
    };
    console.log(insertData[0], "insertData");
    console.log(dataFromMain[0], "dataFromMain");

    console.log(insertData[0].MOBILE_NO.slice(0, 2), "insertData length");

    if (dataFromMain.length > 0 && insertData.length > 0) {
        console.log("first two from main -------->>>>", dataFromMain[0].phone_number.slice(0, 2));
        console.log("first two from main -------->>>>", dataFromMain[0].phone_number.slice(dataFromMain[0].phone_number.length - 6, dataFromMain[0].phone_number.length));
        console.log("first two from insert -------->>>>", insertData[0].MOBILE_NO.slice(0, 2));
        console.log("first two from insert -------->>>>", insertData[0].MOBILE_NO.slice(insertData[0].MOBILE_NO.length - 6, insertData[0].MOBILE_NO.length));

        let matchedFromMain = [];
        for (let i = 0; i < dataFromMain.length; i++) {
            console.log(i, "insertData length");

            // matchedFromMain = dataFromMain.filter(item => ((item.phone_number.slice(0, 2) == insertData[i].MOBILE_NO.slice(0, 2)) && (item.phone_number.slice(item.phone_number.length - 6, item.phone_number.length) == insertData[i].MOBILE_NO.slice(insertData[i].MOBILE_NO.length - 6, insertData[i].MOBILE_NO.length))));

            for (let j = 0; j < insertData.length; j++) {
                if ((dataFromMain[i].phone_number.slice(0, 2) === insertData[j].MOBILE_NO.slice(0, 2)) && (dataFromMain[i].phone_number.slice(dataFromMain[i].phone_number.length - 6, dataFromMain[i].phone_number.length) === insertData[j].MOBILE_NO.slice(insertData[j].MOBILE_NO.length - 6, insertData[j].MOBILE_NO.length))) {
                    console.log("hi im in if condition ", i, j);
                    console.log("first  from main -------->>>>", dataFromMain[i].phone_number.slice(0, 2));
                    console.log("last  from main -------->>>>", dataFromMain[i].phone_number.slice(dataFromMain[i].phone_number.length - 6, dataFromMain[i].phone_number.length));
                    console.log("first two from insert -------->>>>", insertData[j].MOBILE_NO.slice(0, 2));
                    console.log("last  from insert -------->>>>", insertData[j].MOBILE_NO.slice(insertData[j].MOBILE_NO.length - 6, insertData[j].MOBILE_NO.length));
                    // singleObj.application_id = insertData[j].APPLICATION_NO;
                    // singleObj.date = insertData[j].DATE;
                    // singleObj.name = insertData[j].NAME;
                    // singleObj.mobile_number = dataFromMain[i].phone_number;
                    // singleObj.card_type = insertData[j].CARDTYPE;
                    // singleObj.ipa_status = insertData[j]['IPA STATUS'];
                    // singleObj.final_status = insertData[j]['ETE STATUS'];
                    // singleObj.main_table = dataFromMain[i].id;
                    // singleObj.main_id = i;
                    // singleObj.insertDataId = j;

                    dataToDb.push({
                        application_id: insertData[j].APPLICATION_NO,
                        date: insertData[j].DATE,
                        name: insertData[j].NAME,
                        mobile_number: dataFromMain[i].phone_number,
                        mobile_number_2: insertData[j].MOBILE_NO,
                        card_type: insertData[j].CARDTYPE,
                        ipa_status: insertData[j]['IPA STATUS'],
                        final_status: insertData[j]['ETE STATUS'],
                        main_table: dataFromMain[i].id,
                        main_id: i,
                        insertDataId: j,
                    });
                    //console.log(singleObj, "dataToDb");
                }

            }



            //console.log("dataToDb in for ", dataToDb);
        }

        console.log("matchedFromMain", dataToDb);
        console.log(insertData.length);


    }

    //console.log(dataToDb, "dataToDb");





    returnData = true;

    //console.log(insertData[0], "dataFromSheet here");

    return dataToDb;




}

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

uploadModel.entryToBobFromSheetAjex = async function (allParsedData, yesApplicationsByApplicationId, appApplicationDataByPhoneNumber) {

    //console.log(allParsedData);

    //console.log(allApplications, "allApplicationsallApplications");
    let returnData = false;

    let sqlQuery = '';
    let sqlQueryUpdate = '';
    let updateMainApplicationTableSql = '';
    let ipApproveData = [];

    let currentApplicationDataS = allParsedData[0];
    console.log(currentApplicationDataS);
    console.log(currentApplicationDataS['LAST_LINK_TRIGGER_DATE']);
    //console.log(allParsedData[0]);
    for (let i = 0; i < allParsedData.length; i++) {
        let isIPApproved = false;
        let matchedDataByMain = false;
        let currentApplicationData = allParsedData[i];
        let updateIPAStatusQuery = '';
        //console.log(currentApplicationData['last_link_trigger_date']);
        let finalStatus = '';
        if (currentApplicationData['PUSHED_TO_APS'] == 'PASS') {
            isIPApproved = true;
        } else if (currentApplicationData['DEDUPE_STATUS'] == 'PASS' && currentApplicationData['POLICY_CHECK_STATUS'] == 'PASS' && currentApplicationData['CIBIL_CHECK_STATUS'] == 'PASS') {
            isIPApproved = true;
        }
        if (isIPApproved) {
            updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
        }
        if (currentApplicationData['FINAL APPLICATION STATUS'] == 'APPROVE') {
            finalStatus = 'Approved';
        } else if (currentApplicationData['FINAL APPLICATION STATUS'] == 'DECLINE') {
            finalStatus = 'Rejected';
        } else {
            finalStatus = 'Pending';
        }

        if (currentApplicationData['CIBIL_CHECK_STATUS'] != 'PASS') {
            updateIPAStatusQuery = updateIPAStatusQuery + ` , low_cibil_score_bool = false`;
        }
        if (currentApplicationData && currentApplicationData['CUSTOMER_CONTACT']) {
            currentApplicationData['APPLICATION_REAL_ID'] = currentApplicationData['APPLICATION_ID'];
            if (!currentApplicationData['APPLICATION_ID']) {
                currentApplicationData['APPLICATION_ID'] = currentApplicationData['CUSTOMER_CONTACT'] + '_' + currentApplicationData['LAST_LINK_TRIGGER_DATE'];
            }
            if (appApplicationDataByPhoneNumber[currentApplicationData['CUSTOMER_CONTACT']]) {
                console.log('I AM MATCHED');
                let matchedData = appApplicationDataByPhoneNumber[currentApplicationData['CUSTOMER_CONTACT']];

                currentApplicationData.main_table = matchedData.id;

                let formFilledArrayQuery = await uploadModel.manageArrayQuery(matchedData.form_filled_array);
                let banksApplied = await uploadModel.manageArrayQuery(matchedData.banks_applied_array);
                let updateMainTableName = ' ';
                let updateMainTableCity = ` `;
                let updateMainTableState = ` `;

                if (currentApplicationData['ADHAR_NAME']) {
                    updateMainTableName = ` name = '${currentApplicationData['ADHAR_NAME']}' , `;
                    updateMainTableName = updateMainTableName + `  adhar_name = '${currentApplicationData['ADHAR_NAME']}' , `;
                }
                if (currentApplicationData['OCCUPATION']) {
                    updateIPAStatusQuery = updateIPAStatusQuery + `  , occupation = '${currentApplicationData['OCCUPATION']}' `;
                }
                if (currentApplicationData['AADHAR_PIN']) {
                    updateIPAStatusQuery = updateIPAStatusQuery + `  , aadhar_pin = '${currentApplicationData['AADHAR_PIN']}' `;
                }
                if (currentApplicationData['ANNUAL_INCOME']) {
                    updateIPAStatusQuery = updateIPAStatusQuery + `  , salary = '${currentApplicationData['ANNUAL_INCOME']}' `;
                } else if (currentApplicationData['MONTHLY_INCOME']) {
                    updateIPAStatusQuery = updateIPAStatusQuery + `  , salary = '${currentApplicationData['MONTHLY_INCOME'] * 12}' `;
                }
                if (currentApplicationData['COMPANY_NAME']) {
                    updateIPAStatusQuery = updateIPAStatusQuery + `  , company_name = '${currentApplicationData['COMPANY_NAME']}' `;
                }
                //console.log(updateIPAStatusQuery , "updateIPAStatusQuery");
                updateMainApplicationTableSql = updateMainApplicationTableSql + ` UPDATE card_applications_main_table SET  ` + updateMainTableName + updateMainTableCity + updateMainTableState + ` "banks_applied_array" = ` + banksApplied + `, "form_filled_array" = ` + formFilledArrayQuery + ` ` + updateIPAStatusQuery + ` WHERE "id" = ` + currentApplicationData.main_table + `; `;

                if (yesApplicationsByApplicationId[currentApplicationData['APPLICATION_ID']]) {
                    let yesBankMatchedData = yesApplicationsByApplicationId[currentApplicationData['APPLICATION_ID']];
                    if (currentApplicationData['APPLICATION_REAL_ID'] != '') {
                        currentApplicationData['APPLICATION_ID'] = currentApplicationData['APPLICATION_REAL_ID'];
                    }
                    sqlQueryUpdate = sqlQueryUpdate + ` UPDATE public.yes_bank_applications_table
                    SET yb_ipa_status='${isIPApproved}',yb_cibil_check_status= '${currentApplicationData['CIBIL_CHECK_STATUS']}' ,yb_dip_reject_reason='${currentApplicationData['DECISION DATE']}',yb_vkyc_unable_reject_reasons='${currentApplicationData['VKYC UNABLE/REJECT REASONS']}',yb_final_original_status='${currentApplicationData['FINAL APPLICATION STATUS']}',yb_application_status='${currentApplicationData['STATUS']}',yb_dedupe_status='${currentApplicationData['DEDUPE_STATUS']}',yb_last_update_on='${currentApplicationData['LAST_UPDATE_ON']}',yb_idv='${currentApplicationData['IDV']}',yb_credit_limit='${currentApplicationData['CREDIT_LIMIT']}',yb_ekyc_status='${currentApplicationData['EKYC_STATUS']}',yb_decision_date='${currentApplicationData['DECISION DATE']}',yb_final_status='${finalStatus}',yb_aps_ref_number='${currentApplicationData['APS_REF_NUMBER']}',yb_policy_check_status='${currentApplicationData['POLICY_CHECK_STATUS']}',yb_decline_reson='${currentApplicationData['APPLICATION DECLINE REASON']}',yb_application_number='${currentApplicationData['APPLICATION_ID']}' , yb_real_application_id = '${currentApplicationData['APPLICATION_REAL_ID']}' , ca_main_table = '${currentApplicationData.main_table}'
                    WHERE yb_idv='${yesBankMatchedData.yb_id}';`
                } else {
                    sqlQuery = sqlQuery + `INSERT INTO public.yes_bank_applications_table (ca_main_table,yb_application_created,yb_application_number,yb_aps_ref_number,yb_ekyc_status,yb_application_status,yb_final_status,yb_ipa_status,yb_dedupe_status,yb_policy_check_status,yb_cibil_check_status,yb_idv,yb_last_update_on,yb_apply_through,yb_credit_limit,yb_vkyc_unable_reject_reasons,yb_final_original_status,yb_decision_date,yb_decline_reson,yb_dip_reject_reason,yb_mobile_number , yb_real_application_id, yb_application_status_initial)
                    VALUES ('${currentApplicationData.main_table}','${currentApplicationData['LAST_LINK_TRIGGER_DATE']}','${currentApplicationData['APPLICATION_ID']}','${currentApplicationData['APS_REF_NUMBER']}','${currentApplicationData['EKYC_STATUS']}','${currentApplicationData['STATUS']}','${finalStatus}','${isIPApproved}','${currentApplicationData['DEDUPE_STATUS']}','${currentApplicationData['POLICY_CHECK_STATUS']}','${currentApplicationData['CIBIL_CHECK_STATUS']}' ,'${currentApplicationData['IDV']}' ,'${currentApplicationData['LAST_UPDATE_ON']}','${currentApplicationData['APPLY_THROUGH']}','${currentApplicationData['CREDIT_LIMIT']}','${currentApplicationData['VKYC UNABLE/REJECT REASONS']}','${currentApplicationData['FINAL APPLICATION STATUS']}','${currentApplicationData['DECISION DATE']}','${currentApplicationData['APPLICATION DECLINE REASON']}','${currentApplicationData['DIP REJECT REASON']}','${currentApplicationData['CUSTOMER_CONTACT']}' , '${currentApplicationData['APPLICATION_REAL_ID']}', '${currentApplicationData['STATUS']}' );`
                }
            } else {
                if (yesApplicationsByApplicationId[currentApplicationData['APPLICATION_ID']]) {
                    let yesBankMatchedData = yesApplicationsByApplicationId[currentApplicationData['APPLICATION_ID']];
                    if (currentApplicationData['APPLICATION_REAL_ID'] != '') {
                        currentApplicationData['APPLICATION_ID'] = currentApplicationData['APPLICATION_REAL_ID'];
                    }
                    sqlQueryUpdate = sqlQueryUpdate + ` UPDATE public.yes_bank_applications_table
                    SET yb_ipa_status='${isIPApproved}',yb_cibil_check_status= '${currentApplicationData['CIBIL_CHECK_STATUS']}' ,yb_dip_reject_reason='${currentApplicationData['DECISION DATE']}',yb_vkyc_unable_reject_reasons='${currentApplicationData['VKYC UNABLE/REJECT REASONS']}',yb_final_original_status='${currentApplicationData['FINAL APPLICATION STATUS']}',yb_application_status='${currentApplicationData['STATUS']}',yb_dedupe_status='${currentApplicationData['DEDUPE_STATUS']}',yb_last_update_on='${currentApplicationData['LAST_UPDATE_ON']}',yb_idv='${currentApplicationData['IDV']}',yb_credit_limit='${currentApplicationData['CREDIT_LIMIT']}',yb_ekyc_status='${currentApplicationData['EKYC_STATUS']}',yb_decision_date='${currentApplicationData['DECISION DATE']}',yb_final_status='${finalStatus}',yb_aps_ref_number='${currentApplicationData['APS_REF_NUMBER']}',yb_policy_check_status='${currentApplicationData['POLICY_CHECK_STATUS']}',yb_decline_reson='${currentApplicationData['APPLICATION DECLINE REASON']}',yb_application_number='${currentApplicationData['APPLICATION_ID']}' , yb_real_application_id = '${currentApplicationData['APPLICATION_REAL_ID']}'
                    WHERE yb_idv='${yesBankMatchedData.yb_id}';`
                } else {
                    sqlQuery = sqlQuery + `INSERT INTO public.yes_bank_applications_table (yb_application_created,yb_application_number,yb_aps_ref_number,yb_ekyc_status,yb_application_status,yb_final_status,yb_ipa_status,yb_dedupe_status,yb_policy_check_status,yb_cibil_check_status,yb_idv,yb_last_update_on,yb_apply_through,yb_credit_limit,yb_vkyc_unable_reject_reasons,yb_final_original_status,yb_decision_date,yb_decline_reson,yb_dip_reject_reason,yb_mobile_number , yb_real_application_id, yb_application_status_initial)
                VALUES ('${currentApplicationData['LAST_LINK_TRIGGER_DATE']}','${currentApplicationData['APPLICATION_ID']}','${currentApplicationData['APS_REF_NUMBER']}','${currentApplicationData['EKYC_STATUS']}','${currentApplicationData['STATUS']}','${finalStatus}','${isIPApproved}','${currentApplicationData['DEDUPE_STATUS']}','${currentApplicationData['POLICY_CHECK_STATUS']}','${currentApplicationData['CIBIL_CHECK_STATUS']}' ,'${currentApplicationData['IDV']}' ,'${currentApplicationData['LAST_UPDATE_ON']}','${currentApplicationData['APPLY_THROUGH']}','${currentApplicationData['CREDIT_LIMIT']}','${currentApplicationData['VKYC UNABLE/REJECT REASONS']}','${currentApplicationData['FINAL APPLICATION STATUS']}','${currentApplicationData['DECISION DATE']}','${currentApplicationData['APPLICATION DECLINE REASON']}','${currentApplicationData['DIP REJECT REASON']}','${currentApplicationData['CUSTOMER_CONTACT']}' , '${currentApplicationData['APPLICATION_REAL_ID']}', '${currentApplicationData['STATUS']}' );`
                }

            }
        }
    }
    //console.log('IN INSERT', sqlQuery);
    // console.log('IN UPDATE' , sqlQueryUpdate);
    //console.log('IN Update MAIN TABLE', updateMainApplicationTableSql);
    try {
        let query;
        if (sqlQueryUpdate != '') {
            //console.log('IN UPDATE' , sqlQueryUpdate);
            query = await pool.query(sqlQueryUpdate, []);
            console.log('IN UPDATE query');
        }

        if (sqlQuery != '') {
            // console.log('IN INSERT', sqlQuery);
            query = await pool.query(sqlQuery, []);
            console.log('IN INSERT');
        }

        if (updateMainApplicationTableSql != '') {
            // console.log('IN Update MAIN TABLE', updateMainApplicationTableSql);
            query = await pool.query(updateMainApplicationTableSql, []);
            console.log('IN Update MAIN TABLE');
        }
        // console.log(sqlQueryUpdate , "IN UPDATE");
        // console.log(query);
        returnData = query.rows;
    } catch (error) {
        console.error(error);
        returnData = error;
    }
    return { ipApproveData };

}

uploadModel.manageArrayQuery = async function (matchedDataArray) {
    let formFilledArrayQuery = ``;
    let formFilledArrayArray = [];
    let isAlredayFilledForm = false;
    if (matchedDataArray && matchedDataArray.length > 0) {
        for (let j = 0; j < matchedDataArray.length; j++) {

            if (matchedDataArray[j]) {
                if (matchedDataArray[j] == 'yesbank') {
                    isAlredayFilledForm = true;
                }
                formFilledArrayArray.push(matchedDataArray[j]);
            }

        }
        if (!isAlredayFilledForm) {
            formFilledArrayArray.push('yesbank');
        }

    } else {
        formFilledArrayArray.push('yesbank');
    }
    formFilledArrayQuery = `ARRAY` + JSON.stringify(formFilledArrayArray).split('"').join("'");
    return formFilledArrayQuery;
}

uploadModel.getAllYesBankApplicationsData = async function () {
    returnData = false;
    try {
        const query = await pool.query(`SELECT * FROM public.yes_bank_applications_table `, []);
        // console.log(query);
        returnData = query.rows;
    } catch (error) {
        // console.error(error);
        returnData = error;
    }
    return returnData;
}

module.exports = uploadModel;