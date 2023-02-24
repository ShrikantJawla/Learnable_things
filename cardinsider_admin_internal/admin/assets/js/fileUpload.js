/*--------------------------------- Core objects here.....--------------------------------------------- */


let FILEUPLOADDATA = {};
FILEUPLOADDATA.userList = [];
FILEUPLOADDATA.userWebList = [];
FILEUPLOADDATA.exlSheetData = [];
FILEUPLOADDATA.creditCardsByIssuersOptions = ' <option selected value="0">Select Card Issuer</option> ';
FILEUPLOADDATA.newCardHtmlTrs = '';
FILEUPLOADDATA.selectedIssuer = '';
FILEUPLOADDATA.cardsByFileArray = [];
FILEUPLOADDATA.matchedUserData = [];
FILEUPLOADDATA.fileCardNameAndId = [];
FILEUPLOADDATA.setAllApplicationData = {};
FILEUPLOADDATA.bobCsvData = {};
FILEUPLOADDATA.cashbackNumber;
let fileCardNameAndOriginalCardId = {};
let creditCardsByIssuersOptionsBySheetName = {};

/*--------------------------------- Init/ ready here........--------------------------------------------- */
/* The above code is used to hide the loader when the page is loaded. */

$(document).ready(function () {
	$("#loader").hide();
	$('#loader').bind('ajaxStart', function () {
		$(this).show();
	}).bind('ajaxStop', function () {
		$(this).hide();
	});
	////console.log("ready!");
	FILEUPLOADDATA.getAllIssuers();

});


/*--------------------------------- triggerd when card issuers changes  here.....--------------------------------------------- */

/*  */
$('#card-issuers-here').on('change', function () {
	if ($('#card-issuers-here').val() == 5) {
		//console.log($('#card-issuers-here').val());
		$('.file-note').replaceWith(` <p class="file-note"> cashback column needs to be added in  excel file in order to process further </p>`).show();
		FILEUPLOADDATA.getAllUsersData();
	} else if ($('#card-issuers-here').val() == 12) {
		$('.file-note').replaceWith(`<p class="file-note"> Please select CSV file in order to proceed further </p>`).show();

	} else {
		$('.file-note').hide();
	}
});




/*--------------------------------- GET ALL USERS here.....--------------------------------------------- */
/* Getting all the users data from the database and storing it in the
FILEUPLOADDATA.setAllApplicationData object. */
FILEUPLOADDATA.getAllUsersData = function () {
	$.ajax({
		url: "/application-get-users",
		type: "POST",
		contentType: "application/jsonrequest",
		//dataType: 'json',
		data: {
			"applicationData": "hbjhbjhb"
		},
		success: function (result) {
			FILEUPLOADDATA.userList = result;
			for (let k = 0; k < FILEUPLOADDATA.userList.length; k++) {
				let userDataMobileNumber = FILEUPLOADDATA.userList[k]['ciu_number'];
				userDataMobileNumber.trim();
				let lastSixDigitUser = userDataMobileNumber.substr(userDataMobileNumber.length - 6);
				let firstTwoDigitUser = userDataMobileNumber.substring(0, 2);
				let newIndex = firstTwoDigitUser + '-' + lastSixDigitUser;
				FILEUPLOADDATA.setAllApplicationData[newIndex] = FILEUPLOADDATA.userList[k];
			}

		}
	});
}

/*---------------------------------GET ALL CARD ISSUERS here.....--------------------------------------------- */

/* Making an ajax call to the server to get the list of card issuers. */
FILEUPLOADDATA.getAllIssuers = function () {
	$.ajax({
		url: "/cardissuerslist-ajax",
		type: "POST",
		contentType: "application/jsonrequest",
		//dataType: 'json',
		data: {
			"applicationData": "hbjhbjhb"
		},
		success: function (result) {
			FILEUPLOADDATA.cardIssuerInSelect(result);

		}
	});
}
/*--------------------------------- READ  CASHBACK NUMBER HERE.....--------------------------------------------- */

/* The above code is reading the value of the cashback number from the input box. */
FILEUPLOADDATA.readCashBack = function () {
	let cashback = document.getElementById("cashBackNum").value;
	return cashback;
}


