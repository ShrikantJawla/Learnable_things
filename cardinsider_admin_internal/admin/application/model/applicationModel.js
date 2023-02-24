const { pool } = require("../../../configration/database")
const mariaDbConfig = require("../../../configration/mariaDbConfig")
const commonHelper = require("../common/helper")
let applicationModelObj = {}

/* ===========>>>>>>>>>    adding application data  here.. <<<<<<<<<<<======================= */

// applicationModelObj.addApplicationsData = async function (bodyData) {
//     let returnData = [];
//     const text =
//         'INSERT INTO card_applications("Application_number", "Phone_Number" , "card_insider_user", "Application_Status", "card_issuer", "credit_card", "Application_date", "application_reason", "application_through") VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *';
//     const values = [
//         bodyData.applicationNumber,
//         bodyData.phoneNumber,
//         bodyData.id,
//         bodyData.status,
//         Number(bodyData.issuerId),
//         Number(bodyData.cardId),
//         bodyData.dateOfApply,
//         bodyData.reasonForStatus,
//         bodyData.applyBy

//     ];
//     try {
//         const query = await pool.query(text, values);
//         console.log(query);
//         returnData = query.rows;
//     } catch (error) {
//         console.error(error);
//         returnData = error;
//     }
//     return returnData;
// };


/* The above code is a function that is used to add data to the database. */
applicationModelObj.addApplicationsData = async function (sqlQuery) {
  let returnData = []

  try {
    const query = await pool.query(sqlQuery, [])
    // console.log(query);
    returnData = query.rows
  } catch (error) {
    // console.error(error);
    returnData = error
  }
  return returnData
}

applicationModelObj.updateCardSheetName = async function (data) {
  console.log(data, "AXIS")
  let updateSqlQuery = ` `
  Object.keys(data).forEach(function (key) {
    var val = data[key]

    updateSqlQuery = updateSqlQuery + ` update public.credit_cards set sheet_name = '${val}' where id = ${key}; `
  })
  let returnData = []

  try {
    const query = await pool.query(updateSqlQuery, [])
    // console.log(query);
    returnData = query.rows
  } catch (error) {
    // console.error(error);
    returnData = error
  }
  return returnData
}




/* ===========>>>>>>>>>    updating applications  data <<<<<<<<<<<======================= */

/* The above code is updating the application status of the application number provided in the body of
the request. */
applicationModelObj.updatingApplicationsData = async function (bodyData) {
  let returnData = []
  let values = [bodyData.status, bodyData.applicationNumber]
  const text = `UPDATE card_applications set "Application_Status" = '${values[0]}' where "Application_number" = '${values[1]}';`

  try {
    const query = await pool.query(text)
    console.log(query)
    returnData = query.rows
  } catch (error) {
    console.error(error)
    returnData = error
  }
  console.log(returnData)
  return returnData
}


/* ===========>>>>>>>>>    upserting IDFC applications  data <<<<<<<<<<<======================= */

