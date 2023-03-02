const { pool } = require("../../utils/configs/database");
const bcrypt = require("bcrypt");
const commonModel = require('../../model/commonModel')

let categoriesModel = {};


categoriesModel.getCatColumns = async () => {
    let returnData = {
      allTr: [],
    };
    let queryForTr = `SELECT 
          CONCAT('edit-category-ui?id=',cat.cat_id) as "Edit",
          cat.cat_id as select,
          cat.cat_id as "int|cat_id|Id",
          cat.cat_name as "string|cat_name|Name",
          cat.cat_desc as "string|cat_desc|Description",
          cat.cat_img as "string|cat_img|Image",
          cat.cat_sequence as "int|cat_sequence|Sequence",
          cat.cat_status as "bool|cat_status|Status",
          cat.cat_created_by as "int|cat_created_by|Created by",
          CAST(cat.cat_created_at as varchar) as "date|cat_created_at|Created at",
          CAST(cat.cat_updated_at as varchar) as "date|cat_updated_at|Updated at"
              FROM cim_categories as cat limit 1`;
    let allTr = await commonModel.getDataOrCount(queryForTr, [], "D");
    //  console.log('ua_rolleee',selectOptions)
  
    returnData.allTr = allTr;
    return returnData;
  };


categoriesModel.editExistingCategoryQuery = (
  id,
  newName,
  newDesc,
  newSequence,
  newStatus,
  newImage
) => {
  if (newImage) {
    return `UPDATE public.cim_categories
        SET cat_name='${newName}',cat_desc='${newDesc}',cat_sequence='${newSequence}',cat_status='${newStatus}',cat_img='${newImage}',cat_updated_at=now()
        WHERE cat_id=${id}
        `;
  }
  return `
    UPDATE public.cim_categories
    SET cat_name='${newName}',cat_desc='${newDesc}',cat_sequence='${newSequence}',cat_status='${newStatus}',cat_updated_at=now()
    WHERE cat_id=${id}
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
  created_by = 2
) => {
  return `
    INSERT INTO cim_categories (cat_name,cat_desc,cat_img,cat_sequence,cat_status,cat_created_by,cat_updated_at)
    VALUES ('${name}','${desc}','${img}',${+sequence},${
    status === "true" ? true : false
  },${+created_by},now()) returning *;
    `;
};





  module.exports = categoriesModel