
/* Importing the modules. */
const accessMiddleware = require('../../common/checkAccessMiddleware');
const commonController = require("../../controller/commonController");
const commonModel = require("../../model/commonModel");
const coldCallingController = require("../../model/applications/coldCallingModel");
const editColdCallingModel = require("../../model/applications/editColdCallingModel")
/* Creating an empty object. */
let controllerObj = {};


/* A function which is used to render the `allColdCallingLeads.ejs` file. */
controllerObj.renderColdCallingsUi = async function(req, res, next){
	
	/* Checking the permission of the user. */
	let middleObj = await accessMiddleware.checkAccessPermition(req, 1, "W");
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
		/* Rendering the `allColdCallingLeads.ejs` file. */
	} else {
		/* Rendering the `noPermission.ejs` file. */
		res.render("error/noPermission");
	}

}

controllerObj.getAllColdCallingAjaxNew = async function (req, res, next) {
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	// console.log(req.body, "hi im in controller");
	let userdata = jwt.decode(req.session.userToken);
	req.body.userId = userdata.ua_id;
	let userLatestRole = await commonModel.getUserAdminRole(
		userdata.ua_id
	);
	req.body.userRole = userLatestRole[0].ua_role;
	let dataFromDb = await coldCallingController.getAllApplicationsNew(req.body);
	// console.log(dataFromDb, "data from db");
	if (dataFromDb) {
		res.render('applications/coldCallingListAjex' , {applicationsList : dataFromDb.applicationsData , totalCount : dataFromDb.count , getAllIssuers : dataFromDb.getAllIssuers , currentIssuer : req.body.issuerName})

	} else {
		// console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}

}

controllerObj.renderEditColdCallingsUi = async function(req, res, next){
	
	/* Checking the permission of the user. */
	let middleObj = await accessMiddleware.checkAccessPermition(req, 2, "T");
	if (middleObj) {
		/* Calling the `commonController.commonSideBarData` function and passing the `req` object to it. */
		let sideBarData = await commonController.commonSideBarData(req);
		let queryForData = `SELECT ua_id , ua_name FROM public.user_admin where ua_role = 3
		ORDER BY ua_id ASC `;
    	let allUsers = await commonModel.getDataOrCount(queryForData, [], 'D');
		let queryForIssuer = `SELECT * FROM public.ci_internal_all_banks ORDER BY id ASC `;
    	let allIssuer = await commonModel.getDataOrCount(queryForIssuer, [], 'D');
		/* Getting the data from the database. */
		let coldCallingData = await editColdCallingModel.getEditColdCallingData({idToFind: req.query.id});
		console.log(coldCallingData)
		res.render("coldCalling/editColdCalling", { sidebarDataByServer: sideBarData , allUsers : allUsers , allIssuers : allIssuer, data: coldCallingData});
		/* Rendering the `coldCallingCommon.ejs` file. */
	} else {
		/* Rendering the `noPermission.ejs` file. */
		res.render("error/noPermission");
	}

}


module.exports = controllerObj;