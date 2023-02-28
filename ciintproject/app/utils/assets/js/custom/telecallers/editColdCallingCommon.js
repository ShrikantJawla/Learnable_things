// Declaring Variables to store input values
let coldCallingId, coldCallingCallStatus, coldCallingNotes, coldCallingCallCounter, coldCallingCallScheduled, coldSmsStatus, coldSmsCounter;
let sendData = {};


// Event Listener for detecting changes in form
$('#coldCallingForm').on('change keyup paste', ':input', function(e) {
    $("#update").prop("disabled", false);
});

// On clicking update button reading form data and making post request 
$("#update").click(function(e){
    $("#update").prop("disabled", true);
    $("#loader").show();
    coldCallingId = $("#cc_id").val();
    coldCallingCallStatus = $("#cc_call_status").val();
    coldCallingNotes = $("#cc_note").val();
    coldCallingCallCounter = $("#cc_call_declined_counter").val();
    coldCallingCallScheduled = $("#cc_call_scheduled").val();
    coldSmsStatus = $("#cc_sms_status").val();

    sendData = {
        cc_id : coldCallingId,
        call_status : coldCallingCallStatus,
        call_notes : coldCallingNotes,
        call_counter : coldCallingCallCounter,
        call_schedule : coldCallingCallScheduled,
        sms_status : coldSmsStatus,
        sms_counter : coldSmsCounter
    }
    
    $.ajax({
        url: "/cc/update-cold-calling",
        type: "PUT",
        data: sendData,
        success: function (result) {
            $("#loader").hide();
            alert("oki")
        }
    })
})

$("#call_btn").click(function(){
    $("#loader").show();
    let destinationNumber = $("#au_phone_number").val()
    // API for calling a number 
    $.ajax({
        url : "/ts/make-call",
        type : "POST",
        data : {
            destination_number : destinationNumber
        },
        success: function (result) {
            console.log(result)
            $("#loader").hide();
            alert(result.message)
        }, 
        error : function(error){
            console.log(error, "error")
        }
    })
})