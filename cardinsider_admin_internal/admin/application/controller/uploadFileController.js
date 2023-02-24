// Load dependencies
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')
let uploadFileControllerObj = {}
let path = require('path')

//  bucket  configs here..........

aws.config.update({
	accessKeyId: process.env.DIGITALACCESKEY,
	secretAccessKey: process.env.DIGITALSECRETKEY,
	region: process.env.DIGITALREGION
})

// Set S3 endpoint to DigitalOcean Spaces
const spacesEndpoint = new aws.Endpoint(process.env.DIGITALENDPOINT)
const s3 = new aws.S3({
	endpoint: spacesEndpoint
})


// Change bucket property to your Space name
uploadFileControllerObj.uploadToSpaces = (directory) => multer({
	storage: multerS3({
		s3: s3,
		bucket: process.env.DIGITALBUCKET,
		contentType: multerS3.AUTO_CONTENT_TYPE,
		acl: 'public-read',
		metadata: function (req, file, cb) {
			// const metadataObj = Object.assign({}, req.body)

			// metadataObj.content_type = file.mimetype
			// metadataObj.filename = file.originalname
			

			cb(null, { fieldName: file.fieldname })
		},
		key: function (request, file, cb) {
			let splittedName = file.originalname.split('.')
			cb(null, `${directory}` + Date.now() + '.' + splittedName[splittedName.length - 1])
		},

	})
})


uploadFileControllerObj.uploadFile = async function (req, res, next) {
	//console.log("Hi im in this  upload file method in controller", req.body)
	if (req.files) {
		const pathName = req.files[0].location
		res.send({ data: req.files, path: pathName })
	}
	else {
		res.send({ data: "no data" })
	}

}

uploadFileControllerObj.uploadNewFile = async function (req, res, next) {
	//console.log("Hi im in this  upload file method in controller", req.body)
	var storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, './public/images/')
		},
		filename: function (req, file, callback) {
			callback(null, Date.now() + path.extname(file.originalname))
		}
	})
	var upload = multer({
		storage: storage,
		fileFilter: function (req, file, callback) {
			var ext = (path.extname(file.originalname).toLowerCase())
			if (ext !== '.png' && ext !== '.jpg' && ext !== '.gif' && ext !== '.jpeg') {
				let obj = {
					message: "invalid extension!"
				}
				//console.log('ERROR')
				//return helper.errorHandler(res, obj, 200)
			}
			callback(null, true)
		}
	}).single('file')
	upload(req, res, function (err) {
		if (err) {
		} else {
			//console.log(req.file)
			if (req.file != null || req.file != undefined) {
				var file = req.file.filename
				//console.log(file, "fileName")
			}
		}
	})

	res.send('')
}





// uploadFileControllerObj.uploadFileTOStorage = async function (req, res, next) {
// 	//console.log("Hi im in this  upload file method in controller", req.body);
//     //console.log(req.body);


//      multer({ storage: storage, fileFilter: fileFitler });
//    next();
// }


module.exports = uploadFileControllerObj