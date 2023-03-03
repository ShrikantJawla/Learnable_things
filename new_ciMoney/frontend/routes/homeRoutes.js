let router = require("express").Router();
let homeController = require('../controller/homeController');
let sessionMiddleWare = require('../utils/common/sessionMiddleware');

//route to render landing page according to the user login status
router.get('/', homeController.renderLandingPage);

router.get('/account', homeController.renderAccountPage);



// importing other routes 
router.use('/auth', require('./authRoutes'));



router.use('/logout',(req,res)=>{
	req.session.destroy();
	res.redirect('/');
})

// handeling default routes
router.get('*', function (req, res, next) {
	res.send('error')
});

module.exports = router;