const id = window.location.search.replace('?id=', '')

const fieldData = {
    axis_id: {
        colSpan: 6,
        order: 1,
        isEditable: false
    },
    axis_application_number: {
        colSpan: 6,
        order: 2,
        isEditable: false
    },
    axis_name: {
        colSpan: 6,
        order: 3,
        isEditable: false
    },
    axis_date: {
        colSpan: 6,
        order: 4,
        isEditable: false
    },
    axis_revised_date: {
        colSpan: 6,
        order: 5,
        isEditable: false
    },
    axis_mobile_number: {
        colSpan: 6,
        order: 6,
        isEditable: false
    },
    axis_card_type: {
        colSpan: 6,
        order: 7,
        isEditable: false
    },
    axis_ipa_status: {
        colSpan: 6,
        order: 8,
        isEditable: false
    },
    axis_final_status: {
        colSpan: 6,
        order: 9,
        isEditable: false
    },
    ca_main_table: {
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
    axis_ipa_original_status_sheet: {
        colSpan: 6,
        order: 13,
        isEditable: false
    },
    axis_ipa_status_bool: {
        colSpan: 4,
        order: 14,
        isEditable: false
    },
    axis_activation: {
        colSpan: 6,
        order: 15,
        isEditable: false
    },

}
const selectFieldsArray = ['axis_card_type', 'axis_ipa_status', 'axis_final_status', 'axis_ipa_original_status_sheet' , 'tad_automated_call_status']
let selectFieldsObject = {
    'axis_card_type': [],
    'axis_ipa_status': [],
    'axis_final_status': [],
    'axis_ipa_original_status_sheet': [],
    'tad_automated_call_status' : []
}

function getSelectFields() {

    return selectFieldsArray.map(elem => {
        return $.ajax({
            url: `/factory/distinctValues?table=axis_bank_applications_table&column=${elem}`,
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
        await readyFunction('axis_bank_applications_table')
        await getFormData('axis-tele-application', id, 'axis')
        $('#loader').hide()
        $(`#axis_date`).flatpickr()
        $(`#created_at`).flatpickr()
        $(`#updated_at`).flatpickr()
        $(`#axis_revised_date`).flatpickr()

    })
})


$("#call_btn").click(function(){
    $("#loader").show();
    let destinationNumber = $("#axis_mobile_number").val()
    // API for calling a number 
    $.ajax({
        url : "/ts/make-call",
        type : "POST",
        data : {
            destination_number : destinationNumber,
            issuerId : 1
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