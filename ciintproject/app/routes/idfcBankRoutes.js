/* Importing the controller files. */
let idfcApplicationController = require('../controller/idfc/idfcApplicationController');
let idfcUploadController = require('../controller/idfc/idfcUploadController');
let idfcTeleController = require("../controller/idfc/idfcTeleController");
let idfcColdCallingController = require("../controller/idfc/idfcColdCallingController");

//////////////////////////////////////////////

/* Creating a new router object. */
let router = require('express').Router();


//////////////////////////----------- NEW VIEW ROUTES ------------------/////////////////////////////////

/* This is a route. It is telling the server that when a user goes to the url `/idfc-applications-new`
then the function `idfcApplicationController.getApplicationsNew` should be called. */
router.get("/idfc-applications-new", idfcApplicationController.getApplicationsNew);

/* This is a route. It is telling the server that when a user goes to the url
`/idfc-applications-new-ajax`
then the function `idfcApplicationController.getApplicationsAjaxNew` should be called. */
router.post("/idfc-applications-new-ajax", idfcApplicationController.getApplicationsAjaxNew);


/* Telling the server that when a user goes to the url `/idfc-tele-leads-new`
then the function `idfcTeleController.getTeleApplicationsNew` should be called. */
router.get('/idfc-tele-leads-new', idfcTeleController.getTeleApplicationsNew);

/* Telling the server that when a user goes to the url `/idfc-tele-leads-new-ajax`
then the function `idfcTeleController.getTeleApplicationsAjaxNew` should be called. */
router.post('/idfc-tele-leads-new-ajax', idfcTeleController.getTeleApplicationsAjaxNew);

//////////////////////////----------- END OF NEW VIEW ROUTES ------------------/////////////////////////////////



/* Telling the server that when a user goes to the url `/idfc-applications`
then the function `idfcApplicationController.getApplications` should be called. */
router.get("/idfc-applications", idfcApplicationController.getApplications);


/* Telling the server that when a user goes to the url `/get-all-applications-ajax`
then the function `idfcApplicationController.getApplicationsAjax` should be called. */
router.post("/get-all-applications-ajax", idfcApplicationController.getApplicationsAjax);

/* Telling the server that when a user goes to the url `/idfc-upload`
then the function `idfcUploadController.uploadApplicationsUi` should be called. */
router.get("/idfc-upload", idfcUploadController.uploadApplicationsUi);

/* Telling the server that when a user goes to the url `/idfc-upload-file-ajex`
then the function `idfcUploadController.uploadApplicationsAjex` should be called. */
router.post("/idfc-upload-file-ajex", idfcUploadController.uploadApplicationsAjex);

/* Telling the server that when a user goes to the url `/export-csv`
then the function `idfcApplicationController.exportCsv` should be called. */
router.post('/export-csv', idfcApplicationController.exportCsv);


/* Telling the server that when a user goes to the url `/edit-idfc-application-ui`
then the function `idfcApplicationController.editApplicationUi` should be called. */
router.get('/edit-idfc-application-ui', idfcApplicationController.editApplicationUi);

/* Telling the server that when a user goes to the url `/get-idfc-application-by-id`
then the function `idfcApplicationController.getApplicationDataById` should be called. */
router.get('/get-idfc-application-by-id', idfcApplicationController.getApplicationDataById);

/* Telling the server that when a user goes to the url `/update-idfc-application`
then the function `idfcApplicationController.updateApplication` should be called. */
router.put('/update-idfc-application', idfcApplicationController.updateApplication);

/* Telling the server that when a user goes to the url `/idfc-tele-leads`
then the function `idfcTeleController.teleLeadsUi` should be called. */
router.get('/idfc-tele-leads', idfcTeleController.teleLeadsUi);

/* Telling the server that when a user goes to the url `/get-tele-applications-ajax`
then the function `idfcTeleController.getTeleApplicationsAjax` should be called. */
router.post("/get-tele-applications-ajax", idfcTeleController.getTeleApplicationsAjax);

/* Telling the server that when a user goes to the url `/edit-tele-idfc-application-ui`
then the function `idfcTeleController.editApplicationUi` should be called. */
router.get('/edit-tele-idfc-application-ui', idfcTeleController.editApplicationUi);

/* Telling the server that when a user goes to the url `/cold-calling`
then the function `idfcColdCallingController.renderColdCallingsUi` should be called. */
router.get('/cold-calling', idfcColdCallingController.renderColdCallingsUi);

/* Telling the server that when a user goes to the url `/edit-cold-calling`
then the function `idfcColdCallingController.renderEditColdCallingsUi` should be called. */
router.get('/edit-cold-calling', idfcColdCallingController.renderEditColdCallingsUi);

/* This is a catch all route. It is telling the server that if the user goes to a url that is not
defined in the router then render the `error/notFound` view. */
router.get('*', function (req, res, next) {
	res.render('error/notFound');
});


/* Exporting the router object so that it can be used in other files. */
module.exports = router;