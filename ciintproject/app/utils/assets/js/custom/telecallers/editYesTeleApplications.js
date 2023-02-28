const id = window.location.search.replace('?id=', '')

const fieldData = {
    yb_id: {
        colSpan: 6,
        order: 1,
        isEditable: false
    },
    ca_main_table: {
        colSpan: 6,
        order: 2,
        isEditable: false
    },
    yb_application_created: {
        colSpan: 6,
        order: 3,
        isEditable: false
    },
    yb_application_number: {
        colSpan: 6,
        order: 4,
        isEditable: false
    },
    yb_aps_ref_number: {
        colSpan: 6,
        order: 5,
        isEditable: false
    },
    yb_ekyc_status: {
        colSpan: 6,
        order: 6,
        isEditable: false
    },
    yb_application_status: {
        colSpan: 6,
        order: 7,
        isEditable: false
    },
    yb_final_status: {
        colSpan: 6,
        order: 8,
        isEditable: false
    },
    yb_ipa_status: {
        colSpan: 6,
        order: 9,
        isEditable: false
    },
    yb_dedupe_status: {
        colSpan: 6,
        order: 10,
        isEditable: false
    },
    yb_policy_check_status: {
        colSpan: 6,
        order: 11,
        isEditable: false
    },
    yb_cibil_check_status: {
        colSpan: 6,
        order: 12,
        isEditable: false
    },
    yb_idv: {
        colSpan: 6,
        order: 13,
        isEditable: false
    },
    yb_last_update_on: {
        colSpan: 6,
        order: 14,
        isEditable: false
    },
    yb_apply_through: {
        colSpan: 6,
        order: 15,
        isEditable: false
    },
    yb_credit_limit: {
        colSpan: 6,
        order: 16,
        isEditable: false
    },
    yb_vkyc_unable_reject_reasons: {
        colSpan: 6,
        order: 17,
        isEditable: false
    },
    yb_final_original_status: {
        colSpan: 6,
        order: 18,
        isEditable: false
    },
    yb_decision_date: {
        colSpan: 6,
        order: 19,
        isEditable: false
    },
    yb_decline_reson: {
        colSpan: 6,
        order: 20,
        isEditable: false
    },
    yb_dip_reject_reason: {
        colSpan: 6,
        order: 21,
        isEditable: false
    },
    yb_mobile_number: {
        colSpan: 6,
        order: 22,
        isEditable: false
    },
    created_at: {
        colSpan: 6,
        order: 23,
        isEditable: false
    },
    updated_at: {
        colSpan: 6,
        order: 24,
        isEditable: false
    },
    yb_real_application_id: {
        colSpan: 6,
        order: 25,
        isEditable: false
    },
}
const selectFieldsArray = [
    'yb_ekyc_status',
    'yb_app',
    'yb_application_status',
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
    'yb_dip_reject_reason'
]
let selectFieldsObject = {
    'yb_ekyc_status': [],
    'yb_app': [],
    'yb_application_status': [],
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
    'yb_dip_reject_reason': []
}

function getSelectFields() {

    return selectFieldsArray.map(elem => {
        return $.ajax({
            url: `/factory/distinctValues?table=yes_bank_applications_table&column=${elem}`,
            type: "GET",
            contentType: "application/json",
            dataType: 'json',
            success: function (result) {
                const { payload } = result
                selectFieldsObject[elem] = payload
            }
        })
    }
    )

}
$('document').ready(async () => {
    $('.hide-sidebar-toggle-button').click()
    $('#loader').show()
    Promise.all(getSelectFields()).then(async () => {
        await readyFunction('yes_bank_applications_table')
        await getFormData('yes-application', id, 'yes')
        $('#loader').hide()
        $(`#yes_date`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
    })
})

$("#call_btn").click(function(){
    $("#loader").show();
    let destinationNumber = $("#yb_mobile_number").val()
    // API for calling a number 
    $.ajax({
        url : "/ts/make-call",
        type : "POST",
        data : {
            destination_number : destinationNumber,
            issuerId : 11
        },
        success: function (result) {
            console.log(result)
            $("#loader").hide();
        }, 
        error : function(error){
            $("#loader").hide();
        }
    })
})

