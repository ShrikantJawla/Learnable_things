const { pool } = require("../../utils/configs/database");
const bcrypt = require("bcrypt");
const commonModel = require("../../model/commonModel");

let offersModel = {};

offersModel.getoffersColumns = async (req, res) => {
  let returnData = {
    allTr: [],
  };
  let queryForTr = `SELECT 
            CONCAT('edit-offer-ui?id=',off.of_id) as "Edit",
            off.of_id as select,
            off.of_id as "int|of_id|Id",
            off.of_name as "string|of_name|Name",
            off.of_desc as "string|of_desc|Description",
            off.of_image_url as "string|of_image_url|Image",
            off.of_logo as "string|of_logo|Logo",
            off.of_sequence as "int|of_sequence|Sequence",
            off.of_active_status as "bool|of_active_status|Status",
            off.of_updated_by as "int|of_updated_by|Updated by",
            CAST(off.of_created_at as varchar) as "date|of_created_at|Created at",
            CAST(off.of_updated_at as varchar) as "date|of_updated_at|Updated at"
                FROM cim_offers as off limit 1`;
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
) => {
  return `
    INSERT INTO public.cim_offers (of_name,of_desc,of_image_url,of_sequence,of_active_status,of_updated_at,of_updated_by,of_private_status,of_logo,of_share_link)
    VALUES ('${name}','${desc}','${img}',${+sequence},${true},now(),2,${false},'${logo}','${share_link}') returning *
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
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
  WHERE of_id = ${id} returning *
  `;
  } else if (images_object?.img) {
    return `
      UPDATE public.cim_offers 
      SET of_name='${name}',of_desc='${desc}',of_image_url='${
      images_object.img
    }',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
      WHERE of_id = ${id} returning *
      `;
  } else if (images_object?.logo) {
    return `
    UPDATE public.cim_offers 
    SET of_name='${name}',of_desc='${desc}',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_logo='${
      images_object.logo
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
    WHERE of_id = ${id} returning *
    `;
  } else {
    return `
    UPDATE public.cim_offers 
    SET of_name='${name}',of_desc='${desc}',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
    WHERE of_id = ${id} returning *
    `;
  }
};

module.exports = offersModel;
