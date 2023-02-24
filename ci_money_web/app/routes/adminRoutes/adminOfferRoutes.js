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

router.get('/getSingleOffer/:id',adminOfferControllerObject.getSingleOffer)


router.post(
  "/addOfferByRequest",
  uploadObject.upload.array("img", 2),
  adminOfferControllerObject.addNewOffer
);

router.patch(
  "/updateAnyExistingOffer/:id",
  uploadObject.upload.fields([
    { name: "img", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  adminOfferControllerObject.updateAnyExistingOffer
);

router.upload;

module.exports = router;
