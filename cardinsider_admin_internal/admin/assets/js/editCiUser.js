let ciUserDetail = {}
let inputObjectCopy = {}


let inputObject = {
    "ciu_first_name": '',
    "ciu_last_name": '',
    "ciu_email": '',
    "ciu_number": '',
    "ciu_verified": false,
    "Referral_commission_paid": false,
    "cashback_claimed": false,
    "iOSCheck": false,
    "ciu_pancard": "",
    "ciu_dob": "",
    "ciu_address1": "",
    "ciu_address2": "",
    "ciu_pincode": "",
    "ciu_gender": "",
    "ciu_annual_income": "",
    "fcm_token": "",
    "Referrers_approved": 0,
    "refer_amount": 0,
    "account_information": {
        "method": "",
        "account_name": "",
        "account_number": "",
        "bank_name": "",
        "ifsc_code": "",
        "upi_id": ""
    },
    "credit_cards": [],
    "card_applications": [],
    "reffered_by": []


}

const validate = () => {

    if (JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy)
        || !inputObject['ciu_first_name']) {
        updateBtn.disabled = true
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = true
    }

}
leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file') || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type !== 'checkbox') {
            if (['method', 'account_name', 'account_number', 'bank_name', 'ifsc_code', 'upi_id'].includes(e.target.name)) {
                inputObject['account_information'][e.target.name] = e.target.value
            }
            else
                inputObject[e.target.name] = e.target.value
        }
        else {

            inputObject[e.target.name] = e.target.checked
        }
        validate()
    }
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
        validate()
    }
    // console.log(inputObject)

})

updateBtn.addEventListener('click', () => {
    // console.log(inputObject)
    $('#loader').show()
    $.ajax({
        url: `/update-ciUser?id=${itemId}`,
        type: "PUT",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({ ciUser: inputObject }),
        success: function () {
            $('#loader').hide()
            location.reload()
        }
    })
})

publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'card_insider_users'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        validate()
    }

})
$(document).ready(function () {
    $("#ciu_dob").flatpickr()
    $.ajax({
        url: `/edit-ciUser?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            ({ ciUserDetail } = result.payload)
            // console.log(ciUserDetail)
            Object.keys(ciUserDetail).map(key => {
                if (['ciu_verified', 'Referral_commission_paid', 'cashback_claimed', 'iOSCheck'].includes(key)) {
                    $(`#${key}`).prop('checked', ciUserDetail[key] || false)
                    inputObject[`${key}`] = ciUserDetail[key] || false
                }
                else if (key === 'account_information') {
                    Object.keys(ciUserDetail[key]).map(innerKey => {
                        // console.log(ciUserDetail[key][innerKey])
                        $(`#${innerKey}`).val(ciUserDetail[key][innerKey] || '')
                        inputObject[`${key}`][`${innerKey}`] = ciUserDetail[key][innerKey] || ''
                    })
                }
                else if (['refferedBy', 'creditCards', 'cardApplications'].includes(key)) {
                    inputObject[`${key}`] = ciUserDetail[`${key}`]
                }
                else if (key === 'ciu_dob') {
                    if (ciUserDetail.ciu_dob === "1990-04-12T18:30:00.000Z") {
                        $("#ciu_dob").val(undefined)
                        inputObject['ciu_dob'] = undefined
                    }
                    else {

                        const dob = new Date(ciUserDetail.ciu_dob).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
                        const dobArray = (dob.split(/,|\//))

                        $("#ciu_dob").val(`${dobArray[2]}-${dobArray[1]}-${dobArray[0]}`)
                        inputObject['ciu_dob'] = $('#ciu_dob').val()
                    }

                }
                else if ($(`#${key}`).length) {
                    $(`#${key}`).val(ciUserDetail[key] || '')
                    inputObject[`${key}`] = ciUserDetail[key] || ''
                }
            })
            publishBtnText(ciUserDetail.published_at)
            enableUniMultiSelect({ refferedBy: ciUserDetail['refferedBy'] }, true, 'refferedBy', true)
            enableUniMultiSelect({ creditCards: ciUserDetail.creditCards }, false, 'creditCards', true)
            enableUniMultiSelect({ cardApplications: ciUserDetail['cardApplications'] }, false, 'cardApplications', true)

            inputObjectCopy = JSON.parse(JSON.stringify(inputObject))
            validate()

        }
    })
})