/* This is a function which is used to update the data in the database. */
applicationModelObj.upsertIdfcApplicationsData = async function (parsedIdfcData, allApplicationsWeHave, allUsers, issuerId) {


  //console.log("parsedata -------->>>> ", parsedIdfcData, "----------<<<<< parsedData")
  // let ooriginalUser = ((parsedIdfcData[6]['splitted_utm'] - 555) / 555);

  let returnData = false

  let dataFromUpsert = []
  let dataFromUpdateUsers = []

  let upsertQuery = "";
  let updateUsersQuery = "";
  let finalApprovedData = [];


  let finalApprovedNotificationObject = {};
  let finalRejectedNotificationObject = {};
  let finalPendingNotificationObject = {};
  let finalApprovedSendSms = [];


  finalApprovedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', 'Approved', 'T')
  finalApprovedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', 'Approved', 'M')
  finalApprovedNotificationObject.pageToOpen = 'ApplicationTracking'
  finalApprovedNotificationObject.fcm_token = []



  finalRejectedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', 'Rejected', 'T')
  finalRejectedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', 'Rejected', 'M')
  finalRejectedNotificationObject.pageToOpen = 'apply'
  finalRejectedNotificationObject.fcm_token = []


  finalPendingNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', 'Processing', 'T')
  finalPendingNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', 'Processing', 'M')
  finalPendingNotificationObject.pageToOpen = 'ApplicationTracking'
  finalPendingNotificationObject.fcm_token = []


  // console.log("hi im in this upsertIdfcApplicationsData------------>>>>",ooriginalUser, parsedIdfcData[6]);
  for (let i = 0; i < parsedIdfcData.length; i++) {
    let originalUser = ((parsedIdfcData[i]['splitted_utm'] - 555) / 555)
    let matchedUserData = allUsers[originalUser];
    let dataToPush = {
      amount: 0,
      application_id: 0,
      issuer_id: issuerId
    };
    if (matchedUserData) {
      // let objForPushNotificationAndMessage = {
      //   message: '',
      //   phoneNumber: '',
      //   userid: '',
      //   tittle: '',
      //   fcmToken: '',
      //   applicationNumber: '',
      //   pageToOpen: '',
      // };

      let matchedData = {}
      if (allApplicationsWeHave[parsedIdfcData[i]['Application Ref. No.']]) {
        matchedData = allApplicationsWeHave[parsedIdfcData[i]['Application Ref. No.']]
      }
      parsedIdfcData[i]['original_user'] = originalUser
      parsedIdfcData[i]['card_issuer'] = 14
      if (parsedIdfcData[i].card_id == "") {
        parsedIdfcData[i].card_id = 291
      }

      let cashback


      if (parsedIdfcData[i]['cashback'] && parsedIdfcData[i]['cashback'] != "") {
        if (parsedIdfcData[i]['cashbacknew'] && parsedIdfcData[i]['cashbacknew'] != "") {
          cashback = parsedIdfcData[i]['cashbacknew']
        } else {
          cashback = parsedIdfcData[i]['cashback']
        }

      } else {
        cashback = 1000
      }

      // objForPushNotificationAndMessage.userid = parsedIdfcData[i]['original_user'];
      // objForPushNotificationAndMessage.phoneNumber = matchedUserData.ciu_number;
      // objForPushNotificationAndMessage.tittle = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', parsedIdfcData[i]['final_status'], 'T');
      // objForPushNotificationAndMessage.applicationNumber = parsedIdfcData[i]['Application Ref. No.'];
      // objForPushNotificationAndMessage.fcmToken = matchedUserData.fcm_token;
      if (parsedIdfcData[i]['Stage'] == 'Approved') {
        parsedIdfcData[i]['final_status'] = 'Approved'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', parsedIdfcData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'ApplicationTracking';
        // if (matchedData['Application_Status'] != parsedIdfcData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }
        dataToPush.application_number = parsedIdfcData[i]['Application Ref. No.'];
        if (cashback && cashback > 0) {
          dataToPush.amount = cashback;
        }
        dataToPush.user_id = parsedIdfcData[i]['original_user'];
        finalApprovedData.push(dataToPush);
        if (matchedData['Application_Status'] != parsedIdfcData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalApprovedNotificationObject.fcm_token.push(matchedUserData.fcm_token);
          finalApprovedSendSms.push({
            "mobiles": `91${matchedUserData.ciu_number}`,
          });
        }



      } else if (parsedIdfcData[i]['Stage'] == 'Cancelled' || parsedIdfcData[i]['Stage'] == 'Rejected') {
        parsedIdfcData[i]['final_status'] = 'Rejected'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', parsedIdfcData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'apply';
        // if (matchedData['Application_Status'] != parsedIdfcData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }



        if (matchedData['Application_Status'] != parsedIdfcData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalRejectedNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }




      } else {
        parsedIdfcData[i]['final_status'] = 'Processing'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('IDFC Bank', parsedIdfcData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'ApplicationTracking';
        // if (matchedData['Application_Status'] != parsedIdfcData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }


        if (matchedData['Application_Status'] != parsedIdfcData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalPendingNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }

      }
      parsedIdfcData[i]['through'] = 'ciapp'






      ////////////////////////queries here......///////////////////////////

      upsertQuery = upsertQuery + ` INSERT INTO card_applications ("all_unique_number" ,"Application_number", "card_issuer", "credit_card", "Application_Status", "Application_date",
      "Cashback_to_be_paid", "card_insider_user", "published_at", "application_reason",
       "application_through", "application_notes", "application_bob_utm_source") values(
       '${parsedIdfcData[i]['Application Ref. No.']}', '${parsedIdfcData[i]['Application Ref. No.']}', ${parsedIdfcData[i]['card_issuer']}, ${parsedIdfcData[i]['card_id']},
      '${parsedIdfcData[i]['final_status']}', '${parsedIdfcData[i]['Created Date']}', ${cashback}, ${parsedIdfcData[i]['original_user']}, CURRENT_TIMESTAMP,
         '${parsedIdfcData[i]['Cancellation/Rejection Reason']}', '${parsedIdfcData[i]['through']}', '${JSON.stringify(parsedIdfcData[i])}','${parsedIdfcData[i]['UTM Campaign']}') 
        ON CONFLICT ("all_unique_number") DO UPDATE 
         SET "Application_Status" = excluded."Application_Status",
         "application_notes" = excluded."application_notes",
         "credit_card" = excluded."credit_card"
      ;`


      if (parsedIdfcData[i]['Location Name'] != "") {
        updateUsersQuery = updateUsersQuery + `UPDATE card_insider_users set "City" = '${parsedIdfcData[i]['Location Name']}' where id = ${parsedIdfcData[i]['original_user']};`
      }




    }

  }
  ///console.log(finalApprovedData , "finalApprovedDatafinalApprovedData");
  try {
    if (upsertQuery != "") {
      //console.log(upsertQuery);

      let queryDataFromUpsert = await pool.query(upsertQuery)
      //console.log(queryDataFromUpsert,"-------upsert");
      dataFromUpsert = queryDataFromUpsert

      // console.log(dataFromUpsert,"-------upsert");

    }
    if (updateUsersQuery != "") {
      let queryDataFromUpdateUsers = await pool.query(updateUsersQuery)
      //console.log(queryDataFromUpdateUsers,"------- update");
      dataFromUpdateUsers = queryDataFromUpdateUsers
      //console.log(dataFromUpdateUsers,"------- update");


    }



  } catch (err) {
    console.log(err)
    // dataFromUpdateUsers = err;
    // dataFromUpsert = err;

  }


  // console.log("ewfwe8fgbhe8----",returnData, "efewew ----- >>> ",dataFromUpdateUsers);
  // console.log("hi im in this upsertIdfcApplicationsData------------>>>>", parsedIdfcData);

  return { dataFromUpdateUsers, dataFromUpsert, 'aprovedNotificationObject': finalApprovedNotificationObject, 'rejectedNotificationObject': finalRejectedNotificationObject, 'pendingNotificationObject': finalPendingNotificationObject, 'approvedSmsObject': finalApprovedSendSms, 'finalApprovedData': finalApprovedData }
}


/* ===========>>>>>>>>>    upserting BOB applications  data <<<<<<<<<<<======================= */

applicationModelObj.upsertBobApplicationsData = async function (parsedBobData, allApplicationsWeHave, allUsers, issuerId) {
  //console.log(parsedBobData[4], "insider model");

  let returnData = false

  let dataFromUpsert = []
  let dataFromUpdateUsers = []
  let finalApprovedData = [];

  let upsertQuery = ""
  let updateUsersQuery = ""

  let finalApprovedNotificationObject = {};
  let finalRejectedNotificationObject = {};
  let finalPendingNotificationObject = {};
  let finalApprovedSendSms = [];


  finalApprovedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', 'Approved', 'T')
  finalApprovedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', 'Approved', 'M')
  finalApprovedNotificationObject.pageToOpen = 'ApplicationTracking'
  finalApprovedNotificationObject.fcm_token = []



  finalRejectedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', 'Rejected', 'T')
  finalRejectedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', 'Rejected', 'M')
  finalRejectedNotificationObject.pageToOpen = 'apply'
  finalRejectedNotificationObject.fcm_token = []


  finalPendingNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', 'Processing', 'T')
  finalPendingNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', 'Processing', 'M')
  finalPendingNotificationObject.pageToOpen = 'ApplicationTracking'
  finalPendingNotificationObject.fcm_token = []


  for (let i = 0; i < parsedBobData.length; i++) {

    let originalUser = ((parsedBobData[i]['splitted_utm'] - 555) / 555)
    let matchedUserData = allUsers[originalUser]
    let dataToPush = {
      amount: 0,
      application_id: 0,
      issuer_id: issuerId
    };
    if (matchedUserData) {

      // let objForPushNotificationAndMessage = {
      //   message: '',
      //   phoneNumber: '',
      //   userid: '',
      //   tittle: '',
      //   fcmToken: '',
      //   applicationNumber: '',
      //   pageToOpen: '',
      // };


      let matchedData = {}

      if (allApplicationsWeHave[parsedBobData[i]['APPLICATION_NO']]) {
        matchedData = allApplicationsWeHave[parsedBobData[i]['APPLICATION_NO']]
      }

      parsedBobData[i]['original_user'] = originalUser
      parsedBobData[i]['card_issuer'] = 12

      if (parsedBobData[i].card_id == "") {
        parsedBobData[i].card_id = 253
      }

      let cashback


      if (parsedBobData[i]['cashback'] && parsedBobData[i]['cashback'] != "") {
        if (parsedBobData[i]['cashbacknew'] && parsedBobData[i]['cashbacknew'] != "") {
          cashback = parsedBobData[i]['cashbacknew']
        } else {
          cashback = parsedBobData[i]['cashback']
        }

      } else {
        cashback = 300
      }

      // objForPushNotificationAndMessage.userid = parsedBobData[i]['original_user'];
      // objForPushNotificationAndMessage.phoneNumber = matchedUserData.ciu_number;
      // objForPushNotificationAndMessage.tittle = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', parsedBobData[i]['final_status'], 'T');
      // objForPushNotificationAndMessage.applicationNumber = parsedBobData[i]['APPLICATION_NO'];
      // objForPushNotificationAndMessage.fcmToken = matchedUserData.fcm_token;






      if (parsedBobData[i]['APPLICATIONSTATUS'] == 'Approve') {
        parsedBobData[i]['final_status'] = 'Approved';
        console.log('hi ia im in')
        //finalApprovedData.push()
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', parsedBobData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'ApplicationTracking';
        // if (matchedData['Application_Status'] != parsedBobData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }
        dataToPush.application_number = parsedBobData[i]['APPLICATION_NO'];
        if (cashback && cashback > 0) {
          dataToPush.amount = cashback;
        }
        if (matchedData['Application_number'] && matchedData['Application_number'] != '') {
          dataToPush.application_id = matchedData.id
        }
        dataToPush.user_id = parsedBobData[i]['original_user'];
        finalApprovedData.push(dataToPush);

        if (matchedData['Application_Status'] != parsedBobData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalApprovedNotificationObject.fcm_token.push(matchedUserData.fcm_token);
          finalApprovedSendSms.push({
            "mobiles": `91${matchedUserData.ciu_number}`,
          });
        }

      } else if (parsedBobData[i]['APPLICATIONSTATUS'] == 'REJECT' || parsedBobData[i]['APPLICATIONSTATUS'] == 'Cancelled Application') {
        parsedBobData[i]['final_status'] = 'Rejected'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', parsedBobData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'apply';
        // if (matchedData['Application_Status'] != parsedBobData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }

        if (matchedData['Application_Status'] != parsedBobData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalRejectedNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }
      } else {
        parsedBobData[i]['final_status'] = 'Processing'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('Bank Of Baroda', parsedBobData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'ApplicationTracking';
        // if (matchedData['Application_Status'] != parsedBobData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }
        if (matchedData['Application_Status'] != parsedBobData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalPendingNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }
      }



      parsedBobData[i]['through'] = 'ciapp'





      ////////////////////////queries here......///////////////////////////
      if (matchedData['Application_number'] && matchedData['Application_number'] != '') {
        upsertQuery = upsertQuery + `UPDATE card_applications SET  "Application_Status" = '${parsedBobData[i]['final_status']}', application_notes = '${JSON.stringify(parsedBobData[i])}', credit_card = ${parsedBobData[i]['card_id']}
        WHERE id = ${matchedData['id']};`
      } else {


        upsertQuery = upsertQuery + ` INSERT INTO card_applications ("all_unique_number" ,"Application_number", "card_issuer", "credit_card", "Application_Status", "Application_date",
        "Cashback_to_be_paid", "card_insider_user", "published_at", "application_reason",
         "application_through", "application_notes", "application_bob_utm_source") values(
         '${parsedBobData[i]['APPLICATION_NO']}', '${parsedBobData[i]['APPLICATION_NO']}', ${parsedBobData[i]['card_issuer']}, ${parsedBobData[i]['card_id']},
        '${parsedBobData[i]['final_status']}', '${parsedBobData[i]['DATE']}', ${cashback}, ${parsedBobData[i]['original_user']}, CURRENT_TIMESTAMP,
           '${parsedBobData[i]['REJECT_REASON']}', '${parsedBobData[i]['through']}', '${JSON.stringify(parsedBobData[i])}','${parsedBobData[i]['UTM_SOURCE']}') 
          ON CONFLICT ("all_unique_number") DO UPDATE 
           SET "Application_Status" = excluded."Application_Status",
           "application_notes" = excluded."application_notes",
           "credit_card" = excluded."credit_card"
        ;`
      }



      if (parsedBobData[i]['CITY'] != "") {
        updateUsersQuery = updateUsersQuery + `UPDATE card_insider_users set "City" = '${parsedBobData[i]['CITY']}' where id = ${parsedBobData[i]['original_user']};`
      }
    }

  }


  try {
    if (upsertQuery != "") {
      console.log(upsertQuery)

      let queryDataFromUpsert = await pool.query(upsertQuery)
      //console.log(queryDataFromUpsert,"-------upsert");
      dataFromUpsert = queryDataFromUpsert

      // console.log(dataFromUpsert,"-------upsert");

    }
    if (updateUsersQuery != "") {
      let queryDataFromUpdateUsers = await pool.query(updateUsersQuery)
      //console.log(queryDataFromUpdateUsers,"------- update");
      dataFromUpdateUsers = queryDataFromUpdateUsers
      //console.log(dataFromUpdateUsers,"------- update");


    }



  } catch (err) {
    console.log(err)
    // dataFromUpdateUsers = err;
    // dataFromUpsert = err;

  }


  // console.log(parsedBobData[4], "insider model");
  //console.log(sendPushNotificationAndMessage, "insider model");
  return { dataFromUpdateUsers, dataFromUpsert, 'aprovedNotificationObject': finalApprovedNotificationObject, 'rejectedNotificationObject': finalRejectedNotificationObject, 'pendingNotificationObject': finalPendingNotificationObject, 'approvedSmsObject': finalApprovedSendSms, 'finalApprovedData': finalApprovedData }

}




/* ===========>>>>>>>>>    upserting AU applications  data <<<<<<<<<<<======================= */

applicationModelObj.upsertAuApplicationsData = async function (parsedAuData, allApplicationsWeHave, allUsers, issuerId) {
  console.log(parsedAuData[4], "insider model");
  let finalApprovedData = [];
  let returnData = false

  let dataFromUpsert = []
  let dataFromUpdateUsers = []

  let upsertQuery = ""
  let updateUsersQuery = ""

  let finalApprovedNotificationObject = {};
  let finalRejectedNotificationObject = {};
  let finalPendingNotificationObject = {};
  let finalApprovedSendSms = [];


  finalApprovedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('AU Bank', 'Approved', 'T')
  finalApprovedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('AU Bank', 'Approved', 'M')
  finalApprovedNotificationObject.pageToOpen = 'ApplicationTracking'
  finalApprovedNotificationObject.fcm_token = []



  finalRejectedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('AU Bank', 'Rejected', 'T')
  finalRejectedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('AU Bank', 'Rejected', 'M')
  finalRejectedNotificationObject.pageToOpen = 'apply'
  finalRejectedNotificationObject.fcm_token = []


  finalPendingNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('AU Bank', 'Processing', 'T')
  finalPendingNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('AU Bank', 'Processing', 'M')
  finalPendingNotificationObject.pageToOpen = 'ApplicationTracking'
  finalPendingNotificationObject.fcm_token = []

  for (let i = 0; i < parsedAuData.length; i++) {

    let originalUser = ((parsedAuData[i]['splitted_utm_term_num1'] - 555) / 555)
    let dataToPush = {
      amount: 0,
      application_id: 0,
      issuer_id: issuerId
    };

    let matchedUserData = allUsers[originalUser]
    let cashback

    if (parsedAuData[i]['cashback'] && parsedAuData[i]['cashback'] != "") {
      if (parsedAuData[i]['cashbacknew'] && parsedAuData[i]['cashbacknew'] != "") {
        cashback = parsedAuData[i]['cashbacknew']
      } else {
        cashback = parsedAuData[i]['cashback']
      }

    } else {
      cashback = 800
    }
    if (matchedUserData) {

      // let objForPushNotificationAndMessage = {    
      //   message: '',
      //   phoneNumber: '',
      //   userid: '',
      //   tittle: '',
      //   fcmToken: '',
      //   applicationNumber: '',
      //   pageToOpen: '',
      // };


      let matchedData = {}


      parsedAuData[i]['original_user'] = originalUser
      parsedAuData[i]['card_issuer'] = 19

      if (parsedAuData[i].card_id == "") {
        parsedAuData[i].card_id = 326
      }

      if (allApplicationsWeHave[parsedAuData[i]['LEAD_ID']]) {
        matchedData = allApplicationsWeHave[parsedAuData[i]['LEAD_ID']]
      }




      // objForPushNotificationAndMessage.userid = parsedAuData[i]['original_user'];
      // objForPushNotificationAndMessage.phoneNumber = matchedUserData.ciu_number;
      // objForPushNotificationAndMessage.tittle = commonHelper.getTitleAndMessageForCardNotification('AU Bank', parsedAuData[i]['final_status'], 'T');
      // objForPushNotificationAndMessage.applicationNumber = parsedAuData[i]['LEAD_ID'];
      // objForPushNotificationAndMessage.fcmToken = matchedUserData.fcm_token;



      if (parsedAuData[i]['CURRENT_STATUS'] == 'Card Generated') {
        parsedAuData[i]['final_status'] = 'Approved'
        dataToPush.application_number = parsedAuData[i]['LEAD_ID'];
        if (cashback && cashback > 0) {
          dataToPush.amount = cashback;
        }
        dataToPush.user_id = parsedAuData[i]['original_user'];
        finalApprovedData.push(dataToPush);
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('AU Bank', parsedAuData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'ApplicationTracking';
        // if (matchedData['Application_Status'] != parsedAuData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }

        if (matchedData['Application_Status'] != parsedAuData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalApprovedNotificationObject.fcm_token.push(matchedUserData.fcm_token);
          finalApprovedSendSms.push({
            "mobiles": `91${matchedUserData.ciu_number}`,
          });

        }

      } else if (parsedAuData[i]['CURRENT_STATUS'] == 'FISERV WAIT' || parsedAuData[i]['CURRENT_STATUS'] == 'WIP CASES' || parsedAuData[i]['CURRENT_STATUS'] == 'INACTIVITY' || parsedAuData[i]['CURRENT_STATUS'] == 'Incomplete Application') {
        parsedAuData[i]['final_status'] = 'Processing'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('AU Bank', parsedAuData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'ApplicationTracking';
        // if (matchedData['Application_Status'] != parsedAuData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }

        if (matchedData['Application_Status'] != parsedAuData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalPendingNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }


      } else {
        parsedAuData[i]['final_status'] = 'Rejected'
        // objForPushNotificationAndMessage.message = commonHelper.getTitleAndMessageForCardNotification('AU Bank', parsedAuData[i]['final_status'], 'M');
        // objForPushNotificationAndMessage.pageToOpen = 'apply';
        // if (matchedData['Application_Status'] != parsedAuData[i]['final_status']) {
        //   sendPushNotificationAndMessage.push(objForPushNotificationAndMessage);
        // }

        if (matchedData['Application_Status'] != parsedAuData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalRejectedNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }
      }



      parsedAuData[i]['through'] = 'ciapp'





      ////////////////////////queries here......///////////////////////////

      upsertQuery = upsertQuery + ` INSERT INTO card_applications ("all_unique_number" ,"Application_number", "card_issuer", "credit_card", "Application_Status", "Application_date",
     "Cashback_to_be_paid", "card_insider_user", "published_at", "application_reason",
      "application_through", "application_notes", "application_bob_utm_source") values(
      '${parsedAuData[i]['LEAD_ID']}', '${parsedAuData[i]['LEAD_ID']}', ${parsedAuData[i]['card_issuer']}, ${parsedAuData[i]['card_id']},
     '${parsedAuData[i]['final_status']}', '${parsedAuData[i]['APPLICATION_INITIATION_DATE']}', ${cashback}, ${parsedAuData[i]['original_user']}, CURRENT_TIMESTAMP,
        '${parsedAuData[i]['REJECT_REASON']}', '${parsedAuData[i]['through']}', '${JSON.stringify(parsedAuData[i])}','${parsedAuData[i]['UTM_CAMPAIGN'] + " " + parsedAuData[i]['UTM_TERM']}') 
       ON CONFLICT ("all_unique_number") DO UPDATE 
        SET "Application_Status" = excluded."Application_Status",
        "application_notes" = excluded."application_notes",
        "credit_card" = excluded."credit_card"
     ;`


      //  if (parsedAuData[i]['CITY'] != "") {
      //    updateUsersQuery = updateUsersQuery + `UPDATE card_insider_users set "City" = '${parsedAuData[i]['CITY']}' where id = ${parsedAuData[i]['original_user']};`
      //  }


    }
  }


  try {
    if (upsertQuery != "") {
      //console.log(upsertQuery);

      let queryDataFromUpsert = await pool.query(upsertQuery)
      //console.log(queryDataFromUpsert,"-------upsert");
      dataFromUpsert = queryDataFromUpsert

      // console.log(dataFromUpsert,"-------upsert");

    }
    if (updateUsersQuery != "") {
      let queryDataFromUpdateUsers = await pool.query(updateUsersQuery)
      console.log(queryDataFromUpdateUsers, "------- update");
      dataFromUpdateUsers = queryDataFromUpdateUsers
      //console.log(dataFromUpdateUsers,"------- update");


    }

    return { dataFromUpdateUsers, dataFromUpsert, 'aprovedNotificationObject': finalApprovedNotificationObject, 'rejectedNotificationObject': finalRejectedNotificationObject, 'pendingNotificationObject': finalPendingNotificationObject, 'approvedSmsObject': finalApprovedSendSms, 'finalApprovedData': finalApprovedData }

  } catch (err) {
    console.log(err)
    // dataFromUpdateUsers = err;
    // dataFromUpsert = err;
    return false;
  }


  //console.log(parsedAuData[4], "insider model");
  // console.log(parsedAuData[40], "insider model");


}



/* ===========>>>>>>>>>   End of  upserting AU applications  data <<<<<<<<<<<======================= */




/* ===========>>>>>>>>>    upserting YES applications  data <<<<<<<<<<<======================= */

applicationModelObj.upsertYesApplicationsData = async function (parsedYesData, allApplicationsWeHave, allUsers, issuerId) {
  // console.log(parsedYesData[4], "insider model");

  let returnData = false
  let finalApprovedData = [];

  let dataFromUpsert = []
  let dataFromUpdateUsers = []

  let upsertQuery = ""
  let updateUsersQuery = ""

  let finalApprovedNotificationObject = {};
  let finalRejectedNotificationObject = {};
  let finalPendingNotificationObject = {};
  let finalApprovedSendSms = [];


  finalApprovedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('YES Bank', 'Approved', 'T')
  finalApprovedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('YES Bank', 'Approved', 'M')
  finalApprovedNotificationObject.pageToOpen = 'ApplicationTracking'
  finalApprovedNotificationObject.fcm_token = []



  finalRejectedNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('YES Bank', 'Rejected', 'T')
  finalRejectedNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('YES Bank', 'Rejected', 'M')
  finalRejectedNotificationObject.pageToOpen = 'apply'
  finalRejectedNotificationObject.fcm_token = []


  finalPendingNotificationObject.tittle = commonHelper.getTitleAndMessageForCardNotification('YES Bank', 'Processing', 'T')
  finalPendingNotificationObject.message = commonHelper.getTitleAndMessageForCardNotification('YES Bank', 'Processing', 'M')
  finalPendingNotificationObject.pageToOpen = 'ApplicationTracking'
  finalPendingNotificationObject.fcm_token = []

  for (let i = 0; i < parsedYesData.length; i++) {

    // let originalUser = ((parsedYesData[i]['splitted_utm_term_num1'] - 555) / 555);
    let dataToPush = {
      amount: 0,
      application_id: 0,
      issuer_id: issuerId
    };

    let cashback

    if (parsedYesData[i]['cashback'] && parsedYesData[i]['cashback'] != "") {
      if (parsedYesData[i]['cashbacknew'] && parsedYesData[i]['cashbacknew'] != "") {
        cashback = parsedYesData[i]['cashbacknew']
      } else {
        cashback = parsedYesData[i]['cashback']
      }

    } else {
      cashback = 800
    }

    let matchedUserData = allUsers[parsedYesData[i]['customer_contact']]
    //console.log(parsedYesData[i]['customer_contact'], "all applications");
    //console.log(matchedUserData, "matched user data");

    if (matchedUserData) {

      // let objForPushNotificationAndMessage = {
      //   message: '',
      //   phoneNumber: '',
      //   userid: '',
      //   tittle: '',
      //   fcmToken: '',
      //   applicationNumber: '',
      //   pageToOpen: '',
      // };


      let matchedData = {}

      parsedYesData[i]['parsed_first_link_send_date'] = new Date(parsedYesData[i]['first_link_send_date']).toLocaleString('en-US', { timeZone: 'Asia/kolkata' }).replaceAll(" ", "").split(",")[0].replaceAll("/", "")
      //console.log(typeof (parsedYesData[i]['parsed_first_link_send_date']));

      if (parsedYesData[i]['application_id'] != "" && parsedYesData[i]['application_id'] != null) {
        parsedYesData[i]['backend_application_id'] = parsedYesData[i]['application_id']
      } else {
        parsedYesData[i]['backend_application_id'] = `${matchedUserData['ciu_number']}_${parsedYesData[i]['parsed_first_link_send_date']}`
      }


      parsedYesData[i]['all_unique_number'] = `${matchedUserData['ciu_number']}_${parsedYesData[i]['parsed_first_link_send_date']}`


      if (allApplicationsWeHave[parsedYesData[i]['backend_application_id']]) {
        matchedData = allApplicationsWeHave[parsedYesData[i]['backend_application_id']]
      }

      parsedYesData[i]['original_user'] = matchedUserData['id']
      parsedYesData[i]['card_issuer'] = 7

      if (!parsedYesData[i].card_id) {
        parsedYesData[i].card_id = 354
      }






      if (parsedYesData[i]['Final Application status'] == 'DECLINE') {
        parsedYesData[i]['final_status'] = 'Rejected'

        if (matchedData['Application_Status'] != parsedYesData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalRejectedNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }

      } else if (parsedYesData[i]['Final Application status'] == 'APPROVE') {
        parsedYesData[i]['final_status'] = 'Approved'
        dataToPush.application_number = parsedYesData[i]['backend_application_id'];
        if (cashback && cashback > 0) {
          dataToPush.amount = cashback;
        }
        dataToPush.user_id = parsedYesData[i]['original_user'];
        finalApprovedData.push(dataToPush);

        if (matchedData['Application_Status'] != parsedYesData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalApprovedNotificationObject.fcm_token.push(matchedUserData.fcm_token);
          finalApprovedSendSms.push({
            "mobiles": `91${matchedUserData.ciu_number}`,
          });
        }


      } else {
        parsedYesData[i]['final_status'] = 'Processing'


        if (matchedData['Application_Status'] != parsedYesData[i]['final_status'] && matchedUserData.fcm_token !== '' && matchedUserData.fcm_token !== null) {
          finalPendingNotificationObject.fcm_token.push(matchedUserData.fcm_token)
        }
      }



      parsedYesData[i]['through'] = 'ciapp'




      console.log("unparsed date ----", parsedYesData[i]['application_start_date'])

      if (parsedYesData[i]['application_start_date']) {

        parsedYesData[i]['parsed_date'] = new Date(parsedYesData[i]['application_start_date']).toLocaleString('en-US', { timeZone: 'Asia/kolkata' })


        parsedYesData[i]['final_parsed_date'] = parsedYesData[i]['parsed_date']




        console.log("parsed date fg in btw ----", parsedYesData[i]['parsed_date'])
        //  parsedYesData[i]['final_parsed_date'] = `${parsedYesData[i]['parsed_date'].getFullYear()}-${parsedYesData[i]['parsed_date'].getMonth()}-${parsedYesData[i]['parsed_date'].getDate()}`;
        //  `${parsedYesData[i]['parsed_date'].getDate()}-${parsedYesData[i]['parsed_date'].getMonth()}-${parsedYesData[i]['parsed_date'].getFullYear()}`;
        console.log("parsed date in btw ----", parsedYesData[i]['final_parsed_date'])
      } else {
        parsedYesData[i]['final_parsed_date'] = '-infinity'
      }

      console.log("parsed date after ----", parsedYesData[i]['final_parsed_date'])

      // parsedYesData[i]['final_parsed_date'] = parsedYesData[i]['application_start_date'];



      console.log(" final all parsed date after ----", parsedYesData[i]['final_parsed_date'])
      //  console.log(parsedYesData[i], "all data");
      // console.log(matchedUserData, "matched data");
      // console.log(allApplicationsWeHave);

      console.log(parsedYesData[i]['parsed_first_link_send_date'])
      console.log(parsedYesData[i]['backend_application_id'])

      ////////////////////////queries here......///////////////////////////

      upsertQuery = upsertQuery + ` INSERT INTO card_applications ("all_unique_number" ,"Application_number",  "Phone_Number", "card_issuer", "credit_card", "Application_Status", "Application_date",
       "Cashback_to_be_paid", "card_insider_user", "published_at", "application_reason",
        "application_through", "application_notes") values(
        '${parsedYesData[i]['all_unique_number']}', '${parsedYesData[i]['backend_application_id']}', ${parsedYesData[i]['customer_contact']}, ${parsedYesData[i]['card_issuer']}, ${parsedYesData[i]['card_id']},
       '${parsedYesData[i]['final_status']}', '${parsedYesData[i]['final_parsed_date']}', ${cashback}, ${parsedYesData[i]['original_user']}, CURRENT_TIMESTAMP,
          '${parsedYesData[i]['Application Decline reason']}', '${parsedYesData[i]['through']}', '${JSON.stringify(parsedYesData[i])}') 
         ON CONFLICT ("all_unique_number") DO UPDATE 
          SET "Application_Status" = excluded."Application_Status",
          "Phone_Number" =excluded."Phone_Number",
          "Application_date" = excluded."Application_date",
          "updated_at" = CURRENT_TIMESTAMP,
          "Application_number" = excluded."Application_number",
          "application_notes" = excluded."application_notes",
          "credit_card" = excluded."credit_card"
       ;`


      //  if (parsedYesData[i]['CITY'] != "") {
      //    updateUsersQuery = updateUsersQuery + `UPDATE card_insider_users set "City" = '${parsedYesData[i]['CITY']}' where id = ${parsedYesData[i]['original_user']};`
      //  }





    }
  }


  try {
    if (upsertQuery != "") {
      //  console.log(upsertQuery);

      let queryDataFromUpsert = await pool.query(upsertQuery)
      // console.log("-------upsert");
      dataFromUpsert = queryDataFromUpsert

      // console.log(dataFromUpsert,"-------upsert");

    }
    if (updateUsersQuery != "") {
      let queryDataFromUpdateUsers = await pool.query(updateUsersQuery)
      console.log("------- update")
      dataFromUpdateUsers = queryDataFromUpdateUsers
      //console.log(dataFromUpdateUsers,"------- update");


    }



  } catch (err) {
    console.log(err)
    // dataFromUpdateUsers = err;
    // dataFromUpsert = err;

  }


  //console.log(parsedAuData[4], "insider model");
  // console.log(parsedAuData[40], "insider model");
  return { dataFromUpdateUsers, dataFromUpsert, 'aprovedNotificationObject': finalApprovedNotificationObject, 'rejectedNotificationObject': finalRejectedNotificationObject, 'pendingNotificationObject': finalPendingNotificationObject, 'approvedSmsObject': finalApprovedSendSms, 'finalApprovedData': finalApprovedData }

}



/* ===========>>>>>>>>>   End of  upserting YES applications  data <<<<<<<<<<<======================= */




/* ===========>>>>>>>>>    checking application numbers exists<<<<<<<<<<<======================= */

applicationModelObj.checkApplicationNumberExist = async function (
  applicationNumber
) {
  let returnData = []
  const text = `select * from card_applications where "Application_number" = '${applicationNumber}'`
  try {
    const query = await pool.query(text)
    //console.log(query);
    returnData = query.rows
  } catch (error) {
    console.error(error)
    //returnData = [];
  }
  return returnData
}

/* ===========>>>>>>>>>    fetching all card applications list <<<<<<<<<<<======================= */

applicationModelObj.fetchAllCardApplications = async function (body) {

  let { filterObject, pageNo, sort } = body

  let {
    user_number,
    Application_number,
    id,
    card_insider_user,
    card_issuer,
    credit_card,
    application_through,
    Application_Status,
    from_application_date,
    Cashback_paid,
    to_application_date,
    entriesPerPage,
    user_name
  } = filterObject
  user_number = user_number || ""
  Application_number = Application_number || ""
  id = id || ""
  entriesPerPage = entriesPerPage || 10
  card_issuer =
    card_issuer === undefined || card_issuer === "any" ? "" : card_issuer
  credit_card =
    credit_card === undefined || credit_card === "any" ? "" : credit_card
  application_through =
    application_through === undefined || application_through === "any" ?
      "" :
      application_through
  Application_Status =
    Application_Status === undefined || Application_Status === "any" ?
      "" :
      Application_Status
  Cashback_paid =
    Cashback_paid === undefined || Cashback_paid === "any" ? "" : Cashback_paid
  sort = sort || "id"

  let offset = (pageNo - 1) * entriesPerPage
  let ascDesc = "asc"
  if (sort.startsWith("-")) {
    sort = sort.substring(1)
    ascDesc = "desc"
  }
  let returnDataFromModel = []
  let cData

  try {
    let queryApplications = `SELECT card_applications.*, card_issuers."IssuerName", 
    credit_cards."CreditCardName",
	  card_insider_users.ciu_number As user_number,
    (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name 
    FROM card_applications
    LEFT JOIN card_issuers ON card_applications.card_issuer = card_issuers.id 
    LEFT JOIN credit_cards ON card_applications.credit_card = credit_cards.id
    LEFT JOIN card_insider_users ON card_applications.card_insider_user = card_insider_users.id
    WHERE 
     ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
    ${user_number ? `card_insider_users."ciu_number" = '${user_number}' AND` : ''} 
    card_applications."Application_number"::Text Like '%${Application_number}%' AND
    ${id ? `card_applications."id"::Text = '${id}' AND` : ''}
    ${card_insider_user ? `card_applications."card_insider_user"::Text = '${card_insider_user}' AND` : ''}

    card_issuers."IssuerName"::Text Like '%${card_issuer}%' AND
    credit_cards."CreditCardName"::Text Like '%${credit_card}%'AND
    card_applications."Application_Status"::Text Like '%${Application_Status}%'AND
    card_applications."application_through"::Text Like '%${application_through}%' AND
    ${from_application_date ? `card_applications."Application_date"  >= '${from_application_date}'::date AND` : ``}  
    ${to_application_date ? `card_applications."Application_date"<= '${to_application_date}'::date AND` : ``}
    (${Cashback_paid === ""
        ? `card_applications."Cashback_paid" IS NULL OR card_applications."Cashback_paid"  = true  OR card_applications."Cashback_paid"  = false `
        : `card_applications."Cashback_paid"  = ${Cashback_paid}`
      } )
    ORDER By "${sort}" ${ascDesc}
    limit ${entriesPerPage} offset ${offset};`

    console.log(queryApplications)
    const qData = await pool.query(queryApplications)

    returnDataFromModel = qData.rows
    cData = await pool.query(
      `SELECT count(*)
                FROM card_applications
                LEFT JOIN card_issuers ON card_applications.card_issuer = card_issuers.id 
                LEFT JOIN credit_cards ON card_applications.credit_card = credit_cards.id
                LEFT JOIN card_insider_users ON card_applications.card_insider_user = card_insider_users.id
                WHERE 
                 ${user_name ? `Lower(CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) Like '%${user_name.toLowerCase()}%' AND` : ''}
                ${user_number ? `card_insider_users."ciu_number" = '${user_number}' AND` : ''}
                card_applications."Application_number"::Text Like '%${Application_number}%' AND
                ${id ? `card_applications."id"::Text = '${id}' AND` : ''}
                ${card_insider_user ? `card_applications."card_insider_user"::Text = '${card_insider_user}' AND` : ''}
                card_issuers."IssuerName"::Text Like '%${card_issuer}%' AND
                credit_cards."CreditCardName"::Text Like '%${credit_card}%'AND
                card_applications."Application_Status"::Text Like '%${Application_Status}%'AND
                card_applications."application_through"::Text Like '%${application_through}%' AND
                ${from_application_date ? `card_applications."Application_date"  >= '${from_application_date}'::date AND` : ``}
                ${to_application_date ? `card_applications."Application_date"<= '${to_application_date}'::date AND` : ``}
                (${Cashback_paid === ""
        ? `card_applications."Cashback_paid" IS NULL OR card_applications."Cashback_paid"  = true  OR card_applications."Cashback_paid"  = false `
        : `card_applications."Cashback_paid"  = ${Cashback_paid}`
      } )`
    )
    // console.log(qData.rows)
  } catch (err) {
    console.log(err)
  }
  return { returnDataFromModel, count: cData.rows[0].count }
}


applicationModelObj.fetchAllCardApplicationsForuploadApplication =
  async function () {
    let returnData = []
    try {
      const qData = await pool.query(
        //"SELECT * FROM card_applications ORDER BY id ASC"
        `SELECT card_applications.*, card_issuers."IssuerName", 
            credit_cards."CreditCardName",
            (CASE WHEN (card_insider_users.ciu_first_name != '' OR card_insider_users.ciu_last_name != '') THEN CONCAT(card_insider_users.ciu_first_name, ' ', card_insider_users.ciu_last_name)  ELSE '' END) as user_name 
            FROM card_applications
            LEFT JOIN card_issuers ON card_applications.card_issuer = card_issuers.id 
            LEFT JOIN credit_cards ON card_applications.credit_card = credit_cards.id
            LEFT JOIN card_insider_users ON card_applications.card_insider_user = card_insider_users.id ORDER BY id asc;`
      )
      returnData = qData.rows
      //console.log(qData.rows);
    } catch (err) {
      console.log(err)
    }
    return returnData
  }



applicationModelObj.getApplicationsForSheetUpsert = async function (issuerId) {
  let returnData = []

  if (issuerId) {

    let queryToDb = `SELECT card_applications."id" , card_applications."Application_number", card_applications.all_unique_number, card_applications.card_issuer, card_applications.credit_card, card_applications.card_insider_user, card_applications."Application_Status", card_insider_users.ciu_number, card_insider_users.fcm_token 
    FROM public.card_applications 
     LEFT JOIN card_insider_users ON card_applications.card_insider_user = card_insider_users.id
    where card_issuer = $1;`
    try {
      let dataFromDb = await pool.query(queryToDb, [issuerId])
      //console.log(dataFromDb.rows, "safauf9w");
      returnData = dataFromDb.rows
    } catch (err) {
      console.error(err)

    }

    return returnData

  } else {
    console.log("no id")
    return returnData
  }



}



applicationModelObj.getAllUsersForSheetUpsert = async function () {
  let returnData = []



  let queryToDb = `SELECT card_insider_users.id, card_insider_users.ciu_number, card_insider_users.fcm_token  from card_insider_users;`
  try {
    let dataFromDb = await pool.query(queryToDb)
    //console.log(dataFromDb.rows, "safauf9w");
    returnData = dataFromDb.rows
  } catch (err) {
    console.error(err)

  }

  return returnData





}



applicationModelObj.getAllIssuers = async function () {
  let returnData = []
  try {
    const qData = await pool.query(
      `SELECT id, "IssuerName", "Website", "CustomerCareNumbers", "Description", "CustomerCareEmail", published_at, created_by, updated_by, created_at, updated_at, "UniqueID", credit_card, "StartingColor", "EndColor", "ApplyNow", "ApplySequence", "URL_launch_apply", "Application_Tracking_Link"
            FROM public.card_issuers`
    )
    returnData = qData.rows
  } catch (err) {
    console.log(err)
  }
  return returnData
}

applicationModelObj.getAllWebUsers = async function () {
  let returnData = []
  try {
    let conn = await mariaDbConfig.getConnection()
    const qData = await conn.query(
      "SELECT CAST(Mobile as varchar(50)) as Mobile FROM `datauseget`"
    )
    returnData = qData
  } catch (err) {
    console.log(err)
  }
  return returnData
}

module.exports = applicationModelObj;