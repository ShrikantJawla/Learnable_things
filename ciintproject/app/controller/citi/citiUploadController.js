let controllerObj = {};


let commonController = require("../../controller/commonController");

let accessMiddleware = require('../../common/checkAccessMiddleware');


controllerObj.uploadApplicationsUi = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 10, "R")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render("citi/citiFileUpload", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}
controllerObj.uploadApplicationsAjex = async function (req, res, next) {
	//console.log(JSON.parse(req.body.allParsedData), "------------>>>>>> request data");
	let allParsedData = JSON.parse(req.body.allData);
	console.log(allParsedData);
}

module.exports = controllerObj;