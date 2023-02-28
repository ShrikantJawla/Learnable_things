
const uploadPincodesController = require('../controller/pincodes/uploadPincodesController');
const managePincodesController = require('../controller/pincodes/managePincodesController');

let router = require('express').Router();

router.get('/upload-pincodes', uploadPincodesController.renderPincodeUploadUi);

router.post('/post-pincode-data', uploadPincodesController.postPincodeData);

router.get('/all-pincodes', managePincodesController.renderAllPincodesUi);

router.post('/get-all-pincodes-data', managePincodesController.getAllPincodesData);

module.exports = router;