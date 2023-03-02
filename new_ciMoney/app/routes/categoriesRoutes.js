const categoriesControllerObject = require("../controller/categories/categoriesControllers");
const uploadObject = require("../controller/categories/uploadFileController");

let router = require("express").Router();

/** Rendering category list-- */

/** This route is to render the page categories list */
router.get("/categories-list-ui", categoriesControllerObject.categoriesListUI);

/** This route is for making ajax request */

router.post(
  "/categories-list-ui-ajax",
  categoriesControllerObject.categoriesListAjax
);

/** Adding and updating routes */

/** This route is for add new category */

router.get(
  "/edit-category-ui",
  categoriesControllerObject.editExistingCategoryUI
);

router.get("/add-new-category", categoriesControllerObject.addNewCategoryUI);

router.post(
  "/addNewCategory",
  uploadObject.upload.single("img"),
  categoriesControllerObject.addNewCategory
);

router.post(
  "/getCategoriesData",
  categoriesControllerObject.getCategoriesToDisplay
);

router.get(
  "/getSingleCategory/:id",
  categoriesControllerObject.getSingleCategoryToDisplay
);

router.patch(
  "/editExistingCategory/:id",
  uploadObject.upload.single("img"),
  categoriesControllerObject.editExistingCategory
);

module.exports = router;
