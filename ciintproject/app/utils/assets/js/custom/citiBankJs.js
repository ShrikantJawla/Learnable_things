let FILEUPLOADDATA = {};
FILEUPLOADDATA.allApplications = [];
FILEUPLOADDATA.exlSheetData = [];
FILEUPLOADDATA.matchedUserData = [];



FILEUPLOADDATA.validateFileToUpload = function () {
	console.log("hello from validateFileToUpload");
	let uploadFile = document.getElementById("fileUpload").files[0];
	console.log("fileUpload", uploadFile);
	if (uploadFile && uploadFile.size > 0 && uploadFile.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
		FILEUPLOADOBJ.postFileData(uploadFile);


	} else {
		alert("Please select a valid file to upload");
	}
}

$(document).ready(() => {

	$("#loader").hide();
	$('#loader').bind('ajaxStart', function () {
		$(this).show();
	}).bind('ajaxStop', function () {
		$(this).hide();
	});
});

$("body").on("click", "#upload", function () {
	$("#loader").show();
	let result = fileUploadCommon(fileUpload);
	//.log(FILEUPLOADDATA_COMMON.sheetData, "resultresult");
	//Reference the FileUpload element.
	// var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
	// if (regex.test(fileUpload.value.toLowerCase())) {
	// 	console.log(fileUpload.files, "dddddddddd");
	// 	if (typeof (FileReader) != "undefined") {
	// 		var reader = new FileReader();
	// 		//For Browsers other than IE.
	// 		if (reader.readAsBinaryString) {
	// 			console.log('111');
	// 			reader.onload = function (e) {
	// 				FILEUPLOADDATA.ProcessExcel(e.target.result);
	// 			};
	// 			reader.readAsBinaryString(fileUpload.files[0]);
	// 		} else {
	// 			console.log('2222');
	// 			//For IE Browser.
	// 			reader.onload = function (e) {
	// 				var data = "";
	// 				var bytes = new Uint8Array(e.target.result);
	// 				for (var i = 0; i < bytes.byteLength; i++) {
	// 					data += String.fromCharCode(bytes[i]);
	// 				}
	// 				FILEUPLOADDATA.ProcessExcel(data);
	// 			};
	// 			reader.readAsArrayBuffer(fileUpload.files[0]);
	// 		}

	// 	} else {

	// 		alert("This browser does not support HTML5.");
	// 	}
	// } else {

	// 	alert("Please upload a valid Excel file.");
	// }
	$("#loader").hide();
});
function handelExcelData(data) {
	console.log(data, "datadata");
	FILEUPLOADDATA.exlSheetData = data;
	FILEUPLOADDATA.matchData();
}
// FILEUPLOADDATA.ProcessExcel = function (data) {
// 	$("#loader").show();
// 	//Read the Excel File data.
// 	var workbook = XLSX.read(data, {
// 		type: 'binary'
// 	});
// 	//Fetch the name of First Sheet.
// 	var firstSheet = workbook.SheetNames[0];
// 	//Read all rows from First Sheet into an JSON array.
// 	var excelRows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], {
// 		header: 0,
// 		defval: ""
// 	});
// 	console.log(excelRows);
// 	FILEUPLOADDATA.exlSheetData = excelRows;
// 	FILEUPLOADDATA.matchData();
// 	//FILEUPLOADDATA.getAllUsersData();
// 	$("#loader").hide();
// };

FILEUPLOADDATA.matchData = function () {
	if (FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {

		FILEUPLOADDATA.matchedUserData = FILEUPLOADDATA.exlSheetData;
		// for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {
		// 	let isMatched = false;
		// 	let machedOne = FILEUPLOADDATA.exlSheetData[i];
		// 	FILEUPLOADDATA.matchedUserData.push(machedOne);
		// 	isMatched = true;
		// }
		console.log("matchedUserDatamatchedUserData--", FILEUPLOADDATA.matchedUserData);
		FILEUPLOADDATA.entryToDb();
	}
}

FILEUPLOADDATA.entryToDb = async function () {
	console.log('HI I AM IN THIS');
	let returnResult = false;
	// $('#loader-overlay').addClass('loader-display');
	//$("#loader").Show();
	await $.ajax({
		url: "/citi/citi-upload-file-ajex",
		type: "POST",
		// contentType: "application/jsonrequest",
		// dataType: 'json',
		data: {
			"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData)
		},

		beforeSend: function () {
			$('#loader-overlay').addClass('loader-display');
			//$("#loader").show();
		},

		success: function (result) {
			console.log(result, "resultresultresultresultresultresultresultresult");
			returnResult = result.status;
			if (returnResult) {
				alert("ALL DONE");
				// window.location.href = "/card-application";
			}
		},
		complete: function () {
			$('#loader-overlay').removeClass('loader-display');
			//$("#loader").hide();
		},

	});
	$("#loader").hide();
	return returnResult;
}