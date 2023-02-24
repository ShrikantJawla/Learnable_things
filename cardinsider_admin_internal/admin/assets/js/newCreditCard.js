const saveBtn = document.getElementById('save-creditCard')
const cardNetworksTab = document.getElementById('pills-tabContent')
const cardNetworksTablist = document.getElementById('pills-tab-card-networks')

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
const validate = () => {

    if (!inputObject['CreditCardName']
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
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false
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

cardNetworksTab.addEventListener('input', (e) => {
    if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
        const selected = e.target.id.replace('-select', '').replace('-checkbox', '')
        inputObject['CreditCardType'][selected] = ['AMEX', 'DinersClub'].includes(selected) ? e.target.checked : e.target.value
        validate()
    }
})

leftForm.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
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
    }
    validate()
    validateApplyNow()
}
)

saveBtn.addEventListener('click', () => {
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
        formDataToPost.append('item', JSON.stringify(inputObject))
        $('#saveModal').modal('show')
        $.ajax({
            url: "/post-newcreditCard",
            type: "POST",
            cache: false,
            contentType: false,
            processData: false,
            data: formDataToPost,
            success: function (result) {
                itemId = result.payload.id
                $('#saveModalTitle').text('Credit Card Saved to DB')
                $('#saveLoader').addClass('success')
                $('#publishText').text('Do you want to Publish it now?')
                $('#laterBtn').prop('disabled', false)
                $('#publishBtn').prop('disabled', false)
            }
        })
    }
})

$('#laterBtn').click(function () {
    location.replace(`edit-creditCard?id=${itemId}`)
})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Credit Card', itemId, 'credit_cards'))

multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['card_issuer'] = getSelectedOptions('cardIssuers')
        inputObject['lounge_network_list'] = getSelectedOptions('loungeNetworks')
        inputObject['offers'] = getSelectedOptions('offers')
        inputObject['lounges'] = getSelectedOptions('lounges')
        validate()
    }

})



$(document).ready(function () {
    document.querySelector('#cardimage-preview').src = fallbackImgSrc
    document.querySelector('#cardimage-preview').dataset.defaultSrc = fallbackImgSrc

    enableUniMultiSelect(undefined, false, 'offers', true)
    enableUniMultiSelect(undefined, false, 'lounges')
    enableUniMultiSelect(undefined, true, 'cardIssuers')
    enableUniMultiSelect(undefined, true, 'loungeNetworks')
})