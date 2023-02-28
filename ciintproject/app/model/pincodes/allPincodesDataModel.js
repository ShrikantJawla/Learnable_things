const {pool} = require('../../utils/configs/database');


let modelObj = {};

modelObj.getAllPincodesData = async function (body) {
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
    mp_id,
	mp_pincode,
	mp_idfc_available,
	mp_axis_available,
	mp_au_available,
	mp_yes_available,
	mp_bob_available,
    from_created_at,
    to_created_at,
    from_updated_at,
    to_updated_at,
    notNull,
  } = filterObject;
  const likeFields = {
  };
  const equalFields = { mp_id, mp_pincode};
  const selectFields = {
	mp_idfc_available,
	mp_axis_available,
	mp_au_available,
	mp_yes_available,
	mp_bob_available,
  };
  const arrayFields = {
  };
  const fromDatefields = {
    from_created_at,
    from_updated_at,
  };
  const toDatefields = {to_created_at, to_updated_at };

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
  sort = sort || "mp_id";
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

  let query = `SELECT * FROM manage_pincodes camt where `;
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

  let countQuery = query.replace("SELECT *", "SELECT count(*)");
  query =
    query +
    ` ORDER By "${sort}" ${ascDesc}
	limit ${entriesPerPage} offset ${offset};`;
  query = query.replace(/AND\s+ORDER/, `ORDER`);
  query = query.replace(/where\s+ORDER/, "ORDER");
  countQuery = countQuery.trimEnd().endsWith("where")
    ? countQuery.trimEnd().replace("where", "")
    : countQuery;
  countQuery = countQuery.trimEnd().endsWith("AND")
    ? countQuery.trimEnd().replace(/AND$/, "")
    : countQuery;
    console.log(countQuery, "<<<<<<<<<<<<<<<<")
  try {
    let appData = await pool.query(query);
    let current_time = Date.now();
    let countData = await pool.query(countQuery);
	
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



module.exports = modelObj;