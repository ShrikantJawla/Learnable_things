let showFields = [
    'idfc_id',
    'ca_main_table',
    'name',
    'phone_number',
    'idfc_date',
    'idfc_application_number',
    'idfc_choice_credit_card',
    'idfc_sub_status',
    'idfc_sub_status_initial',
    'idfc_stage_integration_status',
    'idfc_status',
    'idfc_reason',
    'idfc_date_ipa_status',
    'idfc_utm_campaign',
    'idfc_splitted_utm',
    'idfc_crm_team_lead_id',
    'idfc_location_city',
    'idfc_credit_limit',
    'created_at',
    'updated_at',
    'idfc_lead_from',
]
const selectFieldsArray = [
    'idfc_location_city',
    'idfc_choice_credit_card',
    'idfc_status',
    'idfc_sub_status',
    'idfc_sub_status_initial',
    'idfc_lead_from',
    'idfc_reason',
    'idfc_stage_integration_status'
]
let selectFieldsObject = {
    'idfc_location_city': [],
    'idfc_choice_credit_card': [],
    'idfc_status': [],
    'idfc_sub_status': [],
    'idfc_sub_status_initial': [],
    'idfc_lead_from': [],
    'idfc_reason' : [],
    'idfc_stage_integration_status' : []
}
let tableUrl = "/idfc/get-all-applications-ajax"

function filterResetFunction() {
    const arr = [
        'idfc_id',
        'idfc_permit_to_telly',
        'idfc_application_number',
        'idfc_crm_team_lead_id',
        'idfc_utm_campaign',
        'idfc_splitted_utm',
        'from_idfc_credit_limit',
        'to_idfc_credit_limit',
        'idfc_reason',
        'from_idfc_date',
        'to_idfc_date',
        'idfc_full_name',
        'from_created_at',
        'to_created_at',
        'from_updated_at',
        'to_updated_at',
        'ca_main_table',
        'idfc_date_ipa_status',
        'select-telecaller-filter-all',
        'idfc_stage_integration_status',
    ]
    selectFieldsArray.map(el => {
        $(`#${el}`).val(null).trigger('change')
    })
    arr.map(field => {
        if ($(`#${field}`).length > 0) {
            document.getElementById(field).value = ''
        }
    })
    // document.getElementById('idfc_date_ipa_status').checked = false
    entriesPerPageElement.value = "50";
    filterObject = { notNull: [] }
    $('.notNull').removeClass('active');
    $(".Null").removeClass("active");
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    getTableBody()
    
}
filterReset.addEventListener('click', filterResetFunction)
$(document).ready(async function () {
    $('.hide-sidebar-toggle-button').click()
    $('#loader').show()
    iconBoundingRect = openFieldsDropdownIcon.getBoundingClientRect()
    tableWrapperBoundingRect = tableWrapper.getBoundingClientRect()
    entriesPerPageElement.value = 50
    filterObject.entriesPerPage = entriesPerPageElement.value
    styleDropdown()
    getAllFields('/factory/fields', 'idfc_bank_applications_table').then(async () => {
        fillUpDropdown(allFieldsArray)
        await getTeleCallers()
        addColumnsToTableHeader(allFieldsArray)
        Promise.all(getSelectFields('idfc_bank_applications_table')).then(async () => {
            addFilters(allFieldsArray)
            await getTableBody()
            $('#loader').hide()
            $("select[multiple='multiple']").select2({
                placeholder: "Select options"
            })
        })
    })
})