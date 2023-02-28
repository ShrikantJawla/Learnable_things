const commonController = require('../../controller/commonController');
const authModel = require('../../model/authentication/authModel');
const helper = require('../../common/helper');


let homeControllerObj = {};

homeControllerObj.home = async function (req, res, next) {

	let sideBarData = await commonController.commonSideBarData(req);
	res.render("home/dashboard.ejs",  {sidebarDataByServer : sideBarData});
}

homeControllerObj.formFilledInfo = async function(req, res, next){
	let formFilledData = false;
	formFilledData = await authModel.getFormFilledCounts();
	if(formFilledData === false){
		res.status(500).json("Error Getting Data")
	}else{
		res.status(200).json(formFilledData)
	}
	
}

homeControllerObj.creditCardInfo = async function(req, res, next){
	let creditCardData = false;
	creditCardData = await authModel.getAppliedCounts();
	if(creditCardData === false){
		res.status(500).json("Error Getting Data")
	}else{
		res.status(200).json(creditCardData)
	}
}

homeControllerObj.getBankData = async function(req, res, next){
	let bankData = false;
	switch (req.body.issuer_id) {
		case "1":
			bankData = await authModel.getAxisApplicationCount();
			break;
		case "2":
			bankData = await authModel.getBobApplicationCount();
			break;
		case "4":
			bankData = await authModel.getIdfcApplicationCount();
			break;
		case "7":
			bankData = await authModel.getAuApplicationCount();
			break;
		case "11":
			bankData = await authModel.getYesApplicationCount();
			break;
		default:
			console.log("Error Getting Bank Data")
			res.status(500).json("Error Getting Data")
			break;
	}
	if(bankData){
		res.status(200).json(bankData);
	}
}

homeControllerObj.getTeleStatsData = async function(req, res, next ){
	console.log(req.body, "------ request body ");
	console.log("hello");

	

	helper.successHandler(res, [], 200);
}

module.exports = homeControllerObj;