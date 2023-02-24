$(document).ready(function() {
    $("#loader").hide();

    $("#dateTimePicker").flatpickr();
    let i = 1;
    const wrapper = document.querySelector(".dynamicNoOfInputs");
    $("#userSegmentFurtherForm").on("change", function() {
        let optionVal = $(this).val();
        $("#furtherFormData").html("");
        if (optionVal == 1) {
            $("#furtherFormData").append(
                '<div class=""><label for="notificationTitle" class="form-label">Enter FCM Token</label><input type="text" class="form-control" name="fcmField" id="fcmToken" required></div>'
            );
        } else if (optionVal == 2) {
            $("#furtherFormData").append(
                '<label for="notificationTitle" class="form-label">Select Target Devices</label> <select name="targetDeviceSelect" class="form-select" aria-label="Select User Segments" id="devicesForm"><option value= "0" selected>All Devices </option> <option value="1">Android Devices</option> <option value="2">IOS Devices</option> </select>'
            );
        } else {
            $("#furtherFormData").html("");
        }
    });

    $('#loader').bind('ajaxStart', function() {
        $(this).show();
    }).bind('ajaxStop', function() {
        $(this).hide();
    });

    $("#topicsSegmentFurtherForm").on("change", async function() {
        let optionVal = $(this).val();

        $("#topicsFurther").html("");
        if (optionVal == 1) {
            $("#loader").show();
            let apiRes = await SCHEDULENOTIFICATIONS.getCreditCardsTopics();
            // console.log(apiRes);
            $("#loader").hide();
            let selectToHtml = ` <label for="" class="form-label">Select Credit Card*</label> <select name="creditCardTopic" class="form-select"  id="topicsFurtherCreditCard">
                                                                   ${apiRes}
                                                                </select>`;
            $("#topicsFurther").html(selectToHtml);
            // document.getElementById()
        } else if (optionVal == 2) {
            $("#loader").show();
            let apiRes = await SCHEDULENOTIFICATIONS.getCardIssuersTopics();
            $("#loader").hide();

            let selectToHtml = ` <label for="" class="form-label">Select Card Issuer*</label> <select name="cardIssuersTopic" class="form-select"  id="topicsFurtherCardIssuer">
                                                                   ${apiRes}
                                                                </select>`;
            $("#topicsFurther").html(selectToHtml);
        } else {
            $("#topicsFurther").html("");
        }
    });

    // dynamicInputNumbers UI
    wrapper.addEventListener("click", (e) => {
        e.preventDefault();
        if (e.target.classList.contains("plusBtn")) {
            i++;
            const div = document.createElement("div");
            div.classList.add("row");
            div.classList.add("align-items-center");
            div.classList.add("mb-2");
            div.innerHTML = `<div class="col-1 text-end ">
                                    <button class="material-icons material-symbols-outlined minusBtn" >
                                    remove
                                    </button>
                                </div>
                                <div class="col-3">
                                    <select  name="pageVal${i}" class="form-control pageInput" data-number="${i}" id="">
                                        <option value="0">Select data</option>
                                        <option value="pageData">pageData</option>
                                        <option value="id">id</option>
                                        <option value="url">url</option>
                                    </select>
                                </div>
                                <div class="col-3">
                                    <input type="text" data-number="${i}" name="dataVal${i}" placeholder="Value" class="form-control valueInput" >
                                </div>
                                <div class="col-1 text-start">
                                        <button class="material-icons material-symbols-outlined plusBtn">
                                    add
                                    </button>
                                </div>`;
            wrapper.append(div);
        } else if (e.target.classList.contains("minusBtn")) {
            e.target.parentNode.parentNode.remove();
        }
    });

    $("#schedulingSelect").on("change", function() {
        let optionVal = $(this).val();
        $("#schedulingTimePicker").html("");
        if (optionVal == 1) {
            $("#schedulingTimePicker").append(
                '<div class=""><label for="" class="form-label">Live Time</label><input class="form-control scheduleTimePicker" id="dateTimePicker" type="text" placeholder="Select Date.."></div>'
            );
            $("#dateTimePicker").flatpickr({
                enableTime: true,
                dateFormat: "Y-m-d H:i",
                minDate: "today",
                maxDate: new Date().fp_incr(28),
            });
        } else {
            $("#schedulingTimePicker").html("");
        }
    });
});

