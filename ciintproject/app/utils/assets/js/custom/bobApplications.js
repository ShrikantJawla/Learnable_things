let showFields = [
  "bob_id",
  "ca_main_table",
  "bob_name",
  "bob_application_number",
  "bob_date",
  "bob_utm_source",
  "bob_application_status",
  "bob_email_id",
  "bob_card_type",
  "bob_state",
  "bob_city",
  "bob_esign_form_url",
  "created_at",
  "updated_at",
  "bob_utm_campaign",
  "bob_utm_medium",
  "bob_stage",
  "bob_esign_status",
  "bob_dasm_reason",
  "bob_reject_reason",
  "bob_vkyc_link",
  "bob_ipa_status_bool",
  "bob_ipa_original_status_sheet",
];
const selectFieldsArray = [
  "bob_application_status",
  "bob_card_type",
  "bob_state",
  "bob_city",
  "bob_utm_campaign",
  "bob_stage",
  "bob_esign_status",
  "bob_reject_reason",
  "bob_ipa_original_status_sheet",
];
let selectFieldsObject = {
  bob_application_status: [],
  bob_card_type: [],
  bob_state: [],
  bob_city: [],
  bob_utm_campaign: [],
  bob_stage: [],
  bob_esign_status: [],
  bob_ipa_original_status_sheet: [],
  bob_reject_reason: [],
};
let tableUrl = "/bob/get-all-applications-ajax";
function filterResetFunction() {
  const arr = [
    "bob_id",
    "bob_application_number",
    "bob_permit_to_telly",
    "from_bob_date",
    "to_bob_date",
    "bob_utm_source",
    "bob_application_status",
    "bob_email_id",
    "bob_esign_form_url",
    "ca_main_table",
    "from_created_at",
    "to_created_at",
    "from_updated_at",
    "to_updated_at",
    "bob_name",
    "bob_utm_medium",
    "bob_dasm_reason",
    "bob_vkyc_link",
    "bob_ipa_status_bool",
    "select-telecaller-filter-all",
  ];
  arr.map((field) => {
    if ($(`#${field}`).length > 0) {
      document.getElementById(field).value = "";
    }
  });
  selectFieldsArray.map((el) => {
    $(`#${el}`).val(null).trigger("change");
  });
  // document.getElementById('bob_ipa_status_bool').checked = false
  entriesPerPageElement.value = "10";
  filterObject = { notNull: [] };
  $(".notNull").removeClass("active");
  $(".Null").removeClass("active");
  filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value;
  getTableBody();
}
filterReset.addEventListener("click", filterResetFunction);

$(document).ready(async function () {
  $(".hide-sidebar-toggle-button").click();
  $("#loader").show();
  iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect();
  tableWrapperBoundingRect = tableWrapper.getBoundingClientRect();
  entriesPerPageElement.value = 10;
  filterObject.entriesPerPage = entriesPerPageElement.value;
  styleDropdown();
  getAllFields("/factory/fields", "bob_applications_table").then(async () => {
    fillUpDropdown(allFieldsArray);
    await getTeleCallers();
    addColumnsToTableHeader(allFieldsArray);
    Promise.all(getSelectFields("bob_applications_table")).then(async () => {
      addFilters(allFieldsArray);
      await getTableBody();
      $("#loader").hide();
      $("select[multiple='multiple']").select2({
        placeholder: "Select options",
      });
    });
  });
});
