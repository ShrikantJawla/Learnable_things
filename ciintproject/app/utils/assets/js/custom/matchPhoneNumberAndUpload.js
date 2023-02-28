let FILEUPLOADDATA = {};
FILEUPLOADDATA.allApplications = [];
FILEUPLOADDATA.exlSheetData = [];
FILEUPLOADDATA.matchedUserData = [];
let selectedBank;
let selectedID;





FILEUPLOADDATA.getAllBankData = async function(){
	await $.ajax({
		url: "/applications/get-all-banks-for-missing-data",
		type: "GET",
		success: function (result) {
			allBanks = result.payload;
			for(i = 0; i<allBanks.length; i++){
				$('#card-issuers-here').append($('<option>').val(allBanks[i].id).text(allBanks[i].bank_name))
			}
		},
		error : function(err){
			console.log(err)
			alert("Error Getting All Banks");
		}
	});
}


// Validating Data to Upload
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
	FILEUPLOADDATA.getAllBankData();
});

$("body").on("click", "#upload", function () {
	fileUp();
	
});
function fileUp(){
	console.log(selectedId, selectedBank , "FFFFFF")
	let raw = true;
	// if (selectedId == '11') {
	// 	raw = false
	// }
    raw = false
	fileUploadCommon(fileUpload ,'', raw);
}
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
	if (selectedBank){
		FILEUPLOADDATA.entryToDb(obj);
	} else {
		alert('Please select the bank.')
	}
	
	//console.log("trimmed data------------>>>>>>>", obj, "-------- trimmed data");
}
FILEUPLOADDATA.selectBank = function(element){
	selectedId = $(element).val();
	selectedBank = $("#card-issuers-here option:selected").text();
	console.log(selectedId, selectedBank)
}
FILEUPLOADDATA.entryToDb = async function (trimmedData) {
	let returnResult = false;
	// $('#loader-overlay').addClass('loader-display');
	//$("#loader").Show();
	let getKeyOfSheet = $('#sheetIndex').val();
	console.log(getKeyOfSheet , "getKeyOfSheetgetKeyOfSheet");
	if (getKeyOfSheet != '') {
		await $.ajax({
			url: "/applications/get-matched-phone-number-sheet",
			type: "POST",
			// contentType: "application/jsonrequest",
			// dataType: 'json',
			data: {
				"allData": JSON.stringify({
					"sheetData" : trimmedData,
					"bankName" : selectedBank,
					"bankId" : parseInt(selectedId),
					"keyindex" : getKeyOfSheet,
				}),
			},
			beforeSend: function () {
				$('#loader-overlay').addClass('loader-display');
				//$("#loader").show();
			},
	
			success: function (result) {
				console.log(result, "resultresultresultresultresultresultresultresult");
				returnResult = result.status;
				saveData(result, "cardinsider_reset_phone_number_sheet.csv");
				// if (returnResult) {
				// 	alert("UPLOAD DONE");
				// 	// window.location.href = "/card-application";
				// } else {
				// 	alert("OOPS Error in DB");
				// }
			},
			complete: function () {
				$('#loader-overlay').removeClass('loader-display');
				//$("#loader").hide();
			},
	
		});
		$("#loader").hide();
		return returnResult;
	} else {
		alert("Please add index value");
	}
	
	
}

const saveData = (function () {
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style = "display: none";
    return function (data, fileName) {
        const blob = new Blob([data], { type: "octet/stream" }),
            url = window.URL.createObjectURL(blob);
        a.href = url;
        a.download = fileName;
        a.click();
        window.URL.revokeObjectURL(url);
    };
}());

