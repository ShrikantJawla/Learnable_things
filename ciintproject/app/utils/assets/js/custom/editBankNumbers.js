let bankCode = {
  1: "axis",
  2: "bob",
  4: "idfc",
  7: "au",
  11: "yes",
  6: "icici",
};
let filterObject = {
  id: [],
  tc_phone_number: [],
  user_admin_id: [],
  tc_enabled: [],
};

let currentId;

$(document).ready(function () {
  $("#tc_phone_number").select2();
});

$("#bank-issuers-here").change(function (e) {
  currentBank = e.target.value;
  getTableData(e.target.value);
});

$("#bank-issuers-here option:eq(1)").prop("selected", true);
getTableData(1);

function getTableData(data) {
  let bank_name = bankCode[data];
  $.ajax({
    url: `/calling/get-caller-id-with-issuer?issuer=${data}`,
    type: "POST",
    data: {
      filter: filterObject,
    },
    success: function (result) {
      renderTableData(result.payload);
    },
    error: function (err) {
      console.log(err);
    },
  });
}

function renderTableData(data) {
  let htmlString;
  if (data.length != 0) {
    for (let i = 0; i < data.length; i++) {
      htmlString += `							
            <tr>
                <td class="text-center">${data[i].id}</td>
                <td class="text-center">${data[i].tc_phone_number}</td>
                <td class="text-center">${data[i].ua_name}</td>
                <td class="text-center">${data[i].tc_enabled}</td>
                <td class="text-center">
                    <a onclick="editCallerIdModal('${data[i].id}')" class="edit" data-toggle="modal"><i class="material-icons"></i></a>
                    <a onclick="deleteCallerIdModal('${data[i].id}')" class="delete" data-toggle="modal"><i class="material-icons"></i></a>
                </td>
            </tr>`;
    }
    $("#table_body").html(htmlString);
  } else {
    $("#table_body").empty();
  }
}

// Function to detect change in banks select
$("#issuer_id").change(function (e) {
  let issuer_id = e.target.value;
  let bank_name = bankCode[issuer_id];

  // Getting telecallers with permission
  $.ajax({
    url: "/calling/get-tele-users-mn",
    type: "POST",
    data: {
      issuer: issuer_id,
      bank: bank_name,
    },
    success: function (result) {
      allUsers = result.payload;
      $("#telecaller_id").html(
        `<option value="" disabled selected>Select Telecaller</option>`
      );
      for (i = 0; i < allUsers.length; i++) {
        $("#telecaller_id").append(
          $("<option>").val(allUsers[i].ua_id).text(allUsers[i].ua_name)
        );
      }
    },
    error: function (err) {
      console.log(err, " Error Getting tele users");
    },
  });

  // Getting caller ids in all issuers
  $.ajax({
    url: "/calling/get-default-caller-id",
    type: "POST",
    data: {
      issuer: issuer_id,
      bank: bank_name,
    },
    success: function (result) {
      allDeafultCallerId = result.payload;
      // console.log(result.payload);
      $("#tc_phone_number").empty();
      for (i = 0; i < allDeafultCallerId.length; i++) {
        $("#tc_phone_number").append(
          $("<option>")
            .val(allDeafultCallerId[i].tc_id)
            .text(allDeafultCallerId[i].tc_phone_number)
        );
      }
    },
    error: function (err) {
      console.log(err, "Error Getting tele users");
    },
  });
});

// Function for submitting add new number form

$("#assignCallerIdModal").submit(function (e) {
  e.preventDefault();

  let tc_number = $("#tc_phone_number").val();
  let issuer_id = $("#issuer_id").val();
  let telecaller_id = $("#telecaller_id").val();
  let enabled = $("#tc_enabled").prop("checked");

  $.ajax({
    url: "/calling/post-new-caller-id",
    contentType: "application/json",
    type: "POST",
    data: JSON.stringify({
      issuer: issuer_id,
      number: tc_number,
      telecaller: telecaller_id,
      isEnabled: enabled,
    }),
    success: function (result) {
      getTableData($("#bank-issuers-here").val());
    },
    error: function (err) {
      alert("Something went wrong");
    },
  });
});

$("#addCallerIdModal").submit(function (e) {
  e.preventDefault();
  $("#loader").show();
  let tc_number = $("#new_tc_phone_number").val();
  let issuer_id = $("#new_issuer_id").val();
  let enabled = $("#new_tc_enabled").prop("checked");

  $.ajax({
    url: "/calling/add-bank-numbers",
    contentType: "application/json",
    type: "POST",
    data: JSON.stringify({
      issuer: issuer_id,
      number: tc_number,
      isEnabled: enabled,
    }),
    success: function (result) {
      window.location.reload();
    },
    error: function (err) {
      alert("Something went wrong");
    },
  });
});

// Enabling Edit Caller Id Modal
function editCallerIdModal() {
  $("#editCallerIdModal").modal("show");
}

// Closing Edit Modal
$(".close-edit-modal").click(function () {
  $("#editCallerIdModal").modal("hide");
});

// Enabling Delete Modal
function deleteCallerIdModal(id) {
  $("#deleteCallerIdModal").modal("show");
  currentId = id;
}

$("#delete-caller-id-btn").click(function () {
  $.ajax({
    url: "/calling/unassign-caller-id",
    type: "POST",
    data: {
      id: currentId,
    },
    success: function (result) {
      $("#deleteCallerIdModal").modal("hide");
      getTableData($("#bank-issuers-here").val());
    },
    error: function (err) {
      console.log(err, "Error Getting tele users");
    },
  });
});
// Closing Delete Modal
$(".close-delete-modal").click(function () {
  $("#deleteCallerIdModal").modal("hide");
});

$(document).ready(function () {
  $.ajax({
    url: "/calling/get-tele-users-mn",
    type: "POST",
    data: {
      issuer: 1,
      bank: "axis",
      filter: filterObject,
    },
    success: function (result) {
      allUsers = result.payload;
      // console.log(result.payload);
      let htmlString = ``;
      htmlString = `<option value="">Select Telecaller</option>`;
      for (i = 0; i < allUsers.length; i++) {
        htmlString += `<option value="${allUsers[i].ua_id}">${allUsers[i].ua_name}</option>`;
      }
      $("#search_telecaller").html(htmlString);
      // console.log("oki 1");
    },
    error: function (err) {
      console.log(err, "Error Getting tele users");
    },
  });
});

$("#seach_id").change(function (e) {
  delete filterObject.id;
  filterObject.id = e.target.value;
  let data = $("#bank-issuers-here").val();
  getTableData(data);
});
$("#seach_phone").change(function (e) {
  delete filterObject.tc_phone_number;
  filterObject.tc_phone_number = e.target.value;
  let data = $("#bank-issuers-here").val();
  getTableData(data);
});
$("#search_telecaller").change(function (e) {
  delete filterObject.user_admin_id;
  filterObject.user_admin_id = e.target.value;
  let data = $("#bank-issuers-here").val();
  getTableData(data);
});
$("#search_enabled").change(function (e) {
  delete filterObject.tc_enabled;
  filterObject.tc_enabled = e.target.checked;
  let data = $("#bank-issuers-here").val();
  getTableData(data);
});
