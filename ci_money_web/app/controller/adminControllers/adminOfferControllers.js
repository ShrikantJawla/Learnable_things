const uploadObject = require("./uploadFileController");
const { pool } = require("../../utils/config/database");
const offerModelsObject = require("../../model/adminModels/adminOffersModel");

const adminOfferControllerObject = {};

adminOfferControllerObject.getSingleOffer = async (req, res) => {
  let id = req.params.id;
  try {
    let resp = await pool.query(offerModelsObject.getSingleOfferQuery(id));
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

adminOfferControllerObject.addNewOffer = async (req, res) => {
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
        offerModelsObject.addANewOfferQuery(
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

adminOfferControllerObject.updateAnyExistingOffer = async (req, res) => {
  const { name, desc, sequence, status, share_link } = req.body;
  const id = req.params.id;
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
          offerModelsObject.updateAnyExistingDataQuery(
            id,
            name,
            desc,
            sequence,
            status,
            share_link,
            { img: resArr[0].Location, logo: resArr[1].Location }
          )
        );
      } else if (req.files.img) {
        let resp = await uploadObject.uploadToS3(req.files.img[0].buffer);
        resAfterAddingToDB = await pool.query(
          offerModelsObject.updateAnyExistingDataQuery(
            id,
            name,
            desc,
            sequence,
            status,
            share_link,
            { img: resp.Location }
          )
        );
      } else if (req.files.logo) {
        let resp = await uploadObject.uploadToS3(req.files.logo[0].buffer);
        resAfterAddingToDB = await pool.query(
          offerModelsObject.updateAnyExistingDataQuery(
            id,
            name,
            desc,
            sequence,
            status,
            share_link,
            {
              logo: resp.Location,
            }
          )
        );
      }

      return res.status(201).json({
        payload: "resAfterAddingToDB",
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
