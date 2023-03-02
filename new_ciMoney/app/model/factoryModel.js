/* Importing the express module. */
const e = require("express");
/* Importing the pool variable from the database.js file in the utils/configs/database folder. */
let { pool } = require("../utils/configs/database");
///////////////////////////////////////
/*  */
let modelObj = {};

/* Getting all the fields from a table. */
modelObj.getAllFieldsModel = async function (table) {
  let returnDataFromModel;
  try {
    /* Creating a new query that will return the column names, data types, and ordinal positions of the
    columns in the table. */
    let newQuery = `
        SELECT "column_name","data_type","ordinal_position"
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name   = '${table}'
        ;
        `;
    let execNewQuery = await pool.query(newQuery);
    returnDataFromModel = execNewQuery.rows;
    return { returnDataFromModel };
  } catch (err) {
    console.error(err);
    return { returnDataFromModel };
  }
};



/* A function that takes in a column and a table and returns the distinct values of that column in that
table. */
modelObj.getDistinctValues = async function (column, table) {
  try {
    let resFromQuery = await pool.query(
      `SELECT DISTINCT ${column} FROM ${table}`
    );
    return resFromQuery.rows.map((field) => field[Object.keys(field)[0]]);
  } catch (err) {
    //console.log(err)
  }
};



/* Updating a table in the database. */
modelObj.updateTable = async function ({ table, inputObject, id }) {
  let query = ` UPDATE ${table} SET `;
  let idField = "id";
  if (table.split("_")[0] !== "card") {
    idField = table.split("_")[0] + "_" + idField;
  }
  Object.keys(inputObject).forEach((key) => {
    query += `"${key}"='${inputObject[key]}' , `;
  });
  query = query.trimEnd().slice(0, -1);
  query += `where "${idField}" = '${id}';`;
  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.error(err);
  }
};


