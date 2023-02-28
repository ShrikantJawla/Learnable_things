let templateData;
let modalData;
// Getting Change in Bank Select
FILEUPLOADDATA.selectBank = function (element) {
  selectedId = $(element).val();
  selectedBank = $("#card-issuers-here option:selected").text();
  $("#template-table tbody").empty();
  getSmsTemplate(selectedId);
};

// Adding issuer_id to load Bank On Default
getSmsTemplate(1);

// Function to get sms templates by issuer id
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
      updateSmsTemplate(templateData);
    })
    .fail(function (error) {
      alert("Error Adding Template");
    });
}
function updateSmsTemplate(data) {
  let htmlString;
  let tableBody = $("#template-table tbody");
  for (let i = 0; i < data.length; i++) {
    htmlString = `<tr><td>${data[i].bank_name}</td><td>${data[i].sms_status}</td><td>${data[i].flow_id}</td><td>${data[i].template_id}</td><td>${data[i].sms_template}</td><td>
        <a onclick="editSmsTemplateModal(${data[i].id})" class="edit" data-toggle="modal"><i class="material-icons"></i></a>
        <a onclick="deleteSmsTemplateModal(${data[i].id})" class="delete" data-toggle="modal"><i class="material-icons"></i></a>
    </td></tr>`;
    tableBody.append(htmlString);
  }
}
// Function to add new sms template
$("#add-sms-template").submit(function (event) {
  var formData = {
    issuer_id: $("#issuer_id_new").val(),
    bank_name: $("#issuer_id_new option:selected").text(),
    sms_status: $("#sms_status_new").val(),
    flow_id: $("#flow_id_new").val(),
    template_id: $("#template_id_new").val(),
    sms_template: $("#template_new").val(),
  };
  $.ajax({
    type: "POST",
    url: "/factory/add-sms-template",
    data: formData,
    dataType: "json",
    encode: true,
  })
    .done(function (data) {
      console.log(data);
      window.location.reload();
    })
    .fail(function (error) {
      alert("Error Adding Template");
    });
  event.preventDefault();
  $("#addEmployeeModal").modal("hide");
});

// Enabling Edit Modal
function editSmsTemplateModal(e) {
  console.log(e)
  $("#editTemplateModal").modal("show");
  for (let i = 0; i < templateData.length; i++) {
    if (templateData[i].id === e) {
      $("#edit-id").val(e);
      $("#edit-bank").val(templateData[i].bank_name);
      $("#edit-status").val(templateData[i].sms_status);
      $("#edit-flow-id").val(templateData[i].flow_id);
      $("#edit-template-id").val(templateData[i].template_id);
      $("#edit-template").val(templateData[i].sms_template);
    }
  }
}
// Disabling Edit Modal
$(".close-edit-modal").click(function() {
  $("#editTemplateModal").modal("hide");
});

// Enabling Save Button
$('#template-edit-form').on('change keyup paste', ':input', function(e) {
  $("#save-edit-template").prop('disabled', false);
});

// Saving Updated Sms Template
$("#editTemplateModal").submit(function (event) {
  event.preventDefault();
  var formData = {
    id : $("#edit-id").val(),
    sms_status: $("#edit-status").val(),
    flow_id: $("#edit-flow-id").val(),
    template_id: $("#edit-template-id").val(),
    sms_template: $("#edit-template").val(),
  };
  $.ajax({
    type: "POST",
    url: "/factory/edit-sms-template",
    data: formData,
    dataType: "json",
    encode: true,
  })
    .done(function (data) {
      $("#editTemplateModal").modal("hide");
      window.location.reload();
    })
    .fail(function (error) {
      alert("Error Updating Template");
    });
});

// Enabling Delete Modal
function deleteSmsTemplateModal(e) {
  modalData = e;
  $("#deleteTemplateModal").modal("show");
}

// Disabling Edit Modal
$(".close-delete-modal").click(function() {
  $("#deleteTemplateModal").modal("hide");
});

// Deleting Sms Template
$("#delete-template-btn").click(function (event) {
  event.preventDefault();
  var formData = {
    id : modalData,
  };
  $.ajax({
    type: "POST",
    url: "/factory/delete-sms-template",
    data: formData,
    dataType: "json",
    encode: true,
  })
    .done(function (data) {
      $("#deleteTemplateModal").modal("hide");
      window.location.reload();
    })
    .fail(function (error) {
      alert("Error Deleting Template");
    });
  console.log(modalData)
});