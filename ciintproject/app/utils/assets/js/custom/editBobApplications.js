const id = window.location.search.replace('?id=', '')

const fieldData = {
    bob_id: {
        colSpan: 4,
        order: 1,
        isEditable: false
    },
    bob_name: {
        colSpan: 4,
        order: 2,
        isEditable: true
    },
    bob_application_number: {
        colSpan: 4,
        order: 3,
        isEditable: false
    },
    bob_email_id: {
        colSpan: 4,
        order: 4,
        isEditable: true
    },
    bob_date: {
        colSpan: 4,
        order: 5,
        isEditable: false
    },
    bob_utm_source: {
        colSpan: 4,
        order: 6,
        isEditable: true
    },
    bob_application_status: {
        colSpan: 4,
        order: 7,
        isEditable: true
    },

    bob_card_type: {
        colSpan: 4,
        order: 8,
        isEditable: true
    },
    bob_state: {
        colSpan: 4,
        order: 9,
        isEditable: true
    },
    bob_city: {
        colSpan: 4,
        order: 10,
        isEditable: true
    },
    bob_esign_form_url: {
        colSpan: 4,
        order: 11,
        isEditable: false
    },
    ca_main_table: {
        colSpan: 4,
        order: 12,
        isEditable: false
    },
    created_at: {
        colSpan: 4,
        order: 13,
        isEditable: false
    },
    updated_at: {
        colSpan: 4,
        order: 14,
        isEditable: false
    },
    bob_utm_campaign: {
        colSpan: 4,
        order: 15,
        isEditable: true
    },
    bob_utm_medium: {
        colSpan: 4,
        order: 16,
        isEditable: true
    },
    bob_stage: {
        colSpan: 4,
        order: 17,
        isEditable: false
    },
    bob_esign_status: {
        colSpan: 4,
        order: 18,
        isEditable: false
    },
    bob_dasm_reason: {
        colSpan: 5,
        order: 19,
        isEditable: true
    },


    bob_vkyc_link: {
        colSpan: 5,
        order: 20,
        isEditable: false
    },
    bob_ipa_status_bool: {
        colSpan: 2,
        order: 21,
        isEditable: true
    },

    bob_ipa_original_status_sheet: {
        colSpan: 12,
        order: 23,
        isEditable: true
    },
    bob_reject_reason: {
        colSpan: 8,
        order: 22,
        isEditable: true
    },


}
const selectFieldsArray = ['bob_application_status',
    'bob_card_type',
    'bob_state',
    'bob_city',
    'bob_utm_campaign',
    'bob_utm_medium',
    'bob_stage',
    'bob_esign_status',
    'bob_ipa_original_status_sheet',
    'bob_reject_reason'

]
let selectFieldsObject = {
    'bob_application_status': [],
    'bob_card_type': [],
    'bob_state': [],
    'bob_city': [],
    'bob_utm_campaign': [],
    'bob_utm_medium': [],
    'bob_stage': [],
    'bob_esign_status': [],
    'bob_ipa_original_status_sheet': [],
    'bob_reject_reason': []
}

function getSelectFields() {
    return selectFieldsArray.map(elem => {
        return $.ajax({
            url: `/factory/distinctValues?table=bob_applications_table&column=${elem}`,
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
        await readyFunction('bob_applications_table')
        await getFormData('bob-application', id, 'bob')
        $('#loader').hide()
        $(`#bob_date`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
    })
})


