
const updateColdCallingController = require("../controller/coldCalling/updateColdCallingController");

let router = require('express').Router();



router.put('/update-cold-calling', updateColdCallingController.updateColdCallingData);






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

module.exports = router;