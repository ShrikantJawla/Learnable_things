const e = require("express");
const { async } = require("q");
let { pool } = require("../../utils/configs/database");
let commonModel = require("../commonModel");
///////////////////////////////////////
let modelObj = {};

modelObj.getAllApplicationsNew = async function (body, currenUserId) {
  console.log(body, "bodybody");
  let returnData = {
    applicationsData: [],
    count: 0,
    lastId: ""
  };

  let limit = ' limit 10';
  let whereCondition = '';
  let selectoptions = 'icici_bank_application.*';
  let offset = 0;
  let sortingBy = 'icici_bank_application.icici_id';
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
  if (body) {
    if (body.sort_asec && body.sort_asec.length > 0) {
      sortingBy = '';
      sortingBy = ` icici_bank_application.` + body.sort_asec;
      sortOrder = 'ASC';
    }
    if (body.sort_desc && body.sort_desc.length > 0) {
      sortingBy = '';
      sortingBy = ` icici_bank_application.` + body.sort_desc;
      sortOrder = 'DESC';
    }
    if (body.null && body.null.length > 0) {
      for (let l = 0; l < body.null.length; l++) {
        isNullCondition = isNullCondition + body.null[l] + ` is null `;

        if (l != body.null.length - 1) {
          isNullCondition = isNullCondition + ` AND `;
        }
      }
    }
    if (body.notNull && body.notNull.length > 0) {
      for (let l = 0; l < body.notNull.length; l++) {
        isNotNullCondition = isNotNullCondition + body.notNull[l] + ` is not null `;
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
          if (key == 'is_work_done' || key == 'is_auto_assigned' || key == 'call_counter' || key == 'automated_call_counter') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else if (key === 'mp_idfc_available' || key === 'mp_axis_available' || key === 'mp_au_available' || key === 'mp_yes_available' || key === 'mp_bob_available') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else {
            let parseValue = parseInt(value);
            if (!parseValue || key == 'phone_number' || key == 'icici_application_number') {
              otherFilter = otherFilter + ` lower(${key}) LIKE lower('%${value}%')`;
            } else {
              otherFilter = otherFilter + ` ${key} = ${value}`;
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
        if (key != 'cold_calling_array') {
          if (value && value.length == 1) {
            let revisedQuery = false;
            if (body.revised && body.revised.length > 0) {
              let revised = body.revised.includes(`${key}_revised`);
              console.log(revised, `${key}_revised---------------`);
              if (revised) {
                revisedQuery = true;
              }
            }
            if (revisedQuery) {
              arrayFilter = arrayFilter + `  NOT ('${value}' = any(${key}) ) `;
            } else {
              arrayFilter = arrayFilter + ` '${value}' = any(${key}) `;
            }


          } else {
            let joinArrayFilter = ` `;
            for (let g = 0; g < value.length; g++) {
              if (g == 0) {
                joinArrayFilter = ` ( `
              }
              let revisedQuery = false;
              if (body.revised && body.revised.length > 0) {
                let revised = body.revised.includes(`${key}_revised`);
                console.log(revised, `${key}_revised---------------`);
                if (revised) {
                  revisedQuery = true;
                }
              }
              if (revisedQuery) {
                joinArrayFilter = joinArrayFilter + `  NOT ('${value[g]}' = any(${key})) `;
              } else {
                joinArrayFilter = joinArrayFilter + ` '${value[g]}' = any(${key}) `;
              }

              if (g != value.length - 1) {
                if (revisedQuery) {
                  joinArrayFilter = joinArrayFilter + ` AND `;
                } else {
                  joinArrayFilter = joinArrayFilter + ` OR `;
                }

              } else {
                joinArrayFilter = joinArrayFilter + ` )`;
              }
            }
            arrayFilter = arrayFilter + joinArrayFilter;
          }
        }

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
          dateFiltter = dateFiltter + ` icici_bank_application.${key}::date >= date '${splitedValue[0]}' AND icici_bank_application.${key}::date <= date '${splitedValue[1]}'`;
        } else {
          dateFiltter = dateFiltter + ` icici_bank_application.${key} ::date = date '${value}'`;
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

  console.log(whereCondition, "isNullConditionisNullCondition");


  let newSelect = ``;

  let needToJoinWere = '';
  let leftJoin = ``;

  let queryLastValues = ` ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset} `;
  let getAllApplicationsSql = `SELECT ${selectoptions} ${newSelect} FROM public.icici_bank_application ${leftJoin}   ${whereCondition} 
    `;
  let finalQuery = getAllApplicationsSql + queryLastValues;

  console.log(finalQuery, "getAllApplicationsSqlgetAllApplicationsSql")
  let result = await commonModel.getDataOrCount(finalQuery, [], 'D');


  let queryForCount = `SELECT Count(*) FROM public.icici_bank_application ${leftJoin}  ${whereCondition}`;

  let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');

  if (totalCount && totalCount.length > 0) {
    returnData.count = totalCount[0].count;
  }
  returnData.applicationsData = result;
  return returnData;
}
modelObj.getAllApplicationsNewRahulEx = async function (body, currenUserId, selectColumns, tableName) {
  console.log(body, "bodybody");
  let returnData = {
    applicationsData: [],
    count: 0,
    lastId: ""
  };

  let limit = ' limit 10';
  let whereCondition = '';
  let selectoptions = selectColumns;
  let offset = 0;
  let sortingBy = `${tableName}.icici_id`;
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
        isNullCondition = isNullCondition + body.null[l] + ` is null `;

        if (l != body.null.length - 1) {
          isNullCondition = isNullCondition + ` AND `;
        }
      }
    }
    if (body.notNull && body.notNull.length > 0) {
      for (let l = 0; l < body.notNull.length; l++) {
        isNotNullCondition = isNotNullCondition + body.notNull[l] + ` is not null `;
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
          if (key == 'is_work_done' || key == 'is_auto_assigned' || key == 'call_counter' || key == 'automated_call_counter') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else if (key === 'mp_idfc_available' || key === 'mp_axis_available' || key === 'mp_au_available' || key === 'mp_yes_available' || key === 'mp_bob_available') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else {
            let parseValue = parseInt(value);
            if (!parseValue || key == 'phone_number' || key == 'icici_application_number') {
              otherFilter = otherFilter + ` lower(${key}) LIKE lower('%${value}%')`;
            } else {
              otherFilter = otherFilter + ` ${key} = ${value}`;
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
        if (key != 'cold_calling_array') {
          if (value && value.length == 1) {
            let revisedQuery = false;
            if (body.revised && body.revised.length > 0) {
              let revised = body.revised.includes(`${key}_revised`);
              console.log(revised, `${key}_revised---------------`);
              if (revised) {
                revisedQuery = true;
              }
            }
            if (revisedQuery) {
              arrayFilter = arrayFilter + `  NOT ('${value}' = any(${key}) ) `;
            } else {
              arrayFilter = arrayFilter + ` '${value}' = any(${key}) `;
            }


          } else {
            let joinArrayFilter = ` `;
            for (let g = 0; g < value.length; g++) {
              if (g == 0) {
                joinArrayFilter = ` ( `
              }
              let revisedQuery = false;
              if (body.revised && body.revised.length > 0) {
                let revised = body.revised.includes(`${key}_revised`);
                console.log(revised, `${key}_revised---------------`);
                if (revised) {
                  revisedQuery = true;
                }
              }
              if (revisedQuery) {
                joinArrayFilter = joinArrayFilter + `  NOT ('${value[g]}' = any(${key})) `;
              } else {
                joinArrayFilter = joinArrayFilter + ` '${value[g]}' = any(${key}) `;
              }

              if (g != value.length - 1) {
                if (revisedQuery) {
                  joinArrayFilter = joinArrayFilter + ` AND `;
                } else {
                  joinArrayFilter = joinArrayFilter + ` OR `;
                }

              } else {
                joinArrayFilter = joinArrayFilter + ` )`;
              }
            }
            arrayFilter = arrayFilter + joinArrayFilter;
          }
        }

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
          dateFiltter = dateFiltter + ` ${tableName}.${key}::date >= date '${splitedValue[0]}' AND ${tableName}.${key}::date <= date '${splitedValue[1]}'`;
        } else {
          dateFiltter = dateFiltter + ` ${tableName}.${key} ::date = date '${value}'`;
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

  console.log(whereCondition, "isNullConditionisNullCondition");


  let newSelect = ``;

  let needToJoinWere = '';
  let leftJoin = ``;

  let queryLastValues = ` ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset} `;
  let getAllApplicationsSql = `SELECT ${selectoptions} ${newSelect} FROM public.${tableName} ${leftJoin}   ${whereCondition} 
      `;
  let finalQuery = getAllApplicationsSql + queryLastValues;

  console.log(finalQuery, "getAllApplicationsSqlgetAllApplicationsSql")
  let result = await commonModel.getDataOrCount(finalQuery, [], 'D');


  let queryForCount = `SELECT Count(*) FROM public.${tableName} ${leftJoin}  ${whereCondition}`;

  let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');

  if (totalCount && totalCount.length > 0) {
    returnData.count = totalCount[0].count;
  }
  returnData.applicationsData = result;
  return returnData;
}

modelObj.getTeleApplicationsNew = async function (body, currenUserId) {
  console.log(body, "bodybody");
  let returnData = {
    applicationsData: [],
    count: 0,
    lastId: ""
  };

  let limit = ' limit 10';
  let whereCondition = '';
  let selectoptions = 'card_applications_main_table.*';
  let offset = 0;
  let sortingBy = 'card_applications_main_table.updated_at';
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
  if (body) {
    if (body.sort_asec && body.sort_asec.length > 0) {
      sortingBy = '';
      sortingBy = ` card_applications_main_table.` + body.sort_asec;
      sortOrder = 'ASC';
    }
    if (body.sort_desc && body.sort_desc.length > 0) {
      sortingBy = '';
      sortingBy = ` card_applications_main_table.` + body.sort_desc;
      sortOrder = 'DESC';
    }
    if (body.null && body.null.length > 0) {
      for (let l = 0; l < body.null.length; l++) {
        if (body.null[l] == 'banks_applied_array' || body.null[l] == 'form_filled_array' || body.null[l] == 'banks_approved_array' || body.null[l] == 'cold_calling_bank_assigned_array') {
          isNullCondition = isNullCondition + body.null[l] + ` = '{}' `;
        } else if (body.null[l] != 'cold_calling_count') {
          isNullCondition = isNullCondition + body.null[l] + ` is null `;
        } else {
          changeInQuery = true;
          newChanges = ' where result.cold_calling_count = 0';
        }

        if (l != body.null.length - 1) {
          isNullCondition = isNullCondition + ` AND `;
        }
      }
    }
    if (body.notNull && body.notNull.length > 0) {
      for (let l = 0; l < body.notNull.length; l++) {
        if (body.notNull[l] == 'banks_applied_array' || body.notNull[l] == 'form_filled_array' || body.notNull[l] == 'banks_approved_array' || body.notNull[l] == 'cold_calling_bank_assigned_array') {
          isNotNullCondition = isNotNullCondition + body.notNull[l] + ` != '{}' `;
        } else if (body.notNull[l] != 'cold_calling_count') {
          isNotNullCondition = isNotNullCondition + body.notNull[l] + ` is not null `;
        } else {
          changeInQuery = true;
          newChanges = ' where result.cold_calling_count > 0';
        }
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
          if (key == 'is_work_done' || key == 'is_auto_assigned' || key == 'call_counter' || key == 'automated_call_counter') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else if (key === 'mp_idfc_available' || key === 'mp_axis_available' || key === 'mp_au_available' || key === 'mp_yes_available' || key === 'mp_bob_available') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else if (key == 'cold_calling_array') {
            var string = value.split("_");
            otherFilter = otherFilter + ` ${string[0]}.cc_issuer = ${string[1]} `
            console.log(string);
          } else {
            let parseValue = parseInt(value);
            if (!parseValue || key == 'phone_number' || key == 'icici_application_number') {
              otherFilter = otherFilter + ` lower(${key}) LIKE lower('%${value}%')`;
            } else {
              otherFilter = otherFilter + ` ${key} = ${value}`;
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
        if (key != 'cold_calling_array') {
          if (value && value.length == 1) {
            let revisedQuery = false;
            if (body.revised && body.revised.length > 0) {
              let revised = body.revised.includes(`${key}_revised`);
              console.log(revised, `${key}_revised---------------`);
              if (revised) {
                revisedQuery = true;
              }
            }
            if (revisedQuery) {
              arrayFilter = arrayFilter + `  NOT ('${value}' = any(${key}) ) `;
            } else {
              arrayFilter = arrayFilter + ` '${value}' = any(${key}) `;
            }


          } else {
            let joinArrayFilter = ` `;
            for (let g = 0; g < value.length; g++) {
              if (g == 0) {
                joinArrayFilter = ` ( `
              }
              let revisedQuery = false;
              if (body.revised && body.revised.length > 0) {
                let revised = body.revised.includes(`${key}_revised`);
                console.log(revised, `${key}_revised---------------`);
                if (revised) {
                  revisedQuery = true;
                }
              }
              if (revisedQuery) {
                joinArrayFilter = joinArrayFilter + `  NOT ('${value[g]}' = any(${key})) `;
              } else {
                joinArrayFilter = joinArrayFilter + ` '${value[g]}' = any(${key}) `;
              }

              if (g != value.length - 1) {
                if (revisedQuery) {
                  joinArrayFilter = joinArrayFilter + ` AND `;
                } else {
                  joinArrayFilter = joinArrayFilter + ` OR `;
                }

              } else {
                joinArrayFilter = joinArrayFilter + ` )`;
              }
            }
            arrayFilter = arrayFilter + joinArrayFilter;
          }
        }

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
          dateFiltter = dateFiltter + ` card_applications_main_table.${key}::date >= date '${splitedValue[0]}' AND card_applications_main_table.${key}::date <= date '${splitedValue[1]}'`;
        } else {
          dateFiltter = dateFiltter + ` card_applications_main_table.${key} ::date = date '${value}'`;
        }

        numLoop++;
        if (numLoop != Object.keys(body.date).length) {
          dateFiltter = dateFiltter + ` AND `;
        }
      }
    }
  }
  whereCondition = ` WHERE 'icici' = any(form_filled_array) `;

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

  console.log(whereCondition, "isNullConditionisNullCondition");


  let newSelect = `, CAST(card_applications_main_table.created_at as varchar) , CAST(card_applications_main_table.updated_at as varchar) ,
  CAST(card_applications_main_table.date_of_birth as varchar) , manage_pincodes.mp_idfc_available ,manage_pincodes.mp_axis_available,manage_pincodes.mp_au_available,manage_pincodes.mp_yes_available,manage_pincodes.mp_bob_available , user_admin.ua_name ,lead_assigning_user_junction.is_work_done, lead_assigning_user_junction.notes, lead_assigning_user_junction.application_status , lead_assigning_user_junction.is_auto_assigned , lead_assigning_user_junction.call_status, lead_assigning_user_junction.call_counter, lead_assigning_user_junction.automated_call_status, lead_assigning_user_junction.automated_call_counter, lead_assigning_user_junction.final_call_status , lead_assigning_user_junction.junction_id  , icici_bank_application.*`;
  newSelect = newSelect + ` `;
  let needToJoinWere = '';
  if (currenUserId) {
    needToJoinWere = ` AND lead_assigning_user_junction.user_id =  ${currenUserId}`;
    whereCondition = whereCondition + ` AND lead_assigning_user_junction.user_id is not null `;
  }
  let leftJoin = ` 
  LEFT JOIN manage_pincodes ON manage_pincodes.mp_pincode = CAST(pin_code as varchar)
  LEFT JOIN lead_assigning_user_junction ON lead_assigning_user_junction.issuer_id = 6 AND 
  lead_assigning_user_junction.lead_id = card_applications_main_table.id ${needToJoinWere}
  LEFT JOIN user_admin ON user_admin.ua_id = lead_assigning_user_junction.user_id
  LEFT JOIN icici_bank_application ON icici_bank_application.ca_main_table = card_applications_main_table.id
`;

  let queryLastValues = ` ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset} `;
  let getAllApplicationsSql = `SELECT ${selectoptions} ${newSelect} FROM public.card_applications_main_table ${leftJoin}   ${whereCondition} 
  `;
  let finalQuery = getAllApplicationsSql + queryLastValues;
  if (changeInQuery) {
    finalQuery = `  SELECT * FROM  (${getAllApplicationsSql}) as result ${newChanges}  ${queryLastValues}`;
  }
  console.log(finalQuery, "getAllApplicationsSqlgetAllApplicationsSql")
  let result = await commonModel.getDataOrCount(finalQuery, [], 'D');


  let queryForCount = `SELECT Count(*) FROM public.card_applications_main_table ${leftJoin}  ${whereCondition}`;
  if (changeInQuery) {
    queryForCount = `  SELECT   Count(*)  FROM  (${getAllApplicationsSql}) as result ${newChanges}`;
  }
  let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');

  if (totalCount && totalCount.length > 0) {
    returnData.count = totalCount[0].count;
  }
  console.log(result)
  returnData.applicationsData = result;
  return returnData;
}

modelObj.assignToTelly = async function (bodyData) {
  let returnData = false;
  if (bodyData.main_id && bodyData.main_id.length > 0 && bodyData.assign_to) {
    let issuerId = 6;
    let insertedDataQuery = ``;
    for (let i = 0; i < bodyData.main_id.length; i++) {
      let checkIfAlreadyAssignSql = `SELECT * FROM public.lead_assigning_user_junction 
        where issuer_id = 6 AND is_work_done = false AND lead_id = ${bodyData.main_id[i]} `;
      let checkIfAlreadyExist = await commonModel.getDataOrCount(checkIfAlreadyAssignSql, [], 'D');
      console.log(checkIfAlreadyExist, "checkIfAlreadyExistcheckIfAlreadyExist");
      if (!checkIfAlreadyExist) {
        let inserdtedData = {
          lead_id: bodyData.main_id[i],
          user_id: bodyData.assign_to,
          issuer_id: issuerId,
          is_auto_assigned: false
        };
        let insertedQuery = await commonModel.insert('lead_assigning_user_junction', inserdtedData, true);
        insertedDataQuery = insertedDataQuery + insertedQuery + '; ';

      }
    }
    if (insertedDataQuery != '') {
      let insertIntoLead = await commonModel.getDataOrCount(insertedDataQuery, [], 'U');
      if (insertIntoLead) {
        returnData = true;
      }
    }
  }
  return returnData;
}

modelObj.editTellyForm = async function (dataBody) {
  let returnData = false;
  let updateInMainTable = 'update card_applications_main_table set ';
  let updateToIcicTellyData = ' ';
  let entryToIcicApplicationTable = '';

  if (dataBody) {
    let dob = `date_of_birth = '${dataBody.leftFormData.dob}' ,`;
    if (dataBody.leftFormData.dob == '' || dataBody.leftFormData.dob == null) {
      dob = '';
    }
    updateInMainTable = updateInMainTable + ` name = '${dataBody.leftFormData.name}' , email=  '${dataBody.leftFormData.email}' , ${dob}  employment =  '${dataBody.leftFormData.employment}', gender = '${dataBody.leftFormData.gender}' , pin_code = '${dataBody.leftFormData.pinCode}' , relationship_with_icici = ${dataBody.leftFormData.relationShip} , is_any_credit_card = ${dataBody.leftFormData.otherBankCard} , company_name = '${dataBody.leftFormData.companyName}' , annual_income = '${dataBody.leftFormData.annulaIncome}' , address = '${dataBody.leftFormData.currentAddress}' , qualification = '${dataBody.leftFormData.qualification}' , employer_details = '${dataBody.leftFormData.employerDetails}' ,  pan_card_number = '${dataBody.leftFormData.pancard}' where id = ${dataBody.leftFormData.mainTableId} ; `;

    updateToIcicTellyData = ` UPDATE lead_assigning_user_junction set is_work_done = ${dataBody.rightFormData.workDone} , application_status = '${dataBody.rightFormData.applicationStatus}' , notes = '${dataBody.rightFormData.notes.trim()}', call_status = '${dataBody.rightFormData.callStatus}', call_counter = ${dataBody.rightFormData.callCounter} , automated_call_status = '${dataBody.rightFormData.automatedCallStatus}' , automated_call_counter = ${dataBody.rightFormData.automatedCallCounter} , final_call_status = '${dataBody.rightFormData.finalCallStatus}' , updated_at = (now() AT TIME ZONE 'Asia/Kolkata')   where junction_id = ${dataBody.leftFormData.leadId} ;`;
    if (dataBody.leftFormData.applicationNumber != '') {
      entryToIcicApplicationTable = ` INSERT INTO icici_bank_application (icici_application_number , ca_main_table) VALUES('${dataBody.leftFormData.applicationNumber}' ,${dataBody.leftFormData.mainTableId}) ON CONFLICT DO NOTHING `;
    }
    updateInMainTable = updateInMainTable + updateToIcicTellyData + entryToIcicApplicationTable;
    console.log('kdjcndskjcndsk', updateInMainTable);
    // console.log(updateToIcicTellyData, "\n\n\n");
    let actionToDb = await commonModel.getDataOrCount(updateInMainTable, [], 'U');
    if (actionToDb) {
      returnData = true;
    }
  }
  return returnData;
}

modelObj.uploadSheetIcici = async function (bodyData) {
  let returnData = false;

  let insertedQuery = ` `;
  let insertedQueryForMain = ` `;
  for (let i = 0; i < bodyData.length; i++) {
    let currentData = bodyData[i];
    Object.keys(currentData).forEach(key => {
      //console.log(key, "keykey");
      let value = currentData[key];
      currentData[key] = value.replace("'", '');

    });

    insertedQueryForMain = insertedQueryForMain + ` INSERT INTO card_applications_main_table (name, phone_number ) 
    VALUES ('${bodyData[i]['APPLICANT_FIRST_NAME']}', '${bodyData[i]['MOBILE_NO']}')
    ON CONFLICT (phone_number) DO NOTHING;`;

    let insertedData = {
      icici_application_number: bodyData[i]['APP_ID'],
      ca_main_table: `(select id from card_applications_main_table where phone_number = '${bodyData[i]['MOBILE_NO']}')`,
      icici_applicant_name: bodyData[i]['APPLICANT_FIRST_NAME'],
      icici_flow_type: bodyData[i]['FLOW_TYPE'],
      icici_phone_number: bodyData[i]['MOBILE_NO'],
      icici_card_type: bodyData[i]['CARD_TYPE'],
      icici_pricing_code: bodyData[i]['PRICING_CODE'],
      icici_is_card_applied: bodyData[i]['IS_CPP_APPLIED'],
      icici_rejection_reason: bodyData[i]['REJECTION_REASON'],
      icici_approved_remarks: bodyData[i]['CKYC_APPROVER_REMARKS'],
      icici_req_income_doc: bodyData[i]['REQ_INCOME_DOC'],
      icici_current_address_pincode: bodyData[i]['CURRENT_ADD_PINCODE'],
      icici_permanent_address_pincode: bodyData[i]['PERMENET_ADD_PINCODE'],
      icici_gems_arn: bodyData[i]['GEMS_ARN'],
      icici_bre_decision: bodyData[i]['BRE_DECISION'],
      icici_ckyc_approver_decision: bodyData[i]['CKYC_APPROVER_DECISION'],
      icici_current_status: bodyData[i]['CURRENT_STATUS'],
      icici_app_status: bodyData[i]['APP_STATUS'],
      icici_idisb_dma: bodyData[i]['IDISB_DMA'],
      icici_se_id: bodyData[i]['SE_ID'],
      icici_status: bodyData[i]['STATUS'],
      icici_submission_status: bodyData[i]['SUBMISSION STATUS'],
      icici_current_city: bodyData[i]['CURRENT_CITY'],
      icici_region: bodyData[i]['REGION'],
      icici_created_date: bodyData[i]['CREATED_DA'],
      icici_location: bodyData[i]['LOCATION'],
      icici_rbm_name: bodyData[i]['RBM NAME'],
      icici_emp_name: bodyData[i]['EMP NAME'],
      icici_delink_dat: bodyData[i]['DELINK_DAT'],
      icici_delinker: bodyData[i]['DELINKER'],
      icici_vkyc_opted_flag: bodyData[i]['VKYC OPTED FLAG'],
      icici_initiated_flag: bodyData[i]['VKYC INITIATED FLAG']
    };
    let query = await commonModel.insert('icici_bank_application', insertedData, true);
    //
    if (query) {
      query = query + ` ON CONFLICT (icici_application_number) DO UPDATE 
      SET icici_applicant_name = '${bodyData[i]['APPLICANT_FIRST_NAME']}',
      icici_flow_type = '${bodyData[i]['FLOW_TYPE']}',
      icici_phone_number = '${bodyData[i]['MOBILE_NO']}',
      icici_card_type = '${bodyData[i]['CARD_TYPE']}',
      icici_pricing_code = '${bodyData[i]['PRICING_CODE']}',
      icici_is_card_applied = '${bodyData[i]['IS_CPP_APPLIED']}',
      icici_rejection_reason = '${bodyData[i]['REJECTION_REASON']}',
      icici_approved_remarks = '${bodyData[i]['CKYC_APPROVER_REMARKS']}',
      icici_req_income_doc = '${bodyData[i]['REQ_INCOME_DOC']}',
      icici_current_address_pincode = '${bodyData[i]['CURRENT_ADD_PINCODE']}',
      icici_permanent_address_pincode = '${bodyData[i]['PERMENET_ADD_PINCODE']}',
      icici_gems_arn = '${bodyData[i]['GEMS_ARN']}',
      icici_bre_decision = '${bodyData[i]['BRE_DECISION']}',
      icici_ckyc_approver_decision = '${bodyData[i]['CKYC_APPROVER_DECISION']}',
      icici_current_status = '${bodyData[i]['CURRENT_STATUS']}',
      icici_app_status = '${bodyData[i]['APP_STATUS']}',
      icici_idisb_dma = '${bodyData[i]['IDISB_DMA']}',
      icici_se_id = '${bodyData[i]['SE_ID']}',
      icici_status = '${bodyData[i]['STATUS']}',
      icici_submission_status = '${bodyData[i]['SUBMISSION STATUS']}',
      icici_current_city = '${bodyData[i]['CURRENT_CITY']}',
      icici_region = '${bodyData[i]['REGION']}',
      icici_created_date = '${bodyData[i]['CREATED_DA']}',
      icici_location = '${bodyData[i]['LOCATION']}',
      icici_rbm_name = '${bodyData[i]['RBM NAME']}',
      icici_emp_name = '${bodyData[i]['EMP NAME']}',
      icici_delink_dat = '${bodyData[i]['DELINK_DAT']}',
      icici_delinker = '${bodyData[i]['DELINKER']}',
      icici_vkyc_opted_flag = '${bodyData[i]['VKYC OPTED FLAG']}',
      icici_initiated_flag = '${bodyData[i]['VKYC INITIATED FLAG']}'; `;

      insertedQuery = insertedQuery + query;
    }
  }
  console.log(insertedQuery, "queryquery");

  let inserIntoMainTableHit = await commonModel.getDataOrCount(insertedQueryForMain, [], 'U');
  if (inserIntoMainTableHit) {
    let inserIntoMainTable = await commonModel.getDataOrCount(insertedQuery, [], 'U');
    if (inserIntoMainTable) {
      returnData = true;
    }
  }

  return returnData;
}

modelObj.getIcicColumns = async function(){
  let returnData = {
    allIssuers : [],
    allTr : [],
  };
 
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		let queryForTr = `SELECT 
    CONCAT('edit-icici-application?id=',icici_bank_application.icici_id) as "Edit",  
		icici_id as select,
		'' as assignTo,
		icici_bank_application.icici_id as "int|icici_id|Id" , 
		icici_bank_application.icici_application_number as "string|icici_application_number|Application Number",
		icici_bank_application.ca_main_table as "int|ca_main_table|Main Table",
		icici_bank_application.icici_applicant_name as "string|icici_applicant_name|Name",
		icici_bank_application.icici_flow_type as "string|icici_flow_type|Flow Type",
		icici_bank_application.icici_phone_number as "string|icici_phone_number|Phone Number",
		icici_bank_application.icici_card_type as "string|icici_card_type|Card Type",
		icici_bank_application.icici_pricing_code as "string|icici_pricing_code|Pricing Code",
		icici_bank_application.icici_is_card_applied as "string|icici_is_card_applied|Is Card Applied",
		icici_bank_application.icici_rejection_reason as "string|icici_rejection_reason|Rejection Reason",
		icici_bank_application.icici_approved_remarks as "string|icici_approved_remarks|Approved Remarks",
		icici_bank_application.icici_req_income_doc as "string|icici_req_income_doc|Req Income Doc",
		icici_bank_application.icici_current_address_pincode as "string|icici_current_address_pincode|Current Pincode",
		icici_bank_application.icici_permanent_address_pincode as "string|icici_permanent_address_pincode|Permanent Pincode",
		icici_bank_application.icici_gems_arn as "string|icici_gems_arn|Gems Arn",
		icici_bank_application.icici_bre_decision as "string|icici_bre_decision|Bre Decision",
		icici_bank_application.icici_ckyc_approver_decision as "string|icici_ckyc_approver_decision|CKYC Approved Decision",
		icici_bank_application.icici_current_status as "string|icici_current_status|Current Status",
		icici_bank_application.icici_app_status as "string|icici_app_status|App Status",
		icici_bank_application.icici_idisb_dma as "string|icici_idisb_dma|IDISB DMA",
		icici_bank_application.icici_se_id as "string|icici_se_id|SE ID",
		icici_bank_application.icici_status as "string|icici_status|Status",
		icici_bank_application.icici_submission_status as "string|icici_submission_status|Submission Status",
		icici_bank_application.icici_current_city as "string|icici_current_city|Current City",
		icici_bank_application.icici_region as "string|icici_region|Region",
		CAST(icici_bank_application.icici_created_date as varchar) as "date|icici_created_date|Created Date",
		icici_bank_application.icici_location as "string|icici_location|Location",
		icici_bank_application.icici_rbm_name as "string|icici_rbm_name| RBM Name",
		icici_bank_application.icici_emp_name as "string|icici_emp_name|Emp Name",
		icici_bank_application.icici_delink_dat as "string|icici_delink_date|Delink Dat",
		icici_bank_application.icici_delinker as "string|icici_delinker|Delinker",
		icici_bank_application.icici_vkyc_opted_flag as "string|icici_vkyc_opted_flag|VKYC Opted Flag",
		icici_bank_application.icici_initiated_flag as "string|icici_initiated_flag|Initiated Flag",
		CAST(icici_bank_application.icici_created_at as varchar) as "date|icici_created_at|Created At",
		CAST(icici_bank_application.icici_updated_at as varchar) as "date|icici_updated_at|Updated At"
		FROM icici_bank_application limit 1`;
		let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
		let selectOptions = {
      icici_flow_type : await commonModel.getDistinctValuesCommon('icici_flow_type' , 'icici_bank_application'),
      icici_card_type :  await commonModel.getDistinctValuesCommon('icici_card_type' , 'icici_bank_application'),
      icici_current_status:  await commonModel.getDistinctValuesCommon('icici_current_status' , 'icici_bank_application'),
      icici_app_status :  await commonModel.getDistinctValuesCommon('icici_current_status' , 'icici_bank_application'),
      icici_status :  await commonModel.getDistinctValuesCommon('icici_status' , 'icici_bank_application'),
      icici_submission_status :  await commonModel.getDistinctValuesCommon('icici_submission_status' , 'icici_bank_application'),
      icici_vkyc_opted_flag :  await commonModel.getDistinctValuesCommon('icici_vkyc_opted_flag' , 'icici_bank_application'),
      icici_initiated_flag :  await commonModel.getDistinctValuesCommon('icici_initiated_flag' , 'icici_bank_application'),
		};
    returnData.allIssuers = allIssuers;
    returnData.allTr = allTr;
    returnData.selectOptions = selectOptions;
    return returnData;
		
}
modelObj.getIcicTeleColumns = async function(){
  let returnData = {
    allIssuers : [],
    allTr : [],
  };
 
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks WHERE is_apply_active = true ORDER BY id ASC `;
		let allIssuers = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		let queryForTr = `SELECT 
    CONCAT('edit-icici-application?id=',icici_bank_application.icici_id) as "Edit",
		'' as Telecallers,
		icici_bank_application.icici_id as "int|icici_id|Id" , 
		icici_bank_application.icici_application_number as "string|icici_application_number|Application Number",
		icici_bank_application.ca_main_table as "int|ca_main_table|Main Table",
		icici_bank_application.icici_applicant_name as "string|icici_applicant_name|Name",
		icici_bank_application.icici_flow_type as "multiple|icici_flow_type|Flow Type",
		icici_bank_application.icici_phone_number as "string|icici_phone_number|Phone Number",
		icici_bank_application.icici_card_type as "multiple|icici_card_type|Card Type",
		icici_bank_application.icici_pricing_code as "string|icici_pricing_code|Pricing Code",
		icici_bank_application.icici_is_card_applied as "string|icici_is_card_applied|Is Card Applied",
		icici_bank_application.icici_rejection_reason as "string|icici_rejection_reason|Rejection Reason",
		icici_bank_application.icici_approved_remarks as "string|icici_approved_remarks|Approved Remarks",
		icici_bank_application.icici_req_income_doc as "string|icici_req_income_doc|Req Income Doc",
		icici_bank_application.icici_current_address_pincode as "string|icici_current_address_pincode|Current Pincode",
		icici_bank_application.icici_permanent_address_pincode as "string|icici_permanent_address_pincode|Permanent Pincode",
		icici_bank_application.icici_gems_arn as "string|icici_gems_arn|Gems Arn",
		icici_bank_application.icici_bre_decision as "string|icici_bre_decision|Bre Decision",
		icici_bank_application.icici_ckyc_approver_decision as "string|icici_ckyc_approver_decision|CKYC Approved Decision",
		icici_bank_application.icici_current_status as "multiple|icici_current_status|Current Status",
		icici_bank_application.icici_app_status as "string|icici_app_status|App Status",
		icici_bank_application.icici_idisb_dma as "string|icici_idisb_dma|IDISB DMA",
		icici_bank_application.icici_se_id as "string|icici_se_id|SE ID",
		icici_bank_application.icici_status as "multiple|icici_status|Status",
		icici_bank_application.icici_submission_status as "multiple|icici_submission_status|Submission Status",
		icici_bank_application.icici_current_city as "string|icici_current_city|Current City",
		icici_bank_application.icici_region as "string|icici_region|Region",
		CAST(icici_bank_application.icici_created_date as varchar) as "date|icici_created_date|Created Date",
		icici_bank_application.icici_location as "string|icici_location|Location",
		icici_bank_application.icici_rbm_name as "string|icici_rbm_name| RBM Name",
		icici_bank_application.icici_emp_name as "string|icici_emp_name|Emp Name",
		icici_bank_application.icici_delink_dat as "string|icici_delink_date|Delink Dat",
		icici_bank_application.icici_delinker as "string|icici_delinker|Delinker",
		icici_bank_application.icici_vkyc_opted_flag as "multiple|icici_vkyc_opted_flag|VKYC Opted Flag",
		icici_bank_application.icici_initiated_flag as "multiple|icici_initiated_flag|Initiated Flag",
		CAST(icici_bank_application.icici_created_at as varchar) as "date|icici_created_at|Created At",
		CAST(icici_bank_application.icici_updated_at as varchar) as "date|icici_updated_at|Updated At"
		FROM icici_bank_application limit 1`;
		let allTr = await commonModel.getDataOrCount(queryForTr, [], 'D');
		let selectOptions = {
      icici_flow_type : await commonModel.getDistinctValuesCommon('icici_flow_type' , 'icici_bank_application'),
      icici_card_type :  await commonModel.getDistinctValuesCommon('icici_card_type' , 'icici_bank_application'),
      icici_current_status:  await commonModel.getDistinctValuesCommon('icici_current_status' , 'icici_bank_application'),
      icici_app_status :  await commonModel.getDistinctValuesCommon('icici_current_status' , 'icici_bank_application'),
      icici_status :  await commonModel.getDistinctValuesCommon('icici_status' , 'icici_bank_application'),
      icici_submission_status :  await commonModel.getDistinctValuesCommon('icici_submission_status' , 'icici_bank_application'),
      icici_vkyc_opted_flag :  await commonModel.getDistinctValuesCommon('icici_vkyc_opted_flag' , 'icici_bank_application'),
      icici_initiated_flag :  await commonModel.getDistinctValuesCommon('icici_initiated_flag' , 'icici_bank_application'),
		};
    returnData.allIssuers = allIssuers;
    returnData.allTr = allTr;
    returnData.selectOptions = selectOptions;
    return returnData;
		
}
module.exports = modelObj;
