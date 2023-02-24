let FILEUPLOADTRANSACTIONS = {};
// FILEUPLOADTRANSACTIONS.csvData = [];

$(document).ready(function () {
	$("#loader").hide();
	$('#loader').bind('ajaxStart', function () {
		$(this).show();
	}).bind('ajaxStop', function () {
		$(this).hide();
	});
	console.log("ready!");

});

$("body").on("click", "#upload", async function () {
	$("#loader").show();
	if (typeof (FileReader) != "undefined") {
		let reader = new FileReader();
		if (reader.readAsBinaryString) {
			reader.onload = function (e) {
				FILEUPLOADTRANSACTIONS.csvJSON(e.target.result);
			};
			reader.readAsBinaryString(fileUpload.files[0]);
		} else {
			reader.onload = function (e) {
				var data = "";
				var bytes = new Uint8Array(e.target.result);
				for (var i = 0; i < bytes.byteLength; i++) {
					data += String.fromCharCode(bytes[i]);
				}

				FILEUPLOADTRANSACTIONS.csvJSON(data);
			};
			reader.readAsArrayBuffer(fileUpload.files[0]);
		}

	} else {

		alert("This browser does not support HTML5.");
	}
	$("#loader").hide();
});

/* Converting the csv file to a json object. */
FILEUPLOADTRANSACTIONS.csvJSON = function (csv) {

	let lines = csv.split("\n");
	let result = [];
	let headers = lines[0].split(",");
	for (let i = 1; i < lines.length; i++) {
		let obj = {};
		let currentline = lines[i].split(",");
		for (let j = 0; j < headers.length; j++) {
			headers[j] = headers[j].replaceAll(/[\s/().\[\]]/g, "_").toLowerCase().replaceAll("__", "_");
			if (headers[j][headers[j].length - 1] == "_") {
				headers[j] = headers[j].slice(0, -1);
			}
			obj[headers[j]] = currentline[j];
		}
		result.push(obj);
	}
	if (result.length > 0) {
		FILEUPLOADTRANSACTIONS.postTransactionsReportData(result);
	} else {
		alert("No data Found");
	}
}


FILEUPLOADTRANSACTIONS.postTransactionsReportData = function (resultData) {
	$.ajax({
		url: "/post-transaction-report",
		type: "POST",
		
		data: {
			"alldata": JSON.stringify(resultData)
		},
		success: function (result) {
			console.log(result);
			alert(result.data);
		},
		onerror: function(err){
			console.log(err);
			alert(err);
		}
	});
}