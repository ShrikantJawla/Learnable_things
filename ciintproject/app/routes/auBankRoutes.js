let auApplicationsController = require('../controller/au/auApplicationsController')
let auUploadController = require('../controller/au/auUploadController')
let auTeleController = require("../controller/au/auTeleController")
let auColdCallingController = require("../controller/au/auColdCallingController")

/////////////////////////////////////////////


let router = require('express').Router()


router.get("/au-applications", auApplicationsController.getApplications);
router.get("/au-applications-new", auApplicationsController.getApplicationsNew);
router.post("/au-applications-new-ajax", auApplicationsController.getApplicationsAjaxNew);
router.get("/au-upload", auUploadController.uploadApplicationsUi);
router.post("/au-upload-file-ajex", auUploadController.uploadApplicationsAjex);
router.post('/export-csv', auApplicationsController.exportCsv);
router.get('/au-tele-leads', auTeleController.teleLeadsUi);
router.get('/au-tele-leads-new', auTeleController.getTeleApplicationsNew);
router.post('/au-tele-leads-new-ajax', auTeleController.getTeleApplicationsAjaxNew);
router.get('/edit-au-application-ui', auApplicationsController.editApplicationUi);
router.get('/get-au-application-by-id', auApplicationsController.getApplicationDataById);
router.put('/update-au-application', auApplicationsController.updateApplication);
router.post("/get-tele-applications-ajax", auTeleController.getTeleApplicationsAjax);
router.get('/edit-tele-au-application-ui', auTeleController.editApplicationUi);
router.get('/cold-calling', auColdCallingController.renderColdCallingsUi);
router.get('/edit-cold-calling', auColdCallingController.renderEditColdCallingsUi);

router.post('/get-all-applications-ajax', auApplicationsController.getApplicationsAjax);

//router.post("/au-demo", auUploadController.demoData)

router.get('*', function (req, res, next) {
    res.render('error/notFound');
});



module.exports = router