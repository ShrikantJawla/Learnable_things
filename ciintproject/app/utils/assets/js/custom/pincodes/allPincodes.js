// Initializing array to show in table
let showFields = [
  "mp_id",
  "mp_pincode",
  "mp_idfc_available",
  "mp_axis_available",
  "mp_au_available",
  "mp_yes_available",
  "mp_bob_available",
  "created_at",
  "updated_at",
];

// Initializing array for select
const selectFieldsArray = [
  "mp_idfc_available",
  "mp_axis_available",
  "mp_au_available",
  "mp_yes_available",
  "mp_bob_available"
];
let selectFieldsObject = {};

// Setting url to get table Data
let tableUrl = "/pincodes/get-all-pincodes-data";

// Function Resetting Filter Values
function filterResetFunction() {
  const arr = [
    "mp_pincode",
    "mp_idfc_available",
    "mp_axis_available",
    "mp_au_available",
    "mp_yes_available",
    "mp_bob_available",
  ];
  // Itterating over array and setting each filter value to empty string
  arr.map((field) => {
    if ($(`#${field}`).length > 0) {
      document.getElementById(field).value = "";
    }
  });
  selectFieldsArray.map((el) => {
    $(`#${el}`).val(null).trigger("change");
  });
  // document.getElementById('is_salaried').checked = false
  entriesPerPageElement.value = "10";
  filterObject = { notNull: [] };
  filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value;
  $(".notNull").removeClass("active");
  $(".Null").removeClass("active");
  getTableBody();
}

filterReset.addEventListener("click", filterResetFunction);

$(document).ready(function () {
  $(".hide-sidebar-toggle-button").click();
  $("#loader").show();
  iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect();
  tableWrapperBoundingRect = tableWrapper.getBoundingClientRect();
  entriesPerPageElement.value = 100;
  filterObject.entriesPerPage = entriesPerPageElement.value;
  styleDropdown();
  getAllFields("/factory/fields", "manage_pincodes").then(() => {
    fillUpDropdown(allFieldsArray);
    addColumnsToTableHeader(allFieldsArray);
    Promise.all(getSelectFields("manage_pincodes")).then(async () => {
      addFilters(allFieldsArray);
      $("#loader").hide();
    });
    getTableBody();
  });
});
