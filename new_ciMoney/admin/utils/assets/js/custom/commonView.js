let GET_APPLICATIONS = {};
let ALLICATIONS_DATA = [];
let idsToRemove = [];
let REQ_DATA = {};
let newTotalCount;
let prevPage = document.querySelector("#prevPage");
let nextPage = document.querySelector("#nextPage");
let pageNoElement = document.querySelector("#page-no");
let limit = document.querySelector("#entriesPerPage");
let pageNo = pageNoElement.value;
let pages = $("#pages");
let pageLimit = "200";
let issuerName =
  window.location.href.split("/")[window.location.href.split("/").length - 2];
let currentPath =
  window.location.href.split("/")[window.location.href.split("/").length - 1];
let ajaxUrl = `/${issuerName}/${currentPath}-ajax`;

console.log(issuerName,currentPath)

let filterObject = {
  sort_asec: "",
  sort_desc: "",
  null: [],
  notNull: [],
  revised: [],
  int: {},
  string: {},
  bool: {},
  select: {},
  date: {},
  array: {},
  range : {}
};

$("#entriesPerPage").change(function () {
  $("#page-no").val(1);
});
limit.addEventListener("change", (e) => {
  pageLimit = e.target.value;
  GET_APPLICATIONS.getData();
});

$("#page-no").change((e) => {
  pageNo = e.target.value;
  GET_APPLICATIONS.getData();
});

prevPage.addEventListener("click", () => {
  pageNoElement.value =
    pageNoElement.value * 1 > 1 ? pageNoElement.value * 1 - 1 : 1;
  pageNo = pageNoElement.value;
  GET_APPLICATIONS.getData();
});

nextPage.addEventListener("click", () => {
  pageNoElement.value =
    pageNoElement.value * 1 < pageNoElement.getAttribute("max") * 1
      ? pageNoElement.value * 1 + 1
      : pageNoElement.getAttribute("max") * 1;
  pageNo = pageNoElement.value;
  GET_APPLICATIONS.getData();
});

