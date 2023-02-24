let router = require("express").Router();
const adminCategoriesConrollers = require("../../controller/adminControllers/adminCategoriesController");
const uploadObject = require("../../controller/adminControllers/uploadFileController");

// Pages rendering routes

router.get("/allCategories", (req, res) => {
  res.render("admin/categories/categories");
});

router.get("/addCategory", (req, res) => {
  res.render("admin/categories/addCategory");
});

router.get("/editCategory", (req, res) => {
  res.render("admin/categories/editCategory");
});

router.post(
  "/addNewCategory",
  uploadObject.upload.single("img"),
  adminCategoriesConrollers.addNewCategory
);

router.post(
  "/getCategoriesData",
  adminCategoriesConrollers.getCategoriesToDisplay
);

router.get(
  "/getSingleCategory/:id",
  adminCategoriesConrollers.getSingleCategoryToDisplay
);

router.patch(
  "/editExistingCategory/:id",
  uploadObject.upload.single("img"),
  adminCategoriesConrollers.editExistingCategory
);

module.exports = router;
