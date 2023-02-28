// imports here..... 

const multer = require('multer');
const path = require('path');


let uploadControllerObj = {};

//upload file with multer here....

uploadControllerObj.uploadExcelFile = ()=> multer({

	storage: multer.diskStorage({
		destination: function (req, file, callback) {
		
			let destinationPath = path.join(__dirname, '/../../../public/temp/');
			//console.log("logging --------->>>>", destinationPath);
			callback(null, destinationPath);
		},
		filename: function (req, file, callback) {
			callback(null, Date.now() + file.originalname);
		}
	}),
	fileFilter: function (req, file, callback) {
		var ext = (path.extname(file.originalname).toLowerCase())
		if (ext !== '.xlsx') {
			let obj = {
				message: "invalid extension!"
			}
			//console.log('ERROR', obj);
			//return helper.errorHandler(res, obj, 200)
		}
		callback(null, true)
	}
});

module.exports = uploadControllerObj;
