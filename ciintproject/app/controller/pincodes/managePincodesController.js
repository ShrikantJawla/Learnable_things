
/* Importing the accessMiddleware and commonController modules. */
const accessMiddleware = require('../../common/checkAccessMiddleware');
const commonController = require('../../controller/commonController');
const commonHelper = require('../../common/helper');

const allPincodesModel = require('../../model/pincodes/allPincodesDataModel');

/* Creating an empty object. */
let controllerObj = {};

/* Rendering the view of all pincodes. */
controllerObj.renderAllPincodesUi = async function(req, res, next){
	console.log("hello from pincodes ");
	let middleObj = await accessMiddleware.checkAccessPermition(req, 8, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render('pincodes/allPincodes', { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission")
	}
}


controllerObj.getAllPincodesData = async function(req, res, next){
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-PINCODE-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	let pincodesData = await allPincodesModel.getAllPincodesData(req.body);

	if(pincodesData){
		finalData.status = true;
		finalData.code = "CIP-APPLICATION-PINCODE-Success-101";
		finalData.message = "Operation performed successfully";
		finalData.payload = pincodesData;
		commonHelper.successHandler(res, finalData);
	}else{
		commonHelper.errorHandler(res, finalData);
	}

}



/* Exporting the controllerObj object. */
module.exports = controllerObj;