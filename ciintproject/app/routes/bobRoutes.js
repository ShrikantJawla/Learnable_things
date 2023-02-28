/////////////////////////////////////////////
let bobApplicationController = require("../controller/bob/bobApplicationsController");
let bobUploadController = require("../controller/bob/bobUploadController");
let bobTeleController = require("../controller/bob/bobTeleController");
let bobColdCallingController = require("../controller/bob/bobColdCallingController");

let router = require('express').Router();


//////////////////////////----------- NEW VIEW ROUTES ------------------/////////////////////////////////

/* This is a route. It is telling the server that when a user goes to the url `/bob-applications-new`
it should run the function `bobApplicationController.getApplicationsNew`. */
router.get("/bob-applications-new", bobApplicationController.getApplicationsNew);
/* This is a route. It is telling the server that when a user goes to the url `/bob-applications-new`
it should run the function `bobApplicationController.getApplicationsNew`. */
router.post("/bob-applications-new-ajax", bobApplicationController.getApplicationsAjaxNew);

/* This is a route. It is telling the server that when a user goes to the url `/bob-tele-leads-new`
it should run the function `bobTeleController.getTeleApplicationsNew`. */
router.get('/bob-tele-leads-new', bobTeleController.getTeleApplicationsNew);

/* This is a route. It is telling the server that when a user goes to the url
`/bob-tele-leads-new-ajax`
it should run the function `bobTeleController.getTeleApplicationsAjaxNew`. */
router.post('/bob-tele-leads-new-ajax', bobTeleController.getTeleApplicationsAjaxNew);

//////////////////////////----------- END OF NEW VIEW ROUTES ------------------/////////////////////////////////

router.get('/bob-applications', bobApplicationController.getApplications);
router.get('/bob-upload', bobUploadController.uploadApplicationsUi);
router.post('/bob-upload-ajex', bobUploadController.uploadApplicationsAjex)
router.post('/export-csv', bobApplicationController.exportCsv);
router.get('/bob-tele-leads', bobTeleController.teleLeadsUi);


//get all application data pagination 
router.post('/get-all-applications-ajax', bobApplicationController.getApplicationsAjax);

router.get('/edit-bob-application-ui', bobApplicationController.editApplicationUi);
router.get('/get-bob-application-by-id', bobApplicationController.getApplicationDataById);
router.put('/update-bob-application', bobApplicationController.updateApplication);
router.post("/get-tele-applications-ajax", bobTeleController.getTeleApplicationsAjax);
router.get('/edit-tele-bob-application-ui', bobTeleController.editApplicationUi);
router.get('/cold-calling', bobColdCallingController.renderColdCallingsUi);
router.get('/edit-cold-calling', bobColdCallingController.renderEditColdCallingsUi);
router.get('*', function (req, res, next) {
	res.render('error/notFound')
})


module.exports = router