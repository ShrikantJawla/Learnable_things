
let commonHelper = require('../common/helper')

let processTransactionModel = require('../model/processTransactionModel')
let transacationsModel = require('../model/transactionModel')
let completeTransactionModel = require('../model/completeTransactionModel')

let transactionsControllerObj = {}
const middleWearObj = require("../common/middleware")
const commonControllerObj = require("./commonController");
const CsvParser = require("json2csv").Parser



transactionsControllerObj.renderTransactionsPage = async function (req, res, next) {
	let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 2, "R")
	if (middleWearObjRes) {
		let sideBarData = await commonControllerObj.commonSideBarData(req)
		res.render("cashbacks/transactionsList", { sidebarDataByServer: sideBarData })
	} else {
		res.render("error/noPermission")
	}
}

transactionsControllerObj.insertTransaction = async function (req, res, next) {
	let processData = JSON.parse(req.body.id);
	console.log(processData);
	let result = [];
	if (processData && processData.length > 0) {
		let userdata = jwt.decode(req.session.userToken);
		let updated_by = userdata.ua_strapi ?? 1;
		for (let i = 0; i < processData.length; i++) {
			let modelData = await processTransactionModel.processTransactionNew(processData[i], updated_by);
			console.log(modelData, "modelDatamodelData");
			result.push({ id: processData[i], data: modelData });
		}


	}
	commonHelper.successHandler(res, { payload: result })

}
/* This is a function which is used to process the transaction. */
transactionsControllerObj.processTransaction = async function (req, res, next) {

	let userdata = jwt.decode(req.session.userToken)
	let updated_by = userdata.ua_strapi ?? 1
	//let updated_by = 1;

	let returnData = {
		status: false,
		code: "CIA-Transaction-err-101",
		message: 'Not a valid identifier',
		payload: [],
	}

	if (req.body.identifier) {

		//console.log('HI i am in');
		let modelData = await processTransactionModel.processTransaction(req.body.identifier, updated_by)

		if (modelData.status == true) {

			returnData.status = true
			returnData.code = "CIA-Transaction-101"
			returnData.message = "Success!!"
			returnData.payload = modelData
			commonHelper.successHandler(res, returnData)
		} else {
			returnData.code = modelData.code
			commonHelper.errorHandler(res, returnData)

		}

	} else {

		commonHelper.errorHandler(res, returnData)

	}
}


/* This is a function which is used to complete the transaction. */
transactionsControllerObj.completeTransaction = async function (req, res, next) {


	let userdata = jwt.decode(req.session.userToken);
	let updated_by = userdata.ua_strapi ?? 1
	// let updated_by = 1;

	console.log(req.body, "request body in line 73");

	let returnData = {
		status: false,
		code: "CIA-Transaction-err-201",
		message: 'Not a valid identifier',
		payload: [],
	}

	if (req.body.transId && req.body.transStatus) {
		let dataFromModel = await completeTransactionModel.completeTransaction(req.body.transId, req.body.transStatus, req.body.transNote, updated_by)
		console.log(dataFromModel, " \n\n\n data from model \n\n\n")
		if (dataFromModel.status == true) {
			returnData.status = true
			returnData.code = "CIA-Transaction-202"
			returnData.message = "Success!!"
			returnData.payload = dataFromModel

			commonHelper.successHandler(res, returnData)

		} else {
			returnData.code = dataFromModel.code
			commonHelper.errorHandler(res, returnData)

		}

	} else {

		commonHelper.errorHandler(res, returnData)

	}

}

transactionsControllerObj.getFilteredTransactions = async function (req, res, next) {
	let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 2, "R")
	if (middleWearObjRes) {
		let { returnDataFromModal, count } = await transacationsModel.getFilteredTransactions(req.body);
		let transactionList = [];
		let notMatchTransactionUpi = []
		//console.log(returnDataFromModal)
		for (let k = 0; k < returnDataFromModal.length; k++) {

			if (returnDataFromModal[k].td_method == 'bank') {
				if ((returnDataFromModal[k].td_account_number != returnDataFromModal[k].account_number) && (returnDataFromModal[k].td_ifsc_code != returnDataFromModal[k].ifsc_code) && (returnDataFromModal[k].td_status == 'Processing')) {
					returnDataFromModal[k].td_status = 'Cancelled'
					transactionList.push(returnDataFromModal[k])
					notMatchTransactionUpi.push(returnDataFromModal[k])
				} else {
					transactionList.push((returnDataFromModal[k]))
				}
			} else if (returnDataFromModal[k].td_method == 'upi') {
				if ((returnDataFromModal[k].td_upi_id != returnDataFromModal[k].upi_id) && (returnDataFromModal[k].td_status == 'Processing')) {
					returnDataFromModal[k].td_status = 'Cancelled'
					transactionList.push(returnDataFromModal[k])
					notMatchTransactionUpi.push(returnDataFromModal[k])
				} else {
					transactionList.push((returnDataFromModal[k]))
				}
			}
		}
		if (notMatchTransactionUpi.length > 0) {
			let updateTheNotVerifyData = await transacationsModel.updateTransactionStatus(notMatchTransactionUpi)
		}
		let returnData = {
			status: true,
			code: 'CIA-APP-FILTEREDTRANSACTIONS-101',
			payload: {
				transactionsList: transactionList,
				count,
			}
		}

		commonHelper.successHandler(res, returnData)
	}
	else {
		res.render("error/noPermission")
	}
}

