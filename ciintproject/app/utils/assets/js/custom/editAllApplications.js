const id = window.location.search.replace('?id=', '')

const fieldData = {
    id: {
        colSpan: 4,
        order: 1,
        isEditable: false
    },
    name: {
        colSpan: 4,
        order: 2,
        isEditable: true
    },
    email: {
        colSpan: 4,
        order: 3,
        isEditable: true
    },
    phone_number: {
        colSpan: 4,
        order: 4,
        isEditable: true
    },
    city: {
        colSpan: 4,
        order: 5,
        isEditable: true
    },
    state: {
        colSpan: 4,
        order: 6,
        isEditable: true
    },
    salary: {
        colSpan: 2,
        order: 7,
        isEditable: true
    },
    date_of_birth: {
        colSpan: 2,
        order: 8,
        isEditable: true
    },

    pin_code: {
        colSpan: 4,
        order: 9,
        isEditable: true
    },
    sms_status: {
        colSpan: 4,
        order: 10,
        isEditable: false
    },
    form_filled: {
        colSpan: 4,
        order: 11,
        isEditable: false
    },
    tracking_id: {
        colSpan: 4,
        order: 12,
        isEditable: false
    },
    ipa_status: {
        colSpan: 4,
        order: 13,
        isEditable: false
    },
    created_at: {
        colSpan: 4,
        order: 14,
        isEditable: false
    },
    updated_at: {
        colSpan: 4,
        order: 15,
        isEditable: false
    },
    form_filled_array: {
        colSpan: 4,
        order: 16,
        isEditable: false
    },
    banks_applied_array: {
        colSpan: 4,
        order: 17,
        isEditable: false
    },
    banks_approved_array: {
        colSpan: 4,
        order: 18,
        isEditable: false
    },
    low_cibil_score: {
        colSpan: 4,
        order: 19,
        isEditable: false
    },
    device_type: {
        colSpan: 4,
        order: 20,
        isEditable: false
    },
    is_salaried: {
        colSpan: 1,
        order: 21,
        isEditable: true
    },
    low_cibil_score_bool: {
        colSpan: 2,
        order: 22,
        isEditable: true
    }
}
const selectFieldsArray = ['ipa_status', 'device_type', 'sms_status']
let selectFieldsObject = {
    'ipa_status': [],
    'device_type': [],
    'sms_status': []
}
function getSelectFields() {

    return selectFieldsArray.map(elem => {
        return $.ajax({
            url: `/factory/distinctValues?table=card_applications_main_table&column=${elem}`,
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
        await readyFunction('card_applications_main_table')
        await getFormData('application', id, 'applications')
        $('#loader').hide()
        $(`#date_of_birth`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
    })
})


