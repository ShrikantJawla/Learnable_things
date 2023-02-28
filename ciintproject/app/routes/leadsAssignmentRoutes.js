
const leadsAssignController = require('../controller/leads/leadsAssignmentController');

//////////////////////////////////////////////

let router = require('express').Router();

router.post('/assign-new-lead', leadsAssignController.assignNewLeads);

router.get('*', function (req, res, next) {
	res.render('error/notFound')
});


module.exports = router;