const saveBtn = document.getElementById('save-cardIssuer')
// const toast = new bootstrap.Toast(document.getElementById('errorToast'))
// const toastMessage = document.getElementById('errorToastMessage')
let inputObject = {
    'IssuerName': "",
    'Website': "",
    'CustomerCareNumbers': "",
    'Description': "",
    "CustomerCareEmail": "",
    'UniqueID': "",
    'StartingColor': '0xff377cc9',
    'EndColor': '0xff0b245d',
    'ApplyNow': false,
    'ApplySequence': '',
    'Sequence': '',
    'URL_launch_apply': false,
    'Application_Tracking_Link': '',
    'offers': [],
    'creditCards': []
}
const validate = () => {

    if (!inputObject['IssuerName']
    ) {
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false
}
function isValidHexaCode(str) {
    if (str[0] != '#')
        return false

    if (!(str.length == 7))
        return false

    for (let i = 1; i < str.length; i++)
        if (!((str[i].charCodeAt(0) <= '0'.charCodeAt(0) && str[i].charCodeAt(0) <= 9)
            || (str[i].charCodeAt(0) >= 'a'.charCodeAt(0) && str[i].charCodeAt(0) <= 'f'.charCodeAt(0))
            || (str[i].charCodeAt(0) >= 'A'.charCodeAt(0) || str[i].charCodeAt(0) <= 'F'.charCodeAt(0))))
            return false

    return true
}

leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.id !== 'StartingColorHex' && e.target.id !== 'EndColorHex') || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type === 'checkbox') {
            inputObject[e.target.id] = e.target.checked

        }
        else if (e.target.type === 'color') {
            inputObject[e.target.id] = e.target.value.replace('#', '0xff')
            document.getElementById(`${e.target.id}Hex`).value = e.target.value
        }
        else {
            inputObject[e.target.name] = e.target.value
        }
        validate()
    }
})
const items = ['StartingColorHex', 'EndColorHex']
items.map(item => {
    document.getElementById(`${item}`).addEventListener('input', e => {
        const selected = `${item}`.replace('Hex', '')
        const colorInput = document.getElementById(selected)
        if (isValidHexaCode(e.target.value)) {
            colorInput.value = e.target.value
            inputObject[selected] = e.target.value.replace('#', '0xff')

        }
        else {
            colorInput.value = '#000000'
            inputObject[selected] = '0xff000000'
        }
    })
})

saveBtn.addEventListener('click', () => {
    let mesg = ``
    if (!(!inputObject['Website'] || isValidHttpUrl(inputObject['Website']))) {
        mesg += `Please enter a valid url for WEBSITE. \n`
    }
    if (!(!inputObject['Application_Tracking_Link'] || isValidHttpUrl(inputObject['Application_Tracking_Link']))) {
        mesg += `Please enter a valid url for APPLICATION TRACKING LINK. \n`
    }
    if (mesg.length) {
        toastMessage.innerText = `${mesg}`
        toast.show()
    }
    else {

        let issuerImg = document.getElementById('issuer_logo').files[0]

        let issuerImgType = (issuerImg === undefined || issuerImg === "") ? "" : issuerImg.type.split('/')[issuerImg.type.split('/').length - 1]

        let issuerImgChangedName = (issuerImgType === "") ? undefined : renameFile(issuerImg, "Logo" + "." + issuerImgType)

        let bankImg = document.getElementById('bank_image').files[0]

        let bankImgType = (bankImg === undefined || bankImg === "") ? "" : bankImg.type.split('/')[bankImg.type.split('/').length - 1]

        let bankImgChangedName = (bankImgType === "") ? undefined : renameFile(bankImg, "BankImage" + "." + bankImgType)

        let formDataToPost = new FormData()
        formDataToPost.append('upload', issuerImgChangedName)
        formDataToPost.append('upload', bankImgChangedName)
        formDataToPost.append('relatedType', 'card_issuers')
        formDataToPost.append('item', JSON.stringify(inputObject))
        $('#saveModal').modal('show')
        $.ajax({
            url: "/post-newcardIssuer",
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: formDataToPost,
            success: function (result) {
                itemId = result.payload.id
                $('#saveModalTitle').text('Card Issuer Saved to DB')
                $('#saveLoader').addClass('success')
                $('#publishText').text('Do you want to Publish it now?')
                $('#laterBtn').prop('disabled', false)
                $('#publishBtn').prop('disabled', false)
            }
        })
    }
})

$('#laterBtn').click(function () {
    location.replace(`edit-cardIssuer?id=${itemId}`)
})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Card Issuer', itemId, 'card_issuers'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['offers'] = getSelectedOptions('offers')
        validate()
    }

})

$(document).ready(function () {

    document.querySelector('#issuer_logo-preview').src = fallbackImgSrc
    document.querySelector('#issuer_logo-preview').dataset.defaultSrc = fallbackImgSrc

    document.querySelector('#bank_image-preview').src = fallbackImgSrc
    document.querySelector('#bank_image-preview').dataset.defaultSrc = fallbackImgSrc

    enableUniMultiSelect(undefined, false, 'creditCards', true)
    enableUniMultiSelect(undefined, false, 'offers', true)
})
