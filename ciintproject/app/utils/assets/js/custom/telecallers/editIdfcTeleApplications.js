const id = window.location.search.replace('?id=', '')

const fieldData = {
    idfc_id: {
        colSpan: 6,
        order: 1,
        isEditable: false
    },
    idfc_date: {
        colSpan: 6,
        order: 3,
        isEditable: false
    },
    idfc_application_number: {
        colSpan: 6,
        order: 4,
        isEditable: false
    },
    ca_main_table: {
        colSpan: 6,
        order: 5,
        isEditable: false
    },
    idfc_location_city: {
        colSpan: 6,
        order: 6,
        isEditable: false
    },
    idfc_choice_credit_card: {
        colSpan: 6,
        order: 7,
        isEditable: false
    },
    idfc_reason: {
        colSpan: 6,
        order: 8,
        isEditable: false
    },
    idfc_status: {
        colSpan: 6,
        order: 9,
        isEditable: false
    },

    idfc_sub_status: {
        colSpan: 6,
        order: 10,
        isEditable: false
    },
    created_at: {
        colSpan: 6,
        order: 11,
        isEditable: false
    },
    updated_at: {
        colSpan: 6,
        order: 12,
        isEditable: false
    },
    idfc_utm_campaign: {
        colSpan: 6,
        order: 13,
        isEditable: false
    },
    idfc_splitted_utm: {
        colSpan: 6,
        order: 14,
        isEditable: false
    },
    idfc_lead_from: {
        colSpan: 6,
        order: 15,
        isEditable: false
    },
    idfc_crm_team_lead_id: {
        colSpan: 6,
        order: 16,
        isEditable: false
    },
    idfc_credit_limit: {
        colSpan: 6,
        order: 17,
        isEditable: false
    },
    idfc_date_ipa_status: {
        colSpan: 6,
        order: 18,
        isEditable: false
    }
}
const selectFieldsArray = ['idfc_location_city', 'idfc_choice_credit_card', 'idfc_status', 'idfc_sub_status', 'idfc_lead_from']
let selectFieldsObject = {
    'idfc_location_city': [],
    'idfc_choice_credit_card': [],
    'idfc_status': [],
    'idfc_sub_status': [],
    'idfc_lead_from': []
}

function getSelectFields() {

    return selectFieldsArray.map(elem => {
        return $.ajax({
            url: `/factory/distinctValues?table=idfc_bank_applications_table&column=${elem}`,
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
        await readyFunction('idfc_bank_applications_table')
        await getFormData('idfc-application', id, 'idfc')
        $('#loader').hide()
        $(`#idfc_date`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
    })
})
$("#call_btn").click(function(){
    $("#loader").show();
    let destinationNumber = $("#phone_number").val()
    // API for calling a number 
    $.ajax({
        url : "/ts/make-call",
        type : "POST",
        data : {
            destination_number : destinationNumber,
            issuerId : 4
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

