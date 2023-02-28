// imports here

let apiController = require('../externalApi/apiControllers/ciFormController');

//////////////////////
let router = require('express').Router();

	//	home routes here.....

// router.get('/', function (req, res, next) {
// 	console.log("api routes route");
// 	res.send({data: "CardInsider Api"});
// });

router.post('/ci-form', apiController.postFormData);

router.get('*', function(req, res, next){
	res.status(404).send({data: "Not found"});
});
router.post('*', function(req, res, next){
	res.status(404).send({data: "Not found"});
});



module.exports = router;