$('#loader').show();

const pageType = 'icici';
const smsStatus = document.getElementById("assigning_sms_status");
const smsBtn = document.getElementById("send_sms");
let updateEnable = false;
let statusObject;
let smsCounter;
let phone = $('#phone').val();
let templateData;
let flowId;
let templateId;
let statusId;
let bank_id;
let formType;


let updateBtn = $('#update');


updateBtn.click(async function () {

    await putApplicationData();
});

$("#pancard").keyup(function(){
    $(this).val($(this).val().toUpperCase());
})
function getDataFromForm() {
    let leftFormData = {
        leadId: $('#leadId').val(),
        mainTableId: $('#mainTableId').val(),
        name: $('#name').val(),
        email: $('#email').val(),
        phoneNumber: $('#phone').val(),
        applicationNumber: $('#application-number').val(),
        pinCode: $('#pincode').val(),
        dob: $('#dob').val(),
        pancard : $('#pancard').val(),
        employment: $('#employment').val(),
        gender: $('#gender').val(),
        relationShip: $('#relationship')[0].checked,
        otherBankCard: $('#otherbankcard')[0].checked,
        companyName: $('#company').val(),
        annulaIncome: $('#income').val(),
        currentAddress: $('#address').val(),
        qualification: $('#qualification').val(),
        employerDetails: $('#employer').val(),

    };
    let rightFormData = {
        workDone: $('#work-done')[0].checked,
        applicationStatus: $('#application_status').val(),
        notes: $('#notes').val(),
        callStatus: $('#call_status').val(),
        callCounter: $('#call_counter').val(),
        automatedCallStatus: $('#automated_call_status').val(),
        automatedCallCounter: $('#automated_call_counter').val(),
        finalCallStatus: $('#final_call_status').val(),
        assigningSmsStatus: $('#assigning_sms_status').val(),
        assigningSmsCounter: $('#assigning_sms_counter').val(),




    };


    return { leftFormData, rightFormData };
}



async function putApplicationData() {
    // let dataFromLeftForm = $('#leftform').serializeArray();

    let { leftFormData, rightFormData } = getDataFromForm();


    // console.log("data from form ----->>", fieldPair);
    $('#loader').show();
    await $.ajax({
        url: `/icici/update-icici-application-data`,
        type: 'POST',
        data: {
            formData: JSON.stringify({ leftFormData, rightFormData }),
        },
        complete: function () {
            $('#loader').hide();
        },
        success: function (data, textStatus, jQxhr) {
            $('#loader').hide()
            // location.reload()
        },
        error: function (jqXhr, textStatus, errorThrown) {
            console.log(errorThrown)
        }
    });
}



//  call here
$("#call_btn").click(function () {
    $("#loader").show();
    let destinationNumber = $("#phone").val()
    // API for calling a number 
    $.ajax({
        url: "/ts/make-call",
        type: "POST",
        data: {
            destination_number: destinationNumber,
            issuerId: 6
        },
        success: function (result) {
            // console.log(result)
            $("#loader").hide();
        },
        error: function (error) {
            $("#loader").hide();
        }
    })
});



getSmsTemplate(6);



// Getting SMS Status
function getSmsTemplate(issuer_id) {
    var formData = {
        issuer_id: issuer_id,
    };
    $.ajax({
        type: "POST",
        url: "/factory/get-sms-template",
        data: formData,
        dataType: "json",
        encode: true,
    })
        .done(function (data) {
            templateData = data.payload;
            addOptionsFromTemplate(templateData);
        })
        .fail(function (error) {
            alert("Error Adding Template");
        });
}


// Adding Template Data to Select:Options
function addOptionsFromTemplate(templateData) {
    console.log(templateData);
    for (let i = 0; i < templateData.length; i++) {
        $('#assigning_sms_status').append(`<option value="${templateData[i].id}">${templateData[i].sms_status}</option>`);
    }

}

// Enabling Send SMS Button
smsStatus.addEventListener("change", (e) => {
    $("#send_sms").prop("disabled", false);
});

// Sening SMS Request
smsBtn.addEventListener("click", (e) => {
    statusObject = $("#assigning_sms_status option:selected").text();
    statusId = $('#assigning_sms_status').find(":selected").val();


    for (let i = 0; i < templateData.length; i++) {
        if (statusId == templateData[i].id) {
            flowId = templateData[i].flow_id;
            templateId = templateData[i].template_id;
        }
    }

    $("#loader").show();
    e.preventDefault();

    bank_id = 6;


    console.log(phone.length);

    if (phone.length != 10) {
        alert("Invalid Phone Number");
        $("#loader").hide();
        return;
    }

    smsCounter = $("#assigning_sms_counter").val();
    console.log(smsCounter);
    smsCounter++;
    console.log(smsCounter);

    let jId = $('#leadId').val();

    $.ajax({
        url: `/factory/send-status-sms-icici?id=${jId}`,
        dataType: "json",
        type: "post",
        contentType: "application/json",
        data: JSON.stringify({ statusObject, tableName: pageType, smsCounter, phone, statusId, flowId, templateId }),
        processData: false,
        success: function (data, textStatus, jQxhr) {
            $("#sms_counter").val(smsCounter);
            $("#loader").hide();
        },
        error: function (err) {
            $("#loader").hide();
            alert("Error Sending Sms")
        },
    });
});







$('document').ready(async () => {
    $('#loader').hide();

});
