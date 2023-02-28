
const commonHelper = require('../../common/helper');
const commonModel = require("../../model/commonModel/commonModel")
let controllerObj = {};

controllerObj.assignNewLeads = async function(req, res, next){
	let assignData = await commonModel.assignToTelly(req.body);
	commonHelper.successHandler(res, {}, 200);
}

module.exports = controllerObj;