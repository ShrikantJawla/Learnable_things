const accessMiddleware = require('../../common/checkAccessMiddleware');
const commonController = require('../../controller/commonController');
const commonModel = require('../../model/commonModel');
const iciciModel = require('../../model/icici/iciciApplicationModel');
const commonHelper = require('../../common/helper');
const encruptionFile = require('../../common/encruption');

let controllerObj = {};


controllerObj.renderEditApplicationsPageWithData = async function (req, res, next) {

	let middleObj = await accessMiddleware.checkAccessPermition(req, 5, 'T');
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req);
		if (req.query && req.query.id && req.query.id > 0) {
			let queryForData = `SELECT * FROM public.lead_assigning_user_junction
			LEFT JOIN card_applications_main_table on card_applications_main_table.id = lead_assigning_user_junction.lead_id
			LEFT JOIN icici_bank_application ON icici_bank_application.ca_main_table = card_applications_main_table.id 
			where junction_id = ${req.query.id}`;
			let dataTosend = await commonModel.getDataOrCount(queryForData, [], 'D');
			if (dataTosend && dataTosend.length > 0 && dataTosend[0].pan_card_number != '' ){
				dataTosend[0].pan_card_number = encruptionFile.decrypt( dataTosend[0].pan_card_number);
			}
			console.log(dataTosend, "datatata");
			res.render('icici/editIciciApplication', { sidebarDataByServer: sideBarData, dataToShow: dataTosend[0] });
		} else {
			res.render("error/noPermission");
		}

	} else {
		res.render("error/noPermission");
	}

}


controllerObj.updateIciciApplicationData = async function (req, res, next) {
	console.log(JSON.parse(req.body.formData));
	let dataBody = JSON.parse(req.body.formData);
	let updateToDb = false;
	console.log(dataBody, "dataBodydataBody");
	if (dataBody && dataBody.leftFormData) {
		if (dataBody.leftFormData.pancard && dataBody.leftFormData.pancard != ''){
			dataBody.leftFormData.pancard = encruptionFile.encrypt(dataBody.leftFormData.pancard);
		}
		updateToDb = await iciciModel.editTellyForm(dataBody);
	}
	let finalData = {
		status: false,
		code: "CIP--ICICI-EDIT-APPLICATION-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	if (updateToDb){
		finalData.status = true;
		finalData.code = "CIP--ICICI-EDIT-APPLICATION-101";
		finalData.message = "All OK";
		commonHelper.successHandler(res, finalData,)
	} else {
		commonHelper.errorHandler(res, finalData,);
	}
}


module.exports = controllerObj;