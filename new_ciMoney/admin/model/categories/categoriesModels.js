const { pool } = require("../../utils/configs/database");
const bcrypt = require("bcrypt");
const commonModel = require("../../model/commonModel");

let categoriesModel = {};

categoriesModel.getCatColumns = async () => {
  let returnData = {
    allTr: [],
  };
  let queryForTr = `SELECT 
  CONCAT('edit-category-ui?id=',cim_categories.cat_id) as "Edit",
  cim_categories.cat_id as select,
  cim_categories.cat_id as "int|cat_id|Id",
  cim_categories.cat_name as "string|cat_name|Name",
  cim_categories.cat_desc as "string|cat_desc|Description",
  cim_categories.cat_img as "string|cat_img|Image",
  cim_categories.cat_sequence as "int|cat_sequence|Sequence",
  cim_categories.cat_status as "bool|cat_status|Status",
  cim_categories.cat_created_by as "string|cat_created_by|Created by",
  cim_categories.cat_updated_by as "string|cat_updated_by|Updated by",
  CAST(cim_categories.cat_created_at as varchar) as "date|cat_created_at|Created at",
  CAST(cim_categories.cat_updated_at as varchar) as "date|cat_updated_at|Updated at",
  CAST(cim_categories.publish_at as varchar) as "date|publish_at|Publish at"
  FROM cim_categories LEFT JOIN user_admin AS ua ON ua.ua_id=cim_categories.cat_created_by limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], "D");
  //  console.log('ua_rolleee',selectOptions)

  returnData.allTr = allTr;
  return returnData;
};

categoriesModel.editExistingCategoryQuery = (props) => {
  if (props.Location) {
    return `UPDATE cim_categories
        SET cat_name='${props.name}',cat_desc='${props.desc}',cat_sequence='${props.sequence}',cat_status='${props.status}',cat_img='${props.Location}',cat_updated_at=now(),cat_updated_by=${props.ua_id}
        WHERE cat_id=${props.id} returning *
        `;
  }
  return `
    UPDATE cim_categories
    SET cat_name='${props.name}',cat_desc='${props.desc}',cat_sequence='${props.sequence}',cat_status='${props.status}',cat_updated_at=now(),cat_updated_by=${props.ua_id}
    WHERE cat_id=${props.id} returning *
    `;
};

categoriesModel.getSingleCategoryQuery = (id) => {
  return `
    SELECT * FROM cim_categories as cat
    WHERE cat.cat_id = ${id}; 
    `;
};

categoriesModel.addNewCategoryQuery = (
  name,
  desc,
  img,
  sequence,
  status,
  created_by
) => {
  return `
    INSERT INTO cim_categories (cat_name,cat_desc,cat_img,cat_sequence,cat_status,cat_created_by,cat_updated_at)
    VALUES ('${name}','${desc}','${img}',${+sequence},${
    status === "true" ? true : false
  },${+created_by},now()) returning *;
    `;
};

categoriesModel.deleteExistingCategoriesQuery = (ids_arrays) => {
  return `DELETE FROM cim_categories WHERE cat_id IN (${ids_arrays.join(",")})`;
};

module.exports = categoriesModel;
