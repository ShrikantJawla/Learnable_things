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
    let queryToDb = `SELECT * FROM card_applications_main_table  WHERE "tracking_id" != 'null'`;
    let mainData = [];
    try {
        let dataQuery = await pool.query(queryToDb);
        mainData = dataQuery.rows;
    } catch (error) {
        console.log(error);

    }
    return mainData;
}

uploadModel.entryToBobFromSheetAjex = async function (insertData, bobAllApplications, bobApplicationsByApplicationId, allApplications, appApplicationDataByPhoneNumber) {

    //console.log(insertData);

    //console.log(allApplications, "allApplicationsallApplications");
    let returnData = false;

    let sqlQuery = '';
    let sqlQueryUpdate = '';
    let updateMainApplicationTableSql = '';
    let ipApproveData = [];

    for (let i = 0; i < insertData.length; i++) {
        let utmTrack = insertData[i]['UTM_SOURCE'].split('_');
        let splittedUtm = utmTrack[utmTrack.length - 1];
        let finalStatus = '';
        let updateApprovedStatus = null;
        let iPaStatus = false;
        let updateIPAStatusQuery = '';
        let internalSplitted = '';

        // console.log("\n",insertData[i]['UTM_SOURCE'], "utm source");
        // console.log(utmTrack,"utm track here");
        // console.log(splittedUtm, "splitted utm");



        if (utmTrack && utmTrack[0] == '1CardInsider') {
            // console.log("im in utm track if ");
            if (insertData[i]['UTM_MEDIUM'] != 'Portal' || insertData[i]['UTM_MEDIUM'] != 'tra') {
                // console.log("im in utm track portal check  if ");
                //  console.log(`${insertData[i]['UTM_MEDIUM']} ---utm-medium`);
                let internalSplit = insertData[i]['UTM_MEDIUM'].split('-');
                //  console.log(internalSplit," internal splitted here");
                splittedUtm = internalSplit[0];
                if (internalSplit.length == 2) {
                    internalSplitted = internalSplit[1];
                }
                // console.log("splitted utm ----", splittedUtm);


            }
        }

        // console.log(splittedUtm," splitted utm here after 1cardinsider \n");

        if (insertData[i].APPLICATIONSTATUS == 'Approve' || insertData[i].APPLICATIONSTATUS == 'UWL1 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL2 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL3 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'VKYC Application In Progress' || insertData[i].APPLICATIONSTATUS == 'AQ Initiated' || insertData[i].APPLICATIONSTATUS == 'COPs Application In Progress' || insertData[i].APPLICATIONSTATUS == 'FI Application In Progress' || insertData[i].APPLICATIONSTATUS == 'CRE Application In Progress' || insertData[i].APPLICATIONSTATUS == 'RM INITIATED' || insertData[i].APPLICATIONSTATUS == 'DASM Physical Doc Initiated') {
            iPaStatus = true;
            updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
        }
        if (insertData[i].APPLICATIONSTATUS == 'UWL1 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL2 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL3 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'VKYC Application In Progress' || insertData[i].APPLICATIONSTATUS == 'AQ Initiated' || insertData[i].APPLICATIONSTATUS == 'COPs Application In Progress' || insertData[i].APPLICATIONSTATUS == 'FI Application In Progress' || insertData[i].APPLICATIONSTATUS == 'CRE Application In Progress' || insertData[i].APPLICATIONSTATUS == 'RM INITIATED' || insertData[i].APPLICATIONSTATUS == 'DASM Physical Doc Initiated') {
            finalStatus = 'Pending';
        } else if (insertData[i].APPLICATIONSTATUS == 'Approve') {
            iPaStatus = true;
            finalStatus = 'Approved';
            ipApproveData.push({ lead: 'bobapp', trackingId: splittedUtm });
        } else if (insertData[i].APPLICATIONSTATUS == 'REJECT' || insertData[i].APPLICATIONSTATUS == 'Cancelled Application') {
            finalStatus = 'Rejected';
        } else {
            finalStatus = 'In Complete';
        }

        if (iPaStatus) {
            ipApproveData.push({ lead: 'bobipa', trackingId: splittedUtm });
        }
        let phoneNumberOfCurrentApplication;
        if (internalSplitted != "") {
            phoneNumberOfCurrentApplication = internalSplitted / 3;
        }
        // if (utmTrack && utmTrack[0] == '1CardInsider'){
        //     console.log( splittedUtm );
        //     console.log(allApplications[splittedUtm]);
        // }
        if ((splittedUtm || phoneNumberOfCurrentApplication) && (allApplications[splittedUtm] || appApplicationDataByPhoneNumber[phoneNumberOfCurrentApplication])) {
            let matchedData = {};
            if (appApplicationDataByPhoneNumber[phoneNumberOfCurrentApplication]) {
                matchedData = appApplicationDataByPhoneNumber[phoneNumberOfCurrentApplication]
            } else if (allApplications[splittedUtm]) {
                matchedData = allApplications[splittedUtm];
            }

            insertData[i].main_table = matchedData.id;
            insertData[i].mobile_number = matchedData.phone_number;

            insertData[i].name = matchedData.name;
            //console.log(insertData[i]);

            let ifApprovedQuery = ``;
            if (insertData[i].APPLICATIONSTATUS == "Approve") {
                updateApprovedStatus = true;
                let banksApproved = await uploadModel.manageArrayQuery(matchedData.banks_approved_array);
                ifApprovedQuery = ` "banks_approved_array" = ` + banksApproved + `,`;
            }

            if (insertData[i]['REJECT_REASON'] == 'CIBIL NEGATIVE / NOT Satisfactory') {

                updateIPAStatusQuery = updateIPAStatusQuery + ` , low_cibil_score_bool = false`;
            }

            let formFilledArrayQuery = await uploadModel.manageArrayQuery(matchedData.form_filled_array);
            let banksApplied = await uploadModel.manageArrayQuery(matchedData.banks_applied_array);

            let updateMainTableName = ' ';
            let updateMainTableCity = ` `;
            let updateMainTableState = ` `;

            if (insertData[i]['name']) {
                updateMainTableName = ` name = '${insertData[i]['name']}' , `;
            }
            if (insertData[i]['CITY']) {
                updateMainTableCity = ` city = '${insertData[i]['CITY']}' , `;
            }
            if (insertData[i]['STATE']) {
                updateMainTableState = ` state = '${insertData[i]['STATE']}' , `;
            }


            updateMainApplicationTableSql = updateMainApplicationTableSql + ` UPDATE card_applications_main_table SET  ` + updateMainTableName + updateMainTableCity + updateMainTableState + ifApprovedQuery + ` "banks_applied_array" = ` + banksApplied + `, "form_filled_array" = ` + formFilledArrayQuery + ` ` + updateIPAStatusQuery + ` WHERE "id" = ` + insertData[i].main_table + `; `;
            if (bobAllApplications[insertData[i].main_table] && bobApplicationsByApplicationId[insertData[i].APPLICATION_NO]) {
                //console.log(bobApplicationsByApplicationId[insertData[i].main_table], "MAIN");
                let currentBankId = bobAllApplications[insertData[i].main_table].bob_id;
                sqlQueryUpdate = sqlQueryUpdate + ` UPDATE bob_applications_table SET "bob_application_status" = '` + finalStatus + `' , "ca_main_table" = ` + insertData[i].main_table + `, "bob_ipa_status_bool" = '` + iPaStatus + `'  WHERE "bob_id" = ` + currentBankId + `;`
            } else {
                sqlQuery = sqlQuery + ` INSERT INTO bob_applications_table("bob_application_status","bob_date","bob_utm_source","bob_application_number", "bob_name", "ca_main_table" , "bob_ipa_status_bool" , "bob_email_id" , "bob_card_type" , "bob_state" , "bob_city" , "bob_esign_form_url" , "bob_ipa_original_status_sheet" ,  "bob_reject_reason" , "bob_dasm_reason" , "bob_esign_status" , "bob_stage" , "bob_utm_medium" , "bob_utm_campaign", "bob_vkyc_link")
				VALUES ( '`+ finalStatus + `', '` + insertData[i].DATE + `', '` + insertData[i].UTM_SOURCE + `', '` + insertData[i].APPLICATION_NO + `' , '` + insertData[i].name + `' , ` + insertData[i].main_table + ` , ` + iPaStatus + ` , '` + insertData[i].EMAILID + `' , '` + insertData[i].PRODUCT_VARIANT + `' , '` + insertData[i].STATE + `' , '` + insertData[i].CITY + `' , '` + insertData[i].ESIGN_URL + `' , '` + insertData[i].APPLICATIONSTATUS + `' , '` + insertData[i]['REJECT_REASON'] + `' , '` + insertData[i]['DASM_REASON'] + `' , '` + insertData[i]['ESIGN_STATUS'] + `' , '` + insertData[i]['STAGE'] + `' , '` + insertData[i]['UTM_MEDIUM'] + `' , '` + insertData[i]['UTM_CAMPAIGN'] + `', '` + insertData[i]['VKYC_LINK'] + `' );`;
            }
        } else {
            if (bobApplicationsByApplicationId[insertData[i].APPLICATION_NO]) {
                //console.log(bobApplicationsByApplicationId[insertData[i].application_id], "APPLICATION");
                let currentBankId = bobApplicationsByApplicationId[insertData[i].APPLICATION_NO].bob_id;
                sqlQueryUpdate = sqlQueryUpdate + ` UPDATE bob_applications_table SET "bob_application_status" = '` + finalStatus + `' , "bob_ipa_status_bool" = '` + iPaStatus + `'  WHERE "bob_id" = ` + currentBankId + `;`
            } else {
                sqlQuery = sqlQuery + ` INSERT INTO bob_applications_table("bob_application_status","bob_date","bob_utm_source","bob_application_number" , "bob_ipa_status_bool" ,  "bob_email_id" , "bob_card_type" , "bob_state" , "bob_city" , "bob_esign_form_url" , "bob_ipa_original_status_sheet" , "bob_reject_reason" , "bob_dasm_reason" , "bob_esign_status" , "bob_stage" , "bob_utm_medium" , "bob_utm_campaign", "bob_vkyc_link")
                VALUES ( '`+ finalStatus + `', '` + insertData[i].DATE + `', '` + insertData[i].UTM_SOURCE + `', '` + insertData[i].APPLICATION_NO + `' , ` + iPaStatus + ` , '` + insertData[i].EMAILID + `' , '` + insertData[i].PRODUCT_VARIANT + `' , '` + insertData[i].STATE + `' , '` + insertData[i].CITY + `' , '` + insertData[i].ESIGN_URL + `' , '` + insertData[i].APPLICATIONSTATUS + `' , '` + insertData[i]['REJECT_REASON'] + `' , '` + insertData[i]['DASM_REASON'] + `' , '` + insertData[i]['ESIGN_STATUS'] + `' , '` + insertData[i]['STAGE'] + `' , '` + insertData[i]['UTM_MEDIUM'] + `' , '` + insertData[i]['UTM_CAMPAIGN'] + `', '` + insertData[i]['VKYC_LINK'] + `' );`;
                console.log('notMatched');
            }

        }

    }
    //console.log('IN INSERT', sqlQuery);
    // console.log('IN UPDATE' , sqlQueryUpdate);
    // console.log('IN Update MAIN TABLE', updateMainApplicationTableSql);
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
                if (matchedDataArray[j] == 'bob') {
                    isAlredayFilledForm = true;
                }
                formFilledArrayArray.push(matchedDataArray[j]);
            }

        }
        if (!isAlredayFilledForm) {
            formFilledArrayArray.push('bob');
        }

    } else {
        formFilledArrayArray.push('bob');
    }
    formFilledArrayQuery = `ARRAY` + JSON.stringify(formFilledArrayArray).split('"').join("'");
    return formFilledArrayQuery;
}

uploadModel.getAllBobApplicationsData = async function () {
    returnData = false;
    try {
        const query = await pool.query(`SELECT * FROM public.bob_applications_table `, []);
        // console.log(query);
        returnData = query.rows;
    } catch (error) {
        // console.error(error);
        returnData = error;
    }
    return returnData;
}

module.exports = uploadModel;