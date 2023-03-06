let commonHelper = require("../../common/helper");
const commonModel = require("../../model/commonModel.js");
const bcrypt = require("bcrypt");
const uploadObject = require("../categories/uploadFileController");

let commonController = require("../../controller/commonController");
let accessMiddleware = require("../../common/checkAccessMiddleware");
const { pool } = require("../../utils/configs/database");
const offersModel = require("../../model/offers/offersModels");

const offersControllerObject = {};

offersControllerObject.offersListUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    let offersColumns = await offersModel.getoffersColumns();
    const displayName = "Offers List";
    res.render("commonView/commonView", {
      sidebarDataByServer: sideBarData,
      allTr: offersColumns.allTr[0],
      displayName: displayName,
      addEntryUrl: `/admin/offers/add-new-offer-ui`,
    });
  } else {
    res.render("error/noPermission");
  }
};

offersControllerObject.addNewOfferUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W");
  if (middleObj) {
    let allCategories = await pool.query(
      `SELECT cat.cat_name,cat.cat_id FROM cim_categories AS cat`
    );
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("offers/addNewOffer", {
      sidebarDataByServer: sideBarData,
      categories: allCategories.rows,
    });
  } else {
    res.render("error/noPermission");
  }
};

offersControllerObject.offersListAjax = async (req, res) => {
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
      CONCAT('edit-offer-ui?id=',cim_offers.of_id) as "Edit",
      cim_offers.of_id as select,
      cim_offers.of_id as "int|of_id|Id",
      cim_offers.of_name as "string|of_name|Name",
      cim_offers.of_desc as "string|of_desc|Description",
      cim_offers.of_image_url as "string|of_image_url|Image",
      cim_offers.of_logo as "string|of_logo|Logo",
      cim_offers.of_sequence as "int|of_sequence|Sequence",
      cim_offers.of_active_status as "bool|of_active_status|Status",
      created_by_u.ua_name as "string|created_by_u.ua_name|Created by",
      updated_by_u.ua_name as "string|updated_by_u.ua_name|Updated by",
      CAST(cim_offers.of_created_at as varchar) as "date|of_created_at|Created at",
      CAST(cim_offers.of_updated_at as varchar) as "date|of_updated_at|Updated at",
      CAST(cim_offers.of_publish_at as varchar) as "date|of_publish_at|Publish at"
        `;
  let leftJoin = `LEFT JOIN user_admin AS created_by_u ON created_by_u.ua_id = cim_offers.of_created_by
                  LEFT JOIN user_admin AS updated_by_u ON updated_by_u.ua_id = cim_offers.of_updated_by
                  `;
  let tableName = "cim_offers";
  let dataFromDb = await commonModel.getDataByPagination({
    body: req.body,
    currenUserId: currentUserId,
    selectColumns: selectColumns,
    tableName: tableName,
    shortByColumn: "of_id",
    leftJoin
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

offersControllerObject.editOffersUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W");
  if (middleObj) {
    let allCategories = await pool.query(
      `SELECT cat.cat_name,cat.cat_id FROM cim_categories AS cat`
    );
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("offers/editExistingOffer", {
      sidebarDataByServer: sideBarData,
      categories: allCategories.rows,
    });
  } else {
    res.render("error/noPermission");
  }
};

offersControllerObject.getSingleOffer = async (req, res) => {
  let id = req.params.id;
  try {
    let resp = await pool.query(offersModel.getSingleOfferQuery(id));
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

offersControllerObject.addNewOffer = async (req, res) => {
  const {ua_id} = req.loggedUser;
  const { name, desc, sequence, status, share_link, category_id } = req.body;
  try {
    if (
      name !== "" ||
      desc !== "" ||
      sequence !== "" ||
      status !== "" ||
      share_link !== "" ||
      req.files.length > 1
    ) {
      let promises = [
        uploadObject.uploadToS3(req.files[0].buffer),
        uploadObject.uploadToS3(req.files[1].buffer),
      ];
      let resArr = await Promise.all(promises);

      let resAfterAddingToDB = await pool.query(
        offersModel.addANewOfferQuery(
          name,
          desc,
          sequence,
          status,
          share_link,
          resArr[0].Location,
          resArr[1].Location,
          ua_id
        )
      );
      let resAfterAddingToJunctionTable = await pool.query(
        `INSERT INTO offer_category_junction (off_fk_id,cat_fk_id) VALUES (${resAfterAddingToDB.rows[0].of_id},${category_id})`
      );
      return res.status(201).json({
        payload: resAfterAddingToDB,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "All fields are required",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      message: error,
    });
  }
};

offersControllerObject.updateAnyExistingOffer = async (req, res) => {
  const {ua_id} = req.loggedUser;
  const { name, desc, sequence, status, share_link, category_id } = req.body;
  const id = req.params.id;
  const common = [id, name, desc, sequence, status, share_link];
  let resAfterAddingToDB;
  try {
    if (
      name !== "" ||
      desc !== "" ||
      sequence !== "" ||
      status !== "" ||
      share_link !== ""
    ) {
      if (req.files.img && req.files.logo) {
        let promises = [
          uploadObject.uploadToS3(req.files.img[0].buffer),
          uploadObject.uploadToS3(req.files.logo[0].buffer),
        ];
        let resArr = await Promise.all(promises);
        resAfterAddingToDB = await pool.query(
          offersModel.updateAnyExistingDataQuery(
            ...common,
            {
              img: resArr[0].Location,
              logo: resArr[1].Location,
            },
            category_id,
            ua_id
          )
        );
      } else if (req.files.img) {
        let resp = await uploadObject.uploadToS3(req.files.img[0].buffer);
        resAfterAddingToDB = await pool.query(
          offersModel.updateAnyExistingDataQuery(
            ...common,
            {
              img: resp.Location,
            },
            category_id,
            ua_id
          )
        );
      } else if (req.files.logo) {
        let resp = await uploadObject.uploadToS3(req.files.logo[0].buffer);
        resAfterAddingToDB = await pool.query(
          offersModel.updateAnyExistingDataQuery(
            ...common,
            {
              logo: resp.Location,
            },
            category_id,
            ua_id
          )
        );
      }
      resAfterAddingToDB = await pool.query(
        offersModel.updateAnyExistingDataQuery(...common, {},ua_id)
      );
      
        // Here I have updated the offer and category junction table 

        await pool.query(`UPDATE offer_category_junction
        SET cat_fk_id = ${category_id} WHERE off_fk_id = ${resAfterAddingToDB.rows[0].of_id}
        `)

      return res.status(201).json({
        payload: resAfterAddingToDB,
      });
    } else {
      return res.status(401).json({
        status: 401,
        message: "All fields are required",
      });
    }
  } catch (error) {
    console.log(error);
    return res.json({
      status: 500,
      message: error,
    });
  }
};



offersControllerObject.deleteOffers = async(req,res)=>{
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
      offersModel.deleteExistingCategoriesQuery(applicationIdList)
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
}


module.exports = offersControllerObject;
