const cardNetworksTab = document.getElementById('pills-tabContent')
const cardNetworksTablist = document.getElementById('pills-tab-card-networks')
const saveBtn = document.getElementById('save-offers')
const cardIssuerForRelationSelectElement = document.getElementById('cardIssuersInput')
const brandsForRelationSelectElement = document.getElementById('brandsInput')



/*

    DO NOT DELETE COMMENTS IN THE FOLLOWING CODE THE COMMENTED CODE WILL BE 
    USEFIL IN CASE WE WANT TO MAKE BRANDS AND CARD ISSUERS MULTISELECT INSTEAD OF 
    SINGLE SELECT



*/


let inputObject = {
    'BrandPrivate': "",
    'CouponCode': "",
    'Description': "",
    'EndDate': "",
    'FromWhere': "",
    'Link': "",
    'OfferCategory': "",
    'OfferLink': "",
    'OfferName': "",
    'OfferType': "",
    'SelectCardIssuer': "",
    'StartDate': "",
    'EndDate': "",
    'brands': [],
    'cardIssuers': [],
    'creditCards': [],
    // "CreditCardType": {
    //     "Visa": "",
    //     "Rupay": "",
    //     "MasterCard": "",
    //     "AMEX": false,
    //     "DinersClub": false
    // }
}



//Add event listener on summernote brands cardissuers creditcards visa rupay mastercard
const validate = () => {

    if (!inputObject['OfferName']
        || (inputObject['OfferType'] === 'Online' ? !(inputObject['Link']) : false)
        || !inputObject['Description']
        || !inputObject['SelectCardIssuer']
        || !inputObject['StartDate']
        || !inputObject['EndDate']
        || !inputObject['OfferCategory']
        || !inputObject['OfferType']
        || !inputObject['FromWhere']
        || !inputObject['brands'].length
        // || !inputObject['BrandPrivate']
        // || !(inputObject['cardIssuers'].length || inputObject['creditCards'].length)
        // || inputObject['CreditCardType']['Visa'] || inputObject['CreditCardType']['Rupay'] || inputObject['CreditCardType']['MasterCard'] || inputObject['CreditCardType']['AMEX'] || inputObject['CreditCardType']['DinersClub'])
    ) {
        saveBtn.disabled = true
    }
    else
        saveBtn.disabled = false

}
const validateOfferType = () => {
    if (inputObject['OfferType'] === 'Online') {
        document.getElementById('BrandLinkLabel').innerHTML = `Brand Link<span class="required">*</span>`
    }
    else {
        document.getElementById('BrandLinkLabel').innerHTML = `Brand Link`
    }

}
// const validateCardNetworksTab = (Target) => {
//     let selected
//     if (Target.tagName === 'INPUT') {
//         selected = Target.id.replace('-checkbox', '')
//     }
//     else if (Target.tagName === 'SELECT') {
//         selected = Target.id.replace('-select', '')
//     }
//     if ((Target.tagName === 'INPUT' && Target.checked) || (Target.tagName === 'SELECT' && Target.value)) {
//         [...cardNetworksTablist.children].map(node => {
//             if (node.children[0].id !== `pills-${selected}-tab`) {
//                 node.children[0].disabled = true
//             }
//         })
//     }
//     else {
//         [...cardNetworksTablist.children].map(node => {
//             node.children[0].disabled = false
//         })
//     }
// }

// cardNetworksTab.addEventListener('input', (e) => {
//     if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') {
//         const selected = e.target.id.replace('-select', '').replace('-checkbox', '')
//         inputObject['CreditCardType'][selected] = ['AMEX', 'DinersClub'].includes(selected) ? e.target.checked : e.target.value
//         if (validate()) {

//             saveBtn.disabled = false
//         }
//         else {

//             saveBtn.disabled = true
//         }
//     }
//     validateCardNetworksTab(e.target)
// })

// same as above


leftForm.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA') {
        inputObject[e.target.name] = e.target.value
        validate()
        validateOfferType()
    }
})



saveBtn.addEventListener('click', () => {
    let mesg = ``
    if (!(!inputObject['Link'] || isValidHttpUrl(inputObject['Link']))) {
        mesg += `Please enter a valid url for BRAND LINK.\n`
    }
    if (!(!inputObject['OfferLink'] || isValidHttpUrl(inputObject['OfferLink']))) {
        mesg += `Please enter a valid url for OFFER LINK.\n`
    }
    if (mesg.length) {
        toastMessage.innerText = `${mesg}`
        toast.show()
    }
    else {
        // console.log(inputObject)
        saveBtnEventListener('Offer', '/post-newoffer')
    }
})
$('#laterBtn').click(function () {
    location.replace(`edit-offer?id=${itemId}`)

})
$('#publishBtn').click(() => publishBtnOnNewPageEventListener('Offer', itemId, 'offers'))
const validateMultiSelect = () => {
    // console.log(inputObject)
    if (inputObject.creditCards && inputObject['creditCards'].length) {
        document.getElementById('cardIssuersInput').disabled = true
        document.getElementById('cardIssuersDropdownIcon').disabled = true
    }
    else {
        document.getElementById('cardIssuersInput').disabled = false
        document.getElementById('cardIssuersDropdownIcon').disabled = false
    }
    if (inputObject.cardIssuers && inputObject['cardIssuers'].length) {
        document.getElementById('creditCardsInput').disabled = true
        document.getElementById('creditCardsDropdownIcon').disabled = true
    }
    else {
        document.getElementById('creditCardsInput').disabled = false
        document.getElementById('creditCardsDropdownIcon').disabled = false
    }
}
multiSelectWrapper.addEventListener('click', e => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['brands'] = getSelectedOptions('brands')
        inputObject['cardIssuers'] = getSelectedOptions('cardIssuers')
        validateMultiSelect()
        validate()
    }

})
const cardIssuersInSelect = function (/* result,*/) {
    let array = ['AMEX', 'AUBank', 'Axis', 'BankofBaroda', 'Citi', 'Federal', 'Bank', 'HDFC', 'HSBC', 'ICICI', 'IDBI', 'IDFC', 'Indusind', 'Kotak', 'MasterCard', 'OneCard', 'PNB', 'RBL', 'Rupay', 'SBICards', 'Slice', 'StandardChartered', 'Uni', 'UnionBank', 'Visa', 'YesBank']
    let selectTag = document.getElementById('SelectCardIssuer')
    let appendData = `<option  value="">Select Card Issuer</option>`
    // console.log(result)
    for (let i = 0; i < array.length; i++) {
        //console.log(i);
        appendData =
            appendData +
            `<option value = "${array[i]}" > ${array[i]} </option> `
    }
    selectTag.innerHTML = appendData
}

$(document).ready(function () {
    $("#StartDate").flatpickr()
    $("#EndDate").flatpickr()
    cardIssuersInSelect('')
    enableUniMultiSelect(undefined, false, 'creditCards')
    enableUniMultiSelect(undefined, true, 'brands')
    enableUniMultiSelect(undefined, true, 'cardIssuers')
})
