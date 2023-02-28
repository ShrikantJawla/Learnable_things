let FILEUPLOADDATA_COMMON = {};


async function fileUploadCommon(fileElement, sheetIndex , rawData ) {
    
    console.log(rawData , "rawDatarawDatarawDatarawDatarawDatarawData")
    console.log(sheetIndex, "sheet index in fileupload");
    console.log(fileElement, "dddddddddd");
    let returnData = [];
    var regex = /^([a-zA-Z0-9\s_\\.\-:])+(.xls|.xlsx)$/;
    //var fileUpload = $("#fileUpload")[0];
    console.log(fileElement.files[0].type)
    if (fileElement.files[0].type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || fileElement.files[0].type === "application/vnd.ms-excel.sheet.binary.macroenabled.12" || fileElement.files[0].type === "application/vnd.ms-excel.sheet.binary.macroEnabled.12") {
       console.log("rann insider")
        if (typeof (FileReader) != "undefined") {                                                                                           
            var reader = new FileReader();
            //For Browsers other than IE.
            if (reader.readAsBinaryString) {
                console.log('111');
                reader.onload = await function (e) {
                    FILEUPLOADDATA_COMMON.ProcessExcel(e.target.result, sheetIndex , rawData);
                };
                reader.readAsBinaryString(fileElement.files[0]);
            } else {
                console.log('2222');
                //For IE Browser.
                reader.onload = await async function (e) {
                    var data = "";
                    var bytes = new Uint8Array(e.target.result);
                    for (var i = 0; i < bytes.byteLength; i++) {
                        data += String.fromCharCode(bytes[i]);
                    }
                    FILEUPLOADDATA_COMMON.ProcessExcel(data, sheetIndex , rawData);

                };
                reader.readAsArrayBuffer(fileElement.files[0]);
            }

        } else {

            alert("This browser does not support HTML5.");
        }
    } else {

        alert("Please upload a valid Excel file.");
    }
}

/* A function that is called when the file is uploaded. */
FILEUPLOADDATA_COMMON.ProcessExcel = function (data, sheetIndex , rawData) {
    console.log(sheetIndex, "sheet index in process excel");
    //Read the Excel File data.
    var workbook = XLSX.read(data, {
        type: 'binary'
    });

    console.log("workbook", workbook.sheets);
    let sheetArr = [];
    for (let i = 0; i < workbook.SheetNames.length; i++) {
        let sheetName = workbook.SheetNames[i]
        let sheet = workbook.Sheets[sheetName]
        let sheetData = XLSX.utils.sheet_to_json(sheet, {
            raw: rawData,
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
    // var firstSheet = sheetIndex ? workbook.SheetNames[sheetIndex] : workbook.SheetNames[0];
    //Read all rows from First Sheet into an JSON array.
    var excelRows = sheetArr[maxLength];
    handelExcelData(excelRows);
};