$(document).ready(function () {
  GET_APPLICATIONS.getData();
  $(".multiple_select").chosen();
  $('.multiple_tele').select2({
    placeholder : "Select Telecaller"
  });
  $("#assign").click(function (e) {
    $("#assignModalNew").modal("show");
  });
  $("#remove").click(function (e) {
    $("#removeModalNew").modal("show");
  });
  $("#reassign").click(function (e) {
    $("#reassignModalNew").modal("show");
  });

  $("#assignLaterBtn").click(function () {
    $("#assignModalNew").modal("hide");
  });
  $("#assign-btn-close").click(function () {
    $("#assignModalNew").modal("hide");
  });
  $("#remove-btn-close").click(function () {
    $("#removeModalNew").modal("hide");
  });
  $("#removeLaterBtn").click(function () {
    $("#removeModalNew").modal("hide");
  });
  $("#reassign-btn-close").click(function () {
    $("#reassignModalNew").modal("hide");
  });
  $("#reassignLaterBtn").click(function () {
    $("#reassignModalNew").modal("hide");
  });
  // Function to handle tele caller assignments (assign)
  $("#assign-submit").click(function () {
    $("#loader").show();
    let sendData = {
      applicationIdList : [],
      removeUsersList : [],
      table : issuerName,
      isAssign : true,
      issuer_id : currentIssuerId
    };
    
    sendData.addUsersList = $("#addTelecallerSelect").val();
    $("#data-to-show").children("tr").children("td:nth-child(2)").children("input").each(function () {
        if ($(this).is(":checked")) {
          sendData.applicationIdList.push(this.id);
        }
      });
      console.log(sendData)
    // Request to assign new leads to telecallers
    $.ajax({
      url: "/admin/ts/manage-tele-assignments",
      type: "POST",
      data: sendData,
      success: function (result) {
        $("#addTelecallerSelect").val(null).trigger('change');
        $("#loader").hide();
        $("#assignModalNew").modal("hide");
        GET_APPLICATIONS.getData();
      },
      error : function(err){
        alert("Error Assigning Telecallers");
        $("#loader").hide();
      }
    });
    
  });
  // Function to handle tele caller assigments (remove)
  $("#remove-submit").click(function () {
    $("#loader").show();
    let sendData = {
      applicationIdList : [],
      addUsersList : [],
      removeUsersList : [],
      table : issuerName,
      isAssign : false,
      issuer_id : currentIssuerId
    };
    sendData.removeUsersList = $("#removeTelecallerSelect").val();
    $("#data-to-show")
      .children("tr")
      .children("td:nth-child(2)")
      .children("input")
      .each(function () {
        if ($(this).is(":checked")) {
          sendData.applicationIdList.push(this.id);
        }
      });
      if(!sendData.applicationIdList.length){
        alert("Please select any entry to delete!")
        $('#loader').hide();
        return;
      }
    // Request to remove new leads to telecallers
    $.ajax({
      url: `/admin/${issuerName}/${currentPath}-delete`,
      type: "POST",
      data: sendData,
      success: function (result) {
        $("#loader").hide();
        $("#removeModalNew").modal("hide");
        GET_APPLICATIONS.getData();
      },
      error : function(err){
        alert("Error Removing Telecallers");
        $("#loader").hide();
      }
    });
  });
  // Function to handle tele caller assigments (reassign)
  $("#reassign-submit").click(function () {
    if ($('#reassignPermissionSelectFrom').select2('data').length == 1 && $('#reassignPermissionSelectTo').select2('data').length == 1 && $('#reassignPermissionSelectFrom').select2('data')[0].id != $('#reassignPermissionSelectTo').select2('data')[0].id) {
    $("#loader").show();
    let sendData = {
      applicationIdList : [],
      reassignFrom : [],
      reassignTo : [],
      issuer_id : currentIssuerId
    };
    sendData.reassignFrom = $("#reassignPermissionSelectFrom").val();
    sendData.reassignTo = $("#reassignPermissionSelectTo").val();
    $("#data-to-show")
      .children("tr")
      .children("td:nth-child(2)")
      .children("input")
      .each(function () {
        if ($(this).is(":checked")) {
          sendData.applicationIdList.push(this.id);
        }
      });
      console.log(sendData)
    // Request to assign new leads to telecallers
    $.ajax({
      url: "/admin/ts/manage-reassign-assignments",
      type: "POST",
      data: sendData,
      success: function (result) {
        $("#reassignPermissionSelectFrom").val(null).trigger('change');
        $("#reassignPermissionSelectTo").val(null).trigger('change');
        $("#loader").hide();
        $("#reassignModalNew").modal("hide");
        GET_APPLICATIONS.getData();
      },
      error : function(err){
        alert("Error Reassigning Telecallers");
        $("#loader").hide();
      }
    });
  }else{
    console.log("its not valid");
    $("#showError").html("You can't select muiltiple users and both the users can't be same");
  }
  });
  const validateReassignSubmit = () => {
    console.log($('#reassignPermissionSelectFrom').select2('data'))
    console.log($('#reassignPermissionSelectTo').select2('data'))
    if ($("#reassignPermissionSelectFrom").val().length > 0 && $("#reassignPermissionSelectTo").val().length > 0) {
      document.getElementById("reassign-submit").disabled = false;
    }
  };
  $("#reassignPermissionSelectFrom").change(function(){
    validateReassignSubmit();
  });
  $("#reassignPermissionSelectTo").change(function(){
    validateReassignSubmit();
  })
  // Function to enable/disable button
  $("#assign_all").click(function () {
    $("#assign").prop("disabled", false);
    $("#remove").prop("disabled", false);
    if ($(this).is(":checked")) {
      $("#data-to-show")
        .children("tr")
        .children("td:nth-child(2)")
        .children("input")
        .each(function () {
          $(this).prop("checked", true);
        });
    } else {
      $("#data-to-show")
        .children("tr")
        .children("td:nth-child(2)")
        .children("input")
        .each(function () {
          $(this).prop("checked", false);
        });
    }
  });


});

GET_APPLICATIONS.getData = function (filterObject) {
  console.log(filterObject, "<<<<<<<<")
  $("#data-to-show").html(`
    <div class="loader-show" id="loader">
        <div class="sbl-circ-path loader-content"></div>
    </div>`);
  REQ_DATA.limit = pageLimit;
  REQ_DATA.pageNo = pageNo;
  REQ_DATA.issuerName = issuerName;
  if (filterObject) {
    Object.assign(REQ_DATA, filterObject);
  }
  // Request to get all data from database
  $.ajax({
    url: "/admin"+ajaxUrl,
    type: "POST",
    data: REQ_DATA,
    success: function (result) {
      $("#loader").hide();
      $("#data-to-show").empty();
      $("#data-to-show").html(result);
      newTotalCount = $("#newTotalCount").val();
      $("#entries").html(`(${newTotalCount})`);
      $("#page-no").attr("max", Math.ceil(newTotalCount / pageLimit));
      $("#pages").html(` / ${Math.ceil(newTotalCount / pageLimit)}`);
    },
  });
};

