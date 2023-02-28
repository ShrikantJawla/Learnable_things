/* Importing the helper file from the common folder. */
const commonHelper = require("../../common/helper");

const coldCallingModel = require("../../model/coldCalling/updateColdCallingModel");

/* Creating an empty object. */
let controllerObj = {};


/* This is a function which is used to update the data in the database. */
controllerObj.updateColdCallingData = async function(req, res, next){
	console.log(req.body, "request body ");
	let returnData = {
		status: false,
		code: "CIP-CC-ERR-101",
		message: "Something went wrong",
		payload: []
	}
	if(req.body && req.body.cc_id){
		let dataFromModel = coldCallingModel.updateColdCallingModel({dataToUpdate : req.body});
		if(dataFromModel){
			returnData.status = dataFromModel;
			returnData.code =  "CIP-CC-101"
			returnData.message = "operation performed ";
			commonHelper.successHandler(res, returnData, 200);
		}else{
			returnData.status = dataFromModel;
			commonHelper.errorHandler(res, returnData, 504);
		}

	}else{
		returnData.code = "CIP-CC-ERR-102";
		returnData.status = false;
		returnData.message = "Data Missing";

		commonHelper.errorHandler(res, returnData, 400);
	}

}

/* Exporting the controllerObj object. */
module.exports = controllerObj;