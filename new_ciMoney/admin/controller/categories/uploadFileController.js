const aws = require("aws-sdk");
const multer = require("multer");

const uplaodObject = {};
const spacesEndpoint = new aws.Endpoint(process.env.DIGITALENDPOINT);

const awsConfig = {
  endpoint: spacesEndpoint,
  accessKeyId: process.env.DIGITALACCESKEY,
  secretAccessKey: process.env.DIGITALSECRETKEY,
  region: process.env.DIGITALREGION,
};

const S3 = new aws.S3(awsConfig);

uplaodObject.upload = multer({
  limits: 1024 * 1024 * 5,
  fileFilter: (req, file, next) => {
    if (
      file.mimetype === "image/jpg" ||
      file.mimetype === "image/jpeg" ||
      file.mimetype === "image/png" ||
      file.mimetype === "image/webp"
    ) {
      next(null, file);
    } else {
      next("file types- jpg/jpeg/png/webp are supported!");
    }
  },
});

//It will take file buffer and return a promise containing a object which includes Location of image on s3.

uplaodObject.uploadToS3 = (fileData) => {
  return new Promise((res, rej) => {
    const s3params = {
      Bucket: process.env.DIGITALBUCKET,
      Key: "Partners/" + `${Date.now().toString()}.jpg`,
      Body: fileData,
      ACL: "public-read", // Set the ACL to public-read
    };
    S3.upload(s3params, (err, data) => {
      if (err) {
        console.log(err);
        return rej(err)
      }
      // console.log(data);
      return res(data);
    });
  });
};

module.exports = uplaodObject;