/*--------------------------------- TRIGGERED  WITH UPLOAD BUTTON here.....--------------------------------------------- */
$("body").on("click", "#upload", async function () {
	$("#loader").show();
	//Reference the FileUpload element.
	var fileUpload = $("#fileUpload")[0];

	FILEUPLOADDATA.cashbackNumber = FILEUPLOADDATA.readCashBack();

	if (FILEUPLOADDATA.cashbackNumber != '') {
		//console.log("dsfsdfbndiosnvo ---->> selectdeissuer -- > > ", FILEUPLOADDATA.selectedIssuer);

		//console.log("dsfsdfbndiosnvo ---->> selectdeissuer -- > > ", FILEUPLOADDATA.cashbackNumber);

		/* Reading the excel file and converting it into a JSON object. */
		if (FILEUPLOADDATA.selectedIssuer == 5) {

			if (fileUpload.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileUpload.files[0].type === "application/vnd.ms-excel.sheet.binary.macroenabled.12") {

				if (typeof (FileReader) != "undefined") {
					var reader = new FileReader();
					//For Browsers other than IE.
					if (reader.readAsBinaryString) {
						////console.log('111');
						reader.onload = function (e) {
							FILEUPLOADDATA.ProcessExcel(e.target.result, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsBinaryString(fileUpload.files[0]);
					} else {
						////console.log('2222');
						//For IE Browser.
						reader.onload = function (e) {
							var data = "";
							var bytes = new Uint8Array(e.target.result);
							for (var i = 0; i < bytes.byteLength; i++) {
								data += String.fromCharCode(bytes[i]);
							}
							FILEUPLOADDATA.ProcessExcel(data, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsArrayBuffer(fileUpload.files[0]);
					}

				} else {

					alert("This browser does not support HTML5.");
				}
			} else {

				alert("Please upload a valid Excel file.");
			}


		} else if (FILEUPLOADDATA.selectedIssuer == 12) {



			// bank of baroda processing here....



			if (fileUpload.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileUpload.files[0].type === "application/vnd.ms-excel.sheet.binary.macroenabled.12") {

				//console.log(fileUpload.files, "dddddddddd");
				if (typeof (FileReader) != "undefined") {
					var reader = new FileReader();
					//For Browsers other than IE.
					if (reader.readAsBinaryString) {
						////console.log('111');
						reader.onload = function (e) {
							//console.log("in first process excel");
							FILEUPLOADDATA.ProcessExcel(e.target.result, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsBinaryString(fileUpload.files[0]);
					} else {
						////console.log('2222');
						//For IE Browser.
						reader.onload = function (e) {
							var data = "";
							var bytes = new Uint8Array(e.target.result);
							for (var i = 0; i < bytes.byteLength; i++) {
								data += String.fromCharCode(bytes[i]);
							}
							//console.log("in 2nd process excel");
							FILEUPLOADDATA.ProcessExcel(data, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsArrayBuffer(fileUpload.files[0]);
					}

				} else {

					alert("This browser does not support HTML5.");
				}
			} else {

				alert("Please upload a valid Excel file.");
			}

			//console.log("bob data ---->>>>>>>", FILEUPLOADDATA.bobCsvData, "------------ bob data");



		} else if (FILEUPLOADDATA.selectedIssuer == 14) {


			if (fileUpload.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileUpload.files[0].type === "application/vnd.ms-excel.sheet.binary.macroenabled.12") {

				//console.log(fileUpload.files, "dddddddddd");
				if (typeof (FileReader) != "undefined") {
					var reader = new FileReader();
					//For Browsers other than IE.
					if (reader.readAsBinaryString) {
						////console.log('111');
						reader.onload = function (e) {
							//console.log("in first process excel");
							FILEUPLOADDATA.ProcessExcel(e.target.result, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsBinaryString(fileUpload.files[0]);
					} else {
						////console.log('2222');
						//For IE Browser.
						reader.onload = function (e) {
							var data = "";
							var bytes = new Uint8Array(e.target.result);
							for (var i = 0; i < bytes.byteLength; i++) {
								data += String.fromCharCode(bytes[i]);
							}
							//console.log("in 2nd process excel");
							FILEUPLOADDATA.ProcessExcel(data, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsArrayBuffer(fileUpload.files[0]);
					}

				} else {

					alert("This browser does not support HTML5.");
				}
			} else {

				alert("Please upload a valid Excel file.");
			}

		} else if (FILEUPLOADDATA.selectedIssuer == 19) {


			if (fileUpload.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileUpload.files[0].type === "application/vnd.ms-excel.sheet.binary.macroenabled.12") {


				if (typeof (FileReader) != "undefined") {
					var reader = new FileReader();
					//For Browsers other than IE.
					if (reader.readAsBinaryString) {
						////console.log('111');
						reader.onload = function (e) {
							//console.log("in first process excel");
							FILEUPLOADDATA.ProcessExcel(e.target.result, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsBinaryString(fileUpload.files[0]);
					} else {
						////console.log('2222');
						//For IE Browser.
						reader.onload = function (e) {
							var data = "";
							var bytes = new Uint8Array(e.target.result);
							for (var i = 0; i < bytes.byteLength; i++) {
								data += String.fromCharCode(bytes[i]);
							}
							//console.log("in 2nd process excel");
							FILEUPLOADDATA.ProcessExcel(data, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsArrayBuffer(fileUpload.files[0]);
					}

				} else {

					alert("This browser does not support HTML5.");
				}
			} else {

				alert("Please upload a valid Excel file.");
			}

		} else if (FILEUPLOADDATA.selectedIssuer == 7) {

			if (fileUpload.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileUpload.files[0].type === "application/vnd.ms-excel.sheet.binary.macroenabled.12") {
				//console.log(fileUpload.files, "dddddddddd");
				if (typeof (FileReader) != "undefined") {
					var reader = new FileReader();
					//For Browsers other than IE.
					if (reader.readAsBinaryString) {
						////console.log('111');
						reader.onload = function (e) {
							FILEUPLOADDATA.ProcessExcel(e.target.result, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsBinaryString(fileUpload.files[0]);
					} else {
						////console.log('2222');
						//For IE Browser.
						reader.onload = function (e) {
							var data = "";
							var bytes = new Uint8Array(e.target.result);
							for (var i = 0; i < bytes.byteLength; i++) {
								data += String.fromCharCode(bytes[i]);
							}
							FILEUPLOADDATA.ProcessExcel(data, FILEUPLOADDATA.selectedIssuer);
						};
						reader.readAsArrayBuffer(fileUpload.files[0]);
					}

				} else {

					alert("This browser does not support HTML5.");
				}
			} else {

				alert("Please upload a valid Excel file.");
			}


		} else {
			alert('PLEASE SELECT CARD ISSUER');
		}
	} else {
		alert('PLEASE ENTER CASHBACK AMOUNT');
	}
	//Validate whether File is valid Excel file.
	$("#loader").hide();
});


/*---------------------------------BOB CSV TO JSON here.....--------------------------------------------- */


// FILEUPLOADDATA.bobCsvToJson = async function (csvFile) {
// 	$("#loader").show();
// 	//console.log("csv file here.... ------- >>>>>>" , csvFile);

// 	let lines = await csvFile.split("\n");

// 	let result = [];


// 	let headers = lines[0].split(",");

// 	for (let i = 1; i < lines.length; i++) {

// 		let obj = {};
// 		let currentline = lines[i].split(",");

// 		for (let j = 0; j < headers.length; j++) {
// 			obj[headers[j]] = currentline[j];
// 		}



// 		let splittedUtm = obj['UTM_SOURCE'].split('_');
// 		////console.log(splittedUtm, "---- disfbi");
// 		if (splittedUtm[splittedUtm.length - 1] == "web") {
// 			if (splittedUtm[splittedUtm.length - 1] != "null" && splittedUtm[splittedUtm.length - 1] != "{param}") {
// 				obj["splitted_utm"] = splittedUtm[splittedUtm.length - 1];
// 				await result.push(obj);
// 			}
// 		}

// 	}
// 	//console.log(result , "Hi I AM IN BOB IIIIII");
// 	////console.log(result.length);
// 	$("#loader").hide();
// 	// //console.log(result);

// 	//return result; //JavaScript object
// 	return JSON.stringify(result); //JSON
// }
////////////////////////////////////////////////////

// FILEUPLOADDATA.manageApplicationMatchedCard = function (dataBySheet) {
//     let checkIfAlredayExist = false;
//     for (let i = 0; i < FILEUPLOADDATA.cardsByFileArray.length; i++) {
//         if (dataBySheet['CARDTYPE'] == FILEUPLOADDATA.cardsByFileArray[i]) {
//             checkIfAlredayExist = true;
//         }
//     }
//     if (!checkIfAlredayExist) {
//         let trimTheCardType = dataBySheet['CARDTYPE'].replaceAll(" ", "_");
//         FILEUPLOADDATA.cardsByFileArray.push(dataBySheet['CARDTYPE']);
//         FILEUPLOADDATA.newCardHtmlTrs = FILEUPLOADDATA.newCardHtmlTrs + ` <tr>
//                             <td scope="row">` + dataBySheet['CARDTYPE'] + `</td>
//                             <td>
//                                 <select required class="form-select"
//                                     aria-label="Default select example" id = ` + trimTheCardType + `> ` +
//             FILEUPLOADDATA.creditCardsByIssuersOptions + `
//                             </td>
//                         </tr>`;
//     }
// }


/*--------------------------------- MATCHING BOB DATA here.....--------------------------------------------- */

FILEUPLOADDATA.matchBobCardsData = function () {
	//console.log("fgdfui ---", typeof (FILEUPLOADDATA.bobCsvData));
	//console.log("fgdfui ---", FILEUPLOADDATA.bobCsvData);
	let jsNewTableCardsMatching = document.getElementById("js-new-card-table");
	let parsedBobData = JSON.parse(FILEUPLOADDATA.bobCsvData);
	let finalBobData = {};
	if (FILEUPLOADDATA.bobCsvData && FILEUPLOADDATA.bobCsvData.length > 0 && FILEUPLOADDATA.bobCsvData != "") {
		//console.log("hi im in this bob");
		jsNewTableCardsMatching.innerHTML = "";
		//console.log(parsedBobData);
		let htmlAppend = "";
		for (let i = 0; i < parsedBobData.length; i++) {
			if (parsedBobData[i]['PRODUCT_VARIANT'] != "") {

				//console.log(i);
				htmlAppend = htmlAppend + `
                <tr>
                            <td scope="row">` + parsedBobData[i]['PRODUCT_VARIANT'] + `</td>
                             <td>
                                     <select required class="form-select"
                                       aria-label="Default select example" id = "bobCards"> ` +
					FILEUPLOADDATA.creditCardsByIssuersOptions + `
                                 </td>
								 
                             </tr>`;

			}

		}
		jsNewTableCardsMatching.innerHTML = htmlAppend;



	}
}

////////////////////////////////////////////////////

/*--------------------------------- PROCESSING EXCEL SHEET here.....--------------------------------------------- */


FILEUPLOADDATA.ProcessExcel = function (data, issuer) {
	$("#loader").show();
	//Read the Excel File data.
	var workbook = XLSX.read(data, {
		type: 'binary'
	});


	let sheetArr = [];
	for (let i = 0; i < workbook.SheetNames.length; i++) {
		let sheetName = workbook.SheetNames[i]
		let sheet = workbook.Sheets[sheetName]
		let sheetData = XLSX.utils.sheet_to_json(sheet, {
			header: 0,
			defval: "",
		});
		sheetArr.push(sheetData);
	}
	const arrLengths = sheetArr.map(a => a.length);
	const maxLength = arrLengths.indexOf(Math.max(...arrLengths));



	let excelRows = sheetArr[maxLength];

	FILEUPLOADDATA.exlSheetData = excelRows;
	FILEUPLOADDATA.matchData(issuer);
	$("#loader").hide();
};



/*--------------------------------- MATCH EXCEL DATA here.....--------------------------------------------- */


FILEUPLOADDATA.matchData = function (issuer) {
	if (issuer == 5 && FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0 && FILEUPLOADDATA.userList &&
		FILEUPLOADDATA.userList.length > 0) {


		console.log(FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('APPLICATION_NO'))


		if ((FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('MOBILE_NO')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('REASON')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('IPA STATUS'))
			&& (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('APPLICATION_NO')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('CARDTYPE')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('DATE'))) {

			FILEUPLOADDATA.matchedUserData = [];



			for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {
				let isMatched = false;
				let cardApplicantMobileNum = FILEUPLOADDATA.exlSheetData[i]['MOBILE_NO'];
				cardApplicantMobileNum.trim();
				let lastSixDigit = cardApplicantMobileNum.substr(cardApplicantMobileNum.length - 6);
				//////console.log("lastSixDigit", lastSixDigit);
				let firstTwoDigit = cardApplicantMobileNum.substring(0, 2);
				//////console.log("firstTwoDigit", firstTwoDigit);
				if (FILEUPLOADDATA.exlSheetData[i]['REASON'] == '1601 - Score Reject') {

					FILEUPLOADDATA.exlSheetData[i]['REASON'] = 'Low score';
					////console.log('HI I AM IN THIS ', FILEUPLOADDATA.exlSheetData[i]['REASON']);
				}


				if (FILEUPLOADDATA.setAllApplicationData[firstTwoDigit + '-' + lastSixDigit]) {
					let matchedApplicationData = FILEUPLOADDATA.setAllApplicationData[firstTwoDigit + '-' + lastSixDigit];
					if (!FILEUPLOADDATA.exlSheetData[i]['cashback']) {
						FILEUPLOADDATA.exlSheetData[i]['cashback'] = FILEUPLOADDATA.cashbackNumber;
					}
					if (FILEUPLOADDATA.exlSheetData[i]['IPA STATUS'] == 'IPA Rejected') {
						FILEUPLOADDATA.exlSheetData[i]['FINAL STATUS'] = 'Declined';
					}
					let machedOne = {
						"id": matchedApplicationData['id'],
						"phoneNumber": matchedApplicationData['ciu_number'],
						"applicationNumber": FILEUPLOADDATA.exlSheetData[i]['APPLICATION_NO'],
						"status": FILEUPLOADDATA.exlSheetData[i]['FINAL STATUS'],
						"issuerId": FILEUPLOADDATA.selectedIssuer,
						"cardName": FILEUPLOADDATA.exlSheetData[i]['CARDTYPE'],
						"dateOfApply": FILEUPLOADDATA.exlSheetData[i]['DATE'],
						"reasonForStatus": FILEUPLOADDATA.exlSheetData[i]['REASON'],
						"applyBy": 'ciapp',
						"refer_by": matchedApplicationData['Referred_by'],
						"cashback": FILEUPLOADDATA.exlSheetData[i]['cashback'],
						"fcmToken": matchedApplicationData['fcm_token'],

					};



					FILEUPLOADDATA.matchedUserData.push(machedOne);


					FILEUPLOADDATA.manageApplicationMatchedCard(FILEUPLOADDATA.exlSheetData[i], issuer);
					//}
					isMatched = true;
				}



			}

			let cardsDataToAppnd = document.getElementById('js-new-card-table');
			cardsDataToAppnd.innerHTML = FILEUPLOADDATA.newCardHtmlTrs;

		} else {
			alert("Some Columns are missing. Please try with a vaild sheet.")
		}
	}

	/*---------------------------------------IDFC FIRST BANK------------------------------------------------------------ */

	if (issuer == 14 && FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {

		console.log(FILEUPLOADDATA.exlSheetData, "wefhugrj f9dv9en ");
		if ((FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM Campaign')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('Created Date')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('Choice of Credit Card'))) {
			console.log(FILEUPLOADDATA.exlSheetData, "wefhugrj");


			let applicationsToChangeCardName = {};
			let isMatched = false;
			for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {

				let splittedutm = FILEUPLOADDATA.exlSheetData[i]['UTM Campaign'].split('_');

				/* Checking if the utm_source is app and utm_medium is not null. If it is true, then it is pushing
				the data to the matchedUserData array. */
				if (splittedutm[splittedutm.length - 2] == 'app' && (splittedutm[splittedutm.length - 1] != 'null')) {
					FILEUPLOADDATA.exlSheetData[i].splitted_utm_from = splittedutm[splittedutm.length - 2];
					FILEUPLOADDATA.exlSheetData[i].splitted_utm = splittedutm[splittedutm.length - 1];
					FILEUPLOADDATA.exlSheetData[i]['Created Date'] = new Date(FILEUPLOADDATA.exlSheetData[i]['Created Date'])



					if (!FILEUPLOADDATA.exlSheetData[i]['cashback']) {
						FILEUPLOADDATA.exlSheetData[i]['cashback'] = FILEUPLOADDATA.cashbackNumber;
					}

					if (FILEUPLOADDATA.exlSheetData[i]['Choice of Credit Card'] == '') {
						FILEUPLOADDATA.exlSheetData[i]['Choice of Credit Card'] = 'null';
					}

					FILEUPLOADDATA.matchedUserData.push(FILEUPLOADDATA.exlSheetData[i]);
					FILEUPLOADDATA.manageApplicationMatchedCard(FILEUPLOADDATA.exlSheetData[i], issuer);
					//}
					isMatched = true;

				}
			}

			let cardsDataToAppnd = document.getElementById('js-new-card-table');
			cardsDataToAppnd.innerHTML = FILEUPLOADDATA.newCardHtmlTrs;


		} else {
			alert("Some Columns are missing. Please try with a vaild sheet.");
		}




	}

	/*---------------------------------------BANK OF BARODA ------------------------------------------------------------ */

	/* Checking if the issuer is 12 and if the exlSheetData is not empty. If both the conditions are true,
	it will loop through the exlSheetData and check if the utm_source is app and if the utm_source is
	not null or {param}. If both the conditions are true, it will push the data to the matchedUserData
	array. */
	if (issuer == 12 && FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {


		if ((FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_SOURCE')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('PRODUCT_VARIANT'))) {


			let applicationsToChangeCardName = {};

			let isMatched = false;
			for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {
				let splittedutm = FILEUPLOADDATA.exlSheetData[i]['UTM_SOURCE'].split('_');


				if (splittedutm[splittedutm.length - 2] == 'app' && (splittedutm[splittedutm.length - 1] != 'null') && splittedutm[splittedutm.length - 1] != "{param}") {

					FILEUPLOADDATA.exlSheetData[i].splitted_utm_from = splittedutm[splittedutm.length - 2];
					FILEUPLOADDATA.exlSheetData[i].splitted_utm = splittedutm[splittedutm.length - 1];


					if (!FILEUPLOADDATA.exlSheetData[i]['cashback']) {
						FILEUPLOADDATA.exlSheetData[i]['cashback'] = FILEUPLOADDATA.cashbackNumber;
					}


					if (FILEUPLOADDATA.exlSheetData[i]['PRODUCT_VARIANT'] == '') {
						FILEUPLOADDATA.exlSheetData[i]['PRODUCT_VARIANT'] = 'null';
					}




					FILEUPLOADDATA.matchedUserData.push(FILEUPLOADDATA.exlSheetData[i]);
					FILEUPLOADDATA.manageApplicationMatchedCard(FILEUPLOADDATA.exlSheetData[i], issuer);
					//}
					isMatched = true;

				}
			}

			let cardsDataToAppnd = document.getElementById('js-new-card-table');
			cardsDataToAppnd.innerHTML = FILEUPLOADDATA.newCardHtmlTrs;

		} else {
			alert("Some Columns are missing. Please try with a vaild sheet.");
		}

	}


	/*--------------------------------------- AU BANK ------------------------------------------------------------ */

	if (issuer == 19 && FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {

		console.log(FILEUPLOADDATA.exlSheetData[0]);

		console.log('UTM_CAMPAIGN ------', FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_CAMPAIGN'));
		console.log('UTM_TERM -----------', FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_TERM'));
		console.log('CARD_VARIANT_SELECTED ----------', FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('CARD_VARIANT_SELECTED'));
		if ((FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_CAMPAIGN')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_TERM')) && (FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('CARD_VARIANT_SELECTED'))) {

			let applicationsToChangeCardName = {};

			let isMatched = false;
			for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {
				let splittedutm = FILEUPLOADDATA.exlSheetData[i]['UTM_CAMPAIGN'].split('-');


				if (splittedutm[splittedutm.length - 1] == 'app') {



					let splitted_utm_term = FILEUPLOADDATA.exlSheetData[i]['UTM_TERM'].split('-');


					if (splitted_utm_term.length == 2) {

						FILEUPLOADDATA.exlSheetData[i].splitted_utm_from = splittedutm[splittedutm.length - 1];
						FILEUPLOADDATA.exlSheetData[i].splitted_utm_term_num1 = splitted_utm_term[splitted_utm_term.length - 1];
						FILEUPLOADDATA.exlSheetData[i].splitted_utm_term_num2 = splitted_utm_term[splitted_utm_term.length - 2];

						if (!FILEUPLOADDATA.exlSheetData[i]['cashback']) {
							FILEUPLOADDATA.exlSheetData[i]['cashback'] = FILEUPLOADDATA.cashbackNumber;
						}


						if (FILEUPLOADDATA.exlSheetData[i]['CARD_VARIANT_SELECTED'] == '') {
							FILEUPLOADDATA.exlSheetData[i]['CARD_VARIANT_SELECTED'] = 'null';
						}


						FILEUPLOADDATA.matchedUserData.push(FILEUPLOADDATA.exlSheetData[i]);
						FILEUPLOADDATA.manageApplicationMatchedCard(FILEUPLOADDATA.exlSheetData[i], issuer);
						//}
						isMatched = true;
					}
				}
			}

			let cardsDataToAppnd = document.getElementById('js-new-card-table');
			cardsDataToAppnd.innerHTML = FILEUPLOADDATA.newCardHtmlTrs;

		} else {
			console.log('UTM_CAMPAIGN ------', FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_CAMPAIGN'));
			console.log('UTM_TERM -----------', FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('UTM_TERM'));
			console.log('CARD_VARIANT_SELECTED ----------', FILEUPLOADDATA.exlSheetData[0].hasOwnProperty('CARD_VARIANT_SELECTED'));
			alert("UTM_CAMPAIGN or UTM_TERM or CARD_VARIANT_SELECTED Columns are missing. Please try with a vaild sheet.");
		}




	}



	/*--------------------------------------- Yes BANK ------------------------------------------------------------ */

	if (issuer == 7 && FILEUPLOADDATA.exlSheetData && FILEUPLOADDATA.exlSheetData.length > 0) {

		let applicationsToChangeCardName = {};

		let isMatched = false;
		for (let i = 0; i < FILEUPLOADDATA.exlSheetData.length; i++) {


			if (!FILEUPLOADDATA.exlSheetData[i]['cashback']) {
				FILEUPLOADDATA.exlSheetData[i]['cashback'] = FILEUPLOADDATA.cashbackNumber;
			}

			FILEUPLOADDATA.matchedUserData.push(FILEUPLOADDATA.exlSheetData[i]);
			FILEUPLOADDATA.manageApplicationMatchedCard(FILEUPLOADDATA.exlSheetData[i], issuer);

			isMatched = true;


		}

		let cardsDataToAppnd = document.getElementById('js-new-card-table');
		cardsDataToAppnd.innerHTML = FILEUPLOADDATA.newCardHtmlTrs;



	}

	//console.log(FILEUPLOADDATA.cardsByFileArray, "FILEUPLOADDATA.cardsByFileArrayFILEUPLOADDATA.cardsByFileArray");
	//console.log(creditCardsByIssuersOptionsBySheetName, "creditCardsByIssuersOptionsBySheetName");
	for (let m = 0; m < FILEUPLOADDATA.cardsByFileArray.length; m++) {

		if (FILEUPLOADDATA.cardsByFileArray[m] != null && FILEUPLOADDATA.cardsByFileArray[m] != 'null' && creditCardsByIssuersOptionsBySheetName[FILEUPLOADDATA.cardsByFileArray[m]]) {
			console.log('HI I AM IN THIS ');
			console.log(FILEUPLOADDATA.cardsByFileArray[m]);
			let trimTheCardTypeA = FILEUPLOADDATA.cardsByFileArray[m].replaceAll(" ", "_");
			let trimTheCardType = trimTheCardTypeA.replaceAll("?", "_");
			console.log(trimTheCardTypeA);
			console.log(trimTheCardType);
			let selectedOptionData = creditCardsByIssuersOptionsBySheetName[FILEUPLOADDATA.cardsByFileArray[m]];
			$("#" + trimTheCardType).val(selectedOptionData.id);
		}

	}
	//console.log("hi im in match data ");

}



/*--------------------------------- APPENDING CARDISSUERS IN SELECT here.....--------------------------------------------- */


FILEUPLOADDATA.cardIssuerInSelect = function (result) {
	//<option value = "1" > Axis Bank < /option>
	let selectTag = document.getElementById("card-issuers-here");
	let appendData = `<option selected value="0">Select Card Issuer</option>`;

	//console.log(result.payload);
	for (let i = 0; i < result.payload.length; i++) {

		appendData = appendData +
			`<option value = "${result.payload[i].id}" > ${result.payload[i].IssuerName} </option> `;

	}
	// ////console.log("appedndagdighspdg====== == >>>>", appendData);
	selectTag.innerHTML = appendData;
}

/*--------------------------------- GET CREDIT CARDS WITH CARD ISSUERS here.....--------------------------------------------- */

FILEUPLOADDATA.getCreditCardsByIssuers = function () {
	let selectedoptionValue = document.getElementById("card-issuers-here").value;
	FILEUPLOADDATA.selectedIssuer = selectedoptionValue;

	//console.log(selectedoptionValue);
	FILEUPLOADDATA.creditCardsByIssuers = [];
	if (selectedoptionValue != '' && selectedoptionValue != 0) {
		$.ajax({
			url: "/creditcardbyissuer-ajax",
			type: "POST",
			data: {
				"id": selectedoptionValue
			},
			success: function (result) {
				console.log(result.payload, "CARD BY ISSUERS");
				if (result && result.status && result.payload.length > 0) {
					//FILEUPLOADDATA.creditCardsByIssuers =  result.payload;
					for (let k = 0; k < result.payload.length; k++) {
						if (result.payload[k].sheet_name) {
							//console.log('Hi I AM IN');
							creditCardsByIssuersOptionsBySheetName[result.payload[k].sheet_name] = result.payload[k];
						}

						FILEUPLOADDATA.creditCardsByIssuersOptions = FILEUPLOADDATA
							.creditCardsByIssuersOptions +
							`<option value = "${result.payload[k].id}" > ${result.payload[k].CreditCardName} </option> `;
					}
				}
			}
		});
	}
}


/*--------------------------------- MANAGE MATCHED DATA here.....--------------------------------------------- */

FILEUPLOADDATA.manageApplicationMatchedCard = function (dataBySheet, issuer) {
	//console.log("issuer in manageApplicationMatchedCard ----->>>>", issuer);
	//FILEUPLOADDATA.cardsByFileArray = [];
	if (issuer == 5) {

		//console.log(dataBySheet, "dsfbsbfbw8be");
		let checkIfAlredayExist = false;
		for (let i = 0; i < FILEUPLOADDATA.cardsByFileArray.length; i++) {
			if (dataBySheet['CARDTYPE'] == FILEUPLOADDATA.cardsByFileArray[i]) {
				checkIfAlredayExist = true;
			}
		}
		if (!checkIfAlredayExist) {
			let trimTheCardType = dataBySheet['CARDTYPE'].replaceAll(" ", "_");
			FILEUPLOADDATA.cardsByFileArray.push(dataBySheet['CARDTYPE']);
			FILEUPLOADDATA.newCardHtmlTrs = FILEUPLOADDATA.newCardHtmlTrs + ` <tr>
                                <td scope="row">` + dataBySheet['CARDTYPE'] + `</td>
                                <td>
                                    <select required class="form-select"
                                        aria-label="Default select example" id = ` + trimTheCardType + `> ` +
				FILEUPLOADDATA.creditCardsByIssuersOptions + `
                                </td>
								<td>
                                <input type="number" min="0" class="form-control" id="`+ trimTheCardType + `-cashback" aria-describedby="cashBackHelp"></input>
                                </td>
                            </tr>`;
		}
		//console.log("FILEUPLOADDATA.cardsByFileArray---", FILEUPLOADDATA.cardsByFileArray);

	} else if (issuer == 14) {
		//console.log(dataBySheet, "dsfbsbfbw8be");
		// if(dataBySheet['Choice of Credit Card'] == ""){
		// 	//console.log("in if");
		// 	dataBySheet['Choice of Credit Card'] = "N/A";
		// }
		let checkIfAlredayExist = false;
		for (let i = 0; i < FILEUPLOADDATA.cardsByFileArray.length; i++) {
			if (dataBySheet['Choice of Credit Card'] == FILEUPLOADDATA.cardsByFileArray[i] && dataBySheet['Choice of Credit Card'] != "") {
				checkIfAlredayExist = true;
			}
		}


		if (!checkIfAlredayExist && dataBySheet['Choice of Credit Card'] != "") {
			let trimTheCardType = dataBySheet['Choice of Credit Card'].replaceAll(" ", "_");
			FILEUPLOADDATA.cardsByFileArray.push(dataBySheet['Choice of Credit Card']);
			FILEUPLOADDATA.newCardHtmlTrs = FILEUPLOADDATA.newCardHtmlTrs + ` <tr>
                                <td scope="row">` + dataBySheet['Choice of Credit Card'] + `</td>
                                <td>
                                    <select required class="form-select"
                                        aria-label="Default select example" id = ` + trimTheCardType + `> ` +
				FILEUPLOADDATA.creditCardsByIssuersOptions + `
                                </td>
								<td>
                                <input type="number" min="0" class="form-control" id="`+ trimTheCardType + `-cashback" aria-describedby="cashBackHelp"></input>
                                </td>
                            </tr>`;
		}

	} else if (issuer == 12) {

		//console.log(dataBySheet, "bank of baroda");
		let checkIfAlredayExist = false;
		for (let i = 0; i < FILEUPLOADDATA.cardsByFileArray.length; i++) {
			if (dataBySheet['PRODUCT_VARIANT'] == FILEUPLOADDATA.cardsByFileArray[i] && dataBySheet['PRODUCT_VARIANT'] != "") {
				checkIfAlredayExist = true;
			}
		}
		if (!checkIfAlredayExist && dataBySheet['PRODUCT_VARIANT'] != "") {
			let trimTheCardType = dataBySheet['PRODUCT_VARIANT'].replaceAll(" ", "_");
			FILEUPLOADDATA.cardsByFileArray.push(dataBySheet['PRODUCT_VARIANT']);
			FILEUPLOADDATA.newCardHtmlTrs = FILEUPLOADDATA.newCardHtmlTrs + ` <tr>
                                <td scope="row">` + dataBySheet['PRODUCT_VARIANT'] + `</td>
                                <td>
                                    <select required class="form-select"
                                        aria-label="Default select example" id = ` + trimTheCardType + `> ` +
				FILEUPLOADDATA.creditCardsByIssuersOptions + `
                                </td>
								<td>
                                <input type="number" min="0" class="form-control" id="`+ trimTheCardType + `-cashback" aria-describedby="cashBackHelp"></input>
                                </td>
                            </tr>`;
		}

	} else if (issuer == 19) {

		console.log(dataBySheet, " AU small bank");
		let checkIfAlredayExist = false;
		for (let i = 0; i < FILEUPLOADDATA.cardsByFileArray.length; i++) {


			if (dataBySheet['CARD_VARIANT_SELECTED'] == FILEUPLOADDATA.cardsByFileArray[i] && dataBySheet['CARD_VARIANT_SELECTED'] != "") {
				checkIfAlredayExist = true;
			}
		}
		if (!checkIfAlredayExist && dataBySheet['CARD_VARIANT_SELECTED'] != "") {
			let trimTheCardType = dataBySheet['CARD_VARIANT_SELECTED'].replaceAll(" ", "_");
			FILEUPLOADDATA.cardsByFileArray.push(dataBySheet['CARD_VARIANT_SELECTED']);
			FILEUPLOADDATA.newCardHtmlTrs = FILEUPLOADDATA.newCardHtmlTrs + ` <tr>
                                <td scope="row">` + dataBySheet['CARD_VARIANT_SELECTED'] + `</td>
                                <td>
                                    <select required class="form-select"
                                        aria-label="Default select example" id = ` + trimTheCardType + `> ` +
				FILEUPLOADDATA.creditCardsByIssuersOptions + `
                                </td>
								<td>
                                <input type="number" min="0" class="form-control" id="`+ trimTheCardType + `-cashback" aria-describedby="cashBackHelp"></input>
                                </td>
                            </tr>`;
		}

	} else if (issuer == 7) {
		//console.log("hi im in issuer 7 yes bank managematchedData");
	} else {
		//console.log("matching in cards");
	}

}

/*--------------------------------- REPLACE CARD NAME  here.....--------------------------------------------- */
FILEUPLOADDATA.replaceCardNameWithid = function () {
	//FILEUPLOADDATA.fileCardNameAndId 
}


/*--------------------------------- POSTING DATA here.....--------------------------------------------- */
FILEUPLOADDATA.submitDataToDb = async function () {
	// $('#loader-overlay').addClass('loader-display');
	let checkIfAllSelected = FILEUPLOADDATA.checkIfAllSelected();
	if (checkIfAllSelected && FILEUPLOADDATA.matchedUserData.length > 0) {
		let returnResult = false;

		returnResult = await FILEUPLOADDATA.entryToDb();
		// $('#loader-overlay').removeClass('loader-display');
		//////console.log("returnResultreturnResult", returnResult);
		// window.location.href = "/card-application";
	} else {
		if (FILEUPLOADDATA.selectedIssuer == 19 && FILEUPLOADDATA.matchedUserData.length > 0) {
			//console.log("hi minindinf");
			let returnResult = false;

			returnResult = await FILEUPLOADDATA.entryToDb();
		} else if (FILEUPLOADDATA.selectedIssuer == 7 && FILEUPLOADDATA.matchedUserData.length > 0) {
			//console.log("hi im in submitDataToDb in yes");
			//console.log(FILEUPLOADDATA.matchedUserData);
			let returnResult = false;

			returnResult = await FILEUPLOADDATA.entryToDb();

		}
		else {
			alert('PLEASE FILL ALL FIELDS');
		}


	}

}

/*--------------------------------- WNTRY TO DB here.....--------------------------------------------- */
FILEUPLOADDATA.entryToDb = async function () {
	////console.log('HI I AM IN THIS');
	let returnResult = false;


	// for (let a = 0; a < FILEUPLOADDATA.matchedUserData.length; a++) {
	// 	let cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['cardName'].replaceAll(" ", "_");
	// 	FILEUPLOADDATA.matchedUserData[a]['cardId'] = document.getElementById(cardSelectedId).value;
	// 	//////console.log(FILEUPLOADDATA.matchedUserData[a], "FILEUPLOADDATA.matchedUserData");
	// }
	// $('#loader-overlay').addClass('loader-display');


	if (FILEUPLOADDATA.selectedIssuer == 5) {
		for (let a = 0; a < FILEUPLOADDATA.matchedUserData.length; a++) {
			let cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['cardName'].replaceAll(" ", "_");
			////console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
			FILEUPLOADDATA.matchedUserData[a]['cardId'] = document.getElementById(cardSelectedId).value;
			//////console.log(FILEUPLOADDATA.matchedUserData[a], "FILEUPLOADDATA.matchedUserData");
			FILEUPLOADDATA.matchedUserData[a]['cashbacknew'] = document.getElementById(`${cardSelectedId}-cashback`).value;
		}
		////console.log("hee goes the seleted card issuer request axis------>>>", FILEUPLOADDATA.matchedUserData);
		await $.ajax({
			url: "/application-add-application-axis",
			type: "POST",
			// contentType: "application/jsonrequest",
			// dataType: 'json', 
			data: {
				"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData),
				"allCardFileName": JSON.stringify(fileCardNameAndOriginalCardId),
				"issuerId" : FILEUPLOADDATA.selectedIssuer
			},

			beforeSend: function () {
				$('#loader-overlay').addClass('loader-display');
			},

			success: function (result) {
				////console.log(result, "resultresultresultresultresultresultresultresult");
				returnResult = result.status;
				if (returnResult) {
					alert("ALL DONE");
					//window.location.href = "/card-application";
				}
			},
			complete: function () {
				$('#loader-overlay').removeClass('loader-display');
			},

		});

	} else if (FILEUPLOADDATA.selectedIssuer == 12) {


		//console.log("hee goes the seleted card issuer request bob------>>>", FILEUPLOADDATA.selectedIssuer);


		//console.log("hi im in entry to db with issuer ----->>>>", FILEUPLOADDATA.selectedIssuer);
		//console.log("mathceduser data ---->>>", FILEUPLOADDATA.matchedUserData);

		for (let a = 0; a < FILEUPLOADDATA.matchedUserData.length; a++) {
			let cardSelectedId;

			if (FILEUPLOADDATA.matchedUserData[a]['PRODUCT_VARIANT'] != "") {
				cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['PRODUCT_VARIANT'].replaceAll(" ", "_");
				//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
				FILEUPLOADDATA.matchedUserData[a].card_id = document.getElementById(cardSelectedId).value;
				FILEUPLOADDATA.matchedUserData[a]['cashbacknew'] = document.getElementById(`${cardSelectedId}-cashback`).value;

			} else {
				//cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['Choice of Credit Card'].replaceAll(" ", "_");
				//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
				FILEUPLOADDATA.matchedUserData[a].card_id = "";
			}



		}
		//console.log(FILEUPLOADDATA.matchedUserData, "FILEUPLOADDATA.matchedUserData");

		await $.ajax({
			url: "/application-add-application-bob",
			type: "POST",
			// contentType: "application/jsonrequest",
			// dataType: 'json', 
			data: {
				"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData),
				"allCardFileName": JSON.stringify(fileCardNameAndOriginalCardId),
				"issuerId" : FILEUPLOADDATA.selectedIssuer
			},

			beforeSend: function () {
				$('#loader-overlay').addClass('loader-display');
			},

			success: function (result) {
				//console.log(result, "resultresultresultresultresultresultresultresult");
				returnResult = result.status;
				if (returnResult) {
					alert("ALL DONE");
					//window.location.href = "/card-application";
				}
			},
			complete: function () {
				$('#loader-overlay').removeClass('loader-display');
			},

		});

	} else if (FILEUPLOADDATA.selectedIssuer == 14) {
		//console.log("hi im in entry to db with issuer ----->>>>", FILEUPLOADDATA.selectedIssuer);
		//console.log("mathceduser data ---->>>", FILEUPLOADDATA.matchedUserData);

		for (let a = 0; a < FILEUPLOADDATA.matchedUserData.length; a++) {
			let cardSelectedId;

			if (FILEUPLOADDATA.matchedUserData[a]['Choice of Credit Card'] != "") {
				cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['Choice of Credit Card'].replaceAll(" ", "_");
				//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
				FILEUPLOADDATA.matchedUserData[a].card_id = document.getElementById(cardSelectedId).value;
				FILEUPLOADDATA.matchedUserData[a]['cashbacknew'] = document.getElementById(`${cardSelectedId}-cashback`).value;

			} else {
				//cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['Choice of Credit Card'].replaceAll(" ", "_");
				//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
				FILEUPLOADDATA.matchedUserData[a].card_id = "";
			}



		}
		//console.log(FILEUPLOADDATA.matchedUserData, "FILEUPLOADDATA.matchedUserData");
		//////// posting data here......////////////////////

		$.ajax({
			url: "/application-add-application-idfc",
			type: "POST",
			data: {
				"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData),
				"allCardFileName": JSON.stringify(fileCardNameAndOriginalCardId),
				"issuerId" : FILEUPLOADDATA.selectedIssuer
			}
		}).done(function (result) {

			//console.log("response from api ---->>>>", result);
			if (result.status) {
				alert("Operation performed successfully");
			}

		});


	} else if (FILEUPLOADDATA.selectedIssuer == 19) {
		////console.log("hi im in entry to db with issuer ----->>>>", FILEUPLOADDATA.selectedIssuer);
		////console.log("mathceduser data ---->>>", FILEUPLOADDATA.matchedUserData[a]['CARD_VARIANT_SELECTED']);

		for (let a = 0; a < FILEUPLOADDATA.matchedUserData.length; a++) {
			let cardSelectedId;

			if (FILEUPLOADDATA.matchedUserData[a]['CARD_VARIANT_SELECTED'] != "") {
				cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['CARD_VARIANT_SELECTED'].replaceAll(" ", "_");
				//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
				FILEUPLOADDATA.matchedUserData[a].card_id = document.getElementById(cardSelectedId).value;
				FILEUPLOADDATA.matchedUserData[a]['cashbacknew'] = document.getElementById(`${cardSelectedId}-cashback`).value;

			} else {
				//cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['Choice of Credit Card'].replaceAll(" ", "_");
				//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
				FILEUPLOADDATA.matchedUserData[a].card_id = "";
			}



		}
		//console.log(FILEUPLOADDATA.matchedUserData, "FILEUPLOADDATA.matchedUserData");
		//////// posting data here......////////////////////

		$.ajax({
			url: "/application-add-application-au",
			type: "POST",
			data: {
				"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData),
				"allCardFileName": JSON.stringify(fileCardNameAndOriginalCardId),
				"issuerId" : FILEUPLOADDATA.selectedIssuer
			}
		}).done(function (result) {

			//console.log("response from api ---->>>>", result);
			if (result.status) {
				alert("Operation performed successfully");
			} else {
				alert("Sheet not uploaded");
			}

		});


	} else if (FILEUPLOADDATA.selectedIssuer == 7) {
		////console.log("hi im in entry to db with issuer ----->>>>", FILEUPLOADDATA.selectedIssuer);
		////console.log("mathceduser data ---->>>", FILEUPLOADDATA.matchedUserData[a]['CARD_VARIANT_SELECTED']);

		// for (let a = 0; a < FILEUPLOADDATA.matchedUserData.length; a++) {
		// 	let cardSelectedId;

		// 	if (FILEUPLOADDATA.matchedUserData[a]['CARD_VARIANT_SELECTED'] != "") {
		// 		cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['CARD_VARIANT_SELECTED'].replaceAll(" ", "_");
		// 		//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
		// 		FILEUPLOADDATA.matchedUserData[a].card_id = document.getElementById(cardSelectedId).value;
		// 		FILEUPLOADDATA.matchedUserData[a]['cashbacknew'] = document.getElementById(`${cardSelectedId}-cashback`).value;

		// 	} else {
		// 		//cardSelectedId = FILEUPLOADDATA.matchedUserData[a]['Choice of Credit Card'].replaceAll(" ", "_");
		// 		//console.log("wdgubwrnvier [] ------- >>>>>>", document.getElementById(cardSelectedId));
		// 		FILEUPLOADDATA.matchedUserData[a].card_id = "";
		// 	}



		// }
		//console.log(FILEUPLOADDATA.matchedUserData, "FILEUPLOADDATA.matchedUserData");
		//////// posting data here......////////////////////

		$.ajax({
			url: "/application-add-application-yes",
			type: "POST",
			data: {
				"allData": JSON.stringify(FILEUPLOADDATA.matchedUserData),
				"allCardFileName": JSON.stringify(fileCardNameAndOriginalCardId),
				"issuerId" : FILEUPLOADDATA.selectedIssuer
			}
		}).done(function (result) {

			//console.log("response from api ---->>>>", result);
			if (result.status) {
				alert("Operation performed successfully");
			}

		});


	} else {
		alert("card issuer not selected!");
	}

	return returnResult;
}

/*--------------------------------- CHECK SELECTED here.....--------------------------------------------- */



FILEUPLOADDATA.checkIfAllSelected = function () {
	let returnData = false;
	fileCardNameAndOriginalCardId = {};
	if (FILEUPLOADDATA.cardsByFileArray.length > 0) {
		for (let i = 0; i < FILEUPLOADDATA.cardsByFileArray.length; i++) {
			let cardSelectedId = FILEUPLOADDATA.cardsByFileArray[i].replaceAll(" ", "_");
			let check = document.getElementById(cardSelectedId).value;
			if (check == 0) {
				alert('PLEASE SELECT ALL CARDS');
				returnData = false;
				break;
			} else {
				if (check != null && check != 'null') {
					fileCardNameAndOriginalCardId[check] = FILEUPLOADDATA.cardsByFileArray[i];
				}

				returnData = true;
			}
		}
	}
	//console.log(fileCardNameAndOriginalCardId , "fileCardNameAndOriginalCardIdfileCardNameAndOriginalCardId");
	return returnData;
}