transactionsControllerObj.viewTransactionDetailsById = async function (req, res, next) {
	console.log(req.query.id, "dsgsdf");
	if (req.query.id) {
		let returnData = await transacationsModel.fetchTransactionDetailsById(req.query.id);
		if (req.query.html === "false") {
			res.status(200).json({
				transactionDetail: returnData,
			})
		} else {
			if (returnData == null || returnData.length === 0) {
				res.status(404).send({ data: "No record Found" })
			} else {
				let middleWearObjRes = await middleWearObj.checkAccessPermition(
					req,
					2,
					"W"
				)
				if (middleWearObjRes) {
					let sideBarData = await commonControllerObj.commonSideBarData(req)
					res.status(200).render("cashbacks/viewTransactionDetails", {
						transactionDetail: returnData,
						sidebarDataByServer: sideBarData,
					})
				} else {
					res.render("error/noPermission")
				}
			}
		}
	} else {
		res.status(404).json({ errMessage: "Please provide an Id" })
	}
	return "success"
}


transactionsControllerObj.exportCsv = async function (req, res, next) {
	console.log(req.body);
	let transactionIdListToExport = JSON.parse(req.body.selectedIds);
	if (transactionIdListToExport.length > 0) {
		let getTransactionDataAccordingToNeed = await transacationsModel.exportCsv(transactionIdListToExport);
		//console.log(getTransactionDataAccordingToNeed);
		if (getTransactionDataAccordingToNeed && getTransactionDataAccordingToNeed.length > 0) {
			const csvParser = new CsvParser()
			let csvData
			if (getTransactionDataAccordingToNeed.length == 0) {
				csvData = csvParser.parse({ "data": "no data found" })
			} else {
				csvData = csvParser.parse(getTransactionDataAccordingToNeed).replace(/['"]+/g, '');
				//console.log(csvData)
			}
			//console.log(csvData);
			res.setHeader("Content-Type", "text/csv")
			res.setHeader("Content-Disposition", "attachment; filename=cardInsiderAdminPS.csv")
			res.status(200).end(csvData)
		}
	}
}


transactionsControllerObj.renderUploadTransactionsPage = async function (req, res, next) {
	let middleWearObjRes = await middleWearObj.checkAccessPermition(req, 2, "W");
	if (middleWearObjRes) {
		let sideBarData = await commonControllerObj.commonSideBarData(req);
		res.render("cashbacks/uploadTransactionsReportPage", { sidebarDataByServer: sideBarData });
	} else {
		res.render("error/noPermission");
	}
}

transactionsControllerObj.uploadAndProcessTransactionReport = async function (req, res, next) {

	let returnData = {
		status: false,
		code: "CIA-Transaction-err-401",
		message: 'Not a valid identifier',
		payload: [],
	}

	//res.send({ "data": "hello world!!" });
	let userdata = jwt.decode(req.session.userToken);
	let updated_by = userdata.ua_strapi ?? 1
	if (req.body.alldata) {
		let sheetData = JSON.parse(req.body.alldata);
		let returnDataArry = [];
		//console.log(sheetData);
		//let updateTransactionStatus = transacationsModel.makeTransactionsComplete(sheetData);
		if (sheetData && sheetData.length > 0) {
			console.log(sheetData[0], "sheetDatasheetData");
			console.log(sheetData[1], "sheetDatasheetData");
			for (let i = 0; i < sheetData.length; i++) {

				let transactionUuId = sheetData[i]['bill_reference_no_optional'];
				if (!transactionUuId) {
					transactionUuId = sheetData[i]['bill_reference_no__optional'];
				}
				let transactionStatus = 'Cancelled';
				let transactionNote = "";
				sheetData[i]['status'] = sheetData[i]['status'].trim();
				if (sheetData[i]['status'] != "SUCCEEDED" && sheetData[i]['errors'] != "") {
					//console.log("hi im in line 247")
					transactionStatus = 'Failed';
					transactionNote = "Failed by sheet upload";
				} else if (sheetData[i]['status'] == "SUCCEEDED") {
					//console.log("hi im in line 251")
					transactionStatus = 'Completed';
					transactionNote = "Completed by upload sheet";
				} else {
					//console.log("hi im in line 255")
					transactionStatus = 'Cancelled';
					transactionNote = "";
				}
				// if (transactionUuId  == '8e42faba-4a25-41f9-9a12-7df828bc8c21'){
				// 	console.log(transactionUuId , 'transactionUuIdtransactionUuId',transactionStatus, transactionNote);
				// }

				let dataFromModel = await completeTransactionModel.completeTransaction(transactionUuId, transactionStatus, transactionNote, updated_by);
				//console.log(dataFromModel);
				returnDataArry.push(dataFromModel);

			}
			console.log(returnDataArry, "returnDataArryreturnDataArry");
			returnData.code = "CIA-Transaction-Success-405";
			returnData.message = 'Operation Performed ';
			returnData.status = true;
			//returnData.payload = returnDataArry;
			//console.log(returnData);
			commonHelper.successHandler(res, returnData);

		} else {
			returnData.code = "CIA-Transaction-err-402";
			returnData.message = 'Sheet empty';
			commonHelper.errorHandler(res, returnData);
		}

	} else {
		commonHelper.errorHandler(res, returnData);

	}

}

module.exports = transactionsControllerObj