const e = require("express");
let { pool } = require("../../utils/configs/database");
let commonModel = require("../commonModel");
///////////////////////////////////////
let modelObj = {};
modelObj.getAllApplicationsNew = async function (body) {
 console.log(body, "bodybodybodybodybodybody");
  let returnData = {
    applicationsData: [],
    count: 0,
    lastId: ""
  };

  let limit = ' limit 10';
  let whereCondition = '';
  let selectoptions = 'card_applications_main_table.* ';
  let offset = 0;
  let sortingBy = 'id';
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
        isNullCondition = isNullCondition + 'card_applications_main_table.' + body.null[l] + ` is null `;
        if (l != body.null.length - 1) {
          isNullCondition = isNullCondition + ` AND `;
        }
      }
    }
    if (body.notNull && body.notNull.length > 0) {
      for (let l = 0; l < body.notNull.length; l++) {
        isNotNullCondition = isNotNullCondition + 'card_applications_main_table.' + body.notNull[l] + ` is not null `;
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
          if (key == 'is_salaried' || key == 'low_cibil_score_bool') {
            otherFilter = otherFilter + ` ${key} = ${value} `;
          } else {
            let parseValue = parseInt(value);
            if (!parseValue || key == 'phone_number') {
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


  let newSelect = `, ci_internal_all_banks.bank_short_value , CAST(card_applications_main_table.created_at as varchar) , CAST(card_applications_main_table.updated_at as varchar) ,
  CAST(card_applications_main_table.date_of_birth as varchar) , manage_pincodes.mp_idfc_available,manage_pincodes.mp_axis_available,manage_pincodes.mp_au_available,manage_pincodes.mp_yes_available,manage_pincodes.mp_bob_available`;
  newSelect = newSelect + ` , (SELECT COUNT(*) FROM cold_calling where cc_main_table_id = card_applications_main_table.id) as cold_calling_count `;

  let leftJoin = ` 
  LEFT JOIN card_applications_main_table ON card_applications_main_table.id =  cold_calling.cc_main_table_id 
  LEFT JOIN user_admin ON user_admin.ua_id =  cold_calling.cc_assign_to 
  LEFT JOIN ci_internal_all_banks ON ci_internal_all_banks.id =  cold_calling.cc_issuer 
  LEFT JOIN manage_pincodes ON manage_pincodes.mp_pincode = CAST(pin_code as varchar)
  `;

  let getIssuersQuery = `SELECT * FROM public.ci_internal_all_banks ORDER BY id ASC `;
  let getAllIssuers = await commonModel.getDataOrCount(getIssuersQuery, [], 'D');
  //   if (getAllIssuers && getAllIssuers.length > 0){
  //    // console.log(getAllIssuers , "getAllIssuersgetAllIssuers");
  //     for(let y= 0; y < getAllIssuers.length; y++ ){
  //       getAllIssuers[y].bank_short_value = getAllIssuers[y].bank_short_value.trim();
  //       newSelect = newSelect + ` , ${getAllIssuers[y].bank_short_value}.cc_id as ${getAllIssuers[y].bank_short_value}_cc_id  , ${getAllIssuers[y].bank_short_value}.cc_issuer as ${getAllIssuers[y].bank_short_value}_cc_issuer , ${getAllIssuers[y].bank_short_value}.cc_assign_to as ${getAllIssuers[y].bank_short_value}_cc_assign_to , ${getAllIssuers[y].bank_short_value}_assign_user.ua_name as ${getAllIssuers[y].bank_short_value}_assign_user_name`;
  //       leftJoin = leftJoin + ` LEFT JOIN cold_calling as ${getAllIssuers[y].bank_short_value} ON  ${getAllIssuers[y].bank_short_value}.cc_main_table_id = card_applications_main_table.id AND ${getAllIssuers[y].bank_short_value}.cc_issuer = ${getAllIssuers[y].id} 

  //       LEFT JOIN user_admin as ${getAllIssuers[y].bank_short_value}_assign_user ON  ${getAllIssuers[y].bank_short_value}.cc_assign_to  = ${getAllIssuers[y].bank_short_value}_assign_user.ua_id 

  //       `;
  //     }
  //   }

  if (body.issuerName) {
    if (body.issuerName == 'axis') {
      if (whereCondition != '') {
        whereCondition = whereCondition + ` AND cc_issuer = 1`;
      } else {
        whereCondition = `where  cc_issuer = 1`;
      }

    }
    if (body.issuerName == 'bob') {
      if (whereCondition != '') {
        whereCondition = whereCondition + ` AND cc_issuer = 2`;
      } else {
        whereCondition = `where  cc_issuer = 2`;
      }

    }
    if (body.issuerName == 'au') {
      if (whereCondition != '') {
        whereCondition = whereCondition + ` AND cc_issuer = 7`;
      } else {
        whereCondition = `where  cc_issuer = 7`;
      }

    }
    if (body.issuerName == 'idfc') {
      if (whereCondition != '') {
        whereCondition = whereCondition + ` AND cc_issuer = 4`;
      } else {
        whereCondition = `where  cc_issuer = 4`;
      }

    }
  }

  if (body.userRole != '1') {
    if (whereCondition != '') {
      whereCondition = whereCondition + ` AND cc_assign_to = ${body.userId}`;
    } else {
      whereCondition = `where   AND cc_assign_to = ${body.userId}`;
    }

  }

  let getAllApplicationsSql = `SELECT ${selectoptions} ${newSelect} , cold_calling.* , user_admin.ua_name FROM public.cold_calling ${leftJoin}   ${whereCondition}
  ORDER BY ${sortingBy} ${sortOrder} ${limit} offset ${offset}`;
  // console.log(getAllApplicationsSql, "getAllApplicationsSqlgetAllApplicationsSql")
  let result = await commonModel.getDataOrCount(getAllApplicationsSql, [], 'D');


  let queryForCount = `SELECT Count(*) FROM public.cold_calling ${leftJoin} ${whereCondition}`;
  let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');

  if (totalCount && totalCount.length > 0) {
    returnData.count = totalCount[0].count;
  }
  returnData.applicationsData = result;
  returnData.getAllIssuers = [];
  return returnData;
}
modelObj.getAllApplications = async function (body) {
  //FILTER NOT APPLIED ON DATE OF BIRTH AND SALARY FIELD SINCE IT HAS NO VALUES
  let returnData = {
    applicationsData: [],
    count: "",
  };
  let intCheck = [
    "id",
    "pin_code",
    "mp_idfc_available",
    "mp_axis_available",
    "mp_au_available",
    "mp_yes_available",
    "mp_bob_available",
  ];
  let { filterObject, pageNo, sort } = body;
  let {
    entriesPerPage,
    id,
    name,
    email,
    phone_number,
    city,
    state,
    from_salary,
    to_salary,
    from_date_of_birth,
    to_date_of_birth,
    is_salaried,
    pin_code,
    sms_status,
    form_filled,
    tracking_id,
    ipa_status,
    from_created_at,
    low_cibil_score_bool,
    to_created_at,
    from_updated_at,
    to_updated_at,
    form_filled_array,
    banks_applied_array,
    banks_approved_array,
    low_cibil_score,
    device_type,
    notNull,
  } = filterObject;
  const likeFields = {
    name,
    email,
    city,
    state,
    pin_code,
    form_filled,
    tracking_id,
  };
  const equalFields = { id, phone_number, is_salaried, low_cibil_score_bool };
  const selectFields = {
    sms_status,
    ipa_status,
    device_type,
  };
  const arrayFields = {
    form_filled_array,
    banks_applied_array,
    banks_approved_array,
    low_cibil_score,
  };
  const fromDatefields = {
    /* from_date_of_birth, */ from_created_at,
    from_updated_at,
  };
  const toDatefields = { /* to_date_of_birth, */ to_created_at, to_updated_at };

  Object.keys(fromDatefields).map((field) => {
    let field_date = new Date(fromDatefields[field]);
    fromDatefields[field] = fromDatefields[field]
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 00:00:01.001`
      : ``;
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``;
    toDatefields[field] = field_date
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 23:59:59.999`
      : ``;
  });
  Object.keys(equalFields).map((field) => {
    if (
      field !== "low_cibil_score_bool" &&
      field !== "is_salaried" &&
      field !== "ipa_status"
    )
      equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });
  Object.keys(arrayFields).map((field) => {
    arrayFields[field] = arrayFields[field] || "";
  });
  const isFalseField = (field) => !field;

  // //console.log({
  // 	likeFields,
  // 	equalFields,
  // 	arrayFields,
  // 	fromDatefields,
  // 	toDatefields,
  // 	from_salary,
  // 	to_salary,
  // })

  entriesPerPage = entriesPerPage || 50;
  sort = sort || "id";
  let offset = (pageNo - 1) * entriesPerPage;
  let ascDesc = "asc NULLS FIRST";
  if (sort.startsWith("-")) {
    sort = sort.substring(1);
    ascDesc = "desc NULLS LAST";
  }
  // //console.log({ pageNo, sort, entriesPerPage, ascDesc, filterObject, offset })

  // let query = await pool.query(`SELECT * FROM card_applications_main_table  ORDER By card_applications_main_table."${sort}" ${ascDesc}
  // limit ${entriesPerPage} offset ${offset};`)
  // let countData = await pool.query(`SELECT count(*) FROM card_applications_main_table`)

  let query = `
	    SELECT camt.*,manage_pincodes.mp_idfc_available,manage_pincodes.mp_axis_available,manage_pincodes.mp_au_available,manage_pincodes.mp_yes_available,manage_pincodes.mp_bob_available FROM card_applications_main_table camt
      LEFT JOIN manage_pincodes ON manage_pincodes.mp_pincode = CAST(camt.pin_code as varchar) where
	`;
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `camt."${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `camt."${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });
  Object.keys(arrayFields).map((field) => {
    query =
      query +
      (isFalseField(arrayFields[field])
        ? ``
        : `'${arrayFields[field]}' = any(${field}) AND `);
  });

  Object.keys(equalFields).map((field) => {
    if (field === "low_cibil_score_bool" || field === "is_salaried") {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ""
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `);
    } else if (field === "ipa_status") {
      query =
        query +
        (equalFields[field]
          ? equalFields[field] == "true"
            ? `camt."${field}"::Text = 'true' AND `
            : `(camt."ipa_status"::Text is null or camt."ipa_status"::TEXT = 'false') AND `
          : ``);
    } else
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `);
  });

  Object.keys(likeFields).map((field, index) => {
    if (field === "pin_code") {
      query =
        query +
        (likeFields[field] === undefined || likeFields[field] === ""
          ? ``
          : `(camt."${field}"::Text Like '%${likeFields[field]}%' AND `);
    } else
      query =
        query +
        (likeFields[field]
          ? `(Lower(camt."${field}")::Text Like '%${likeFields[
            field
          ].toLowerCase()}%' ) AND `
          : ``);
  });
  Object.keys(selectFields).map((field) => {
    let string = "";

    for (
      let i = 0;
      i < (selectFields[field] ? selectFields[field].length : 0);
      i++
    ) {
      string += `'${selectFields[field][i]}',`;
    }
    string = string.slice(0, -1);
    console.log({ string });
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``);
  });
  let stringFields = [
    "tracking_id",
    "name",
    "email",
    "city",
    "state",
    "salary",
    "sms_status",
    "form_filled",
    "ipa_status",
    "device_type",
  ];

  notNull.forEach((elem) => {
    if (elem) {
      if (elem === "telecallers") {
        query += `0 != ANY(telecallers)`;
      } else if (elem === "-telecallers") {
        query += `0 = ANY(telecallers)`;
      }
      if (
        elem.includes("-") &&
        elem != "telecallers" &&
        elem != "-telecallers"
      ) {
        let NULL = elem.slice(1);
        if (intCheck.includes(NULL)) {
          query = query + `${NULL} IS NULL AND `;
        } else {
          query = query + `(${NULL} IS NULL OR ${NULL}= '') AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query + `(${elem} IS NOT NULL AND ${elem}!= '') AND `;
        }
      }
    }
  });

  let countQuery = query.replace("SELECT camt.*,manage_pincodes.mp_idfc_available,manage_pincodes.mp_axis_available,manage_pincodes.mp_au_available,manage_pincodes.mp_yes_available,manage_pincodes.mp_bob_available", "SELECT count(*)");
  query =
    query +
    ` ORDER By camt."${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  query = query.replace(/AND\s+ORDER/, `ORDER`);
  query = query.replace(/where\s+ORDER/, "ORDER");
  // console.log(countQuery)
  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;

  try {
    console.log(query, "queryquery");
    let appData = await pool.query(query);
    let current_time = Date.now();
    let countData = await pool.query(countQuery);
    console.log(appData.rows, "appData.rows,appData.rows,");
    returnData = {
      count: countData.rows[0].count,
      applicationsData: appData.rows,
    };

    // console.log({ returnData })
  } catch (err) {
    console.error(err);
    returnData = { count: 0, applicationsData: [] };
  }
  return returnData;
};

modelObj.getFilteredApplications = async function (body, requestFor) {
  console.log(body, "bodybody");
  let needToAttachQuery = false;
  let attachedQuery = "";
  let leftJoinSql = "";
  let extraSelectOption = "";
  let someDataByBankName = {
    axis: {
      leftJoin: ` LEFT JOIN axis_bank_applications_table ON card_applications_main_table.id = axis_bank_applications_table.ca_main_table `,
      selectPer: ` , axis_final_status , axis_ipa_status_bool`,
      addWhear: " axis_final_status ",
      ipaFilde: " axis_ipa_status_bool = true ",
      pincodeField: " mp_axis_available ",
    },
    bob: {
      leftJoin: ` LEFT JOIN bob_applications_table ON card_applications_main_table.id = bob_applications_table.ca_main_table `,
      selectPer: ` , bob_application_status , bob_ipa_status_bool`,
      addWhear: " bob_application_status ",
      ipaFilde: " bob_ipa_status_bool = true ",
      pincodeField: " mp_bob_available ",
    },
    idfc: {
      leftJoin: ` LEFT JOIN idfc_bank_applications_table ON card_applications_main_table.id = idfc_bank_applications_table.ca_main_table `,
      selectPer: ` , idfc_status , idfc_date_ipa_status`,
      addWhear: " idfc_status ",
      ipaFilde: " idfc_date_ipa_status = true ",
      pincodeField: " mp_idfc_available ",
    },
    aubank: {
      leftJoin: ` LEFT JOIN au_bank_applications_table ON card_applications_main_table.id = au_bank_applications_table.ca_main_table `,
      selectPer: ` , au_final_status , au_ipa_status`,
      addWhear: " au_final_status ",
      ipaFilde: " au_ipa_status = true ",
      pincodeField: " mp_au_available ",
    },
    yesBank: {
      leftJoin: ` LEFT JOIN yes_bank_applications_table ON card_applications_main_table.id = yes_bank_applications_table.ca_main_table `,
      selectPer: ` , ya_final_status , ya_ipa_status`,
      addWhear: " ya_final_status ",
      ipaFilde: " ya_ipa_status = true ",
      pincodeField: " mp_yes_available ",
    },
  };
  if (
    body.isAllSelectedBank ||
    body.allSelectedBanksArray.length > 0 ||
    body.allNumberFieldsSelected ||
    body.allNumberFieldsArray.length > 0 ||
    body.formAppliedFilterAll ||
    body.formAppliedFilterArray.length > 0
  ) {
    //if (body.isAllSelectedBank && body.allNumberFieldsSelected && body.notAppliedStatus && body.appliedStatus && body.formAppliedFilterAll) {
    //needToAttachQuery = false;
    //} else {
    // //console.log('I AM IN else 222', typeof (body.isAllSelectedBank))
    if (!body.isAllSelectedBank && body.allSelectedBanksArray.length > 0) {
      attachedQuery = ` where (`;
      for (let i = 0; i < body.allSelectedBanksArray.length; i++) {
        if (someDataByBankName[body.allSelectedBanksArray[i]]) {
          leftJoinSql =
            leftJoinSql +
            someDataByBankName[body.allSelectedBanksArray[i]].leftJoin;
          extraSelectOption =
            extraSelectOption +
            someDataByBankName[body.allSelectedBanksArray[i]].selectPer;
        }
        // if (body.allSelectedBanksArray[i] == 'bob'){
        // 	leftJoinSql = leftJoinSql+ ` LEFT JOIN bob_applications_table ON card_applications_main_table.id = bob_applications_table.ca_main_table `;
        // 	extraSelectOption = extraSelectOption+` , bob_application_status `;
        // }
        // //console.log(i, body.allSelectedBanksArray.length - 1)
        if (i == body.allSelectedBanksArray.length - 1) {
          attachedQuery =
            attachedQuery +
            ` '` +
            body.allSelectedBanksArray[i] +
            `' = any("form_filled_array") )`;
        } else {
          attachedQuery =
            attachedQuery +
            ` '` +
            body.allSelectedBanksArray[i] +
            `' = any("form_filled_array") OR `;
        }
      }
    } else {
      if (body.allSelectedBanksArray.length > 0) {
        for (let i = 0; i < body.allSelectedBanksArray.length; i++) {
          if (someDataByBankName[body.allSelectedBanksArray[i]]) {
            leftJoinSql =
              leftJoinSql +
              someDataByBankName[body.allSelectedBanksArray[i]].leftJoin;
            extraSelectOption =
              extraSelectOption +
              someDataByBankName[body.allSelectedBanksArray[i]].selectPer;
          }
        }
      }
    }
    if (!body.allNumberFieldsSelected && body.allNumberFieldsArray.length > 0) {
      if (attachedQuery == "") {
        attachedQuery = ` where `;
      } else {
        attachedQuery = attachedQuery + ` AND `;
      }
      let emptyValueAlsoNeeded = false;
      let queryDataOfSmsFilter = "";
      for (let j = 0; j < body.allNumberFieldsArray.length; j++) {
        if (body.allNumberFieldsArray[j] == "empty") {
          emptyValueAlsoNeeded = true;
        }
        if (j == body.allNumberFieldsArray.length - 1) {
          queryDataOfSmsFilter =
            queryDataOfSmsFilter + ` '` + body.allNumberFieldsArray[j] + `'`;
        } else {
          queryDataOfSmsFilter =
            queryDataOfSmsFilter + ` '` + body.allNumberFieldsArray[j] + `' , `;
        }
      }
      if (emptyValueAlsoNeeded) {
        attachedQuery =
          attachedQuery +
          ` ("sms_status" IN (` +
          queryDataOfSmsFilter +
          `) OR "sms_status" is null )`;
      } else {
        attachedQuery =
          attachedQuery + ` "sms_status" IN (` + queryDataOfSmsFilter + `) `;
      }
    }
    //console.log(Object.keys(body.formAppliedFilterArray).length, "Object.keys(body.formAppliedFilterArray).length")
    if (Object.keys(body.formAppliedFilterArray).length > 0) {
      let whereAttachQuery = "";
      let ipaQueryWhere = "";
      let countOfFilteredObj = 0;
      let entryNumber = 0;
      for (var item in body.formAppliedFilterArray) {
        if (someDataByBankName[item] && !body.formAppliedFilterAll[item]) {
          //console.log(someDataByBankName[item], "someDataByBankName[item]")
          for (let i = 0; i < body.formAppliedFilterArray[item].length; i++) {
            if (body.formAppliedFilterArray[item][i] == "IPA Approved") {
              if (ipaQueryWhere != "") {
                ipaQueryWhere = ipaQueryWhere + ` OR `;
              }
              ipaQueryWhere = ipaQueryWhere + someDataByBankName[item].ipaFilde;
            } else {
              if (entryNumber == 0) {
                if (whereAttachQuery == "") {
                  if (attachedQuery == "") {
                    whereAttachQuery = ` where `;
                  } else {
                    whereAttachQuery = whereAttachQuery + ` AND (`;
                  }
                  whereAttachQuery =
                    whereAttachQuery +
                    someDataByBankName[item].addWhear +
                    ` IN (`;
                } else {
                  whereAttachQuery =
                    whereAttachQuery +
                    ` OR ` +
                    someDataByBankName[item].addWhear +
                    ` IN (`;
                }
              }

              if (i == body.formAppliedFilterArray[item].length - 1) {
                whereAttachQuery =
                  whereAttachQuery +
                  `'` +
                  body.formAppliedFilterArray[item][i] +
                  `' ) `;
              } else {
                whereAttachQuery =
                  whereAttachQuery +
                  `'` +
                  body.formAppliedFilterArray[item][i] +
                  `' , `;
              }
              entryNumber++;
            }
          }
          entryNumber = 0;
          //console.log(whereAttachQuery, "whereAttachQuerywhereAttachQuery")
        }
        countOfFilteredObj++;
        //console.log(countOfFilteredObj, Object.keys(body.formAppliedFilterArray).length)
        if (
          countOfFilteredObj == Object.keys(body.formAppliedFilterArray).length
        ) {
          if (attachedQuery != "") {
            if (whereAttachQuery != "") {
              whereAttachQuery = whereAttachQuery + ` )`;
            }
            if (ipaQueryWhere != "") {
              if (whereAttachQuery != "") {
                whereAttachQuery =
                  whereAttachQuery + " AND (" + ipaQueryWhere + `)`;
              } else {
                whereAttachQuery = " AND (" + ipaQueryWhere + ")";
              }
            }
          }
        }
      }
      if (whereAttachQuery != "") {
        attachedQuery = attachedQuery + ` ` + whereAttachQuery;
      }
      // if(){

      // }

      // if (whereAttachQuery == '') {
      // 	if (attachedQuery == '') {
      // 		whereAttachQuery = ` where `
      // 	} else {
      // 		whereAttachQuery = whereAttachQuery + ` AND (`
      // 	}
      // 	whereAttachQuery = whereAttachQuery + someDataByBankName[item].addWhear + ` IN (`
      // } else {
      // 	whereAttachQuery = whereAttachQuery + ` OR ` + someDataByBankName[item].addWhear + ` IN (`
      // }

      ////console.log(whereAttachQuery, "whereAttachQuery");
    }

    //}
  } else {
    // //console.log('I AM IN ELSE')
  }
  if (body.allSelectedBanksArrayEx.length > 0) {
    console.log("I AM IN ELSE in");
    if (attachedQuery != "") {
      attachedQuery = attachedQuery + ` AND `;
    } else {
      attachedQuery = attachedQuery + ` where `;
    }
    for (let p = 0; p < body.allSelectedBanksArrayEx.length; p++) {
      //if (attachedQuery != '') {
      //attachedQuery = attachedQuery + ` AND `
      if (p == body.allSelectedBanksArrayEx.length - 1) {
        // attachedQuery = attachedQuery + ` '`+body.allSelectedBanksArrayEx[p]+`' != any("form_filled_array")`;
        attachedQuery =
          attachedQuery +
          ` NOT ('` +
          body.allSelectedBanksArrayEx[p] +
          `' = ANY (banks_applied_array))`;
      } else {
        // attachedQuery = attachedQuery + ` '`+body.allSelectedBanksArrayEx[p]+`' != any("form_filled_array") AND`
        attachedQuery =
          attachedQuery +
          ` NOT ('` +
          body.allSelectedBanksArrayEx[p] +
          `' = ANY (banks_applied_array)) AND `;
      }

      //}
    }
  }
  console.log(attachedQuery, "attachedQuery");

  // if (body && (body.for || body.status)){
  // 	attachedQuery = ` where `;
  // }
  // if (attachedQuery && body.for){
  // 	attachedQuery = attachedQuery + ` '`+ body.for+`' = any("form_filled_array")`;
  // }
  // // if (attachedQuery && body.status){
  // // 	attachedQuery = attachedQuery + ` "sms_status" = '`+ body.status+`'`;
  // // }
  let returnData = [];
  if (body.fromDate && body.toDate) {
    if (attachedQuery != "") {
      attachedQuery =
        attachedQuery +
        ` AND (card_applications_main_table.created_at  between '` +
        body.fromDate +
        `' AND '` +
        body.toDate +
        `') `;
    } else {
      attachedQuery =
        ` where  (card_applications_main_table.created_at  between '` +
        body.fromDate +
        `' AND '` +
        body.toDate +
        `') `;
    }
  }
  let addNewLeftForPinCode = `   left join  manage_pincodes on manage_pincodes.mp_pincode =  CAST(pin_code AS varchar) `;
  let selectedPinCodeColumn = " ";
  leftJoinSql = leftJoinSql + addNewLeftForPinCode;
  if (body.bankForpinCodeOption != "") {
    if (someDataByBankName[body.bankForpinCodeOption]) {
      let matchedData = someDataByBankName[body.bankForpinCodeOption];
      selectedPinCodeColumn = " , " + matchedData.pincodeField;
      if (
        body.pinCodeStatus &&
        body.pinCodeStatus.length > 0 &&
        body.pinCodeStatus.length != 3
      ) {
        let pinCodeWhereCondition = ``;
        for (let p = 0; p < body.pinCodeStatus.length; p++) {
          if (p == 0) {
            pinCodeWhereCondition = pinCodeWhereCondition + ` ( `;
          } else {
            pinCodeWhereCondition = pinCodeWhereCondition + ` or `;
          }
          if (body.pinCodeStatus[p] == "null") {
            pinCodeWhereCondition =
              pinCodeWhereCondition + ` ${matchedData.pincodeField} is null `;
          } else {
            pinCodeWhereCondition =
              pinCodeWhereCondition +
              `  ${matchedData.pincodeField} = ${body.pinCodeStatus[p]} `;
          }
          if (p == body.pinCodeStatus.length - 1) {
            pinCodeWhereCondition = pinCodeWhereCondition + ` ) `;
          }
        }
        if (attachedQuery != "") {
          attachedQuery = attachedQuery + ` AND  ${pinCodeWhereCondition} `;
        } else {
          attachedQuery = attachedQuery + ` where  ${pinCodeWhereCondition} `;
        }
      }
    }
  }

  let finalSql =
    `SELECT DISTINCT  phone_number ,  sms_status , ipa_status , replace(array_to_string(form_filled_array  , ',' , ' ') , ',' , ' ') as form_filled_array , card_applications_main_table.created_at  AT TIME ZONE 'ASIA/Kolkata' , pin_code ` +
    extraSelectOption +
    ` ${selectedPinCodeColumn} FROM card_applications_main_table ` +
    leftJoinSql +
    ` ` +
    attachedQuery;
  if (requestFor == "ph") {
    finalSql =
      `SELECT DISTINCT   CONCAT ('91', phone_number ) as phone FROM card_applications_main_table ` +
      leftJoinSql +
      ` ` +
      attachedQuery;
  } else if (requestFor == "phFb") {
    finalSql =
      `SELECT DISTINCT   CONCAT ('+91', phone_number ) as phone , email  FROM card_applications_main_table ` +
      leftJoinSql +
      ` ` +
      attachedQuery;
  }
  console.log(finalSql, "finalSqlfinalSql");
  let query = await pool.query(finalSql);
  returnData = query.rows;
  return returnData;
};

modelObj.getAllApplicationsForOthers = async function (bodyData) {
  // //console.log(bodyData, "bodyData")
  let queryToDb = `SELECT * FROM card_applications_main_table`;
  let mainData = [];
  try {
    let dataQuery = await pool.query(queryToDb);
    mainData = dataQuery.rows;
  } catch (error) {
    //console.log(error)
  }
  return mainData;
};

modelObj.getSmSActiveBanks = async function (bodyData) {
  //console.log(bodyData, "bodyData")
  let queryToDb = `SELECT * FROM public.ci_internal_all_banks where is_sms_active = true`;
  let mainData = [];
  try {
    let dataQuery = await pool.query(queryToDb);
    mainData = dataQuery.rows;
  } catch (error) {
    //console.log(error)
  }
  return mainData;
};

modelObj.uploadSMSDate = async function (
  bodyData,
  provider,
  allApplicationsByPhoneNumber
) {
  console.log(bodyData, "bodyData");
  let returnData = false;
  let updateSql = "";
  for (let i = 0; i < bodyData.length; i++) {
    //if (allApplicationsByPhoneNumber[bodyData[i].TelNum]) {
    //let matchedData = allApplicationsByPhoneNumber[bodyData[i].TelNum];
    let phoneNumber = bodyData[i].telNum;

    if (phoneNumber) {
      let accuratePH = phoneNumber.trim().slice(2);
      // phoneNumber = phoneNumber.slice(2);
      updateSql =
        updateSql +
        ` UPDATE card_applications_main_table SET  "sms_status" = '` +
        bodyData[i].status +
        `'  WHERE "phone_number" = '` +
        accuratePH +
        `' ; `;
    }

    ////console.log(allApplicationsByPhoneNumber[bodyData[i].TelNum]);
    //}
  }
  // console.log('IN UPDATE out ', updateSql);
  try {
    let query;
    if (updateSql != "") {
      // console.log('IN UPDATE', updateSql)
      query = await pool.query(updateSql, []);
      // //console.log('IN UPDATE query')
    }
    returnData = true;
  } catch (error) {
    // console.error(error);
    returnData = false;
  }
  return returnData;
};

//---------------------------------------- Upload vfirst sms status here ... --------------------------------------------------------------///

modelObj.uploadvFistSMSDate = async function (
  bodyData,
  provider,
  allApplicationsByPhoneNumber
) {
  console.log(bodyData[3], "bodyData");
  let returnData = false;
  let updateSql = "";
  let count = 0;

  for (let i = 0; i < bodyData.length; i++) {
    let phone_number = bodyData[i]["Recipient"];
    if (phone_number) {
      phone_number = phone_number.replace(/['"]+/g, "");
    }
    //console.log(phone_number, "phone_number");
    //console.log(typeof(phone_number), "phone_number type");

    if (allApplicationsByPhoneNumber[phone_number]) {
      let matchedData = allApplicationsByPhoneNumber[phone_number];
      let updateApplyStatus = "";
      if (bodyData[i]["Status Description"] == `"NDNC FAILURE"`) {
        //count = count + 1;
        updateApplyStatus = "NDNC Number";
      }

      if (bodyData[i]["Status Description"] == `"Delivered"`) {
        count = count + 1;
        updateApplyStatus = "Delivered";
      }
      if (bodyData[i]["Status Description"] == `"Network Error"`) {
        count = count + 1;
        updateApplyStatus = "Pending";
      }
      if (
        bodyData[i]["Status Description"] == `"Absent Subscriber"` ||
        bodyData[i]["Status Description"] == `"General Consent error"`
      ) {
        count = count + 1;
        updateApplyStatus = "Failed";
      }

      updateSql =
        updateSql +
        ` UPDATE card_applications_main_table SET  "sms_status" = '` +
        updateApplyStatus +
        `'  WHERE "id" = ` +
        matchedData.id +
        `; `;
      //console.log(matchedData, "matchedData");
    }
  }
  console.log(count, "count");
  //console.log(allApplicationsByPhoneNumber, "allApplicationsByPhoneNumber[phone_number]");
  try {
    let query;
    if (updateSql != "") {
      console.log("IN UPDATE", updateSql);
      query = await pool.query(updateSql, []);
      //console.log('IN UPDATE query')
    }
    returnData = true;
  } catch (error) {
    // console.error(error);
    returnData = false;
  }
  return returnData;
};

// {
//     TelNum: '916207439079',
//     Status: 'Delivered',
//     DeliveryTime: '2022-06-23 11:04:01',
//     SenderID: 'crdins',
//     '': ''
//   },
modelObj.exportCsv = async function ({ allFieldsArray, filterObject }) {
  let returnData = {
    applicationsData: [],
  };
  let intCheck = [
    "id",
    "pin_code",
    "mp_idfc_available",
    "mp_axis_available",
    "mp_au_available",
    "mp_yes_available",
    "mp_bob_available",
  ];
  let {
    id,
    name,
    email,
    phone_number,
    city,
    state,
    from_salary,
    to_salary,
    from_date_of_birth,
    to_date_of_birth,
    is_salaried,
    pin_code,
    sms_status,
    form_filled,
    tracking_id,
    ipa_status,
    from_created_at,
    low_cibil_score_bool,
    to_created_at,
    from_updated_at,
    to_updated_at,
    form_filled_array,
    banks_applied_array,
    banks_approved_array,
    low_cibil_score,
    device_type,
    notNull,
  } = filterObject;
  const likeFields = {
    name,
    email,
    city,
    state,
    pin_code,
    form_filled,
    tracking_id,
  };
  const arrayFields = {
    form_filled_array,
    banks_applied_array,
    banks_approved_array,
    low_cibil_score,
  };
  const fromDatefields = {
    /* from_date_of_birth, */ from_created_at,
    from_updated_at,
  };
  const toDatefields = { /* to_date_of_birth, */ to_created_at, to_updated_at };
  const equalFields = { id, phone_number, is_salaried, low_cibil_score_bool };
  const selectFields = {
    sms_status,
    ipa_status,
    device_type,
  };
  Object.keys(fromDatefields).map((field) => {
    let field_date = new Date(fromDatefields[field]);
    fromDatefields[field] = fromDatefields[field]
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 00:00:01.001`
      : ``;
  });
  Object.keys(toDatefields).map((field) => {
    let field_date = toDatefields[field] ? new Date(toDatefields[field]) : ``;
    toDatefields[field] = field_date
      ? `${field_date.getFullYear()}-${(field_date.getMonth() + 1)
        .toString()
        .padStart(2, 0)}-${field_date
          .getDate()
          .toString()
          .padStart(2, 0)} 23:59:59.999`
      : ``;
  });
  Object.keys(equalFields).map((field) => {
    if (field !== "low_cibil_score_bool" && field !== "is_salaried")
      equalFields[field] = equalFields[field] || "";
  });
  Object.keys(likeFields).map((field) => {
    likeFields[field] = likeFields[field] || "";
  });
  Object.keys(arrayFields).map((field) => {
    arrayFields[field] = arrayFields[field] || "";
  });
  const isFalseField = (field) => !field;

  let columnString = ``;
  allFieldsArray.map((field) => {
    let pincodeFields = [
      "mp_idfc_available",
      "mp_axis_available",
      "mp_au_available",
      "mp_yes_available",
      "mp_bob_available",
    ];

    if (pincodeFields.includes(field.column_name)) {
      columnString += `${field.column_name},`;
    } else {
      columnString += `camt.${field.column_name},`;
    }
  });
  columnString = columnString.slice(0, -1);
  let query = `
	SELECT ${columnString} FROM card_applications_main_table camt 
  LEFT JOIN manage_pincodes ON manage_pincodes.mp_pincode = CAST(camt.pin_code as varchar)
  where
	`;
  Object.keys(fromDatefields).map((fromField) => {
    const field = fromField.replace("from_", "");
    query =
      query +
      (fromDatefields[fromField]
        ? `camt."${field}" >= '${fromDatefields[fromField]}' AND `
        : ``);
  });
  Object.keys(toDatefields).map((toField) => {
    const field = toField.replace("to_", "");
    query =
      query +
      (toDatefields[toField]
        ? `camt."${field}" <= '${toDatefields[toField]}' AND `
        : ``);
  });

  Object.keys(equalFields).map((field) => {
    if (field === "low_cibil_score_bool" || field === "is_salaried") {
      query =
        query +
        (equalFields[field] === undefined || equalFields[field] === ""
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `);
    } else if (field === "ipa_status") {
      query =
        query +
        (equalFields[field]
          ? equalFields[field] == "true"
            ? `camt."${field}"::Text = 'true' AND `
            : `(camt."ipa_status"::Text is null or camt."ipa_status"::TEXT = 'false') AND `
          : ``);
    } else
      query =
        query +
        (isFalseField(equalFields[field])
          ? ``
          : `camt."${field}"::Text = '${equalFields[field]}' AND `);
  });

  Object.keys(likeFields).map((field, index) => {
    if (field === "pin_code") {
      query =
        query +
        `(camt."${field}"::Text Like '%${likeFields[field]}%' OR camt."${field}" IS NULL ) AND `;
    } else
      query =
        query +
        (likeFields[field]
          ? `(Lower(camt."${field}")::Text Like '%${likeFields[
            field
          ].toLowerCase()}%' ) AND `
          : ``);
  });
  Object.keys(selectFields).map((field) => {
    let string = "";

    for (
      let i = 0;
      i < (selectFields[field] ? selectFields[field].length : 0);
      i++
    ) {
      string += `'${selectFields[field][i]}',`;
    }
    string = string.slice(0, -1);
    console.log({ string });
    query =
      query +
      (selectFields[field] && selectFields[field].length > 0
        ? `"${field}"::Text=ANY(ARRAY[${string}]) AND `
        : ``);
  });
  let stringFields = [
    "tracking_id",
    "name",
    "email",
    "city",
    "state",
    "salary",
    "sms_status",
    "form_filled",
    "ipa_status",
    "device_type",
  ];
  notNull.forEach((elem) => {
    if (elem) {
      if (elem === "telecallers") {
        query += `0 != ANY(telecallers)`;
      } else if (elem === "-telecallers") {
        query += `0 = ANY(telecallers)`;
      }
      if (
        elem.includes("-") &&
        elem != "telecallers" &&
        elem != "-telecallers"
      ) {
        let NULL = elem.slice(1);
        if (intCheck.includes(NULL)) {
          query = query + `${NULL} IS NULL AND `;
        } else {
          query = query + `(${NULL} IS NULL OR ${NULL}= '') AND `;
        }
      } else if (elem != "telecallers" && elem != "-telecallers") {
        if (intCheck.includes(elem)) {
          query = query + `${elem} IS NOT NULL AND `;
        } else {
          query = query + `(${elem} IS NOT NULL AND ${elem}!= '') AND `;
        }
      }
    }
  });
  query = query.trimEnd().endsWith("where")
    ? query.replace("where", "")
    : query;
  query = query + ";";
  query = query.replace(/AND\s+\;/, `;`);
  console.log(query);
  try {
    let appData = await pool.query(query);
    returnData = { applicationsData: appData.rows };
  } catch (err) {
    console.log(err);
    returnData = { applicationsData: [] };
  }
  return returnData;
};

modelObj.getApplicationDataById = async function (id) {
  let query = `SELECT * FROM card_applications_main_table where id=${id}`;
  let returnData = {};
  try {
    let qReturn = await pool.query(query);
    returnData = qReturn.rows[0];
  } catch (err) {
    returnData = {};
  }
  return returnData;
};

/* The above code is inserting data into the database. */
modelObj.insertColdCallingData = async function ({ insertData }) {
  console.log(insertData, "---------- insert data");
  /* Declaring a variable called returnData and assigning it the value of false. */
  let returnData = false;
  /* The above code is a query to the database. */
  let queryToDb = `INSERT INTO cold_calling(cc_issuer, cc_assign_to, cc_main_table_id, cc_call_status, 
    cc_call_declined_counter, cc_call_scheduled, cc_note, cc_sms_counter) 
    values($1, $2, $3, $4, $5, $6, $7, $8)`;
  try {
    let queryForCount = `SELECT * FROM public.cold_calling where cc_main_table_id = ${insertData.mainId} AND cc_issuer = ${insertData.cardIssuer} `;
    let totalCount = await commonModel.getDataOrCount(queryForCount, [], 'D');
    if (totalCount && totalCount.length > 0) {
      returnData = true;
    } else {
      let dataFromDb = await pool.query(queryToDb, [insertData.cardIssuer, insertData.assignTo, insertData.mainId, insertData.callStatus, insertData.declineCounter, insertData.callSchedule, insertData.note, insertData.smsCounter]);
      console.log(dataFromDb.rows);
      /* Returning true. */
      returnData = true;
    }
    /* The above code is a query to the database. */

    return returnData;

  } catch (err) {
    console.log(err);
    returnData = false;
    return returnData;

  }
}

module.exports = modelObj;
