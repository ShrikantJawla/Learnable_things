

///////////////////////////////////////////////////////////////////////////////////////////////////

let citiApplicationsModel = require('../../model/citi/citiApplicationsModel')
let commonHelper = require('../../common/helper')
const CsvParser = require("json2csv").Parser

let accessMiddleware = require('../../common/checkAccessMiddleware')

let commonController = require("../../controller/commonController")

let controllerObj = {}

controllerObj.getApplications = async function (req, res, next) {



	let middleObj = await accessMiddleware.checkAccessPermition(req, 10, "W")
	if (middleObj) {
		let sideBarData = await commonController.commonSideBarData(req)
		res.render("citi/citiApplications.ejs", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

controllerObj.getApplicationsAjax = async function (req, res, next) {
	// //console.log(req.body, "request body ")
	let finalData = {
		status: false,
		code: "CIP-APPLICATION-ERR-102",
		message: "Something went wrong",
		payload: []
	}



	let dataFromDb = await citiApplicationsModel.getFilteredCitiApplications(req.body)
	// //console.log(dataFromDb, "data from db")


	if (dataFromDb) {
		//log(finalData, "final data in if");
		finalData.status = true
		finalData.code = "CIP-APPLICATION-SUC-102"
		finalData.message = "Operation performed successfully"
		finalData.payload = dataFromDb
		////console.log(finalData, "final data");
		commonHelper.successHandler(res, finalData)

	} else {
		//console.log(finalData, "final data in else")
		commonHelper.errorHandler(res, finalData,)
	}
}
controllerObj.exportCsv = async (req, res, next) => {
	const { applicationsData } = await citiApplicationsModel.exportCsv(JSON.parse(req.body.allData))
	const csvParser = new CsvParser()
	let csvData
	if (applicationsData.length == 0) {
		csvData = csvParser.parse({ "data": "no data found" })
	} else {
		csvData = csvParser.parse(applicationsData)
	}
	res.setHeader("Content-Type", "text/csv")
	res.status(200).end(csvData)
}
controllerObj.editApplicationUi = async (req, res, next) => {
	let sideBarData = await commonController.commonSideBarData(req)
	res.render('citi/editApplication', { sidebarDataByServer: sideBarData })
}
controllerObj.getApplicationDataById = async (req, res, next) => {
	let returnDataFromModel = await citiApplicationsModel.getApplicationDataById(
		parseInt(req.query.id)
	)
	let returnData = {
		status: true,
		code: 'CI-APP-EXISTING-CITI-APPLICATIONEDIT-101',
		payload: {
			...returnDataFromModel,
		}
	}
	commonHelper.successHandler(res, returnData)
}
controllerObj.updateApplication = async (req, res, next) => {

}
module.exports = controllerObj
