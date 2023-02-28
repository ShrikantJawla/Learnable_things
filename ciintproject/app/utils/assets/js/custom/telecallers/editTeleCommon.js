const pageType = window.location.pathname.split("/")[1];
const updateBtn = document.getElementById("update");
const smsStatus = document.getElementById("tad_sms_status");
const smsBtn = document.getElementById("tad_send_sms");
let updateEnable = false;
let allFieldsArray, mainTableId, details;
let inputObject = {};
let statusObject;
let smsCounter;
let phone;
let leftForm = document.getElementById("left-form");
let rightForm = document.getElementById("right-form");
let templateData;
let flowId;
let templateId;
let statusId;
let bank_id;
let formType;

switch (pageType) {
  case "axis":
    bank_id = 1;
    break;
  case "au":
    bank_id = 7;
    break;
  case "bob":
    bank_id = 2;
    break;
  case "citi":
    bank_id = 3;
    break;
  case "idfc":
    bank_id = 4;
    break;
  case "yes":
    bank_id = 11;
    break;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}
const readyFunction = async (table) => {
  await getAllFields("/factory/fields", `${table}`);
  Object.keys(fieldData).forEach((key) => {
    fieldData[key]["dataType"] = allFieldsArray.find(
      (val) => val.column_name === key
    ).data_type;
    fieldData[key]["tableName"] = allFieldsArray.find(
      (val) => val.column_name === key
    ).table_name;
  });
  let htmlString = `<div class="row" style="row-gap:20px">`;

  // Adding Phone Number and Name in IDFC Bank
  if(window.location.href.includes("idfc")){
    htmlString += 
  `<div class="col-6">
    <label for="phone_number" class="form-label">Phone Number</label>
    <input type="text" class="form-control" id="phone_number" name="phone_number" disabled="" required="">
  </div>
  <div class="col-6">
    <label for="name" class="form-label">Name</label>
    <input type="text" class="form-control" id="name" name="name" disabled="" required="">
  </div>`;
  }
  Object.keys(fieldData)
    .sort((a, b) => fieldData[a]["order"] - fieldData[b]["order"])
    .forEach((key) => {
      const { colSpan, isEditable, dataType, tableName } = fieldData[key];
      if (selectFieldsArray.includes(key)) {
        htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <select class='form-control' id=${key} name=${key}  ${
          isEditable ? "" : `disabled`
        }>
							<option value="">Select ${tableName}</option>
					`;
        for (i = 0; i < selectFieldsObject[key].length; i++) {
          htmlString += `<option value="${selectFieldsObject[key][i]}">${selectFieldsObject[key][i]}</option>`;
        }
        htmlString += `
            </select>
					 </div>
					`;
      } else if (key === "ca_main_table") {
        htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label"><a id="mainTableLink" href="/applications/edit-application-ui?id=${mainTableId}">${tableName}</a></label>
                                <input type="number" class="form-control" id="${key}" name="${key}" ${
          isEditable ? "" : `disabled`
        } required>
                            </div>`;
      } else if (dataType === "integer" || dataType === "bigint") {
        htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input type="number" class="form-control" id="${key}" name="${key}" ${
          isEditable ? "" : `disabled`
        } required>
                            </div>`;
      } else if (dataType === "date") {
        htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input class="form-control" type="date" placeholder="yyyy-mm-dd" id="${key}" name="${key}" ${
          isEditable ? "" : `disabled`
        } >
                            </div>`;
        $(`#${key}`).flatpickr();
      } else if (
        dataType === "timestamp with time zone" ||
        dataType === "timestamp without time zone"
      ) {
        htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input class="form-control" type="date" placeholder="yyyy-mm-dd" id="${key}" name="${key}" ${
          isEditable ? "" : `disabled`
        } >
                            </div>`;
        $(`#${key}`).flatpickr();
      } else if (dataType === "boolean") {
        htmlString += `
                <div class="col-${colSpan}" style="display:flex;flex-direction:column;">
                    <label for="${key}" class="form-label">${tableName}</label>
                    <label class="switch">
                        <input type="checkbox" id="${key}" name="${key}" ${
          isEditable ? "" : `disabled`
        }>
                        <span class="slider round"></span>
                    </label>
                </div>
            `;
      } else {
        htmlString += `<div class="col-${colSpan}">
                                <label for="${key}" class="form-label">${tableName}</label>
                                <input type="text" class="form-control" id="${key}" name="${key}" ${
          isEditable ? "" : `disabled`
        } required>
                            </div>`;
      }
    });
  htmlString += `</div>`;
  leftForm.innerHTML = htmlString;
};
let getAllFields = async (url, table) => {
  return $.ajax({
    url: `${url}?table=${table}`,
    method: "GET",
    success: function (result) {
      allFieldsArray = result.payload;
      allFieldsArray.map((field) => {
        field.table_name = field.column_name
          .split("_")
          .map((field) => capitalizeFirstLetter(field))
          .join(" ");
        
        field.table_name = field.table_name
          .replace(/Axis|Bob|Au|Idfc|Citi/, function (matched) {
            return "";
          })
          .trim();
        // CA Main Table - Main Table ID
        field.table_name = field.table_name.replace(
          "Ca Main Table",
          "Main Table"
        );
        field.table_name = field.table_name.replace("Bool", "").trim();
      });
    },
  }).then((res) => res.data);
};
let getFormData = async (url, id, home) => {
  return $.ajax({
    url: `/factory/get-tele-application-data-by-id?id=${id}&table=${pageType}`,
    method: "GET",
    success: function (result) {
      // console.log(result.payload)
      $("#phone_number").val(result.payload.phone_number);
      $("#name").val(result.payload.name);
      if(pageType === "axis"){
        if(result.payload.axis_final_status === "Pending"){
          formType = "Pending"
        }else if(result.payload.axis_final_status === "Rejected"){
          formType = "Rejected"
        }else if(result.payload.axis_final_status === "Approved" && result.payload.axis_activation === false || result.payload.axis_activation === null){
          formType = "Approved"
        }else if(result.payload.axis_final_status === "Approved" && result.payload.axis_activation === true){
          formType = "Activated"
        }
      }else if(pageType === "au"){
        formType = result.payload.au_final_status;
      }
      if(formType === "Pending"){
        $("#card-completion").removeClass("d-none");
      }else if(formType === "Approved"){
        $("#card-completion").addClass("d-none");
        $("#card-activation").removeClass("d-none");
        $("#card-completion-sms").addClass("d-none");
      }else if(formType === "Rejected"){
        $("#card-completion").addClass("d-none");
        $("#card-activation").addClass("d-none");
        $("#card-completion-sms").addClass("d-none");
        $("#card-rejected").removeClass("d-none");
      }
      else if(formType === "Activated"){
        $("#card-completion").addClass("d-none");
        $("#card-activation").addClass("d-none");
        $("#card-completion-sms").addClass("d-none");
        $("#card-activted").removeClass("d-none");
      }
      details = result.payload;
      // console.log(details)
      // console.log(result.payload, "------");
      mainTableId = details["ca_main_table"];
      $("#mainTableLink").attr(
        "href",
        mainTableId
          ? `/applications/edit-application-ui?id=${mainTableId}`
          : `#`
      );
      Object.keys(fieldData).forEach((key) => {
        if (fieldData[key].dataType === "boolean") {
          $(`#${key}`).prop("checked", details[key] || false);
          details[key] = details[key] || false;
        } else if (
          fieldData[key].dataType === "timestamp with time zone" ||
          fieldData[key].dataType === "timestamp without time zone" ||
          fieldData[key].dataType === "date"
        ) {
          if (details[key]) {
            const startdate = new Date(details[key]).toLocaleString("en-GB", {
              timeZone: "Asia/Kolkata",
            });
            const startDateArray = startdate.split(/,|\//);

            $(`#${key}`).val(
              `${startDateArray[2]}-${startDateArray[1]}-${startDateArray[0]}`
            );
          } else {
            $(`#${key}`).val(``);
          }
        } else {
          $(`#${key}`).val(details[key] || "");
        }
      });
      $(`#tad_call_status`).val(details["tad_call_status"] || "");
      $(`#tad_application_status`).val(details["tad_application_status"] || "");
      $(`#tad_automated_call_status`).val(details["tad_automated_call_status"] || "");
      $(`#tad_final_call_status`).val(details["tad_final_call_status"] || "");
      $(`#tad_notes`).val(details["tad_notes"] || "");
      $(`#tad_call_scheduled`).val(
        (details["tad_call_scheduled"] || "").slice(0, -8)
      );
      $(`#tad_call_decline_counter`).val(
        details["tad_call_decline_counter"] || 0
      );
      $(`#tad_activation_call_status`).val(details["tad_activation_call_status"] || "");
      $(`#tad_activation_notes`).val(details["tad_activation_notes"] || "");
      $(`#tad_activation_call_counter`).val(details["tad_activation_call_counter"] || 0);
      $(`#tad_automated_call_counter`).val(details["tad_automated_call_counter"] || 0);
      $(`#tad_sms_counter`).val(details["tad_sms_counter"] || 0);
      $(`#tad_activation_call_scheduled`).val(
        (details["tad_activation_call_scheduled"] || "").slice(0, -8)
      );
    },
  }).then((res) => res.data);
};

const validate = () => {
  Object.keys(inputObject).forEach((key) => {
    if (!details[key]) {
      if (inputObject[key] !== "") {
        updateBtn.disabled = false;
        updateEnable = true;
      } else delete inputObject[key];
    } else {
      if (inputObject[key] !== details[key]) {
        updateBtn.disabled = false;
        updateEnable = true;
      } else delete inputObject[key];
    }
  });
  if (!updateEnable) {
    updateBtn.disabled = true;
  } else {
    updateEnable = false;
  }
};

// Left form
leftForm.addEventListener("input", (e) => {
  if (e.target.type === "checkbox") {
    inputObject[e.target.name] = e.target.checked;
  } else {
    inputObject[e.target.name] = e.target.value;
  }
  validate();
});
// right form
rightForm.addEventListener("input", (e) => {
  if (e.target.id != "tad_sms_status") {
    if (e.target.type === "checkbox") {
      inputObject[e.target.name] = e.target.checked;
    } else {
      inputObject[e.target.name] = e.target.value;
    }
    validate();
  }
});


updateBtn.addEventListener("click", (e) => {
  $("#loader").show();
  $.ajax({
    url: `/factory/update-tele-table?id=${id}`,
    dataType: "json",
    type: "put",
    contentType: "application/json",
    data: JSON.stringify({ inputObject, tableName: pageType }),
    processData: false,
    success: function (data, textStatus, jQxhr) {
      $("#loader").hide();
    },
    error: function (jqXhr, textStatus, errorThrown) {
      console.log(errorThrown);
    },
  });
});

getSmsTemplate(bank_id)



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
function addOptionsFromTemplate(templateData){
  for(let i = 0; i < templateData.length; i++){
    $('#tad_sms_status').append(`<option value="${templateData[i].id}">${templateData[i].sms_status}</option>`);
  }
  
}

// Enabling Send SMS Button
smsStatus.addEventListener("change", (e) => {
  $("#tad_send_sms").prop("disabled", false);
});

// Sening SMS Request
smsBtn.addEventListener("click", (e) => {
  statusObject = $( "#tad_sms_status option:selected" ).text();
  statusId = $('#tad_sms_status').find(":selected").val();
  

  for(let i = 0; i < templateData.length; i++){
    if(statusId == templateData[i].id){
      flowId = templateData[i].flow_id;
      templateId = templateData[i].template_id;
    }
  }

  $("#loader").show();
  e.preventDefault();

  if (bank_id === 1) {
    phone = $("#axis_mobile_number").val();
  }
  else if(bank_id === 7){
    phone = $("#au_phone_number").val();
  }
  else if(bank_id === 11){
    phone = $("#yb_mobile_number").val();
  }
  else if(bank_id === 4){
    phone = $("#phone_number").val();
  }
  else{
    alert("Bank Not Implemented : Contact Admin")
    $("#loader").hide();
    return;
  }
  if(phone.length != 10){
    alert("Invalid Phone Number");
    $("#loader").hide();
    return;
  }

  smsCounter = $("#tad_sms_counter").val();
  smsCounter++;
  $.ajax({
    url: `/factory/send-status-sms?id=${id}`,
    dataType: "json",
    type: "post",
    contentType: "application/json",
    data: JSON.stringify({statusObject, tableName: pageType, smsCounter, phone, statusId, flowId, templateId}),
    processData: false,
    success: function (data, textStatus, jQxhr) {
        $("#tad_sms_counter").val(smsCounter);
        $("#loader").hide();
    },
    error: function (err) {
      $("#loader").hide();
      alert("Error Sending Sms")
    },
  });
});
