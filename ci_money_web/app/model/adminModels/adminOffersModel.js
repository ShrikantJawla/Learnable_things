const { pool } = require("../../utils/config/database");

const offerModelsObject = {};

offerModelsObject.getSingleOfferQuery = (id) => {
  return `
  SELECT * FROM public.cim_offers as cat
  WHERE cat.of_id = ${id}; 
  `;
};

offerModelsObject.addANewOfferQuery = (
  name,
  desc,
  sequence,
  status,
  share_link,
  img,
  logo
) => {
  return `
  INSERT INTO public.cim_offers (of_name,of_desc,of_image_url,of_sequence,of_active_status,of_updated_at,of_updated_by,of_private_status,of_logo,of_share_link)
  VALUES ('${name}','${desc}','${img}',${+sequence},${true},now(),2,${false},'${logo}','${share_link}') returning *
  `;
};

offerModelsObject.getAllDataQuery = () => {
  return `
    SELECT * FROM public.cim_offers
    `;
};

offerModelsObject.deleteAnyDataQuery = (id) => {
  return `
    UPDATE public.cim_offers
    SET of_created_at = NULL, of_updated_at = now()
     WHERE offer_id = ${id}
      `;
};

offerModelsObject.updateAnyExistingDataQuery = (
  id,
  name,
  desc,
  sequence,
  status,
  share_link,
  images_object
) => {
  if (images_object.img && images_object.logo) {
    return `
UPDATE public.cim_offers 
SET of_name='${name}',of_desc='${desc}',of_image_url='${
      images_object.img
    }',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_logo='${
      images_object.logo
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
WHERE of_id = ${id}
`;
  } else if (images_object.img) {
    return `
    UPDATE public.cim_offers 
    SET of_name='${name}',of_desc='${desc}',of_image_url='${
      images_object.img
    }',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
    WHERE of_id = ${id}
    `;
  } else if (images_object.logo) {
    return `
  UPDATE public.cim_offers 
  SET of_name='${name}',of_desc='${desc}',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_logo='${
      images_object.logo
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
  WHERE of_id = ${id}
  `;
  } else {
    return `
  UPDATE public.cim_offers 
  SET of_name='${name}',of_desc='${desc}',of_sequence='${sequence}',of_active_status='${
      status === "true" ? true : false
    }',of_share_link='${share_link}',of_updated_by=${2},of_updated_at=now()
  WHERE of_id = ${id}
  `;
  }
};

module.exports = offerModelsObject;
