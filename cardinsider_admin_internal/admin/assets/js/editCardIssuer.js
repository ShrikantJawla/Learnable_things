let cardIssuerDetail = {}
let inputObjectCopy = {}
let IssuerLogo = document.getElementById('issuer_logo')
let BankImage = document.getElementById('bank_image')


let inputObject = {
    'IssuerName': "",
    'Website': "",
    'CustomerCareNumbers': "",
    'Description': "",
    "CustomerCareEmail": "",
    'UniqueID': "",
    'StartingColor': "",
    'EndColor': '',
    'ApplyNow': false,
    'ApplySequence': '',
    'Sequence': '',
    'URL_launch_apply': false,
    'Application_Tracking_Link': '',
    'offers': [],
    'creditCards': []
}


function isValidHttpUrl(string) {
    let url

    try {
        url = new URL(string)
    } catch (err) {
        return false
    }

    return url.protocol === "http:" || url.protocol === "https:"
}
const validate = () => {

    if ((JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy) && !(IssuerLogo.files.length > 0 || BankImage.files.length > 0))
        || !inputObject['IssuerName']
    ) {
        updateBtn.disabled = true
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = true
    }

}
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/cardIssuer', '/cardissuers-list')
})
leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file' && e.target.id !== 'StartingColorHex' && e.target.id !== 'EndColorHex') || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type === 'checkbox') {
            inputObject[e.target.id] = e.target.checked

        }
        else if (e.target.type === 'color') {
            inputObject[e.target.id] = e.target.value.replace('#', '0xff')
            document.getElementById(`${e.target.id}Hex`).value = e.target.value
        }
        else if (e.target.type === 'number') {
            inputObject[e.target.id] = Math.floor(e.target.value)
            document.getElementById(`${e.target.id}`).value = Math.floor(e.target.value)
        }
        else {
            inputObject[e.target.name] = e.target.value
        }
        validate()
    }
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
        validate()
    }
})
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
$("#creditreportshow").change(function () {
    console.log($("#creditreportshow").prop("checked"));
    $(updateBtn).prop("disabled", false);
    $("#publish").prop("disabled", true);

});
updateBtn.addEventListener('click', () => {
    inputObject['creditreportshow'] = $("#creditreportshow").prop("checked");
    let mesg = ``
    if (!(!inputObject['Website'] || isValidHttpUrl(inputObject['Website']))) {
        mesg += `Please enter a valid url for WEBSITE.\n`
    }
    if (!(!inputObject['Application_Tracking_Link'] || isValidHttpUrl(inputObject['Application_Tracking_Link']))) {
        mesg += `Please enter a valid url for APPLICATION TRACKING LINK.\n`
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
        formDataToPost.append('cardIssuer', JSON.stringify(inputObject))
        $('#loader').show()
        $.ajax({
            url: `/update-cardIssuer?id=${itemId}`,
            type: "PUT",
            cache: false,
            contentType: false,
            processData: false,
            data: formDataToPost,
            success: function (response) {
                $('#loader').hide()
                location.reload()
            },
            error: function (response) {
                $('#loader').hide()
                toastMessage.innerText = `${response.responseJSON.message}`
                toast.show()
            }
        })
    }
})

publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'card_issuers'))



multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['offers'] = getSelectedOptions('offers')
        validate()
    }

})




$(document).ready(function () {
    $.ajax({
        url: `/edit-cardIssuer?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            ({ cardIssuerDetail } = result.payload)
            console.log(cardIssuerDetail)
            publishBtnText(cardIssuerDetail.published_at)
            $('#bank_image-preview').attr('src', cardIssuerDetail['bank_image'] || fallbackImgSrc)
            document.querySelector('#bank_image-preview').dataset.defaultSrc = cardIssuerDetail['bank_image'] || fallbackImgSrc
            $('#issuer_logo-preview').attr('src', cardIssuerDetail['issuer_logo'] || fallbackImgSrc)
            document.querySelector('#issuer_logo-preview').dataset.defaultSrc = cardIssuerDetail['issuer_logo'] || fallbackImgSrc
            Object.keys(cardIssuerDetail).map(key => {
                if ($(`#${key}`).length && key !== 'ApplyNow' && key !== 'URL_launch_apply' && key !== 'bank_image' && key !== 'issuer_logo') {
                    if (key === 'StartingColor' || key === 'EndColor') {
                        $(`#${key}`).val(cardIssuerDetail[key].replace('0xff', '#') || '')
                        $(`#${key}Hex`).val(cardIssuerDetail[key].replace('0xff', '#') || '')
                        inputObject[`${key}`] = cardIssuerDetail[key]
                    }
                    else {
                        cardIssuerDetail[key] === 'null' ? $(`#${key}`).val('') : $(`#${key}`).val(cardIssuerDetail[key] || '')
                        inputObject[`${key}`] = cardIssuerDetail[key] || ''
                    }
                }
                if (key === 'creditreportshow') {
                   // console.log('HELL MAY CHAL GEYA ')
                    $(`#${key}`).prop('checked', cardIssuerDetail[key] || false)
                    inputObject[`${key}`] = cardIssuerDetail[key] || false
                }
                if (key === 'ApplyNow' || key === 'URL_launch_apply') {
                    $(`#${key}`).prop('checked', cardIssuerDetail[key])
                    inputObject[`${key}`] = cardIssuerDetail[key]
                }
            })
            enableUniMultiSelect({ creditCards: cardIssuerDetail['creditCards'] }, false, 'creditCards', true)
            enableUniMultiSelect({ offers: cardIssuerDetail['offers'] }, false, 'offers', true)
            inputObject['creditCards'] = cardIssuerDetail['creditCards']
            inputObject['offers'] = cardIssuerDetail['offers']
            inputObjectCopy = { ...inputObject }
            validate()

        }
    })
})
