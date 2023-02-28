const id = window.location.search.replace('?id=', '')

const fieldData = {
    au_id: {
        colSpan: 4,
        order: 1,
        isEditable: true
    },
    ca_main_table: {
        colSpan: 4,
        order: 2,
        isEditable: true
    },
    au_customer_name: {
        colSpan: 4,
        order: 3,
        isEditable: true
    },
    au_phone_number: {
        colSpan: 4,
        order: 4,
        isEditable: true
    },
    au_application_number: {
        colSpan: 4,
        order: 5,
        isEditable: true
    },
    au_initiation_date: {
        colSpan: 4,
        order: 6,
        isEditable: true
    },
    au_card_variant: {
        colSpan: 4,
        order: 7,
        isEditable: true
    },
    au_current_status: {
        colSpan: 4,
        order: 8,
        isEditable: true
    },
    au_final_status: {
        colSpan: 4,
        order: 9,
        isEditable: true
    },
    created_at: {
        colSpan: 4,
        order: 10,
        isEditable: true
    },
    updated_at: {
        colSpan: 4,
        order: 11,
        isEditable: true
    },
    au_utm_campaign: {
        colSpan: 4,
        order: 12,
        isEditable: true
    },
    au_utm_term: {
        colSpan: 4,
        order: 13,
        isEditable: true
    },
    au_utm_source: {
        colSpan: 4,
        order: 14,
        isEditable: true
    },
    au_utm_medium: {
        colSpan: 4,
        order: 15,
        isEditable: true
    },
    au_revised_date: {
        colSpan: 4,
        order: 16,
        isEditable: true
    },
    au_lead_from: {
        colSpan: 4,
        order: 17,
        isEditable: true
    },
    au_reject_reason: {
        colSpan: 8,
        order: 18,
        isEditable: true
    },
    au_ipa_status: {
        colSpan: 4,
        order: 19,
        isEditable: true
    },
    au_drop_off_page : {
        colSpan: 8,
        order: 20,
        isEditable: true
    },
}
const selectFieldsArray = ['au_card_variant', 'au_current_status', 'au_drop_off_page', 'au_utm_source', 'au_utm_medium', 'au_utm_campaign', 'au_final_status', 'au_lead_from', 'au_reject_reason']
let selectFieldsObject = {
    'au_card_variant': [],
    'au_current_status': [],
    'au_drop_off_page' : [],
    'au_utm_source': [],
    'au_utm_medium': [],
    'au_utm_campaign': [],
    'au_final_status': [],
    'au_lead_from': [],
    'au_reject_reason': []
}
function getSelectFields() {

    return selectFieldsArray.map(elem => {
        return $.ajax({
            url: `/factory/distinctValues?table=au_bank_applications_table&column=${elem}`,
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
        await readyFunction('au_bank_applications_table')
        await getFormData('au-application', id, 'au')
        $('#loader').hide()
        $(`#au_initiation_date`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
        $(`#au_revised_date`).flatpickr()
    })
})


