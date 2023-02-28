
const accessMiddleware = require('../../common/checkAccessMiddleware');
const commonController = require('../../controller/commonController');
const commonHelper = require('../../common/helper');


const pincodeModel = require('../../model/pincodes/postPincodeModel');


let controllerObj = {};


controllerObj.renderPincodeUploadUi = async function (req, res, next) {
	console.log("first");
	let middleObj = await accessMiddleware.checkAccessPermition(req, 57, "R");
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		res.render('pincodes/uploadPincodes.ejs', { sidebarDataByServer: sideBarData });

	} else {
		res.render("error/noPermission");
	}

}


controllerObj.postPincodeData = async function(req, res, next){

	let userdata = jwt.decode(req.session.userToken);
	
	let allData = JSON.parse(req.body.allData);
	console.log(allData);
	let returnData = {
		"status": false,
		"code": "All-banks-pincodes-ERR-101",
		"message": "something went wrong",
		"payload": []
	}
	let datafromModel = await pincodeModel.postPincodesData({insertData: allData.sheetData, bankName: allData.bankName, bankId: allData.bankId, user: userdata.ua_id});

	if (datafromModel) {
		returnData.status = true;
		returnData.code = "All-banks-pincodes-Success-101";
		returnData.message = "Operation performed !!";
		returnData.payload = datafromModel;

		commonHelper.successHandler(res, returnData);

	} else {
		commonHelper.errorHandler(res, returnData);
	}
}



module.exports = controllerObj;