// Event Listener for sort filter
$("#table-header")
  .children("th")
  .children(":first-child")
  .children(":first-child")
  .each(function () {
    $(this).click(function (e) {
      if (filterObject.sort_desc.includes(e.target.dataset.filter)) {
        filterObject.sort_desc = "";
        filterObject.sort_asec = "";
      } else {
        if (filterObject.sort_desc != e.target.dataset.filter) {
          filterObject.sort_desc = "";
        }
        if (filterObject.sort_asec.includes(e.target.dataset.filter)) {
          if (filterObject.sort_asec.length > 0) {
            filterObject.sort_asec = "";
          }
          filterObject.sort_desc = e.target.dataset.filter;
        } else {
          filterObject.sort_asec = e.target.dataset.filter;
        }
      }
      GET_APPLICATIONS.getData(filterObject);
    });
  });

// Event listener for null filter
$("#table-header")
  .children("th")
  .children(":nth-child(2)")
  .each(function () {
    $(this).click(function (e) {
      $(e.target).toggleClass("active");
      let filterValue = e.target.dataset.filter;

      // Removing Null When Adding Not Null
      if (e.target.dataset.filter.includes("-")) {
        let index = filterObject.notNull.indexOf(filterValue.slice(1));
        if (index > -1) {
          filterObject.notNull.splice(index, 1);
        }

        $(`.${filterValue.slice(1)}`).removeClass("active");
      } else if (e.target.dataset.filter.includes("-") === false) {
        let index = filterObject.notNull.indexOf(`-${filterValue}`);
        if (index > -1) {
          filterObject.notNull.splice(index, 1);
        }
        $(`.-${filterValue}`).removeClass("active");
      }

      let nullFilter = e.target.dataset.filter.replace("-", "");

      //Adding "-sting" in string and select type null filter
      if ($(this).data("filter-type") == "string") {
        nullFilter += "-string";
      } else if ($(this).data("filter-type") == "select") {
        nullFilter += "-string";
      }

      if ($(this).data("filter-type") == "array") {
        nullFilter += "-array";
      }

      // Removing duplicate filter from array
      if (filterObject.notNull.includes(nullFilter)) {
        const index = filterObject.notNull.indexOf(nullFilter);
        if (index > -1) {
          filterObject.notNull.splice(index, 1);
        }
      }
      // Adding filter in array
      if (filterObject.null.includes(nullFilter)) {
        const index = filterObject.null.indexOf(nullFilter);
        if (index > -1) {
          filterObject.null.splice(index, 1);
        }
      } else {
        filterObject.null.push(nullFilter);
      }
      GET_APPLICATIONS.getData(filterObject);
    });
  });

$(".revised").click(function (e) {
  let filter = e.target.dataset.filter;
  if (filterObject.revised.includes(filter)) {
    const index = filterObject.revised.indexOf(filter);
    if (index > -1) {
      filterObject.revised.splice(index, 1);
    }
    $(this).removeClass("active");
    GET_APPLICATIONS.getData(filterObject);
  } else {
    filterObject.revised.push(filter);
    $(this).addClass("active");
    GET_APPLICATIONS.getData(filterObject);
  }
});

// Event Listener for not null filter
$("#table-header")
  .children("th")
  .children(":nth-child(3)")
  .each(function () {
    $(this).click(function (e) {
      $(e.target).toggleClass("active");
      let filterValue = e.target.dataset.filter;

      // Removing Null When Adding Not Null
      if (e.target.dataset.filter.includes("-")) {
        let index = filterObject.notNull.indexOf(filterValue.slice(1));
        if (index > -1) {
          filterObject.notNull.splice(index, 1);
        }

        $(`.${filterValue.slice(1)}`).removeClass("active");
      } else if (e.target.dataset.filter.includes("-") === false) {
        let index = filterObject.notNull.indexOf(`-${filterValue}`);
        if (index > -1) {
          filterObject.notNull.splice(index, 1);
        }
        $(`.-${filterValue}`).removeClass("active");
      }

      let notNullFilter = e.target.dataset.filter.replace("-", "");
      //Adding "-string" in string and option type null filter
      if ($(this).data("filter-type") == "string") {
        notNullFilter += "-string";
      } else if ($(this).data("filter-type") == "select") {
        notNullFilter += "-string";
      }

      if ($(this).data("filter-type") == "array") {
        notNullFilter += "-array";
      }
      // Removing duplicate filter from array
      if (filterObject.null.includes(notNullFilter)) {
        const index = filterObject.null.indexOf(notNullFilter);
        if (index > -1) {
          filterObject.null.splice(index, 1);
        }
      }
      // Adding filter in array
      if (filterObject.notNull.includes(notNullFilter)) {
        const index = filterObject.notNull.indexOf(notNullFilter);
        if (index > -1) {
          filterObject.notNull.splice(index, 1);
        }
      } else {
        filterObject.notNull.push(notNullFilter);
      }
      GET_APPLICATIONS.getData(filterObject);
    });
  });

