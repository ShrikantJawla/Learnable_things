/* This is importing the helper and model files. */
const commonHelper = require('../../common/helper');
const handleAsignmentsModel = require('../../model/teleServices/handleAssignmentsModel');
/* Creating an empty object. */
let controllerObj = {};


/* This is a function that is called when a user wants to add or remove a permit to another user. */
controllerObj.handleTeleAssignments = async function (req, res, next) {
	let returnData = {
		status: true,
		code: "CIA-APP-PERMIT-NEW-101",
		payload: false,
	};

	let dataFromModel = await handleAsignmentsModel.handleAddRemoveAssignments({...req.body});


	if (dataFromModel !== false) {
		returnData.payload = dataFromModel;
		commonHelper.successHandler(res, returnData);
	} else {
		returnData.status = false;
		returnData.code = "CIA-APP-PERMIT-NEW-ERROR-105";
		commonHelper.errorHandler(res, returnData);

	}

}


/* This is a function that is called when a user wants to reassign a permit to another user. */
controllerObj.handleReassignments = async function (req, res, next) {
	let returnData = {
	  status: true,
	  code: "CIA-APP-REPERMIT-NEW-101",
	  payload: false,
	};
	let dataFromModel = await handleAsignmentsModel.handleReassignAssignments({...req.body});
	if (dataFromModel) {
	  returnData.payload = dataFromModel;
	  commonHelper.successHandler(res, returnData);
  
	} else {
	  returnData.status = false;
	  returnData.code = "CIA-APP-REPERMIT-NEW-ERROR-101";
	  commonHelper.errorHandler(res, returnData);
	}
  
  }
  




/* Exporting the controllerObj object so that it can be used in other files. */
module.exports = controllerObj;