SCHEDULENOTIFICATIONS = {};

SCHEDULENOTIFICATIONS.postData = function() {
    $("#loader").show();
    let payload = [];
    let formData = $("#notification-form").serializeArray();

    //getting form data values here.......

    let notifictionTitle = document.getElementById("notifictionTitle").value;
    let notificationText = document.getElementById("notificationText").value;
    let notificationImage = document.getElementById("notificationImageUrl").value;

    let userSegment = $("#userSegmentFurtherForm :selected").text();
    let messageTopics = $("#topicsSegmentFurtherForm :selected").text();
    let fcmToken = $("#fcmToken").val();
    let targetDevices = $("#devicesForm :selected").val();

    let cardCardTopicsVal = $("#topicsFurtherCreditCard").val();
    let cardIssuerTopicsVal = $("#topicsFurtherCardIssuer").val();
    let schedulingTime = $("#schedulingSelect").val();

    const pageInputs = document.getElementsByClassName("pageInput");
    const valueInputs = document.getElementsByClassName("valueInput");

    console.log(schedulingTime);
    let notificationTime = 1;

    if (schedulingTime == 1) {
        let timeForNotification = $("#dateTimePicker").val();
        console.log("value of time 0----- ", timeForNotification);
        notificationTime = timeForNotification;
    }

    for (i = 0; i < pageInputs.length; i++) {
        if (
            pageInputs[i].value != "" &&
            valueInputs[i].value != "" &&
            pageInputs[i].value != "0" &&
            valueInputs[i].value != "0"
        ) {
            payload.push({ page: pageInputs[i].value, value: valueInputs[i].value });
        }
    }
    console.log(payload, "payload here.....");

    console.log("form data here...... ----- >>>>>> ", formData);

    let finalDataTOPost = {};

    finalDataTOPost = {
        notifictionTitle: notifictionTitle,
        notificationText: notificationText,
        notificationImage: notificationImage,
        target: {
            userSegment: userSegment,
            messageTopics: messageTopics,
            fcmToken: fcmToken,
            targetDevices: targetDevices,
            cardCardTopicsVal: cardCardTopicsVal,
            cardIssuerTopicsVal: cardIssuerTopicsVal,
        },
        payload: payload,
        notificationTime: notificationTime,
    };

    // return formData;

    console.log(finalDataTOPost, "finaojdfn");

    if (
        notificationText === null ||
        notificationText === "" ||
        notifictionTitle === null ||
        notifictionTitle === ""
    ) {
        alert("Notification tiitle or text  is empty");
    } else {
        $.ajax({
            url: "/schedule-notifications-formdata",
            type: "POST",
            data: JSON.stringify(finalDataTOPost),
            contentType: "application/json",
            success: (resp) => {
                console.log(resp, "resp resp");
            },
            complete: function() {
                $('#loader').hide();
            }

        });

    }
};

SCHEDULENOTIFICATIONS.getCreditCardsTopics = async function() {
    let returnData = '<option value="">Select Credit Card</option>';
    await $.ajax({
        url: "/creditcardforrelation",
        method: "GET",
        success: function(response) {
            //console.log(response.payload);
            for (let i = 0; i < response.payload.length; i++) {
                returnData += `<option value="Card_${response.payload[i].id}">${response.payload[i].CreditCardName}</option>`;
            }
        },
    });

    return returnData;
};

SCHEDULENOTIFICATIONS.getCardIssuersTopics = async function() {
    let returnData = '<option value="">Select Card Issuer</option>';
    await $.ajax({
        url: "/cardissuerslist-ajax",
        method: "POST",
        success: function(response) {
            for (let i = 0; i < response.payload.length; i++) {
                returnData += `<option value="Issuer_${response.payload[i].id}">${response.payload[i].IssuerName}</option>`;
            }
        },
    });

    return returnData;
};