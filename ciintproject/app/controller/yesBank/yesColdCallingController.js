/* Importing the modules. */
const accessMiddleware = require('../../common/checkAccessMiddleware');
const commonController = require("../commonController");
const commonModel = require("../../model/commonModel");
const yesEditColdCallingModel = require("../../model/yesBank/yesEditColdCallingModel");

let controllerObj = {}
/* A function which is used to render the `yesColdCalling.ejs` file. */
controllerObj.renderColdCallingsUi = async function(req, res, next){
	
	/* Checking the permission of the user. */
	let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "T");
	if (middleObj) {
		/* Calling the `commonController.commonSideBarData` function and passing the `req` object to it. */
		let sideBarData = await commonController.commonSideBarData(req);
		let queryForData = `SELECT ua_id , ua_name FROM public.user_admin where ua_role = 3
		ORDER BY ua_id ASC `;
    	let allUsers = await commonModel.getDataOrCount(queryForData, [], 'D');
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks ORDER BY id ASC `;
    	let allIssuer = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		// console.log(allIssuer , "allIssuer");
		res.render("coldCalling/coldCallingCommon", { sidebarDataByServer: sideBarData , allUsers : allUsers , allIssuers : allIssuer })
		/* Rendering the `yesColdCalling.ejs` file. */
	} else {
		/* Rendering the `noPermission.ejs` file. */
		res.render("error/noPermission");
	}

}

controllerObj.renderEditColdCallingsUi = async function(req, res, next){
	
	/* Checking the permission of the user. */
	let middleObj = await accessMiddleware.checkAccessPermition(req, 12, "T");
	if (middleObj) {
		/* Calling the `commonController.commonSideBarData` function and passing the `req` object to it. */
		let sideBarData = await commonController.commonSideBarData(req);
		let queryForData = `SELECT ua_id , ua_name FROM public.user_admin where ua_role = 3
		ORDER BY ua_id ASC `;
    	let allUsers = await commonModel.getDataOrCount(queryForData, [], 'D');
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks ORDER BY id ASC `;
    	let allIssuer = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		/* Getting the data from the database. */
		let coldCallingData = await yesEditColdCallingModel.getYesEditColdCallingData({idToFind: req.query.id});
		res.render("coldCalling/editColdCalling", { sidebarDataByServer: sideBarData , allUsers : allUsers , allIssuers : allIssuer, data: coldCallingData});
		/* Rendering the `coldCallingCommon.ejs` file. */
	} else {
		/* Rendering the `noPermission.ejs` file. */
		res.render("error/noPermission");
	}

}

module.exports = controllerObj