/* Updating the tele_applications_data table. */
modelObj.updateTeleTable = async function ({ table, inputObject, id }) {
  console.log(inputObject, "<<<<<<<<<<<")
  let issuer_id;
  switch (table) {
    case "axis":
      issuer_id = 1;
      break;
    case "au":
      issuer_id = 7;
      break;
    case "bob":
      issuer_id = 2;
      break;
    case "citi":
      issuer_id = 3;
      break;
    case "idfc":
      issuer_id = 4;
      break;
    case "yes":
      issuer_id = 11;
      break;
  }

  let {
    tad_call_status,
    tad_application_status,
    tad_notes,
    tad_call_decline_counter,
    tad_call_scheduled,
    tad_activation_call_status,
    tad_activation_notes,
    tad_activation_call_counter,
    tad_activation_call_scheduled,
    tad_automated_call_counter,
    tad_automated_call_status,
    tad_final_call_status
  } = inputObject;

  let query = `
    UPDATE tele_applications_data SET 
    ${inputObject.hasOwnProperty("tad_call_status")
      ? `tad_call_status = '${tad_call_status}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_activation_call_status")
      ? `tad_activation_call_status = '${tad_activation_call_status}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_automated_call_status")
      ? `tad_automated_call_status = '${tad_automated_call_status}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_final_call_status")
      ? `tad_final_call_status = '${tad_final_call_status}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_application_status")
      ? `tad_application_status = '${tad_application_status}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_notes")
      ? `tad_notes = '${tad_notes}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_activation_notes")
      ? `tad_activation_notes = '${tad_activation_notes}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_call_decline_counter")
      ? `tad_call_decline_counter = '${tad_call_decline_counter}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_activation_call_counter")
      ? `tad_activation_call_counter = '${tad_activation_call_counter}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_automated_call_counter")
      ? `tad_automated_call_counter = '${tad_automated_call_counter}',`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_call_scheduled")
      ? tad_call_scheduled
        ? `tad_call_scheduled = '${tad_call_scheduled}',`
        : `tad_call_scheduled = null,`
      : ``
    }
    ${inputObject.hasOwnProperty("tad_activation_call_scheduled")
      ? tad_call_scheduled
        ? `tad_activation_call_scheduled = '${tad_activation_call_scheduled}',`
        : `tad_activation_call_scheduled = null,`
      : ``
    }
    
    tad_updated_at = (now() AT TIME ZONE 'Asia/Kolkata')
    where tad_issuer=${issuer_id} and tad_card_applications=${id};
    `;
  query = query.replace(/,\s+where/, " where");
  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.log(err);
  }
};
modelObj.updateSmsCounter = async function ({ smsCounter, table, id }) {
  let issuer_id;
  switch (table) {
    case "axis":
      issuer_id = 1;
      break;
    case "au":
      issuer_id = 7;
      break;
    case "bob":
      issuer_id = 2;
      break;
    case "citi":
      issuer_id = 3;
      break;
    case "idfc":
      issuer_id = 4;
      break;
    case "yes":
      issuer_id = 11;
      break;
  }

  let query = `
    UPDATE tele_applications_data SET 
    tad_sms_counter =${smsCounter},
    tad_updated_at = (now() AT TIME ZONE 'Asia/Kolkata')
    where tad_issuer=${issuer_id} and tad_card_applications=${id};
    `;
  query = query.replace(/,\s+where/, " where");

  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.log(err);
  }
};

modelObj.updateSmsCounterIcici = async function ({ smsCounter, id }) {

  let query = `
    UPDATE lead_assigning_user_junction SET 
    assigning_sms_counter =${smsCounter},
    updated_at = (now() AT TIME ZONE 'Asia/Kolkata')
    where junction_id =${id};
    `;
  query = query.replace(/,\s+where/, " where");

  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.log(err);
  }
};

modelObj.addSmsTemplate = async function ({
  issuer_id,
  bank_name,
  sms_status,
  flow_id,
  template_id,
  sms_template,
}) {
  let query = `
    INSERT INTO bank_sms_template (issuer_id, bank_name, sms_status, flow_id, template_id, sms_template, published_at)
    VALUES (${issuer_id}, '${bank_name}', '${sms_status}', '${flow_id}', '${template_id}', '${sms_template}', CURRENT_TIMESTAMP)`;
  query = query.replace(/,\s+where/, " where");
  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.log(err);
  }
};
modelObj.editSmsTemplate = async function ({
  id,
  sms_status,
  flow_id,
  template_id,
  sms_template,
}) {
  let query = `
    UPDATE bank_sms_template
    SET sms_status = '${sms_status}',
        flow_id = '${flow_id}',
        template_id = '${template_id}',
        sms_template = '${sms_template}',
        published_at = CURRENT_TIMESTAMP
    WHERE id = ${id};`;
  query = query.replace(/,\s+where/, " where");
  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.log(err);
  }
};
modelObj.deleteSmsTemplate = async function ({ id }) {
  let query = `
    UPDATE bank_sms_template
    SET published_at = NULL
    WHERE id = ${id};`;
  query = query.replace(/,\s+where/, " where");
  try {
    await pool.query(query);
    return "success";
  } catch (err) {
    console.log(err);
  }
};
modelObj.getSmsTemplate = async function ({ issuer_id }) {
  let query = `SELECT * FROM bank_sms_template WHERE issuer_id = ${issuer_id} AND published_at IS NOT NULL`;
  query = query.replace(/,\s+where/, " where");

  let returnDataFromModel;

  try {
    let execNewQuery = await pool.query(query);
    returnDataFromModel = execNewQuery.rows;
    return returnDataFromModel;
  } catch (err) {
    console.log(err);
  }
};
modelObj.getPunchInStatus = async function (user) {

  let query = `SELECT user_admin.ua_tele_punch FROM user_admin WHERE ua_id = ${user}`;

  let returnDataFromModel;

  try {
    let execNewQuery = await pool.query(query);
    returnDataFromModel = execNewQuery.rows[0].ua_tele_punch;
    return returnDataFromModel;
  } catch (err) {
    console.log(err);
  }
};
modelObj.updatePunchInStatus = async function (user, status) {

  let returnData = false
  let query = `UPDATE user_admin SET ua_tele_punch = ${status} WHERE ua_id = ${user}`;

  try {
    returnData = await pool.query(query);
    if (returnData) return returnData
  } catch (err) {
    console.log(err);
  }
};
modelObj.updatePunchOutStatus = async function (user, status) {

  let returnData = false
  let query = `UPDATE user_admin SET ua_tele_punch = false WHERE ua_role = 3`;

  try {
    returnData = await pool.query(query);
    if (returnData) return returnData
  } catch (err) {
    console.log(err);
  }
};

/* Updating the database with the new permission value. */
modelObj.permitAll = async function ({ table, list }) {
  let returnData = false;
  let idString = ``;
  list.forEach((elem) => {
    idString += `${elem.id.split("-")[1]},`;
  });
  idString = idString.slice(0, -1);
  let prefix, table_name;
  switch (table) {
    case "axis":
      prefix = "axis";
      table_name = "axis_bank_applications_table";
      break;
    case "au":
      prefix = "au";
      table_name = "au_bank_applications_table";
      break;
    case "bob":
      prefix = "bob";
      table_name = "bob_applications_table";
      break;
    case "citi":
      prefix = "citi";
      table_name = "citi_applications_table";
      break;
    case "idfc":
      prefix = "idfc";
      table_name = "idfc_bank_applications_table";
      break;
    case "yes":
      prefix = "yb";
      table_name = "yes_bank_applications_table";
      break;
  }
  let queryToDb = `UPDATE "${table_name}" SET "${prefix}_permit_to_telly" = ${!list[0][
    "permission"
  ]} WHERE ${prefix}_id in (${idString});`;
  if (list.length > 0) {
    try {
      const query = await pool.query(queryToDb);
      returnData = query.rows;
    } catch (err) {
      console.log(err);
      returnData = false;
    }
  }
  return returnData;
};

/* Updating the database. */
modelObj.changePermissionById = async function ({ table, id }) {
  let returnData = false;
  let prefix, table_name;
  switch (table) {
    case "axis":
      prefix = "axis";
      table_name = "axis_bank_applications_table";
      break;
    case "au":
      prefix = "au";
      table_name = "au_bank_applications_table";
      break;
    case "bob":
      prefix = "bob";
      table_name = "bob_applications_table";
      break;
    case "citi":
      prefix = "citi";
      table_name = "citi_applications_table";
      break;
    case "idfc":
      prefix = "idfc";
      table_name = "idfc_bank_applications_table";
      break;
    case "yes":
      prefix = "yb";
      table_name = "yes_bank_applications_table";
      break;
  }
  let queryToDb = `UPDATE "${table_name}" SET "${prefix}_permit_to_telly" = NOT "${prefix}_permit_to_telly" WHERE ${prefix}_id = (${id});`;
  try {
    const query = await pool.query(queryToDb);
    returnData = query.rows;
  } catch (err) {
    console.log(err);
    returnData = false;
  }
  return returnData;
};



/* The above code is used to assign the applications to multiple users. */
modelObj.assignToMultipleIds = async function ({
  applicationIdList,
  addUsersList,
  removeUsersList,
  table,
  isAssign,
  loggedUser
}) {
  let issuer_id;
  let returnBoolean = false;
  switch (table) {
    case "axis":
      issuer_id = 1;
      break;
    case "au":
      issuer_id = 7;
      break;
    case "bob":
      issuer_id = 2;
      break;
    case "citi":
      issuer_id = 3;
      break;
    case "idfc":
      issuer_id = 4;
      break;
    case "yes":
      issuer_id = 11;
      break;
    case "icici":
      issuer_id = 6;
      break;
  }
  if (isAssign) {
    if (issuer_id == 1) {

      try {
        let finalQueryForEntry = ``;
        for (let i = 0; i < applicationIdList.length; i++) {
          let axisSelectQuery = `SELECT * FROM public.axis_bank_applications_table WHERE axis_id = $1 ;`;
          let dataFromAxisSelectQuery = await pool.query(axisSelectQuery, [applicationIdList[i].id]);
          // console.log(dataFromAxisSelectQuery.rows);
          if (dataFromAxisSelectQuery.rows.length > 0) {
            for (let j = 0; j < addUsersList.length; j++) {
              let axisIpaOriginalStatusVal = dataFromAxisSelectQuery.rows[0].axis_ipa_original_status_sheet;

              let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]["id"]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
              if (aujData.rows.length == 0) {

                finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]["id"]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} );`;
                finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_axis_ipa_original_status_sheet) values('${issuer_id}','${applicationIdList[i]["id"]}','${issuer_id}_${applicationIdList[i]["id"]}', '${axisIpaOriginalStatusVal}')
                            ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
              }
            }
          }
        }
        if (finalQueryForEntry != "") {
          // console.log(finalQueryForEntry, "---- final query for entry ");
          await pool.query(finalQueryForEntry);
        }
        returnBoolean = true;

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;
      }

    } else if (issuer_id == 4) {

      try {
        let finalQueryForEntry = ``;
        for (let i = 0; i < applicationIdList.length; i++) {
          let idfcSelectQuery = `SELECT * FROM public.idfc_bank_applications_table WHERE idfc_id = $1 ;`;
          let dataFromIdfcSelectQuery = await pool.query(idfcSelectQuery, [applicationIdList[i].id]);
          //console.log(dataFromIdfcSelectQuery.rows);
          if (dataFromIdfcSelectQuery.rows.length > 0) {
            for (let j = 0; j < addUsersList.length; j++) {
              let idfcIpaOriginalStatusVal = dataFromIdfcSelectQuery.rows[0].idfc_sub_status;
              //console.log(idfcIpaOriginalStatusInitialVal);

              let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]["id"]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
              if (aujData.rows.length == 0) {

                finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]["id"]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} );`;
                finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_idfc_sub_status) values('${issuer_id}','${applicationIdList[i]["id"]}','${issuer_id}_${applicationIdList[i]["id"]}', '${idfcIpaOriginalStatusVal}')
                            ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
              }
            }
          }
        }
        if (finalQueryForEntry != "") {
          //console.log(finalQueryForEntry, "---- final query for entry ");
          await pool.query(finalQueryForEntry);
        }
        returnBoolean = true;

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;
      }



    } else if (issuer_id == 6) {
      console.log('HI I AM RAHUL BBBBBB');
    } else if (issuer_id == 7) {
      try {
        let finalQueryForEntry = ``;
        for (let i = 0; i < applicationIdList.length; i++) {
          let auSelectQuery = `SELECT * FROM public.au_bank_applications_table WHERE au_id = $1 ;`;
          let dataFromAuSelectQuery = await pool.query(auSelectQuery, [applicationIdList[i].id]);
          console.log(dataFromAuSelectQuery.rows);
          if (dataFromAuSelectQuery.rows.length > 0) {
            for (let j = 0; j < addUsersList.length; j++) {
              let dropOffPageVal = dataFromAuSelectQuery.rows[0].au_drop_off_page;
              let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]["id"]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
              if (aujData.rows.length == 0) {
                finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]["id"]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} ) ;`;
                finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_au_dropoff_page) values('${issuer_id}','${applicationIdList[i]["id"]}','${issuer_id}_${applicationIdList[i]["id"]}', '${dropOffPageVal}')
                              ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;

              }



            }

          }


        }
        if (finalQueryForEntry != "") {
          console.log(finalQueryForEntry, "---- final query for entry ");
          await pool.query(finalQueryForEntry);

        }

        returnBoolean = true;

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;
      }


    } else if (issuer_id == 11) {

      try {
        let finalQueryForEntry = ``;
        for (let i = 0; i < applicationIdList.length; i++) {
          let yesSelectQuery = `SELECT * FROM public.yes_bank_applications_table WHERE yb_id = $1 ;`;
          let dataFromYesSelectQuery = await pool.query(yesSelectQuery, [applicationIdList[i].id]);
          //console.log(dataFromYesSelectQuery.rows);
          if (dataFromYesSelectQuery.rows.length > 0) {
            for (let j = 0; j < addUsersList.length; j++) {
              let applicationStatusVal = dataFromYesSelectQuery.rows[0].yb_application_status;
              let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]["id"]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
              if (aujData.rows.length == 0) {

                finalQueryForEntry += ` INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]["id"]} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id} );`;
                finalQueryForEntry += ` INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_yes_application_status) values('${issuer_id}','${applicationIdList[i]["id"]}','${issuer_id}_${applicationIdList[i]["id"]}', '${applicationStatusVal}')
                            ON CONFLICT (tad_ci_ca_unique) DO NOTHING; `;
              }

            }

          }
        }
        if (finalQueryForEntry != "") {
          // console.log(finalQueryForEntry, "---- final query for entry ");
          await pool.query(finalQueryForEntry);
        }
        returnBoolean = true;

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;
      }



    } else {
      let finalQueryForEntry = ``;

      for (i = 0; i < applicationIdList.length; i++) {
        for (j = 0; j < addUsersList.length; j++) {
          if (
            !(
              applicationIdList[i].users.length > 0 &&
              applicationIdList[i].users.includes(addUsersList[j])
            )
          ) {
            let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationIdList[i]["id"]}  AND admin_user = ${addUsersList[j]} AND  issuer_id =  ${issuer_id}; `);
            if (aujData.rows.length == 0) {
              finalQueryForEntry += `INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${addUsersList[j]} , ${applicationIdList[i]["id"]} , ${issuer_id} , ${loggedUser.ua_id} , ${loggedUser.ua_id} );`;
              finalQueryForEntry += `INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique) values('${issuer_id}','${applicationIdList[i]["id"]}','${issuer_id}_${applicationIdList[i]["id"]}')
                            ON CONFLICT (tad_ci_ca_unique) DO NOTHING;`;

            }
          }


        }
      }

      try {
        if (finalQueryForEntry != "") {
          await pool.query(finalQueryForEntry);
        }
        returnBoolean = true;
      } catch (err) {
        console.log(err);
        //Although not required
        returnBoolean = false;
      }


    }

  } else if (removeUsersList.length > 0) {
    let finalRemoveQuery = ``;
    for (i = 0; i < applicationIdList.length; i++) {
      for (j = 0; j < removeUsersList.length; j++) {
        finalRemoveQuery += ` DELETE FROM public.applications_users_junction where application_id='${applicationIdList[i]["id"]}' and admin_user='${removeUsersList[j]}' and issuer_id=${issuer_id}; `;
      }
    }
    try {
      await pool.query(finalRemoveQuery);
      returnBoolean = true;
    } catch (err) {
      console.log(err);
      //Although not required
      returnBoolean = false;
    }
  }
  return returnBoolean;
};

/* The above code is assigning the application to the user. */
modelObj.assignToSingleId = async function ({
  applicationId,
  userId,
  toAssignBool,
  table,
  loggedUser
}) {
  /* The above code is declaring two variables. The first variable is issuer_id and the second variable
  is returnBoolean. The first variable is declared as a global variable and the second variable is
  declared as a local variable. */
  let issuer_id;
  let returnBoolean = false;

  /* Assigning the issuer_id based on the table name. */
  switch (table) {
    case "axis":
      issuer_id = 1;
      break;
    case "au":
      issuer_id = 7;
      break;
    case "bob":
      issuer_id = 2;
      break;
    case "citi":
      issuer_id = 3;
      break;
    case "idfc":
      issuer_id = 4;
      break;
    case "yes":
      issuer_id = 11;
      break;
  }

  if (toAssignBool) {
    if (issuer_id == 1) {
      let entryQuery = '';

      let axisSelectQuery = `SELECT * FROM public.axis_bank_applications_table WHERE axis_id = $1 ;`;
      try {
        let dataFromSelectAxisQuery = await pool.query(axisSelectQuery, [applicationId]);
        console.log(dataFromSelectAxisQuery.rows[0]);
        if (dataFromSelectAxisQuery.rows.length > 0) {
          let axisIpaOriginalStatusVal = dataFromSelectAxisQuery.rows[0].axis_ipa_original_status_sheet;
          //console.log(axisIpaOriginalStatusInitialVal);
          let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationId}  AND admin_user = ${userId} AND  issuer_id =  ${issuer_id}; `);
          if (aujData.rows.length == 0) {
            entryQuery = `INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${userId} , ${applicationId} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id});`;
            entryQuery += `INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_axis_ipa_original_status_sheet) values('${issuer_id}','${applicationId}','${issuer_id}_${applicationId}', '${axisIpaOriginalStatusVal}')
                              ON CONFLICT (tad_ci_ca_unique) DO NOTHING;`;
          }

          if (entryQuery != "") {
            await pool.query(entryQuery);
          }
          returnBoolean = true;
        }

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;

      }

    } else if (issuer_id == 4) {
      console.log("hi im in assign idfc");
      let entryQuery = '';

      let idfcSelectQuery = `SELECT * FROM public.idfc_bank_applications_table WHERE idfc_id = $1 ;`;
      try {
        let dataFromSelectIdfcQuery = await pool.query(idfcSelectQuery, [applicationId]);
        // console.log(dataFromSelectIdfcQuery.rows[0]);
        if (dataFromSelectIdfcQuery.rows.length > 0) {
          let idfcIpaOriginalStatusVal = dataFromSelectIdfcQuery.rows[0].idfc_sub_status;
          //  console.log(idfcIpaOriginalStatusInitialVal);
          let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationId}  AND admin_user = ${userId} AND  issuer_id =  ${issuer_id}; `);
          if (aujData.rows.length == 0) {
            entryQuery = `INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${userId} , ${applicationId} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id});`;
            entryQuery += `INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_idfc_sub_status) values('${issuer_id}','${applicationId}','${issuer_id}_${applicationId}', '${idfcIpaOriginalStatusVal}')
                              ON CONFLICT (tad_ci_ca_unique) DO NOTHING;`;
          }
          if (entryQuery != "") {
            await pool.query(entryQuery);
          }
          returnBoolean = true;
        }

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;

      }

    }
    else if (issuer_id == 7) {
      let entryQuery = '';
      let auSelectQuery = `SELECT * FROM public.au_bank_applications_table WHERE au_id = $1 ;`;
      try {
        let dataFromSelectAuQuery = await pool.query(auSelectQuery, [applicationId]);
        if (dataFromSelectAuQuery.rows.length > 0) {
          let auDropOffPageVal = dataFromSelectAuQuery.rows[0].au_drop_off_page;
          let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationId}  AND admin_user = ${userId} AND  issuer_id =  ${issuer_id}; `);
          if (aujData.rows.length == 0) {
            entryQuery = `INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${userId} , ${applicationId} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id});`;
            entryQuery += `INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_au_dropoff_page) values('${issuer_id}','${applicationId}','${issuer_id}_${applicationId}', '${auDropOffPageVal}')
                              ON CONFLICT (tad_ci_ca_unique) DO NOTHING;`;
          }
          if (entryQuery != "") {
            await pool.query(entryQuery);
          }
          returnBoolean = true;
        }

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;

      }

    } else if (issuer_id = 11) {
      let entryQuery = '';

      let yesSelectQuery = `SELECT * FROM public.yes_bank_applications_table WHERE yb_id = $1 ;`;
      try {
        let dataFromSelectYesQuery = await pool.query(yesSelectQuery, [applicationId]);
        if (dataFromSelectYesQuery.rows.length > 0) {
          let yesApplicationStatusVal = dataFromSelectYesQuery.rows[0].yb_application_status;
          let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationId}  AND admin_user = ${userId} AND  issuer_id =  ${issuer_id}; `);
          if (aujData.rows.length == 0) {
            entryQuery = `INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${userId} , ${applicationId} , ${issuer_id} , ${loggedUser.ua_id}, ${loggedUser.ua_id});`;
            entryQuery += `INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique, tad_yes_application_status) values('${issuer_id}','${applicationId}','${issuer_id}_${applicationId}', '${yesApplicationStatusVal}')
                              ON CONFLICT (tad_ci_ca_unique) DO NOTHING;`;
          }
          if (entryQuery != "") {
            await pool.query(entryQuery);
          }
          returnBoolean = true;
        }

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;

      }

    } else {
      let entryQuery = '';
      try {
        let aujData = await pool.query(`SELECT * FROM public.applications_users_junction WHERE application_id = ${applicationId}  AND admin_user = ${userId} AND  issuer_id =  ${issuer_id}; `);
        if (aujData.rows.length == 0) {
          entryQuery = `INSERT INTO public.applications_users_junction (admin_user , application_id , issuer_id , auj_created_by , auj_updated_by) VALUES(${userId} , ${applicationId} , ${issuer_id} , ${loggedUser.ua_id} , ${loggedUser.ua_id});`;
          entryQuery += `INSERT INTO tele_applications_data(tad_issuer, tad_card_applications, tad_ci_ca_unique) values('${issuer_id}','${applicationId}','${issuer_id}_${applicationId}')
                            ON CONFLICT (tad_ci_ca_unique) DO NOTHING;`;
        }
        if (entryQuery != "") {
          await pool.query(entryQuery);
        }
        returnBoolean = true;

      } catch (error) {
        console.log(error);
        //Although not required
        returnBoolean = false;
      }

    }


  } else {
    let removeQuery = `DELETE FROM public.applications_users_junction where application_id='${applicationId}' and admin_user='${userId}' and issuer_id=${issuer_id};`;
    try {
      await pool.query(removeQuery);
      returnBoolean = true;

    } catch (err) {
      console.log(err);
      //Although not required
      returnBoolean = false;
    }
  }


  return returnBoolean;
};



// This code appears to be a function that reassigns a user from one ID to another in a database table, based on certain conditions.

// The function takes in an object with 5 properties :

// 'applicationIdList' : an array of application ids
// 'reassignFrom': the user id from which reassignment should happen
// 'reassignTo': the user id to which reassignment should happen
// 'table': the table name
// 'loggedUser': an object containing the user details
// The function first checks the value of 'table' and assigns a corresponding 'issuer_id' based on the value of 'table'.

// Then, it constructs a dynamic query string using a for loop, that updates the admin_user and auj_updated_at fields of the 'applications_users_junction' table, based on the values of 'applicationIdList', 'reassignFrom', 'reassignTo' and 'loggedUser.ua_id'

// It then executes the query using the 'pool.query()' function and returns a boolean value 'returnBoolean' based on the result.


/* The above code is used to reassign the applications to multiple users. */
modelObj.reassignToMultipleIds = async function ({
  applicationIdList,
  reassignFrom,
  reassignTo,
  table,
  loggedUser
}) {
  // console.log(applicationIdList, reassignFrom, reassignTo, table, loggedUser, "------- in model");
  let issuer_id = 0;
  let returnBoolean = false;
  switch (table) {
    case "axis":
      issuer_id = 1;
      break;
    case "au":
      issuer_id = 7;
      break;
    case "bob":
      issuer_id = 2;
      break;
    case "citi":
      issuer_id = 3;
      break;
    case "idfc":
      issuer_id = 4;
      break;
    case "yes":
      issuer_id = 11;
      break;
    case "icici":
      issuer_id = 6;
      break;
  }


  if (issuer_id != 0) {


    let finalQueryForEntry = ``;

    for (let i = 0; i < applicationIdList.length; i++) {
      finalQueryForEntry += ` UPDATE public.applications_users_junction SET admin_user = ${reassignTo} , auj_updated_at = (now() AT TIME ZONE 'Asia/Kolkata') , auj_updated_by =  ${loggedUser.ua_id} WHERE application_id = ${applicationIdList[i].id} AND issuer_id = ${issuer_id} AND admin_user = ${reassignFrom}; `
    }

    // console.log(finalQueryForEntry);
    try {
      await pool.query(finalQueryForEntry);
      returnBoolean = true;
    } catch (err) {
      console.log(err);
      //Although not required
      returnBoolean = false;
    }
    return returnBoolean;


  } else {
    returnBoolean = false;
    return returnBoolean;
  }


};


modelObj.getApplicationDataById = async function (id, table) {
  let prefix, table_name, issuer_id;
  switch (table) {
    case "axis":
      prefix = "axis";
      table_name = "axis_bank_applications_table";
      issuer_id = 1;
      break;
    case "au":
      prefix = "au";
      table_name = "au_bank_applications_table";
      issuer_id = 7;
      break;
    case "bob":
      prefix = "bob";
      table_name = "bob_applications_table";
      issuer_id = 2;
      break;
    case "citi":
      prefix = "citi";
      table_name = "citi_applications_table";
      issuer_id = 3;
      break;
    case "idfc":
      prefix = "idfc";
      table_name = "idfc_bank_applications_table";
      issuer_id = 4;
      break;
    case "yes":
      prefix = "yb";
      table_name = "yes_bank_applications_table";
      issuer_id = 11;
      break;
  }

  let query;
  // Chaning query according to bank table cause idfc table does not have name and number column
  if (table_name === "idfc_bank_applications_table") {
    query = `SELECT *, card_applications_main_table.phone_number, card_applications_main_table.name FROM idfc_bank_applications_table 
    LEFT JOIN card_applications_main_table ON card_applications_main_table.id = ca_main_table where ${prefix}_id=${id} `;
  } else {
    query = `SELECT * FROM ${table_name} where ${prefix}_id=${id}`;
  }
  let query2 = `SELECT * FROM tele_applications_data where tad_card_applications=${id} and tad_issuer=${issuer_id} `;

  let returnData = {};
  try {
    let qReturn = await pool.query(query);
    let qReturn2 = await pool.query(query2);

    returnData = {
      ...qReturn.rows[0],
      ...qReturn2.rows[0],
    };
  } catch (err) {
    console.log(err);
    returnData = {};
  }
  return returnData;
};
module.exports = modelObj;
