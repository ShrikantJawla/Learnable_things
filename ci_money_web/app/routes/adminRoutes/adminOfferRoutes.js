let router = require("express").Router();
const { pool } = require("../../utils/config/database");
const bodyParser = require("body-parser");
const adminOfferControllerObject = require("../../controller/adminControllers/adminOfferControllers");
const uploadObject = require("../../controller/adminControllers/uploadFileController");
const offerModelsObject = require("../../model/adminModels/adminOffersModel");

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get("/offerslist", (req, res) => {
  res.render("admin/offers/offersList");
});
router.get("/editOffers", (req, res) => {
  res.render("admin/offers/editOffer");
});
router.get("/addOffer", (req, res) => {
  res.render("admin/offers/addOffer");
});

router.delete("/deleteRow/:id", adminOfferControllerObject.deleteAnyData);

router.post("/get-filtered-offers", adminOfferControllerObject.displayAllData);

router.post("/addOfferByRequest", async (req, res) => {
  const {
    name,
    desc,
    sequence,
    status,
    share_link,
  } = req.body;
  try {
    console.log(req.file)
    return;
  } catch (error) {
    return res.json({
      status: 500,
      message: error,
    });
  }
});

router.upload;

module.exports = router;
