/* This is importing the callingController.js file. */
const callingController = require('../controller/calling/callingController.js');

/* Creating a new router object. */
let router = require('express').Router();

/* This is a route that will render the manage phone number page. */
router.get("/manage-bank-numbers", callingController.renderManagePhoneNumber);

// This is the route to get all caller ids according to issuer 

router.post("/get-caller-id-with-issuer",callingController.getCallerIdWithIssuer);
/* This is a route that will be called when the user clicks the "Get Tele Users" button on the manage
phone number page. */
router.post('/get-tele-users-mn', callingController.getTeleUsersInCallerIds);

router.post("/unassign-caller-id", callingController.unassignCallerId)
router.post('/get-default-caller-id', callingController.getDefaultCallerIdWithIssuer);

/* This is a route that will be called when the user clicks the "Add New Caller ID" button on the
manage
phone number page. */
router.post('/post-new-caller-id', callingController.postNewCallerId);

router.post('/add-bank-numbers', callingController.addNewNumber);

router.get('*', function (req, res, next) {
/* This is a catch all route. If the user goes to a route that does not exist, this route will be
called. */
	res.render('error/notFound')
});

/* This is a way to export the router object so that it can be used in other files. */
module.exports = router;