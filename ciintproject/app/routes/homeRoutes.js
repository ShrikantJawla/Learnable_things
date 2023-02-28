
const authController = require('../controller/authentication/authController');
const sessionMiddleware = require('../common/sessionMiddleware');
const auController = require('../controller/au/auUploadController');

/////////////////////////////////////////////

let router = require('express').Router();

//		home routes here.....
router.get('/', authController.signInUi);
router.use('/dashboard', sessionMiddleware.checkTheLoginStatus, require('./dashboardRoutes'));

router.post('/au-demo' , auController.demoData);



/// authentication routes here...........

router.get('/sign-in', authController.signInUi);
router.post("/sign-in-data", authController.signinData);
router.post("/sign-out-user", authController.signOutData);




router.use('/applications', sessionMiddleware.checkTheLoginStatus, require('./applicationsRoute'));
router.use('/axis', sessionMiddleware.checkTheLoginStatus, require('./axisBankRoutes'));
router.use('/bob', sessionMiddleware.checkTheLoginStatus, require('./bobRoutes'));
router.use('/yes', sessionMiddleware.checkTheLoginStatus, require('./yesRoutes'));
router.use('/citi', sessionMiddleware.checkTheLoginStatus, require('./citiRoutes'));
router.use('/idfc', sessionMiddleware.checkTheLoginStatus, require('./idfcBankRoutes'));
router.use('/au', sessionMiddleware.checkTheLoginStatus, require('./auBankRoutes'));
router.use('/icici', sessionMiddleware.checkTheLoginStatus, require('./iciciBankRoutes'));
router.use('/factory', sessionMiddleware.checkTheLoginStatus, require('./factoryRoutes'));
router.use('/users', sessionMiddleware.checkTheLoginStatus, require('./userAdminRoutes'));
router.use('/pincodes', sessionMiddleware.checkTheLoginStatus, require('./pinCodesRoutes'));
router.use('/cc', sessionMiddleware.checkTheLoginStatus, require('./coldCallingRoutes'));
router.use('/ts', sessionMiddleware.checkTheLoginStatus, require('./teleServicesRoutes'));
router.use('/calling', sessionMiddleware.checkTheLoginStatus, require('./callingRoute'));
router.use('/leads', sessionMiddleware.checkTheLoginStatus, require('./leadsAssignmentRoutes'));



////////// api routes here.....

router.use('/api/v1', require('../../externalApi/apiRoutes'));

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