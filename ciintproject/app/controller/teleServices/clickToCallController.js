
const makeCallModel = require("../../model/teleServices/makeCallModel");
const commonHelper = require("../../common/helper");
let controllerObj = {};


/**
 * It checks if the string is a 10 digit number and if it is, it checks if it is a valid Indian mobile
 * number
 * 
 * Args:
 *   str: The string to be validated.
 * 
 * Returns:
 *   A function that takes a string as an argument and returns a boolean value.
 */
let validateNumber = function (str) {
	if (str.length == 10) {
		// Regular expression to check if string is a Indian mobile number
		const regexExp = /^[6-9]\d{9}$/gi;
		return regexExp.test(str);
	} else {
		return false;
	}
}

controllerObj.makeCallToCustomer = async function (req, res, next) {
	console.log(req.body, "request body of makeCallToCustomer");
	let returnData = {
		status: false,
		code: "CIP-CALL-ERROR-101",
		message: "Something went wrong",
		payload: []
	}
	let destinationNumber
	// = "7906957815";
	= req.body.destination_number;
	let issuerId 
	= req.body.issuerId;
	//= '7';
	if (req.body.loggedUser.ua_telenumber) {
		let validNumberResult = validateNumber(destinationNumber);
		let agentNumber = req.body.loggedUser.ua_telenumber;
		//console.log(validNumberResult);
		if (validNumberResult) {
			destinationNumber = "+91" + destinationNumber;
			console.log(destinationNumber);

			let callerIdResponse = await makeCallModel.getCallerIdForMakeCall({userId: req.body.loggedUser.ua_id, issuerId: issuerId});

			console.log(callerIdResponse, "caller id response");
			let makeCallResponse 
			if(callerIdResponse){
			makeCallResponse =  makeCallModel.makeCallToDestination({ destinationNumber: destinationNumber, agentNumber: agentNumber, callerId: callerIdResponse});
			}

			
			console.log(makeCallResponse, "demo");
			returnData.status = true;
			returnData.code = "CIP-CALL-200";
			returnData.message = "Operation performed successfully";
			returnData.payload = [];
			commonHelper.successHandler(res, returnData, 200);
		} else {
			returnData.status = false;
			returnData.code = "CIP-CALL-ERROR-104";
			returnData.message = "Customer Mobile not valid";
			commonHelper.errorHandler(res, returnData, 403);
		}

	} else {
		returnData.status = false;
		returnData.code = "CIP-CALL-ERROR-103";
		returnData.message = "call not allowed";
		commonHelper.errorHandler(res, returnData, 400);
	}


}

module.exports = controllerObj;
