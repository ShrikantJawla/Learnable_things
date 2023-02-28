// let FILEUPLOADDATA = {};
// FILEUPLOADDATA.allApplications = [];
// FILEUPLOADDATA.exlSheetData = [];
// FILEUPLOADDATA.matchedUserData = [];




// FILEUPLOADDATA.validateFileToUpload = function () {
// 	console.log("hello from validateFileToUpload");
// 	let uploadFile = document.getElementById("fileUpload").files[0];
// 	console.log("fileUpload", uploadFile);
// 	if (uploadFile && uploadFile.size > 0 && uploadFile.type == "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") {
// 		FILEUPLOADOBJ.postFileData(uploadFile);


// 	} else {
// 		alert("Please select a valid file to upload");
// 	}
// }


// $(document).ready(() => {
// 	$("#loader").hide();
// 	$('#loader').bind('ajaxStart', function () {
// 		$(this).show();
// 	}).bind('ajaxStop', function () {
// 		$(this).hide();
// 	});
// });







// FILEUPLOADDATA.csvToJson = function (csvFile) {
// 	//console.log("csv file here.... ------- >>>>>>", csv);

// 	let lines = csvFile.split("\n");

// 	let result = [];


// 	let headers = lines[0].split(",");

// 	for (let i = 1; i < lines.length; i++) {

// 		let obj = {};
// 		let currentline = lines[i].split(",");

// 		for (let j = 0; j < headers.length; j++) {
// 			obj[headers[j]] = currentline[j];
// 		}

// 		result.push(obj);

// 	}

// 	//return result; //JavaScript object
// 	return JSON.stringify(result); //JSON
// }



// $("body").on("click", "#upload", function () {
// 	$("#loader").show();

// 	let regex = /^.*\.(csv)$/;

// 	if (regex.test(fileUpload.value.toLowerCase()) && fileUpload.files.length > 0) {

// 		console.log(fileUpload.files[0].type, "dddddddddd");

// 		if (typeof (FileReader) != "undefined") {
// 			let reader = new FileReader();
// 			//For Browsers other than IE.
// 			if (reader.readAsBinaryString) {
// 				console.log('111');
// 				reader.onload = function (e) {
// 					FILEUPLOADDATA.matchedUserData = FILEUPLOADDATA.csvToJson(e.target.result);
// 					console.log("filedata ----->>>>", FILEUPLOADDATA.matchedUserData);

// 					if (FILEUPLOADDATA.matchedUserData.length > 0) {

// 						FILEUPLOADDATA.entryToDb();
// 					}
// 					//FILEUPLOADDATA.ProcessExcel(e.target.result);
// 				};
// 				reader.readAsBinaryString(fileUpload.files[0]);
// 			} else {
// 				console.log('2222');
// 				//For IE Browser.

// 				reader.onload = function (e) {
// 					var data = "";
// 					var bytes = new Uint8Array(e.target.result);
// 					for (var i = 0; i < bytes.byteLength; i++) {
// 						data += String.fromCharCode(bytes[i]);
// 					}
// 					FILEUPLOADDATA.matchedUserData = FILEUPLOADDATA.csvToJson(data);
// 					console.log("filedata 2----->>>>", FILEUPLOADDATA.matchedUserData);
// 					if (FILEUPLOADDATA.matchedUserData.length > 0) {

// 						FILEUPLOADDATA.entryToDb();
// 					}

// 				};
// 				reader.readAsArrayBuffer(fileUpload.files[0]);
// 			}

// 		} else {

// 			alert("This browser does not support HTML5.");
// 		}
// 	} else {


// 		alert("Please upload a valid CSV file.");
// 	}
// 	$("#loader").hide();
// });



// FILEUPLOADDATA.entryToDb = async function () {
// 	console.log('HI I AM IN THIS');
// 	let returnResult = false;
// 	// $('#loader-overlay').addClass('loader-display');
// 	await $.ajax({
// 		url: "/bob/bob-upload-ajex",
// 		type: "POST",
// 		// contentType: "application/jsonrequest",
// 		// dataType: 'json',
// 		data: {
// 			"allData": FILEUPLOADDATA.matchedUserData
// 		},

// 		beforeSend: function () {
// 			$('#loader-overlay').addClass('loader-display');
// 		},

// 		success: function (result) {
// 			console.log(result, "resultresultresultresultresultresultresultresult");
// 			returnResult = result.status;
// 			if (returnResult == false) {
// 				alert(result.message);

// 			}
// 			if (returnResult == true) {
// 				alert(result.message);

// 			}
// 		},
// 		complete: function () {
// 			$('#loader-overlay').removeClass('loader-display');
// 		},

// 	});
// 	return returnResult;
// }






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
	fileUploadCommon(fileUpload);
});
function handelExcelData(data) {
	console.log(data, "datadata");
	FILEUPLOADDATA.exlSheetData = data;
	FILEUPLOADDATA.matchData();
}





FILEUPLOADDATA.matchData = function () {
	if (FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {

		FILEUPLOADDATA.matchedUserData = FILEUPLOADDATA.exlSheetData;
		console.log("matchedUserDatamatchedUserData--", FILEUPLOADDATA.matchedUserData);
		FILEUPLOADDATA.removeExtraWhiteSpaces(FILEUPLOADDATA.matchedUserData);
		//FILEUPLOADDATA.entryToDb();
	}
}


FILEUPLOADDATA.removeExtraWhiteSpaces = function(obj){
	//console.log(obj, "-----data in whitespaces");
	for(let i = 0; i < obj.length; i++){
		Object.keys(obj[i]).forEach((key) => {
			var replacedKey = key.trim().toUpperCase().replace(/\s\s+/g, "_");
			//console.log(key, "___________ key");
			if (key !== replacedKey) {
			   obj[i][replacedKey] = obj[i][key];
			   delete obj[i][key];
			}
		 });
	}

	FILEUPLOADDATA.entryToDb(obj);
	//console.log("trimmed data------------>>>>>>>", obj, "-------- trimmed data");
}

FILEUPLOADDATA.entryToDb = async function (trimmedData) {
	console.log('HI I AM IN THIS');
	let returnResult = false;
	// $('#loader-overlay').addClass('loader-display');
	//$("#loader").Show();
	await $.ajax({
		url: "/icici/icici-upload-ajex",
		type: "POST",
		// contentType: "application/jsonrequest",
		// dataType: 'json',
		data: {
			"allData": JSON.stringify(trimmedData)
		},
		beforeSend: function () {
			$('#loader-overlay').addClass('loader-display');
			//$("#loader").show();
		},

		success: function (result) {
			console.log(result, "resultresultresultresultresultresultresultresult");
			alert(result.message)
		},
		complete: function () {
			$('#loader-overlay').removeClass('loader-display');
			//$("#loader").hide();
		},

	});
	$("#loader").hide();
	return returnResult;
}



