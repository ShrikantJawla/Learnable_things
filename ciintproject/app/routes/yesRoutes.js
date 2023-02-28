/////////////////////////////////////////////
let yesApplicationController = require("../controller/yesBank/yesApplicationsController")
let yesUploadController = require("../controller/yesBank/yesUploadController")
let yesTeleController = require("../controller/yesBank/yesTeleController")
let yesColdCallingController = require("../controller/yesBank/yesColdCallingController")
/* Creating a new router object. */

let router = require('express').Router()


/* This is a route. It is telling the server to go to the yesApplicationController and run the
getApplications function. */
router.get('/yes-applications', yesApplicationController.getApplications)
router.get('/yes-applications-new', yesApplicationController.getApplicationsNew)
router.post("/yes-applications-new-ajax", yesApplicationController.getApplicationsAjaxNew);
/* This is a route. It is telling the server to go to the yesApplicationController and run the
getApplicationsAjax function. */
router.post("/get-all-applications-ajax", yesApplicationController.getApplicationsAjax)
/* This is a route. It is telling the server to go to the yesUploadController and run the
uploadApplicationsUi function. */
router.get('/yes-upload', yesUploadController.uploadApplicationsUi)
/* This is a route. It is telling the server to go to the yesUploadController and run the
uploadApplicationsAjex function. */
router.post('/yes-upload-ajex', yesUploadController.uploadApplicationsAjex)
/* This is a route. It is telling the server to go to the yesApplicationController and run the
exportCsv function. */
router.post('/export-csv', yesApplicationController.exportCsv)

/* This is a route. It is telling the server to go to the yesTeleController and run the
teleLeadsUi function. */
router.get('/yes-tele-leads', yesTeleController.teleLeadsUi)
/* This is a route. It is telling the server to go to the yesApplicationController and run the
editApplicationUi function. */
router.get('/edit-yes-application-ui', yesApplicationController.editApplicationUi)
/* This is a route. It is telling the server to go to the yesApplicationController and run the
getApplicationDataById function. */
router.get('/get-yes-application-by-id', yesApplicationController.getApplicationDataById)
/* This is a route. It is telling the server to go to the yesApplicationController and run the
updateApplication function. */
router.put('/update-yes-application', yesApplicationController.updateApplication)

router.post("/get-tele-applications-ajax", yesTeleController.getTeleApplicationsAjax)

router.get('/edit-tele-yes-application-ui', yesTeleController.editApplicationUi)

router.get('/cold-calling', yesColdCallingController.renderColdCallingsUi);
router.get('/edit-cold-calling', yesColdCallingController.renderEditColdCallingsUi);

router.get('/yes-tele-leads-new', yesTeleController.getTeleApplicationsNew);
router.post('/yes-tele-leads-new-ajax', yesTeleController.getTeleApplicationsAjaxNew);
/* This is a route. It is telling the server to go to the error/notFound page if the user tries to
access a page that does not exist. */
router.get('*', function (req, res, next) {
	res.render('error/notFound')
})


module.exports = router