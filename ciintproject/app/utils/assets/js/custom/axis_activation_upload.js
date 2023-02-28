let FILEUPLOADDATA = {};

$(document).ready(() => {

	$("#loader").hide();
	$('#loader').bind('ajaxStart', function () {
		$(this).show();
	}).bind('ajaxStop', function () {
		$(this).hide();
	});
	FILEUPLOADDATA.getAllBankData();
});





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


FILEUPLOADDATA.selectBank = function(element){
	FILEUPLOADDATA.selectedId = $(element).val();
	FILEUPLOADDATA.selectedBank = $("#card-issuers-here option:selected").text();
	console.log(FILEUPLOADDATA.selectedId, FILEUPLOADDATA.selectedBank);
}


$("body").on("click", "#upload", function () {
	fileUploadCommon(fileUpload);
});


function handelExcelData(data) {
	//console.log(data, "datadata");
	entryToDb(data);
}


async function entryToDb(data){
	console.log(data, "----- in data entry");
	await $.ajax({
		url: "/axis/axis-upload-activation-ajex",
		type: "POST",
		data: {
			"allData": JSON.stringify({
				"sheetData" : data,
				// "bankName" : FILEUPLOADDATA.selectedBank,
				// "bankId" : parseInt(FILEUPLOADDATA.selectedId)
			}),
		},

		success: function (result) {
			console.log(result, "resultresultresultresultresultresultresultresult");
			returnResult = result.status;
			if (returnResult) {
				alert("UPLOAD DONE");
				// window.location.href = "/card-application";
			} else {
				alert("OOPS Error in DB");
			}
		},
		

	});
}