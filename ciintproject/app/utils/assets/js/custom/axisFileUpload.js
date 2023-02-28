let FILEUPLOADDATA = {}
FILEUPLOADDATA.allApplications = []
FILEUPLOADDATA.exlSheetData = []
FILEUPLOADDATA.matchedUserData = []



FILEUPLOADDATA.validateFileToUpload = function () {
	console.log("hello from validateFileToUpload")
	let uploadFile = document.getElementById("fileUpload").files[0]
	console.log("fileUpload", uploadFile)
	if (uploadFile && uploadFile.size > 0 && uploadFile.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		FILEUPLOADOBJ.postFileData(uploadFile)


	} else {
		alert("Please select a valid file to upload")
	}
}



$("body").on("click", "#upload", function () {
	$("#loader").show()
	//Reference the FileUpload element.
	var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/
	if (regex.test(fileUpload.value.toLowerCase())) {
		console.log(fileUpload.files, "dddddddddd")
		if (typeof (FileReader) != "undefined") {
			var reader = new FileReader()
			//For Browsers other than IE.
			if (reader.readAsBinaryString) {
				console.log('111')
				reader.onload = function (e) {
					FILEUPLOADDATA.ProcessExcel(e.target.result)
				}
				reader.readAsBinaryString(fileUpload.files[0])
			} else {
				console.log('2222')
				//For IE Browser.
				reader.onload = function (e) {
					var data = ""
					var bytes = new Uint8Array(e.target.result)
					for (var i = 0; i < bytes.byteLength; i++) {
						data += String.fromCharCode(bytes[i])
					}
					FILEUPLOADDATA.ProcessExcel(data)
				}
				reader.readAsArrayBuffer(fileUpload.files[0])
			}

		} else {

			alert("This browser does not support HTML5.")
		}
	} else {

		alert("Please upload a valid Excel file.")
	}

})

FILEUPLOADDATA.ProcessExcel = function (data) {
	//Read the Excel File data.
	var workbook = XLSX.read(data, {
		type: 'binary'
	});
	console.log("workbook", workbook.Sheets);
	let sheetArr = [];
	for(let i = 0; i < workbook.SheetNames.length; i++){
		let sheetName = workbook.SheetNames[i]
		let sheet = workbook.Sheets[sheetName]
		let sheetData = XLSX.utils.sheet_to_json(sheet, {
				header: 0,
				defval: ""
			});
		sheetArr.push(sheetData);
	}
	const arrLengths = sheetArr.map(a => a.length);
	const maxLength = arrLengths.indexOf(Math.max(...arrLengths));
	console.log("maxLength", maxLength);
	console.log("sheetArr", sheetArr);
	//Fetch the name of First Sheet.
	//var firstSheet = workbook.SheetNames[1];
	//Read all rows from First Sheet into an JSON array.
	let excelRows = sheetArr[maxLength];
	// var excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], {
	// 	header: 0,
	// 	defval: ""
	// });
	console.log(" excel rows-------->>.",excelRows)
	FILEUPLOADDATA.exlSheetData = excelRows
	FILEUPLOADDATA.matchData()
	//FILEUPLOADDATA.getAllUsersData();
}

FILEUPLOADDATA.matchData = function () {
	if (FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {

		FILEUPLOADDATA.matchedUserData = []
		for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {
			let isMatched = false
			let cardApplicantMobileNum = FILEUPLOADDATA.exlSheetData[i]['MOBILE_NO']
			cardApplicantMobileNum.trim()
			let lastSixDigit = cardApplicantMobileNum.substr(cardApplicantMobileNum.length - 6)
			let firstTwoDigit = cardApplicantMobileNum.substring(0, 2)
			let machedOne = {
				"main_table": '',
				"mobile_number": firstTwoDigit + '-' + lastSixDigit,
				"application_id": FILEUPLOADDATA.exlSheetData[i]['APPLICATION_NO'],
				"final_status": FILEUPLOADDATA.exlSheetData[i]['FINAL STATUS'],
				"card_type": FILEUPLOADDATA.exlSheetData[i]['CARDTYPE'],
				"date": FILEUPLOADDATA.exlSheetData[i]['DATE'],
				"ipa_status": FILEUPLOADDATA.exlSheetData[i]['IPA STATUS'],
				"reason": FILEUPLOADDATA.exlSheetData[i]['REASON'],
				'name': '',
				'revised_date': FILEUPLOADDATA.exlSheetData[i]['DATE2'],
				'BLAZE_OUTPUT' : FILEUPLOADDATA.exlSheetData[i]['BLAZE_OUTPUT'],
				'send_to_channel' : FILEUPLOADDATA.exlSheetData[i]['Send to Channel'],
				'EXISTING_C' : FILEUPLOADDATA.exlSheetData[i]['EXISTING_C'],
				'LEAD_ERROR_LOG' : FILEUPLOADDATA.exlSheetData[i]['LEAD ERROR LOG'],
				'LIVE_FEEDBACK_STATUS' : FILEUPLOADDATA.exlSheetData[i]['LIVE FEEDBACK STATUS'],
			}
			FILEUPLOADDATA.matchedUserData.push(machedOne)
			isMatched = true
		}
		console.log("matchedUserDatamatchedUserData--", FILEUPLOADDATA.matchedUserData)
		FILEUPLOADDATA.entryToDb()
	}
}

FILEUPLOADDATA.entryToDb = async function () {
	console.log('HI I AM IN THIS')
	let returnResult = false
	// $('#loader-overlay').addClass('loader-display');
	await $.ajax({
		url: "/axis/axis-upload-ajex",
		type: "POST",
		// contentType: "application/jsonrequest",
		// dataType: 'json',
		data: {
			"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData)
		},

		beforeSend: function () {
			// $('#loader-overlay').addClass('loader-display')
			//$("#loader").show();
		},

		success: function (result) {
			console.log(result, "resultresultresultresultresultresultresultresult")
			returnResult = result.status
			if (returnResult) {
				alert("ALL DONE")
				// window.location.href = "/card-application";
			}
		},
		complete: function () {
			// $('#loader-overlay').removeClass('loader-display')
			$("#loader").hide()
		},

	})
	//$("#loader").hide();
	return returnResult
}
$(document).ready(() => {

	$("#loader").hide()
	// $('#loader').bind('ajaxStart', function () {
	// 	$(this).show()
	// }).bind('ajaxStop', function () {
	// 	$(this).hide()
	// })
})