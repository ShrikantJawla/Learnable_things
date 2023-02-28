let showFields = [
    'tad_automated_call_counter',
    'tad_automated_call_status',
    'tad_call_status',
    'tad_final_call_status',
    'tad_call_decline_counter',
    'tad_activation_call_counter',
    'tad_sms_counter',
    'axis_id',
	'ca_main_table',
	'axis_name',
	'axis_mobile_number',
	'axis_application_number',
    'axis_activation',
	'axis_date',
	'axis_card_type',
	'axis_ipa_status',
	'axis_final_status',
	'axis_ipa_original_status_sheet',
    'tad_axis_ipa_original_status_sheet',
	'axis_existing_c',
	'axis_send_to_channel',
	'axis_blaze_output',
	'axis_lead_error_log',
	'axis_live_feedback_status',
    'tad_updated_at'
]
const selectFieldsArray = [
	'axis_card_type',
	'axis_ipa_status',
	'axis_final_status',
	'axis_ipa_original_status_sheet',
	'axis_blaze_output',
	'axis_existing_c',
	'axis_lead_error_log',
	'axis_live_feedback_status',
	'axis_send_to_channel',
    'tad_call_status',
    'tad_automated_call_status',
    'tad_final_call_status',
    'tad_axis_ipa_original_status_sheet'
]
let selectFieldsObject = {
	'axis_card_type': [],
	'axis_ipa_status': [],
	'axis_final_status': [],
	'axis_ipa_original_status_sheet': [],
	'axis_blaze_output' : [],
	'axis_existing_c' : [],
	'axis_lead_error_log' : [],
	'axis_live_feedback_status' : [],
	'axis_send_to_channel' : [],
    'tad_call_status' : [],
    'tad_automated_call_status' : [],
    'tad_final_call_status': [],
    'tad_axis_ipa_original_status_sheet' : []
}
let tableUrl = "/axis/get-tele-applications-ajax"
function filterResetFunction() {
    const arr = [
        'axis_id',
        'axis_permit_to_telly',
        'axis_application_number',
        'from_axis_date',
        'to_axis_date',
        'from_axis_revised_date',
        'to_axis_revised_date',
        'axis_name',
        'axis_mobile_number',
        'axis_card_type',
        'axis_ipa_status',
        'axis_final_status',
        'ca_main_table',
        'from_created_at',
        'from_updated_at',
        'to_created_at',
        'to_updated_at',
        'axis_ipa_original_status_sheet',
        'axis_ipa_status_bool',
        'select-telecaller-filter-all',
        'tad_call_status',
        'tad_call_decline_counter',
        'tad_sms_counter',
        'axis_activation',
        'tad_activation_call_counter',
        'tad_automated_call_status',
        'tad_final_call_status',
        'tad_automated_call_counter',
        'tad_axis_ipa_original_status_sheet'
    ]
    arr.map(field => {
        if ($(`#${field}`).length > 0) {
            document.getElementById(field).value = ''
        }
    })
    selectFieldsArray.map(el => {
		$(`#${el}`).val(null).trigger('change')
	})
	entriesPerPageElement.value = "50"
	filterObject = { notNull: [] }
	filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
	$('.notNull').removeClass('active');
	$(".Null").removeClass("active");
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
    getAllFields('/factory/fields', 'axis_bank_applications_table').then(async () => {
        fillUpDropdown(allFieldsArray)
        addColumnsToTableHeader(allFieldsArray)
        Promise.all(getSelectFields('axis_bank_applications_table')).then(async () => {
            addFilters(allFieldsArray)
            await getTableBody()
            $('#loader').hide()
            $("select[multiple='multiple']").select2({
                placeholder: "Select options"
            })
        })

    })
})