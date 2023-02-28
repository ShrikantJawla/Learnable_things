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
		url: "/idfc/idfc-upload-file-ajex",
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