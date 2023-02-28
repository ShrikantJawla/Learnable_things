/* Importing the controller files. */
const iciciApplicationsController = require('../controller/icici/iciciApplicationController');
const editIciciApplicationController = require('../controller/icici/editIciciApplicationController');

/* Creating a router object. */
const router = require('express').Router();

/* This is a route. It is telling the server that when a user goes to the url `/icici-applications`
then the function `iciciApplicationsController.getApplications` should be called. */
router.get("/icici-applications", iciciApplicationsController.getApplications);



router.get("/icici-applications-rahul-ex", iciciApplicationsController.getApplicationsRahulEx);
router.post("/icici-applications-rahul-ex-ajax", iciciApplicationsController.getApplicationsAjaxRahulEx);
router.get("/tele-applications", iciciApplicationsController.getTeleApplications);

// Icici New Application Flow
router.get("/icici-applications-new", iciciApplicationsController.getApplicationsNew);
router.post("/icici-applications-new-ajax", iciciApplicationsController.getApplicationsAjaxNew);

// Icici New Application Flow Tele
router.get("/icici-tele-leads-new", iciciApplicationsController.getTeleApplicationsNew);
router.post("/icici-tele-leads-new-ajax", iciciApplicationsController.getTeleApplicationsAjaxNew);

// Router to render icici upload page
router.get("/icici-upload", iciciApplicationsController.renderIciciUploadFile); 
router.post("/icici-upload-ajex", iciciApplicationsController.renderIciciUploadFileAjex);


router.post("/get-all-applications-icici-ajax", iciciApplicationsController.getApplicationsAjax);
/* This is a route. It is telling the server that when a user goes to the url
`/get-tele-applications-icici-ajax`
then the function `iciciApplicationsController.getApplicationsAjax` should be called. */
router.post("/get-tele-applications-icici-ajax", iciciApplicationsController.getTeleApplicationsAjax);


/* Telling the server that when a user goes to the url `/edit-icici-application`
then the function `editIciciApplicationController.renderEditApplicationsPageWithData` should be
called. */
router.get('/edit-icici-application', editIciciApplicationController.renderEditApplicationsPageWithData);

/* Telling the server that when a user goes to the url `/update-icici-application-data`
then the function `editIciciApplicationController.updateIciciApplicationData` should be called. */
router.post('/update-icici-application-data', editIciciApplicationController.updateIciciApplicationData);


/* This is a route. It is telling the server that when a user goes to any url that is not defined in
the router then the function `res.render('error/notFound')` should be called. */
router.get('*', function (req, res, next) {
	res.render('error/notFound')
});





/* Exporting the router object so that it can be used in other files. */
module.exports = router;