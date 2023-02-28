let { pool } = require('../../utils/configs/database');
//////////////////////////////////////////
let uploadModel = {};

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

uploadModel.entryToIdfcFromSheetAjex = async function (insertData, idfcAllApplications, idfcApplicationsByApplicationId, allApplications, appApplicationDataByPhoneNumber) {

    //console.log(allApplications, "allApplicationsallApplications");
    let returnData = false;

    let sqlQuery = '';
    let sqlQueryUpdate = '';
    let updateMainApplicationTableSql = '';
    let ipApproveData = [];
    let approveDataArray = [];

    for (let i = 0; i < insertData.length; i++) {
        let utmTrack = insertData[i]['UTM CAMPAIGN'].split('_');
        let spplitedUtm = utmTrack[utmTrack.length - 1];
        let leadFrom = utmTrack[utmTrack.length - 2];
        if (utmTrack[utmTrack.length - 3] == 'ci') {
            leadFrom = 'cimoney'
        }
        let mainTrakingId = '';
        let isApproved = false;
        let finalStatus = '';
        let updateApprovedStatus = null;
        let iPaStatus = false;
        let updateIPAStatusQuery = '';
        if (spplitedUtm == '') {
            spplitedUtm = '{param}'
        }
        // if (insertData[i].STAGE == 'Approved' ){
        //     iPaStatus = true;
        //     updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
        // }
        // if (insertData[i].APPLICATIONSTATUS == 'Approve' || insertData[i].APPLICATIONSTATUS == 'UWL1 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL2 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL3 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'VKYC Application In Progress' || insertData[i].APPLICATIONSTATUS == 'AQ Initiated' || insertData[i].APPLICATIONSTATUS == 'COPs Application In Progress' || insertData[i].APPLICATIONSTATUS == 'FI Application In Progress' || insertData[i].APPLICATIONSTATUS == 'CRE Application In Progress' || insertData[i].APPLICATIONSTATUS == 'RM INITIATED' || insertData[i].APPLICATIONSTATUS == 'DASM Physical Doc Initiated') {
        //     iPaStatus = true;
        //     updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
        // }

        // if ( insertData[i].APPLICATIONSTATUS == 'UWL1 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL2 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'UWL3 Application In Progress' || insertData[i].APPLICATIONSTATUS == 'VKYC Application In Progress' || insertData[i].APPLICATIONSTATUS == 'AQ Initiated' || insertData[i].APPLICATIONSTATUS == 'COPs Application In Progress' || insertData[i].APPLICATIONSTATUS == 'FI Application In Progress' || insertData[i].APPLICATIONSTATUS == 'CRE Application In Progress' || insertData[i].APPLICATIONSTATUS == 'RM INITIATED' || insertData[i].APPLICATIONSTATUS == 'DASM Physical Doc Initiated') {
        //     finalStatus = 'Pending';
        // } else if (insertData[i].APPLICATIONSTATUS == 'Approve') {
        //     iPaStatus = true;
        //     finalStatus = 'Approved';
        // } else if (insertData[i].APPLICATIONSTATUS == 'REJECT' || insertData[i].APPLICATIONSTATUS == 'Cancelled Application') {
        //     finalStatus = 'Rejected';
        // } else {
        //     finalStatus = 'In Complete';
        // }


        if (insertData[i].STAGE == 'Approved') {
            iPaStatus = true;
            finalStatus = 'Approved';
            isApproved = true;
            console.log('APPROVED');
        } else if (insertData[i].STAGE == 'Cancelled' || insertData[i].STAGE == 'Rejected') {
            finalStatus = 'Rejected';
        } else if (insertData[i].STAGE == 'QDE' || insertData[i].STAGE == 'DDE') {
            finalStatus = 'In Complete';
        } else {
            iPaStatus = true;
            finalStatus = 'Pending';
        }
        if (!insertData[i]['FINAL CREDIT LIMIT']) {
            insertData[i]['FINAL CREDIT LIMIT'] = 0;
        }
        if (insertData[i]['CHOICE OF CREDIT CARD'] != "") {

            iPaStatus = true;
        }
        if (iPaStatus) {
            ipApproveData.push({ lead: 'idfcipa', trackingId: spplitedUtm });
        }

        let phoneNumberOfCurrentApplication;
        if (!isNaN(spplitedUtm)) {
            phoneNumberOfCurrentApplication = spplitedUtm / 3;
        }


        if (allApplications[spplitedUtm] || appApplicationDataByPhoneNumber[phoneNumberOfCurrentApplication]) {
            let matchedData = {};
            if (appApplicationDataByPhoneNumber[phoneNumberOfCurrentApplication]) {
                matchedData = appApplicationDataByPhoneNumber[phoneNumberOfCurrentApplication]
            } else if (allApplications[spplitedUtm]) {
                matchedData = allApplications[spplitedUtm];
            }
            // console.log(matchedData, "matchedData");
            if (matchedData.tracking_id && matchedData.tracking_id) {
                mainTrakingId = matchedData.tracking_id;
            }
            insertData[i].main_table = matchedData.id;
            insertData[i].mobile_number = matchedData.phone_number;

            insertData[i].name = matchedData.name;
            //console.log(insertData[i]);
            let ifApprovedQuery = ``;
            if (insertData[i].STAGE == "Approved") {
                updateApprovedStatus = true;
                let banksApproved = await uploadModel.manageArrayQuery(matchedData.banks_approved_array);
                ifApprovedQuery = ` "banks_approved_array" = ` + banksApproved + `,`;
                updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
            }
            if (insertData[i]['CHOICE OF CREDIT CARD'] != "") {
                updateIPAStatusQuery = ` , "ipa_status" = 'true'`;
            }
            if (insertData[i]['CANCELLATION/REJECTION REASON'] == 'Low Cibil Score Reject') {
                updateIPAStatusQuery = updateIPAStatusQuery + ` , low_cibil_score_bool = false`;
            }

            let formFilledArrayQuery = await uploadModel.manageArrayQuery(matchedData.form_filled_array);
            let banksApplied = await uploadModel.manageArrayQuery(matchedData.banks_applied_array);
            let updateMainTableCity = ` `;

            if (insertData[i]['LOCATION NAME']) {
                updateMainTableCity = ` city = '${insertData[i]['LOCATION NAME']}' , `;
            }
            updateMainApplicationTableSql = updateMainApplicationTableSql + ` UPDATE card_applications_main_table SET ` + updateMainTableCity + ifApprovedQuery + ` "banks_applied_array" = ` + banksApplied + `, "form_filled_array" = ` + formFilledArrayQuery + ` ` + updateIPAStatusQuery + ` WHERE "id" = ` + insertData[i].main_table + `; `;
            if (idfcAllApplications[insertData[i].main_table] && idfcApplicationsByApplicationId[insertData[i]['APPLICATION REF. NO.']]) {
                //console.log(idfcApplicationsByApplicationId[insertData[i].main_table], "MAIN");
                let currentBankId = idfcAllApplications[insertData[i].main_table].idfc_id;
                sqlQueryUpdate = sqlQueryUpdate + `  UPDATE idfc_bank_applications_table SET 
                idfc_reason = '`+ insertData[i]['CANCELLATION/REJECTION REASON'] + `',
                idfc_status = '`+ finalStatus + `',
                idfc_sub_status = '`+ insertData[i]['SUB STAGE'] + `',
                ca_main_table = `+ insertData[i].main_table + ` ,
                idfc_date_ipa_status = `+ iPaStatus + `,
                idfc_lead_from = '`+ leadFrom + `',
                updated_at = (now() AT TIME ZONE 'Asia/Kolkata')
                where idfc_id = `+ currentBankId + ` ;`;
            } else {
                sqlQuery = sqlQuery + ` INSERT INTO idfc_bank_applications_table 
                (idfc_application_number, idfc_crm_team_lead_id, idfc_utm_campaign, idfc_splitted_utm, idfc_location_city, idfc_choice_credit_card,
                idfc_credit_limit, idfc_reason, idfc_status, idfc_sub_status, idfc_date, idfc_full_name, ca_main_table , idfc_date_ipa_status , idfc_lead_from, idfc_stage_integration_status, idfc_sub_status_initial)
                values('`+ insertData[i]['APPLICATION REF. NO.'] + `', '` + insertData[i]['CRM LEAD ID'] + `', '` + insertData[i]['UTM CAMPAIGN'] + `', '` + spplitedUtm + `',
                '`+ insertData[i]['LOCATION NAME'] + `', '` + insertData[i]['CHOICE OF CREDIT CARD'] + `', ` + insertData[i]['FINAL CREDIT LIMIT'] + `,
                 ' `+ insertData[i]['CANCELLATION/REJECTION REASON'] + `', '` + finalStatus + `', '` + insertData[i]['SUB STAGE'] + `', '` + insertData[i]['CREATED DATE'] + `', ' ', ` + insertData[i].main_table + ` , ` + iPaStatus + ` , '` + leadFrom + `' , '` + insertData[i]['STAGE BY INTEGRATION STATUS'] + `', '` + insertData[i]['SUB STAGE'] + `' );`;
            }
            if (insertData[i].STAGE == "Approve") {
                console.log(insertData[i].main_table, ifApprovedQuery);
            }
        } else {
            if (idfcApplicationsByApplicationId[insertData[i]['APPLICATION REF. NO.']]) {
                //console.log(idfcApplicationsByApplicationId[insertData[i].application_id], "APPLICATION");
                let currentBankId = idfcApplicationsByApplicationId[insertData[i]['APPLICATION REF. NO.']].idfc_id;
                sqlQueryUpdate = sqlQueryUpdate + `  UPDATE idfc_bank_applications_table SET 
                idfc_reason = '`+ insertData[i]['CANCELLATION/REJECTION REASON'] + `',
                idfc_status = '`+ finalStatus + `',
                idfc_sub_status = '`+ insertData[i]['SUB STAGE'] + `',
                idfc_date_ipa_status = `+ iPaStatus + `,
                idfc_lead_from = '`+ leadFrom + `',
                idfc_stage_integration_status = '`+ insertData[i]['STAGE BY INTEGRATION STATUS'] + `',
                updated_at =(now() AT TIME ZONE 'Asia/Kolkata')
                where idfc_id = `+ currentBankId + ` ;`;
            } else {
                sqlQuery = sqlQuery + ` INSERT INTO idfc_bank_applications_table 
                (idfc_application_number, idfc_crm_team_lead_id, idfc_utm_campaign, idfc_splitted_utm, idfc_location_city, idfc_choice_credit_card,
                idfc_credit_limit, idfc_reason, idfc_status, idfc_sub_status, idfc_date, idfc_full_name , idfc_date_ipa_status , idfc_lead_from, idfc_stage_integration_status, idfc_sub_status_initial)
                values('`+ insertData[i]['APPLICATION REF. NO.'] + `', '` + insertData[i]['CRM LEAD ID'] + `', '` + insertData[i]['UTM CAMPAIGN'] + `', '` + spplitedUtm + `',
                '`+ insertData[i]['LOCATION NAME'] + `', '` + insertData[i]['CHOICE OF CREDIT CARD'] + `', '` + insertData[i]['FINAL CREDIT LIMIT'] + `',
                 ' `+ insertData[i]['CANCELLATION/REJECTION REASON'] + `', '` + finalStatus + `', '` + insertData[i]['SUB STAGE'] + `', '` + insertData[i]['CREATED DATE'] + `', ' ' , ` + iPaStatus + ` , '` + leadFrom + `' , '` + insertData[i]['STAGE BY INTEGRATION STATUS'] + `', '` + insertData[i]['SUB STAGE'] + `' );`;
                console.log('notMatched');
            }

        }
        if (iPaStatus) {
            if (mainTrakingId != '') {
                ipApproveData.push({ lead: 'idfcipa', trackingId: mainTrakingId });
            }

        }
        console.log(isApproved , "isApprovedisApproved");
        if (isApproved) {
            console.log('HI I AM IN --1111');
            if (mainTrakingId != '') {
                console.log('HI I AM IN --222');
                ipApproveData.push({ lead: 'idfcapp', trackingId: mainTrakingId });
            }
        }

    }
    //console.log('IN UPDATE 444' , sqlQueryUpdate);
    // console.log('IN INSERT 444', sqlQuery);
    //console.log('IN Update MAIN TABLE', updateMainApplicationTableSql);
    try {
        let query;
        if (sqlQueryUpdate != '') {
            // console.log('IN UPDATE' , sqlQueryUpdate);
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
    return { ipApproveData, approveDataArray };

}

/* A function that is used to get all the data from the idfc_bank_applications_table. */
uploadModel.getAllIdfcApplicationsData = async function () {
    returnData = false;
    try {
        const query = await pool.query(`SELECT * FROM public.idfc_bank_applications_table `, []);
        // console.log(query);
        returnData = query.rows;
    } catch (error) {
        // console.error(error);
        returnData = error;
    }
    return returnData;
}

uploadModel.manageArrayQuery = async function (matchedDataArray) {
    let formFilledArrayQuery = ``;
    let formFilledArrayArray = [];
    let isAlredayFilledForm = false;
    if (matchedDataArray && matchedDataArray.length > 0) {
        for (let j = 0; j < matchedDataArray.length; j++) {

            if (matchedDataArray[j]) {
                if (matchedDataArray[j] == 'idfc') {
                    isAlredayFilledForm = true;
                }
                formFilledArrayArray.push(matchedDataArray[j]);
            }

        }
        if (!isAlredayFilledForm) {
            formFilledArrayArray.push('idfc');
        }

    } else {
        formFilledArrayArray.push('idfc');
    }
    formFilledArrayQuery = `ARRAY` + JSON.stringify(formFilledArrayArray).split('"').join("'");
    return formFilledArrayQuery;
}

module.exports = uploadModel;