const offersControllerObject = require('../controller/offers/offersControllers');
const uploadObject = require("../controller/categories/uploadFileController");


let router = require('express').Router()


router.get('/offers-list-ui',offersControllerObject.offersListUI)

/** This route is for making ajax request */

router.post("/offers-list-ui-ajax", offersControllerObject.offersListAjax)


router.get('/edit-offer-ui',offersControllerObject.editOffersUI)



router.get('/getSingleOffer/:id',offersControllerObject.getSingleOffer)


router.get('/add-new-offer-ui',offersControllerObject.addNewOfferUI)


router.post(
  "/addOfferByRequest",
  uploadObject.upload.array("img", 2),
  offersControllerObject.addNewOffer
);

router.patch(
  "/updateAnyExistingOffer/:id",
  uploadObject.upload.fields([
    { name: "img", maxCount: 1 },
    { name: "logo", maxCount: 1 },
  ]),
  offersControllerObject.updateAnyExistingOffer
);

router.post(
  "/offers-list-ui-delete",
  offersControllerObject.deleteOffers
);


module.exports = router;