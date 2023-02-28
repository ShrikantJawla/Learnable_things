let showFields = [
  "au_id",
  "ca_main_table",
  "au_customer_name",
  "au_phone_number",
  "au_application_number",
  "au_bank_assisted",
  "au_initiation_date",
  "au_revised_date",
  "au_card_variant",
  "au_current_status",
  "au_drop_off_page_initial",
  "au_drop_off_page",
  "au_final_status",
  "au_reject_reason",
  "au_ipa_status",
  "au_utm_source",
  "au_utm_medium",
  "au_utm_campaign",
  "au_utm_term",
  "created_at",
  "updated_at",
];
const selectFieldsArray = [
  "au_card_variant",
  "au_current_status",
  "au_drop_off_page",
  "au_drop_off_page_initial",
  "au_final_status",
  "au_reject_reason",
];
let selectFieldsObject = {
  au_card_variant: [],
  au_current_status: [],
  au_drop_off_page : [],
  au_drop_off_page_initial: [],
  au_utm_source: [],
  au_utm_medium: [],
  au_utm_campaign : [],
  au_utm_term : [],
  au_final_status: [],
  au_reject_reason: [],
  au_utm_term : [],
  au_utm_campaign : [],
};
let tableUrl = "/au/get-all-applications-ajax";
function filterResetFunction() {
  const arr = [
    "au_id",
    "ca_main_table",
    "au_permit_to_telly",
    "au_customer_name",
    "au_application_number",
    "from_au_initiation_date",
    "to_au_initiation_date",
    "au_revised_date",
    "au_utm_campaign",
    "au_utm_term",
    "from_created_at",
    "to_created_at",
    "from_updated_at",
    "to_updated_at",
    "au_phone_number",
    "au_ipa_status",
    "select-telecaller-filter-all",
    "au_drop_off_page",
    "au_drop_off_page_initial"
  ];
  arr.map((field) => {
    if ($(`#${field}`).length > 0) {
      document.getElementById(field).value = "";
    }
  });
  selectFieldsArray.map((el) => {
    $(`#${el}`).val(null).trigger("change");
  });
  
  entriesPerPageElement.value = "50";
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
  entriesPerPageElement.value = 50;
  filterObject.entriesPerPage = entriesPerPageElement.value;
  styleDropdown();
  getAllFields("/factory/fields", "au_bank_applications_table").then(
    async () => {
      fillUpDropdown(allFieldsArray);
      await getTeleCallers();
      addColumnsToTableHeader(allFieldsArray);
      Promise.all(getSelectFields("au_bank_applications_table")).then(
        async () => {
          addFilters(allFieldsArray);
          await getTableBody();
          $("#loader").hide();
          $("select[multiple='multiple']").select2({
            placeholder: "Select options",
          });
        }
      );
    }
  );
});
