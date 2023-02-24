const uploadObject = require("./uploadFileController");
const { pool } = require("../../utils/config/database");
const offerModelsObject = require("../../model/adminModels/adminOffersModel");

const adminOfferControllerObject = {};

adminOfferControllerObject.imageUpload = async (req, res, next) => {
  let resp;
  try {
    if (req.file) {
      resp = await uploadObject.uploadToS3(req.file.buffer).then((res) => {
        return res;
      });
      //Here response recieved from s3 containing image location added into req object so that it can used in next middleware which will add data into DB.
      req.newOfferToBeAddedIntoDB = resp;
      next();
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

adminOfferControllerObject.displayAllData = async (req, res) => {
  try {
    let responseData = await pool.query(offerModelsObject.getAllDataQuery());
    res.json({
      status: 200,
      allData: responseData,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

adminOfferControllerObject.deleteAnyData = async (req, res) => {
  const id = req.params.id;
  try {
    let res = await pool.query(offerModelsObject.deleteAnyDataQuery(id));
    return res.json({
      status: 200,
      message: "Data Deleted Successfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

module.exports = adminOfferControllerObject;
