let commonHelper = require("../../common/helper");
const commonModel = require("../../model/commonModel.js");
const bcrypt = require("bcrypt");
const uploadObject = require("../categories/uploadFileController");

let commonController = require("../../controller/commonController");
let accessMiddleware = require("../../common/checkAccessMiddleware");
const { pool } = require("../../utils/configs/database");
const categoriesModel = require("../../model/categories/categoriesModels");

const categoriesControllerObject = {};

categoriesControllerObject.categoriesListUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    let catColumns = await categoriesModel.getCatColumns();
    const displayName = "Categories List";
    res.render("commonView/commonView", {
      sidebarDataByServer: sideBarData,
      allTr: catColumns.allTr[0],
      displayName: displayName,
      addEntryUrl: `/admin/categories/add-new-category`,
    });
  } else {
    res.render("error/noPermission");
  }
};

categoriesControllerObject.categoriesListAjax = async (req, res) => {
  let finalData = {
    status: false,
    code: "CIP-APPLICATION-ERR-101",
    message: "Something went wrong",
    payload: [],
  };
  let userdata = jwt.decode(req.session.userToken);
  let userLatestRole = await commonModel.getUserAdminRole(userdata.ua_id);
  let currentUserRole = userLatestRole[0].ua_role;
  let currentUserId = false;
  if (currentUserRole == 3) {
    currentUserId = userdata.ua_id;
  }
  let selectColumns = `
	CONCAT('edit-category-ui?id=',cim_categories.cat_id) as "Edit",
          cim_categories.cat_id as select,
          cim_categories.cat_id as "int|cat_id|Id",
          cim_categories.cat_name as "string|cat_name|Name",
          cim_categories.cat_desc as "string|cat_desc|Description",
          cim_categories.cat_img as "string|cat_img|Image",
          cim_categories.cat_sequence as "int|cat_sequence|Sequence",
          cim_categories.cat_status as "bool|cat_status|Status",
          created_by_u.ua_name as "string|created_by_u.ua_name|Created by",
          updated_by_u.ua_name as "string|updated_by_u.ua_name|Updated by",
          CAST(cim_categories.cat_created_at as varchar) as "date|cat_created_at|Created at",
          CAST(cim_categories.cat_updated_at as varchar) as "date|cat_updated_at|Updated at",
          CAST(cim_categories.publish_at as varchar) as "date|publish_at|Publish at"
	`;
  let leftJoin = `LEFT JOIN user_admin AS created_by_u ON created_by_u.ua_id = cim_categories.cat_created_by
  LEFT JOIN user_admin AS updated_by_u ON updated_by_u.ua_id = cim_categories.cat_updated_by
  `;
  let tableName = "cim_categories";
  let dataFromDb = await commonModel.getDataByPagination({
    body: req.body,
    currenUserId: currentUserId,
    selectColumns: selectColumns,
    tableName: tableName,
    shortByColumn: "cat_id",
    leftJoin,
  });
  if (dataFromDb) {
    res.render("commonView/commonAjax", {
      applicationsList: dataFromDb.applicationsData,
      totalCount: dataFromDb.count,
      getAllIssuers: dataFromDb.getAllIssuers,
      currentIssuer: req.body.issuerName,
    });
  } else {
    commonHelper.errorHandler(res, finalData);
  }
};

categoriesControllerObject.addNewCategoryUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W");
  if (middleObj) {
    let allOffers = await pool.query(`SELECT * FROM cim_offers`);
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("categories/addNewCategory", {
      sidebarDataByServer: sideBarData,
      offers: allOffers.rows,
    });
  } else {
    res.render("error/noPermission");
  }
};

