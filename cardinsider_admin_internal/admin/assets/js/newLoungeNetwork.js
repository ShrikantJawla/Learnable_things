const saveBtn = document.getElementById('save-loungeNetwork')

let inputObject = {
    'ListName': "",
    'information': "",
    'creditCards': [],
    'lounges': []
}
const validate = () => {

    if (!inputObject['ListName']
    ) {
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false
}
leftForm.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        inputObject[e.target.name] = e.target.value
        validate()
    }
})
saveBtn.addEventListener('click', () => {
    saveBtnEventListener('Lounge Network', '/post-newloungeNetwork')
})

$('#laterBtn').click(function () {
    location.replace(`edit-loungeNetwork?id=${itemId}`)
})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Lounge Network', itemId, 'lounge_network_lists'))
multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['lounges'] = getSelectedOptions('lounges')
        validate()
    }
})

$(document).ready(function () {
    enableUniMultiSelect(undefined, false, 'creditCards')
    enableUniMultiSelect(undefined, false, 'lounges')

})