const { pool } = require("../../utils/configs/database");
const bcrypt = require("bcrypt");
const commonModel = require("../../model/commonModel");

let offersModel = {};

offersModel.getoffersColumns = async (req, res) => {
  let returnData = {
    allTr: [],
  };
  let queryForTr = `SELECT 
  CONCAT('edit-offer-ui?id=',cim_offers.of_id) as "Edit",
  cim_offers.of_id as select,
  cim_offers.of_id as "int|of_id|Id",
  cim_offers.of_name as "string|of_name|Name",
  cim_offers.of_desc as "string|of_desc|Description",
  cim_offers.of_image_url as "string|of_image_url|Image",
  cim_offers.of_logo as "string|of_logo|Logo",
  cim_offers.of_sequence as "int|of_sequence|Sequence",
  cim_offers.of_active_status as "bool|of_active_status|Status",
  cim_offers.of_created_by as "string|of_created_by|Created by",
  cim_offers.of_updated_by as "string|of_updated_by|Updated by",
  CAST(cim_offers.of_created_at as varchar) as "date|of_created_at|Created at",
  CAST(cim_offers.of_updated_at as varchar) as "date|of_updated_at|Updated at",
  CAST(cim_offers.of_publish_at as varchar) as "date|of_publish_at|Publish at"
  FROM cim_offers LEFT JOIN user_admin AS ua ON ua.ua_id=cim_offers.of_created_by limit 1`;
  let allTr = await commonModel.getDataOrCount(queryForTr, [], "D");
  //  console.log('ua_rolleee',selectOptions)

  returnData.allTr = allTr;
  return returnData;
};

offersModel.getSingleOfferQuery = (id) => {
  return `
    SELECT * FROM public.cim_offers as cat
    LEFT JOIN offer_category_junction AS junc ON junc.off_fk_id = cat.of_id
    WHERE cat.of_id = ${id}; 
    `;
};

offersModel.addANewOfferQuery = (
  name,
  desc,
  sequence,
  status,
  share_link,
  img,
  logo,
  ua_id
) => {
  return `
    INSERT INTO public.cim_offers (of_name,of_desc,of_image_url,of_sequence,of_active_status,of_updated_at,of_private_status,of_logo,of_share_link,of_created_by)
    VALUES ('${name}','${desc}','${img}',${+sequence},${true},now(),${true},'${logo}','${share_link}',${ua_id}) returning *
    `;
};

offersModel.updateAnyExistingDataQuery = (
  id,
  name,
  desc,
  sequence,
  status,
  share_link,
  images_object,
  ua_id
) => {
  if (images_object?.img && images_object?.logo) {
    return `
  UPDATE public.cim_offers 
  SET of_name='${name}',of_desc='${desc}',of_image_url='${
      images_object.img
    }',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_logo='${
      images_object.logo
    }',of_share_link='${share_link}',of_updated_by=${ua_id},of_updated_at=now()
  WHERE of_id = ${id} returning *
  `;
  } else if (images_object?.img) {
    return `
      UPDATE public.cim_offers 
      SET of_name='${name}',of_desc='${desc}',of_image_url='${
      images_object.img
    }',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_share_link='${share_link}',of_updated_by=${ua_id},of_updated_at=now()
      WHERE of_id = ${id} returning *
      `;
  } else if (images_object?.logo) {
    return `
    UPDATE public.cim_offers 
    SET of_name='${name}',of_desc='${desc}',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_logo='${
      images_object.logo
    }',of_share_link='${share_link}',of_updated_by=${ua_id},of_updated_at=now()
    WHERE of_id = ${id} returning *
    `;
  } else {
    return `
    UPDATE public.cim_offers 
    SET of_name='${name}',of_desc='${desc}',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_share_link='${share_link}',of_updated_by=${ua_id},of_updated_at=now()
    WHERE of_id = ${id} returning *
    `;
  }
};

offersModel.deleteExistingCategoriesQuery = (ids_arrays) => {
  return `DELETE FROM cim_offers WHERE of_id IN (${ids_arrays.join(",")})`;
};

module.exports = offersModel;
