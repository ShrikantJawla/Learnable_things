const cardNetworksTab = document.getElementById('pills-tabContent')
const cardNetworksTablist = document.getElementById('pills-tab-card-networks')


/*

    DO NOT DELETE COMMENTS IN THE FOLLOWING CODE THE COMMENTED CODE WILL BE 
    USEFUL IN CASE WE WANT TO MAKE BRANDS AND CARD ISSUERS MULTISELECT INSTEAD OF 
    SINGLE SELECT



*/
let offerDetail = {}
let inputObject = {}
let inputObjectCopy = {}

// cardNetworksTab.addEventListener('input', e => {
//     if (e.target.value) {
//         const selected = e.target.id.replace('-select', '');
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
// })
// cardNetworksTab.addEventListener('input', (e) => {
//     if (e.target.tagName === 'SELECT') {
//         inputObject[e.target.name] = e.target.value
//         if (validate()) {

//             updateBtn.disabled = false
//         }
//         else {

//             updateBtn.disabled = true
//         }
//     }
// })


const validate = () => {

    if (JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy)
        || (inputObject['OfferType'] === 'Online' ? !(inputObject['Link']) : false)
        || !inputObject['OfferName']
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
        updateBtn.disabled = true
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = true
    }

}
const validateOfferType = () => {
    if (inputObject['OfferType'] === 'Online') {
        document.getElementById('BrandLinkLabel').innerHTML = `Brand Link<span class="required">*</span>`
    }
    else {
        document.getElementById('BrandLinkLabel').innerHTML = `Brand Link`
    }

}
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/offer', '/offers')
})
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

//             updateBtn.disabled = false
//         }
//         else {

//             updateBtn.disabled = true
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


// const disableCardNetworksTab=()

publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'offers'))

updateBtn.addEventListener('click', () => {
    console.log(inputObject.StartDate, inputObject.EndDate)
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
        $('#loader').show()
        $.ajax({
            url: `/update-offer?id=${itemId}`,
            type: "PUT",
            contentType: "application/json",
            dataType: 'json',
            data: JSON.stringify({ offer: inputObject }),
            success: function (result) {
                console.log(result, "dsgfuhg");
                if(result.status){
                    $('#loader').hide();
                    alert(`Status: ${result.status} \n Message: ${result.message} \n code: ${result.code}`);
                    location.reload();
                }else{
                    $('#loader').hide();
                    alert(`Status: ${result.status} \n Message: ${result.message} \n code: ${result.code}`);
                }
            },
            error: function(result){
                console.log(result.responseJSON);
                $('#loader').hide();
                    alert(`Status: ${result.responseJSON.status} \n Message: ${result.responseJSON.message} \n code: ${result.responseJSON.code}`);
            }
        })
    }

})
const validateMultiSelect = () => {
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
    }
    validate()
    validateMultiSelect()

})

const cardIssuersInSelect = function (/* result,*/) {
    let array = ['AMEX', 'AUBank', 'Axis', 'Canara Bank',  'BankofBaroda', 'Citi', 'Federal', 'Bank', 'HDFC', 'HSBC', 'ICICI', 'IDBI', 'IDFC', 'Indusind', 'Kotak', 'MasterCard', 'OneCard', 'PNB', 'RBL', 'Rupay', 'SBICards', 'Slice', 'StandardChartered', 'Uni', 'UnionBank', 'Visa', 'YesBank']
    let selectTag = document.getElementById('SelectCardIssuer')
    let appendData = `<option  value="any">Select Card Issuer</option>`
    for (let i = 0; i < array.length; i++) {
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
    $.ajax({
        url: `/edit-offer?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
console.log(result, "result here");
            offerDetail = result.payload.offerDetail
            console.log(offerDetail)
            publishBtnText(offerDetail.published_at)
            const startdate = new Date(offerDetail.StartDate).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            const startDateArray = (startdate.split(/,|\//))

            $("#StartDate").val(`${startDateArray[2]}-${startDateArray[1]}-${startDateArray[0]}`)

            const endDate = new Date(offerDetail.EndDate).toLocaleString('en-GB', { timeZone: 'Asia/Kolkata' })
            const endDateArray = (endDate.split(/,|\//))
            $("#EndDate").val(`${endDateArray[2]}-${endDateArray[1]}-${endDateArray[0]}`)
            inputObject['StartDate'] = $('#StartDate').val()
            inputObject['EndDate'] = $('#EndDate').val()
            Object.keys(offerDetail).map(key => {
                const include = ['OfferName', 'Description', 'Link', 'OfferType', 'OfferCategory', 'CouponCode', 'SelectCardIssuer', 'OfferLink', 'BrandPrivate', 'FromWhere']
                if (include.includes(key)) {
                    $(`#${key}`).val(offerDetail[key])
                    inputObject[`${key}`] = offerDetail[key]
                }
            })
            console.log(offerDetail)
            enableUniMultiSelect({ creditCards: offerDetail.creditCards }, false, 'creditCards')
            enableUniMultiSelect({ brands: offerDetail.brands }, true, 'brands')
            enableUniMultiSelect({ cardIssuers: offerDetail.cardIssuers }, true, 'cardIssuers')

            inputObject['creditCards'] = offerDetail.creditCards
            inputObject['brands'] = offerDetail.brands
            inputObject['cardIssuers'] = offerDetail.cardIssuers
            inputObjectCopy = JSON.parse(JSON.stringify(inputObject))
            validate()
            validateMultiSelect()
            validateOfferType()
        }
    })
})
