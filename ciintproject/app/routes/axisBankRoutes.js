
const axisController = require('../controller/axisBank/axisApplicationsController')
const axisUploadController = require('../controller/axisBank/axisUploadController')
const excelUploaderController = require('../controller/uploader/excelUploaderController')
let axisTeleController = require("../controller/axisBank/axisTeleController")
let axisColdCallingController = require("../controller/axisBank/axisColdCallingController")
/////////////////////////////////////////////
let router = require('express').Router();



//////////////////////////----------- NEW VIEW ROUTES ------------------/////////////////////////////////
/* The above code is creating a new route for the axisController.getApplicationsNew function. */
router.get("/axis-applications-new", axisController.getApplicationsNew);
router.post("/axis-applications-new-ajax", axisController.getApplicationsAjaxNew);


router.get('/axis-tele-leads-new', axisTeleController.getTeleApplicationsNew);
router.post('/axis-tele-leads-new-ajax', axisTeleController.getTeleApplicationsAjaxNew);

//////////////////////////----------- END OF NEW VIEW ROUTES ------------------/////////////////////////////////



router.get('/axis-applications', axisController.getApplications);

router.get('/axis-upload', axisUploadController.uploadApplicationsUi);
router.post('/axis-upload-ajex', axisUploadController.uploadFileDataByAjex);

router.post('/axis-upload-file', excelUploaderController.uploadExcelFile('axis').single('excelFile', 1), axisUploadController.uploadFileData);
router.post('/export-csv', axisController.exportCsv)

router.get('/edit-axis-application-ui', axisController.editApplicationUi)
router.get('/get-axis-application-by-id', axisController.getApplicationDataById)
router.put('/update-axis-application', axisController.updateApplication)
router.get('/axis-tele-leads', axisTeleController.teleLeadsUi)
router.post('/get-tele-applications-ajax', axisTeleController.getTeleApplicationsAjax)
router.get('/edit-tele-axis-application-ui', axisTeleController.editApplicationUi)
router.get('/axis-upload-activation', axisUploadController.addActivationData)
router.post('/axis-upload-activation-ajex', axisUploadController.addActivationDataAjex)
router.get('/cold-calling', axisColdCallingController.renderColdCallingsUi);
router.get('/edit-cold-calling', axisColdCallingController.renderEditColdCallingsUi);
//get all application data pagination 
router.post('/get-all-applications-ajax', axisController.getApplicationsAjax)

router.get('*', function (req, res, next) {
	res.render('error/notFound')
})


module.exports = router