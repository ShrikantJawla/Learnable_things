const applicationsController = require('../controller/applications/applicationsController');
const applicationsControllerUpload = require('../controller/applications/applicationsUpload');
const sessionMiddleware = require('../common/sessionMiddleware');

const  coldCallingController = require('../controller/applications/coldCallingsController');


/////////////////////////////////////////////
let router = require('express').Router();


/* Defining the routes for the application. */
router.get("/get-applications", applicationsController.getAllApplicationsUi);

router.get("/get-applications-new", applicationsController.getApplicationsNew);


router.post("/get-applications-new-ajax", applicationsController.getApplicationsNewAjex);

router.get("/show-applications", applicationsController.showAllApplicationsUi);
router.get("/application-upload-sms", applicationsController.uploadSMSStatus);
router.post("/application-upload-sms-ajex", applicationsController.uploadSMSStatusAjex);
router.post('/get-all-applications-ajax', applicationsController.getAllApplicationsAjax);
router.post('/get-filtered-application-ajax', applicationsController.getFilteredApplicationsAjax);
router.get('/export-sms-file', applicationsController.exportSmsFile);
router.post('/get-all-applications-by-bank-ajax', applicationsController.getAllApplicationsOfBank);
router.get('/all-banks-in-applications', applicationsController.getAllBanksInApplications);
router.post('/export-csv', applicationsController.exportCsv);
router.post('/all-banks-in-applications-ajax', applicationsController.getAllBanksInApplicationsAjax);
router.get('/application-upload', applicationsControllerUpload.uploadApplicationsUi);
router.post('/upload-file-ajex', applicationsControllerUpload.uploadApplicationsAjex);
router.get('/edit-application-ui', applicationsController.editApplicationUi);
router.get('/get-application-by-id', applicationsController.getApplicationDataById);
/* A route to update the application status. */
router.put('/update-application', applicationsController.updateApplication);

/* A route to upload missing data. */
router.get('/upload-missing-data', applicationsController.uploadMissingData);
router.get('/match-phonenumber-data', applicationsController.matchPhoneNumberWithApplication);
/* A route to get all the banks for the missing data. */
router.get('/get-all-banks-for-missing-data', applicationsController.getAllBanksForUploadMissingData);

/* This is a route to post the missing data. */
router.post('/post-missing-data', applicationsController.postAllBanksMissingData);

router.post('/get-matched-phone-number-sheet', applicationsController.geteMatchedPhoneNumberSheet);

/*Routes to Add SMS Templates */
router.get('/edit-sms-templates', applicationsController.editSmsTemplates);

/* A route to update the application status. */
router.post('/update-apply-status', applicationsController.updateApplyStatus);


/* This is a route to get all the applications. */
router.post('/get-all-applications-ajax-new', applicationsController.getAllApplicationsAjaxNew);

/* This is a route to insert new cold calling data. */
router.post('/insert-new-cc',applicationsController.insertNewColdCalling);

/* This is a route to unassign caller from calling ticket */
router.post('/remove-new-cc',applicationsController.removeNewColdCallingData);

/* This is a route to render the cold calling UI. */
router.get('/cold-callings', coldCallingController.renderColdCallingsUi);
router.post('/cold-callings-ajex', coldCallingController.getAllColdCallingAjaxNew);
router.get('/edit-cold-calling', coldCallingController.renderEditColdCallingsUi);

/* This is a route to handle all the routes which are not defined in the application. */
router.get('*', function (req, res, next) {
	res.render('error/notFound');
});


module.exports = router;