const { pool } = require("../../utils/config/database");

const offerModelsObject = {};

offerModelsObject.addANewOffer = async (req, res, next) => {};

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

module.exports = offerModelsObject;
