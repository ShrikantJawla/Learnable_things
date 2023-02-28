let showFields = [
	'tad_automated_call_counter',
    'tad_automated_call_status',
	'tad_call_status',
	'tad_final_call_status',
	'tad_call_decline_counter',
	'tad_activation_call_counter',
	'yb_id',
	'yb_real_application_id',
	'ca_main_table',
	'name',
	'yb_mobile_number',
	'yb_application_created',
	'yb_application_number',
	'yb_aps_ref_number',
	'yb_ekyc_status',
	'yb_application_status',
	'tad_yes_application_status',
	'yb_application_status_initial',
	'yb_dedupe_status',
	'yb_policy_check_status',
	'yb_cibil_check_status',
	'yb_idv',
	'yb_last_update_on',
	'occupation',
	'yb_apply_through',
	'yb_vkyc_unable_reject_reasons',
	'yb_final_original_status',
	'yb_decision_date',
	'yb_decline_reson',
	'yb_dip_reject_reason',
	'created_at',
	'tad_updated_at',
]
const selectFieldsArray = [
	'yb_ekyc_status',
	'yb_app',
	'yb_application_status',
	'tad_yes_application_status',
	'yb_application_status_initial',
	'yb_final_status',
	'yb_ipa_status',
	'yb_dedupe_status',
	'yb_policy_check_status',
	'yb_cibil_check_status',
	'yb_idv',
	'yb_apply_through',
	'yb_vkyc_unable_reject_reasons',
	'yb_final_original_status',
	'yb_decline_reson',
	'yb_dip_reject_reason',
	'tad_call_status',
	'tad_automated_call_status',
	'tad_final_call_status'
]
let selectFieldsObject = {
	'yb_ekyc_status': [],
	'yb_app': [],
	'yb_application_status': [],
	'tad_yes_application_status' : [],
	'yb_application_status_initial' : [],
	'yb_final_status': [],
	'yb_ipa_status': [],
	'yb_dedupe_status': [],
	'yb_policy_check_status': [],
	'yb_cibil_check_status': [],
	'yb_idv': [],
	'yb_apply_through': [],
	'yb_vkyc_unable_reject_reasons': [],
	'yb_final_original_status': [],
	'yb_decline_reson': [],
	'yb_dip_reject_reason': [],
	'tad_call_status' : [],
	'tad_automated_call_status' : [],
	'tad_final_call_status': []
}
let tableUrl = "/yes/get-tele-applications-ajax"
function filterResetFunction() {
	const arr = [
		'yb_id',
		'ca_main_table',
		'from_yb_application_created',
		'to_yb_application_created',
		'yb_application_number',
		'yb_aps_ref_number',
		'yb_ekyc_status',
		'yb_application_status',
		'tad_yes_application_status',
		'yb_application_status_initial',
		'yb_final_status',
		'yb_ipa_status',
		'yb_dedupe_status',
		'yb_policy_check_status',
		'yb_cibil_check_status',
		'yb_real_application_id',
		'yb_idv',
		'from_yb_last_update_on',
		'to_yb_last_update_on',
		'yb_apply_through',
		'yb_credit_limit',
		'yb_vkyc_unable_reject_reasons',
		'yb_final_original_status',
		'yb_decision_date',
		'yb_decision_date',
		'yb_decline_reson',
		'yb_dip_reject_reason',
		'yb_mobile_number',
		'from_created_at',
		'to_created_at',
		'from_updated_at',
		'to_updated_at',
		'tad_call_status',
		'tad_final_call_status'
	]
	arr.map(field => {
		if ($(`#${field}`).length > 0) {
			document.getElementById(field).value = ''
		}
	})
	// document.getElementById('bob_ipa_status_bool').checked = false
	entriesPerPageElement.value = "10"
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
	entriesPerPageElement.value = 10
	filterObject.entriesPerPage = entriesPerPageElement.value;
	styleDropdown()

	getAllFields('/factory/fields', 'yes_bank_applications_table').then(() => {
		fillUpDropdown(allFieldsArray)
		addColumnsToTableHeader(allFieldsArray)
		Promise.all(getSelectFields('yes_bank_applications_table')).then(async () => {
			addFilters(allFieldsArray)
			await getTableBody()
			$('#loader').hide()

		})
	})
})