/////////////////////////////////////////////

let citiApplicationController = require("../controller/citi/citiApplicationController")
let citiUploadController = require("../controller/citi/citiUploadController")
let citiTeleController = require("../controller/citi/citiTeleController")

let router = require('express').Router()



router.get("/citi-applications", citiApplicationController.getApplications)
router.post("/get-all-applications-ajax", citiApplicationController.getApplicationsAjax)
router.get("/citi-upload", citiUploadController.uploadApplicationsUi)
router.post("/citi-upload-file-ajex", citiUploadController.uploadApplicationsAjex)
router.post('/export-csv', citiApplicationController.exportCsv)
router.get('/citi-tele-leads', citiTeleController.teleLeadsUi)

router.get('/edit-citi-application-ui', citiApplicationController.getApplicationDataById)
router.get('/get-citi-application-by-id', citiApplicationController.getApplicationDataById)
router.put('/update-citi-application', citiApplicationController.updateApplication)
router.post("/get-tele-applications-ajax", citiTeleController.getTeleApplicationsAjax)
router.get('*', function (req, res, next) {
	res.render('error/notFound')
})


module.exports = router