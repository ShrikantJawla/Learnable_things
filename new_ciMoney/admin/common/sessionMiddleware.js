const commonHelper = require('../common/helper');
let jwt = require('jsonwebtoken');


let middleObj = {};

middleObj.checkTheLoginStatus = function (req, res, next) {
	//console.log(req.session, "weghe9n");
	if (!req.session || !req.session.userToken) {
		res.redirect("/");
	} else {
		const loggedUser = jwt.decode(req.session.userToken);
		req.body.loggedUser = loggedUser;
		req.loggedUser = loggedUser;
		next()
	}
}


middleObj.checkTheLoginStatusForAjax = function (req, res, next) {
	if (!req.session || !req.session.userToken) {
		commonHelper.errorHandler(res, {
			status: false,
			message: "authentication error",
			code: "CIA-AUTH-101",
		})
	} else {
		next()
	}
}

module.exports = middleObj;