const id = window.location.search.replace('?id=', '')

const fieldData = {
    au_id: {
        colSpan: 6,
        order: 1,
        isEditable: false
    },
    ca_main_table: {
        colSpan: 6,
        order: 2,
        isEditable: false
    },
    au_customer_name: {
        colSpan: 6,
        order: 3,
        isEditable: false
    },
    au_phone_number: {
        colSpan: 6,
        order: 4,
        isEditable: false
    },
    au_application_number: {
        colSpan: 6,
        order: 5,
        isEditable: false
    },
    au_initiation_date: {
        colSpan: 6,
        order: 6,
        isEditable: false
    },
    au_card_variant: {
        colSpan: 6,
        order: 7,
        isEditable: false
    },
    au_current_status: {
        colSpan: 6,
        order: 8,
        isEditable: false
    },

    au_final_status: {
        colSpan: 6,
        order: 9,
        isEditable: false
    },
    created_at: {
        colSpan: 6,
        order: 10,
        isEditable: false
    },
    updated_at: {
        colSpan: 6,
        order: 11,
        isEditable: false
    },
    au_revised_date: {
        colSpan: 6,
        order: 16,
        isEditable: false
    },
    au_lead_from: {
        colSpan: 6,
        order: 17,
        isEditable: false
    },
    au_reject_reason: {
        colSpan: 6,
        order: 18,
        isEditable: false
    },
    au_ipa_status: {
        colSpan: 6,
        order: 19,
        isEditable: false
    },
    au_drop_off_page : {
        colSpan: 6,
        order: 20,
        isEditable: false
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
                Object.keys(result.payload).forEach(
                    (k) => result.payload[k] == null && delete result.payload[k] || result.payload[k] == "" && delete result.payload[k]
                  );
                  
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
        $(`#au_date`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
        $(`#au_revised_date`).flatpickr()
    })
})


$("#call_btn").click(function(){
    $("#loader").show();
    let destinationNumber = $("#au_phone_number").val()
    // API for calling a number 
    $.ajax({
        url : "/ts/make-call",
        type : "POST",
        data : {
            destination_number : destinationNumber,
            issuerId : 7
        },
        success: function (result) {
            // console.log(result)
            $("#loader").hide();
        }, 
        error : function(error){
            $("#loader").hide();
        }
    })
})