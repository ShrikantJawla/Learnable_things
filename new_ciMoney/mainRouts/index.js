
let router = require('express').Router();
let adminRout =  require('../admin/routes/homeRoutes');
let front =  require('../frontend/routes/homeRoutes');
//		home routes here.....
router.use('/admin', adminRout);
router.use('/', front);




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