
/* Importing the `clickToCallController` module from the `controller/teleServices` folder. */
const makeCallController = require('../controller/teleServices/clickToCallController');
const handleTeleAssignmentsController = require('../controller/teleServices/handleTeleAssignmentsController');

/* Creating a new router object. */
let router = require("express").Router();


/* This is a route to handle the post request for the url `/make-call`. */
router.post('/make-call', makeCallController.makeCallToCustomer);


/* This is a route to handle the post request for the url `/manage-tele-assignments`. */
router.post('/manage-tele-assignments', handleTeleAssignmentsController.handleTeleAssignments);

/* This is a route to handle the post request for the url `/manage-reassign-assignments`. */
router.post('/manage-reassign-assignments', handleTeleAssignmentsController.handleReassignments);

/* This is a route to handle all the routes which are not defined in the application. */
router.get('*', function (req, res, next) {
	res.render('error/notFound');
});

/* This is a route to handle all the routes which are not defined in the application. */
router.post('*', function (req, res, next) {
	res.render('error/notFound');
});

/* This is a route to handle all the routes which are not defined in the application. */
router.put('*', function (req, res, next) {
	res.render('error/notFound');
});


/* Exporting the router object to be used in other files. */
module.exports = router;