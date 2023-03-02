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
      addEntryUrl: `/offers/add-new-offer-ui`,
    });
  } else {
    res.render("error/noPermission");
  }
};

offersControllerObject.addNewOfferUI = async (req, res) => {
  let middleObj = await accessMiddleware.checkAccessPermition(req, 6, "W");
  if (middleObj) {
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("offers/addNewOffer", {
      sidebarDataByServer: sideBarData,
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
      cim_offers.of_updated_by as "int|of_updated_by|Updated by",
      CAST(cim_offers.of_created_at as varchar) as "date|of_created_at|Created at",
      CAST(cim_offers.of_updated_at as varchar) as "date|of_updated_at|Updated at"
        `;
  let leftJoin = `LEFT JOIN user_admin AS ua ON ua.uar_id=user_admin.ua_role`;
  let tableName = "cim_offers";
  let dataFromDb = await commonModel.getDataByPagination({
    body: req.body,
    currenUserId: currentUserId,
    selectColumns: selectColumns,
    tableName: tableName,
    shortByColumn: "of_id",
  });
  console.log(dataFromDb);
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
    let sideBarData = await commonController.commonSideBarData(req);
    res.render("offers/editExistingOffer", {
      sidebarDataByServer: sideBarData,
    });
  } else {
    res.render("error/noPermission");
  }
};

offersControllerObject.getSingleOffer = async (req, res) => {
  let id = req.params.id;
  console.log(id);
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
  const { name, desc, sequence, status, share_link } = req.body;
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
          resArr[1].Location
        )
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
  const { name, desc, sequence, status, share_link } = req.body;
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
          offersModel.updateAnyExistingDataQuery(...common, {
            img: resArr[0].Location,
            logo: resArr[1].Location,
          })
        );
      } else if (req.files.img) {
        let resp = await uploadObject.uploadToS3(req.files.img[0].buffer);
        resAfterAddingToDB = await pool.query(
          offersModel.updateAnyExistingDataQuery(...common, {
            img: resp.Location,
          })
        );
      } else if (req.files.logo) {
        let resp = await uploadObject.uploadToS3(req.files.logo[0].buffer);
        resAfterAddingToDB = await pool.query(
          offersModel.updateAnyExistingDataQuery(...common, {
            logo: resp.Location,
          })
        );
      }
      resAfterAddingToDB = await pool.query(
        offersModel.updateAnyExistingDataQuery(...common)
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

module.exports = offersControllerObject;
