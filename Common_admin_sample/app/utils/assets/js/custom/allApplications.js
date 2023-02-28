// Initializing array to show in table
let showFields = [
  "id",
  "tracking_id",
  "name",
  "email",
  "phone_number",
  "is_salaried",
  "ipa_status",
  "created_at",
  "updated_at",
  "form_filled_array",
  "form_not_filled",
  "banks_applied_array",
  "banks_approved_array",
  "low_cibil_score_bool",
  "is_salaried",
  "device_type",
  "city",
  "state",
  "salary",
  "date_of_birth",
  "pin_code",
  "mp_idfc_available",
  "mp_axis_available",
  "mp_au_available",
  "mp_yes_available",
  "mp_bob_available",
  "sms_status",
  "low_cibil_score",
];

// Initializing array for select
const selectFieldsArray = ["ipa_status", "device_type", "sms_status"];
let selectFieldsObject = {
  ipa_status: [],
  device_type: [],
  sms_status: [],
};

// Setting url to get table Data
let tableUrl = "/applications/get-all-applications-ajax";

// Function Resetting Filter Values
function filterResetFunction() {
  const arr = [
    "id",
    "name",
    "email",
    "phone_number",
    "city",
    "state",
    /* 'salary', 'date_of_birth', 'is_salaried',*/ "pin_code",
    "form_filled",
    "tracking_id",
    "from_created_at",
    "to_created_at",
    "from_updated_at",
    "to_updated_at",
    "form_filled_array",
    "form_not_filled",
    "banks_applied_array",
    "banks_approved_array",
    "low_cibil_score",
    "is_salaried",
    "low_cibil_score_bool",
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
  getAllFields("/factory/fields", "card_applications_main_table").then(() => {
    fillUpDropdown(allFieldsArray);
    addColumnsToTableHeader(allFieldsArray);
    Promise.all(getSelectFields("card_applications_main_table")).then(
      async () => {
        addFilters(allFieldsArray);
        $("#loader").hide();
      }
    );
    getTableBody();
  });
});
