
const authController = require('../controller/authentication/authController');
const sessionMiddleware = require('../common/sessionMiddleware');

/////////////////////////////////////////////

let router = require('express').Router();

//		home routes here.....
router.get('/', authController.signInUi);
router.use('/dashboard', sessionMiddleware.checkTheLoginStatus, require('./dashboardRoutes'));




/// authentication routes here...........

router.get('/sign-in', authController.signInUi);
router.post("/sign-in-data", authController.signinData);
router.post("/sign-out-user", authController.signOutData);




router.use('/users', sessionMiddleware.checkTheLoginStatus, require('./userAdminRoutes'));
router.use('/siteUsers', sessionMiddleware.checkTheLoginStatus, require('./siteUsersRoutes'));
router.use('/categories', sessionMiddleware.checkTheLoginStatus,require('./categoriesRoutes'))
router.use('/offers', sessionMiddleware.checkTheLoginStatus,require('./offersRoutes'))



////////// api routes here.....


router.get('*', function (req, res, next) {
	res.render('error/notFound')
});


router.post('*', function (req, res, next) {
	res.render('error/notFound')
});


router.put('*', function (req, res, next) {
	res.render('error/notFound')
});


module.exports = router;