// Event Listener on input fields for adding values in filter object
$("#table-filter-row")
  .children("th")
  .children("input")
  .each(function () {
    $(this).change(function (e) {
      let newValue = {
        [e.target.id]: e.target.value,
      };
      if ($(this).data("filter-type") === "int") {
        Object.assign(filterObject.int, newValue);
      } else if ($(this).data("filter-type") === "string") {
        Object.assign(filterObject.string, newValue);
      } else if ($(this).data("filter-type") === "date") {
        Object.assign(filterObject.date, newValue);
      } else if ($(this).data("filter-type") === "url"){
        Object.assign(filterObject.string, newValue);
      }
      GET_APPLICATIONS.getData(filterObject);
    });
  });
  // Event Listener on input type range filter and then adding value in filter object
  $("#table-filter-row").children("th").children(".range_container").children("input").each(function () {
    $(this).change(function (e) {
      let id;
      let rangeType = e.target.id.split("_");
      rangeType = rangeType[rangeType.length - 1];
      if(rangeType === 'to'){
        id = e.target.id.replace("_to", "");
      }else if(rangeType === 'from'){
        id = e.target.id.replace("_from", "");
      }
      let fromId = id + "_from";
      let toId = id + "_to";
      let fromValue = $(`#${fromId}`).val();
      let toValue = $(`#${toId}`).val();

      fromValue = parseInt(fromValue , 10);
      toValue = parseInt(toValue , 10);

      if(fromValue > toValue){
        alert("Invalid Range");
        return
      }
      let newValue = {
        [id]: fromValue + " to " + toValue,
      };

      if ($(this).data("filter-type") === "range") {
        Object.assign(filterObject.range, newValue);
      }
      GET_APPLICATIONS.getData(filterObject);
    }); 
  });
// Event Listener on select fields for adding value in filter object
$("#table-filter-row")
  .children("th")
  .children("select")
  .each(function () {
    $(this).change(function (e) {
      let newValue = {
        [e.target.id]: $(e.target).val(),
      };
      console.log(newValue)
      if ($(this).hasClass("multiple_select_js") && $(this).data("filter-type") !== "array") {
        Object.assign(filterObject.select, newValue);
      } else if ($(this).data("filter-type") === "bool") {
        Object.assign(filterObject.bool, newValue);
      } else if (
        $(this).data("filter-type") !== "bool" &&
        $(this).hasClass("multiple_select_js") === false &&
        $(this).data("filter-type") !== "array"
      ) {
        Object.assign(filterObject.string, newValue);
      } else if ($(this).data("filter-type") === "array") {
        Object.assign(filterObject.array, newValue);
      }
      GET_APPLICATIONS.getData(filterObject);
    });
  });

// Initializing Date Pickers

$(".date_picker_range").daterangepicker({
  autoUpdateInput: false,
  opens: "left",
  showDropdowns: true,
  maxDate: new Date()
});
$(".date_picker_range").on("apply.daterangepicker", function (ev, picker) {
  $(this).val(
    picker.startDate.format("YYYY/MM/DD") +
    " to " +
    picker.endDate.format("YYYY/MM/DD")
  );
  let newValue = {
    [$(this).prop("id")]: $(this).val(),
  };
  Object.assign(filterObject.date, newValue);
  GET_APPLICATIONS.getData(filterObject);
});

$(".date_picker_range").on("cancel.daterangepicker", function (ev, picker) {
  $(this).val("");
  picker.setStartDate({});
  picker.setEndDate({});
  delete filterObject.date[$(this).prop("id")];
  GET_APPLICATIONS.getData(filterObject);
});

$("#filterReset").click(function () {
  window.location.reload();
});

function assignValue(element) {
  $("#assign").prop("disabled", false);
  $("#remove").prop("disabled", false);
}
// Request to get all telecallers with permission to bank
$.ajax({
  url: `/admin/users/get-telecallersInAssignment-ajax?issuer=${issuerName}`,
  type: "GET",
  success: function (result) {
    $("#loader").hide();
    renderTelecaller(result);
  },
});

function renderTelecaller(data) {
  let htmlString;
  for (let i = 0; i < data.payload.length; i++) {
    htmlString += `<option value="${data.payload[i].ua_id}">${data.payload[i].ua_name}</option>`;
  }
  $("#removeTelecallerSelect").html(htmlString);
  $("#addTelecallerSelect").html(htmlString);
  $("#reassignPermissionSelectFrom").html(htmlString);
  $("#reassignPermissionSelectTo").html(htmlString);
}

$("#removeIssuerSelect").change(function (e) {
  $("#removeTelecallerSelect").prop("disabled", false);
});

$("#addTelecallerSelect").change(function (e) {
  $("#assign-submit").prop("disabled", false);
});

$("#removeTelecallerSelect").change(function (e) {
  $("#remove-submit").prop("disabled", false);
});

$("#reassignTelecallerSelect").change(function (e) {
  $("#reassign-submit").prop("disabled", false);
});
