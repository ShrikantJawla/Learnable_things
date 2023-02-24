const adminCategoriesModels = require("../../model/adminModels/adminCategoriesModel");
const { pool } = require("../../utils/config/database");
const uploadObject = require("../../controller/adminControllers/uploadFileController");

const categoriesConrollerObject = {};

categoriesConrollerObject.getCategoriesToDisplay = async (req, res) => {
  try {
    const dataFromDb = await pool.query(
      adminCategoriesModels.getCategoriesQuery()
    );
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

categoriesConrollerObject.addNewCategory = async (req, res) => {
  let { name, desc, sequence, status } = req.body;
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

      const resp = await pool.query(
        adminCategoriesModels.addNewCategoryQuery(
          name,
          desc,
          response.Location,
          sequence,
          status
        )
      );
      res.status(201).send({
        addedData: resp,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg: error,
    });
  }
};

categoriesConrollerObject.editExistingCategory = async (req, res) => {
  let id = req.params.id;
  const { name, desc, status, sequence } = req.body;
  let resp;
  try {
    let uploadedImg;
    if (req.file) {
      uploadedImg = await uploadObject
        .uploadToS3(req.file.buffer)
        .then((res) => {
          return res;
        });
      const { Location } = uploadedImg;
      resp = await pool.query(
        adminCategoriesModels.editExistingCategoryQuery(
          id,
          name,
          desc,
          sequence,
          status,
          Location
        )
      );
    } else {
      resp = await pool.query(
        adminCategoriesModels.editExistingCategoryQuery(
          id,
          name,
          desc,
          sequence,
          status
        )
      );
    }
    // console.log(resp)
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

categoriesConrollerObject.getSingleCategoryToDisplay = async (req, res) => {
  let id = req.params.id;
  try {
    let resp = await pool.query(
      adminCategoriesModels.getSingleCategoryQuery(id)
    );
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

module.exports = categoriesConrollerObject;
