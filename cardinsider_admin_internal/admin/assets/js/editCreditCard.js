const cardNetworksTab = document.getElementById('pills-tabContent')
const cardNetworksTablist = document.getElementById('pills-tab-card-networks')
let CardImage = document.getElementById('cardimage')


let creditCardDetail = {}
let show_on_home;
let inputObjectCopy = {}
let inputObject = {
    'CreditCardName': "",
    'applyNow': false,
    'CardRating': "",
    'Applynowsequence': "",
    "Apply_Link": "",
    'featured_text': "",
    'Highlights': "",
    'WelcomeOffers': "",
    'FeeReversal': "",
    "JoiningFees": "",
    "show_on_home": false,
    "RenewalFees": "",
    'BestSuitedFor': {
        'Movies': false,
        'Travel': false,
        'Dining': false,
        'Fuel': false,
        'Shopping': false,
    },
    "Features": {
        'Rewards': "",
        'Movie': "",
        'Dining': "",
        'Travel': "",
        'Lounge': "",
        'Golf': "",
        'Fuel': "",
        'RewardRedemption': "",
    },
    "card_issuer": [],
    "lounge_network_list": [],
    "lounges": [],
    "offers": [],
    "CreditCardType": {
        "Visa": "",
        "Rupay": "",
        "MasterCard": "",
        "AMEX": false,
        "DinersClub": false
    }
}

const validate = () => {

    if ((JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy) && !(CardImage.files.length > 0))
        || !inputObject['CreditCardName']
        || (inputObject['applyNow'] === true
            ? !(
                inputObject['Apply_Link']
                && inputObject['featured_text']
                && inputObject['Features']['Rewards']
                && inputObject['WelcomeOffers']
                && inputObject['Highlights'])
            : false)
        || !inputObject['CardRating']
        || !(inputObject['card_issuer'].length)
        || !(inputObject['JoiningFees'])
        || !(inputObject['RenewalFees'])
        || !(inputObject['CreditCardType']['Visa'] || inputObject['CreditCardType']['Rupay'] || inputObject['CreditCardType']['MasterCard'] || inputObject['CreditCardType']['AMEX'] || inputObject['CreditCardType']['DinersClub'])
        || !(inputObject['BestSuitedFor']['Dining'] || inputObject['BestSuitedFor']['Movies'] || inputObject['BestSuitedFor']['Travel'] || inputObject['BestSuitedFor']['Shopping'] || inputObject['BestSuitedFor']['Fuel'])
    ) {
        updateBtn.disabled = true
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = true
    }

}
// This Should Be Done Life this but it is a desperate attempt to fix

document.getElementById("show_on_home").addEventListener("change", (e) => {
    if (show_on_home != e.target.checked) {
        updateBtn.disabled = false;
        publishBtn.disabled = true;
        inputObject.show_on_home = e.target.checked;
    } else {
        updateBtn.disabled = true;
        publishBtn.disabled = false;
        inputObject.show_on_home = e.target.checked;
    }

})
cardNetworksTab.addEventListener('input', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
        const selected = e.target.id.replace('-select', '').replace('-checkbox', '')
        inputObject['CreditCardType'][selected] = ['AMEX', 'DinersClub'].includes(selected) ? e.target.checked : e.target.value
        validate()
    }
})
leftForm.addEventListener('input', (e) => {
    if ((e.target.tagName === 'INPUT' && e.target.type !== 'file') || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        if (e.target.type === 'checkbox' && e.target.dataset.parent !== 'BestSuitedFor') {
            inputObject['applyNow'] = e.target.checked
        }
        else if (e.target.type === 'checkbox' && e.target.dataset.parent === 'BestSuitedFor') {
            inputObject['BestSuitedFor'][e.target.id] = e.target.checked
        }
        else if (e.target.dataset.parent === 'Features') {
            inputObject['Features'][e.target.name] = e.target.value
        }
        else {
            inputObject[e.target.name] = e.target.value
        }
        validate()
        validateApplyNow()
    }
    if (e.target.tagName === 'INPUT' && e.target.type === 'file') {
        validate()
        validateApplyNow()
    }

}
)