categoriesControllerObject.addNewCategory = async (req, res) => {
  const { ua_id } = req.loggedUser;
  let { name, desc, sequence, status, offers_array } = req.body;
  let response;
  try {
    if (req.file && name && desc && sequence && status) {
      //Here response recieved from s3 containing image location added into req object so that it can used in next middleware which will add data into DB.
      response = await uploadObject.uploadToS3(req.file.buffer).then((res) => {
        return res;
      });

      //   response_example = {
      //     ETag: '"d5747b9a352f0c4c4e277fd6a0861c99"',
      //     Location: 'https://ciwebback.sgp1.digitaloceanspaces.com/Partners/1677137146323.jpg',
      //     key: 'Partners/1677137146323.jpg',
      //     Key: 'Partners/1677137146323.jpg',
      //     Bucket: 'ciwebback'
      //   }

      // categories added here
      const resp = await pool.query(
        categoriesModel.addNewCategoryQuery(
          name,
          desc,
          response.Location,
          sequence,
          status,
          ua_id
        )
      );
      offers_array = offers_array.split(",");
      // offers and category junction table added here
      let query = "";
      for (let i = 0; i < offers_array.length; i++) {
        query += `(${offers_array[i]},${resp.rows[0].cat_id}),`;
      }
      let offer_cat_update = await pool.query(
        `INSERT INTO offer_category_junction (off_fk_id,cat_fk_id) VALUES ${query.substring(
          0,
          query.length - 1
        )}`
      );

      res.status(201).send({
        addedData: "resp",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

categoriesControllerObject.editExistingCategoryUI = async (req, res) => {
  const id = req.query.id;
  let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W");
  if (middleObj) {
    let allOffers = await pool.query(`SELECT * FROM cim_offers`);
    let selectedOffers = await pool.query(`SELECT * FROM cim_offers 
    LEFT JOIN offer_category_junction AS junc ON junc.off_fk_id = cim_offers.of_id 
    WHERE junc.cat_fk_id = '${id}' and junc.publish_at IS NOT NULL`);
    let allOffersRows = allOffers.rows;
    let selectedOffersRows = selectedOffers.rows;
    for (let i = 0; i < allOffersRows.length; i++) {
      for (let j = 0; j < selectedOffersRows.length; j++) {
        if (allOffersRows[i].of_id === selectedOffersRows[j].of_id) {
          allOffersRows[i].activeStatus = true;
          break;
        }
      }
    }
    // console.log(allOffers.rows)
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("categories/editExistingCategory", {
      sidebarDataByServer: sideBarData,
      offers: allOffers.rows,
    });
  } else {
    res.render("error/noPermission");
  }
};

categoriesControllerObject.getCategoriesToDisplay = async (req, res) => {
  try {
    const dataFromDb = await pool.query(`select * from public.cim_categories`);
    res.status(200).send({
      allData: dataFromDb,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      msg: error,
    });
  }
};

categoriesControllerObject.editExistingCategory = async (req, res) => {
  const { ua_id } = req.loggedUser;
  let id = req.params.id;
  let { name, desc, status, sequence, offers_array } = req.body;
  let resp;
  let propsWithImgUrl = {
    id,
    name,
    desc,
    sequence,
    status,
    ua_id,
  };
  let propsWithoutImgUrl = {
    id,
    name,
    desc,
    sequence,
    status,
    ua_id,
  };
  try {
    let uploadedImg;
    if (req.file) {
      uploadedImg = await uploadObject
        .uploadToS3(req.file.buffer)
        .then((res) => {
          return res;
        });
      const { Location } = uploadedImg;
      propsWithImgUrl.Location = Location;
      resp = await pool.query(
        categoriesModel.editExistingCategoryQuery(propsWithImgUrl)
      );
    } else {
      resp = await pool.query(
        categoriesModel.editExistingCategoryQuery(propsWithoutImgUrl)
      );
    }
    offers_array = offers_array.split(",").map(Number);
    let idsToExclude = [];
    let idsToInclude = [];
    let allExistingOffersId = [];

    let { rows: allConnectedOffersInJunction } =
      await pool.query(`SELECT * FROM offer_category_junction AS junc
    WHERE junc.cat_fk_id = ${id} AND publish_at IS NOT NULL`);

    for (let i = 0; i < allConnectedOffersInJunction.length; i++) {
      allExistingOffersId.push(+allConnectedOffersInJunction[i].off_fk_id);
    }

    for (let i = 0; i < allConnectedOffersInJunction.length; i++) {
      if (!offers_array.includes(+allConnectedOffersInJunction[i].off_fk_id)) {
        idsToExclude.push(+allConnectedOffersInJunction[i].off_fk_id);
      }
    }

    for (let i = 0; i < offers_array.length; i++) {
      if (!allExistingOffersId.includes(offers_array[i]))
        idsToInclude.push(+offers_array[i]);
    }

    let valuesToBeAdded = "";
    for (let i = 0; i < idsToInclude.length; i++) {
      valuesToBeAdded += `(${idsToInclude[i]},${resp.rows[0].cat_id}),`;
    }

    let finalQuery = "";
    if (idsToInclude.length) {
      finalQuery += `INSERT INTO offer_category_junction (off_fk_id,cat_fk_id) VALUES ${valuesToBeAdded.substring(
        0,
        valuesToBeAdded.length - 1
      )};`;
    }
    if (idsToExclude.length) {
      finalQuery += `UPDATE offer_category_junction
      SET publish_at = NULL WHERE off_fk_id IN(${idsToExclude.join(
        ","
      )}) AND cat_fk_id = ${id};`;
    }
    let resAfterUpdatingJunctionOfOffAndCat = await pool.query(finalQuery);

    res.status(200).send({
      updatedData: resp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

categoriesControllerObject.getSingleCategoryToDisplay = async (req, res) => {
  let id = req.params.id;
  try {
    let resp = await pool.query(categoriesModel.getSingleCategoryQuery(id));
    res.status(200).send({
      allData: resp.rows[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

categoriesControllerObject.deleteCategories = async (req, res) => {
  let { applicationIdList, table } = req.body;
  applicationIdList = applicationIdList.map(Number);
  let finalData = {
    status: false,
    code: "CIP-APPLICATION-ERR-101",
    message: "Something went wrong",
    payload: [],
  };
  try {
    let response = await pool.query(
      categoriesModel.deleteExistingCategoriesQuery(applicationIdList)
    );
    finalData = {
      ...finalData,
      code: "",
      message: "",
      payload: response,
    };
    commonHelper.successHandler(res, finalData);
  } catch (error) {
    console.log(error);
    commonHelper.errorHandler(res, finalData);
  }
};

module.exports = categoriesControllerObject;