$("#creditreportshowcard").change(function () {
    console.log($("#creditreportshowcard").prop("checked"));
    $(updateBtn).prop("disabled", false);
    $("#publish").prop("disabled", true);

});

updateBtn.addEventListener('click', () => {
    inputObject['creditreportshowcard'] = $("#creditreportshowcard").prop("checked");
    let mesg = ``
    if (!(!inputObject['Apply_Link'] || isValidHttpUrl(inputObject['Apply_Link']))) {
        mesg += `Please enter a valid url for APPLY LINK.\n`
    }
    if (mesg.length) {
        toastMessage.innerText = `${mesg}`
        toast.show()
    }
    else {
        let cardImg = document.getElementById('cardimage').files[0]

        let cardImgType = (cardImg === undefined || cardImg === "") ? "" : cardImg.type.split('/')[cardImg.type.split('/').length - 1]

        let cardImgChangedName = (cardImgType === "") ? undefined : renameFile(cardImg, "CreditCardImage" + "." + cardImgType)

        let formDataToPost = new FormData()
        formDataToPost.append('upload', cardImgChangedName)
        formDataToPost.append('relatedType', 'credit_cards')
        formDataToPost.append('creditCard', JSON.stringify(inputObject))
        console.log(inputObject, "<<<<<<<<<<<<")
        $('#loader').show()
        $.ajax({
            url: `/update-creditCard?id=${itemId}`,
            type: "PUT",
            cache: false,
            contentType: false,
            processData: false,
            data: formDataToPost,
            success: function () {
                $('#loader').hide()
                location.reload()
            }
        })
    }

})

publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'credit_cards'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['card_issuer'] = getSelectedOptions('cardIssuers')
        inputObject['lounge_network_list'] = getSelectedOptions('loungeNetworks')
        inputObject['lounges'] = getSelectedOptions('lounges')
        inputObject['offers'] = getSelectedOptions('offers')
        validate()
    }
})
const validateApplyNow = () => {
    if (inputObject['applyNow']) {
        document.getElementById('Apply_link_label').innerHTML = `Apply Link<span class="required">*</span>`
        document.getElementById('featured_text_label').innerHTML = `Featured Text<span class="required">*</span>`
        document.getElementById('Highlights_label').innerHTML = `Highlights<span class="required">*</span>`
        document.getElementById('WelcomeOffers_label').innerHTML = `Welcome Offers<span class="required">*</span>`
        document.getElementById('Rewards_label').innerHTML = `Rewards<span class="required">*</span>`

    }
    else {
        document.getElementById('Apply_link_label').innerHTML = `Apply Link`
        document.getElementById('featured_text_label').innerHTML = `Featured Text`
        document.getElementById('Highlights_label').innerHTML = `Highlights`
        document.getElementById('WelcomeOffers_label').innerHTML = `Welcome Offers`
        document.getElementById('Rewards_label').innerHTML = `Rewards`

    }

}
const validateCardNetworksTab = (Target) => {
    let selected
    if (Target.tagName === 'INPUT') {
        selected = Target.id.replace('-checkbox', '')
    }
    else if (Target.tagName === 'SELECT') {
        selected = Target.id.replace('-select', '')
    }
    if ((Target.tagName === 'INPUT' && Target.checked) || (Target.tagName === 'SELECT' && Target.value)) {
        [...cardNetworksTablist.children].map(node => {
            if (node.children[0].id !== `pills-${selected}-tab`) {
                node.children[0].disabled = true
            }
        })
    }
    else {
        [...cardNetworksTablist.children].map(node => {
            node.children[0].disabled = false
        })
    }
}
cardNetworksTab.addEventListener('input', e => validateCardNetworksTab(e.target))
const successFunction = (result) => {
    console.log("fsdhgdfs8uiunfe ------->>>>>>", result);
    ({ creditCardDetail } = result)
    publishBtnText(creditCardDetail.published_at)
    $('#cardimage-preview').attr('src', creditCardDetail['cardimage'] || fallbackImgSrc)
    document.querySelector('#cardimage-preview').dataset.defaultSrc = creditCardDetail['cardimage'] || fallbackImgSrc
    Object.keys(creditCardDetail).map(key => {
        if (key === 'applyNow') {
            $(`#${key}`).prop('checked', creditCardDetail[key] || false)
            inputObject[`${key}`] = creditCardDetail[key] || false
        }
        else if (key === 'creditreportshowcard') {
            $(`#${key}`).prop('checked', creditCardDetail[key] || false)
            inputObject[`${key}`] = creditCardDetail[key] || false
        }
        else if (key === 'show_on_home') {
            $(`#${key}`).prop('checked', creditCardDetail[key] || false)
            inputObject[`${key}`] = creditCardDetail[key] || false
        }
        else if ($(`#${key}`).length && key !== 'Movie' && key !== 'RewardRedemtion' && key !== 'BestSuitedFor' && key !== 'Features' && key !== 'CreditCardType' && key !== 'cardimage') {
            $(`#${key}`).val(creditCardDetail[key] || '')
            inputObject[`${key}`] = creditCardDetail[key] || ''
        }
        else if (key === 'BestSuitedFor') {
            Object.keys(creditCardDetail['BestSuitedFor']).map(key => {
                if ($(`#${key}`).length) {
                    $(`#${key}`).prop('checked', creditCardDetail['BestSuitedFor'][key]) || false
                    inputObject['BestSuitedFor'][`${key}`] = creditCardDetail['BestSuitedFor'][key] || false
                }
            })
        }
        else if (key === 'Features') {
            Object.keys(creditCardDetail['Features']).map(key => {
                creditCardDetail['Features'][key] === 'null' ? $(`#${key}Features`).val('') : $(`#${key}Features`).val(creditCardDetail['Features'][key] || '')
                inputObject['Features'][`${key}`] = creditCardDetail['Features'][key] || ''
            })
        }
        else if (key === 'CreditCardType') {
            let type = Object.keys(creditCardDetail['CreditCardType'])[0]
            let value = Object.values(creditCardDetail['CreditCardType'])[0]
            inputObject['CreditCardType'] = { ...inputObject['CreditCardType'], [type]: value }
            $(`#pills-Visa-tab`).removeClass('active')
            $(`#pills-Visa`).removeClass('active show')
            $(`#pills-${type}-tab`).addClass('active')
            $(`#pills-${type}`).addClass('active show')
            if (type === 'AMEX' || type === 'DinersClub') {
                $(`#${type}-checkbox`).prop('checked', value || false)
                validateCardNetworksTab(document.getElementById(`${type}-checkbox`))
            }
            else {
                $(`#${type}-select`).val(value)
                validateCardNetworksTab(document.getElementById(`${type}-select`))
            }
        }
    })
    // enableMultiSelectCreditCards({ offers: creditCardDetail['offers'], lounges: creditCardDetail['lounges'] })
    enableUniMultiSelect({ offers: creditCardDetail['offers'] }, false, 'offers', true)
    enableUniMultiSelect({ lounges: creditCardDetail['lounges'] }, false, 'lounges')
    enableUniMultiSelect({ cardIssuers: creditCardDetail['card_issuer'] }, true, 'cardIssuers')
    enableUniMultiSelect({ loungeNetworks: creditCardDetail['lounge_network_list'] }, true, 'loungeNetworks')

    inputObject['card_issuer'] = creditCardDetail['card_issuer']
    inputObject['lounge_network_list'] = creditCardDetail['lounge_network_list']
    inputObject['offers'] = creditCardDetail['offers']
    inputObject['lounges'] = creditCardDetail['lounges']
    inputObjectCopy = JSON.parse(JSON.stringify(inputObject))
    validate()
    validateApplyNow()
}

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/creditCard', '/creditcards-list')
})
$(document).ready(function () {
    console.log('hi ia m rahul')
    $.ajax({
        url: `/edit-creditCard?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",
        success: function (result) {
            successFunction(result.payload)
            show_on_home = $("#show_on_home").is(":checked");
        }
    })
})