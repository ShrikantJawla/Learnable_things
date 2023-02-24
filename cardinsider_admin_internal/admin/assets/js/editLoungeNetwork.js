let loungeNetworkDetail = {}
let inputObjectCopy = {}
let inputObject = {
    'ListName': "",
    'information': "",
    'creditCards': [],
    'lounges': []
}
let selectedLounges;
let selectedCreditCards;
const validate = () => {

    if (JSON.stringify(inputObject) === JSON.stringify(inputObjectCopy)
        || !inputObject['ListName']
    ) {
        updateBtn.disabled = false
        publishBtn.disabled = false
    }
    else {
        updateBtn.disabled = false
        publishBtn.disabled = false
    }
}
leftForm.addEventListener('input', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        inputObject[e.target.name] = e.target.value
        validate()
    }
})
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction(itemId, '/delete/loungeNetwork', '/lounge-network-list')
})



updateBtn.addEventListener('click', () => {
    inputObject.lounges = [];
    inputObject.creditCards = [];
    $('#loader').show();
    $(".newCheckBox").each(function () {
        if ($(this).is(":checked")) {
            let targetId = $(this).prop('id');
            targetId = targetId.replace("_l" , "")
            let name = $(this).prop('name')
            let lounge = {
                id: targetId,
                LoungeName: name
            }
            inputObject.lounges.push(lounge)
        }
    })
    $(".newCreditCheckBox").each(function(){
        if ($(this).is(":checked")) {
            let targetId = $(this).prop('id');
            targetId = targetId.replace("_c" , "")
            let name = $(this).prop('name')
            let cards = {
                id: targetId,
                CreditCardName: name
            }
            inputObject.creditCards.push(cards)
        }
    })
    $.ajax({
        url: `/update-loungeNetwork?id=${itemId}`,
        type: "PUT",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({ loungeNetwork: inputObject }),
        success: function (result) {
            $('#loader').hide()
            location.reload();
        }
    })
})
publishBtn.addEventListener('click', () => publishBtnOnEditPage(itemId, 'lounge_network_lists'))
multiSelectWrapper.addEventListener('click', (e) => {
    if (['BUTTON', 'INPUT', 'OPTION'].includes(e.target.tagName)) {
        inputObject['creditCards'] = getSelectedOptions('creditCards')
        inputObject['lounges'] = getSelectedOptions('lounges')
        validate()
    }

})
$(document).ready(function () {
    $.ajax({
        url: `/edit-loungeNetwork?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",
        success: function (result) {
            ({ loungeNetworkDetail } = result.payload)
            publishBtnText(loungeNetworkDetail.published_at)
            $(`#ListName`).val(loungeNetworkDetail['ListName'])
            $(`#information`).val(loungeNetworkDetail['information'])
            inputObject['ListName'] = loungeNetworkDetail['ListName']
            inputObject['information'] = loungeNetworkDetail['information']
            addSelectedLounges(loungeNetworkDetail.lounges)
            addSelectedCards(loungeNetworkDetail.creditCards)
            
            selectedLounges = loungeNetworkDetail.lounges;
            selectedCreditCards = loungeNetworkDetail.creditCards;
            enableUniMultiSelect({ creditCards: loungeNetworkDetail['creditCards'] }, false, 'creditCards')
            enableUniMultiSelect({ lounges: loungeNetworkDetail['lounges'] }, false, 'lounges')
            inputObject['creditCards'] = loungeNetworkDetail['creditCards']
            inputObject['lounges'] = loungeNetworkDetail['lounges']
            inputObjectCopy = { ...inputObject }
            validate()
        }
    });

   

})

function addSelectedLounges(lounges) {
    selectedLounges = lounges;
    $.ajax({
        url: "/loungesforrelation",
        type: 'GET',
        success: function (res) {
            renderLoungesData(res.payload, lounges)
        }
    });
}

function addSelectedCards(cards) {
    selectedCreditCards = cards;
    $.ajax({
        url: "/creditcardforrelation",
        type: 'GET',
        success: function (res) {
            renderCardsData(res.payload, cards)
        }
    });
}

function renderCardsData(data, cards){
    let htmlString = ``;
    let checkedData = {};
    
    for(let i = 0 ; i < cards.length; i++){
        checkedData[cards[i].id] = cards[i];
    }
    let uncheckVal = $("#check-all-credit");
    $(uncheckVal).change(function () {
        if (!uncheckVal[0].checked) {
            $('.newCreditCheckBox').attr('checked', false);
        } else {
            for (let i = 0; i < data.length; i++) {
                let checked = false;
                if (checkedData[data[i].id]) {
                    checked = true;
                }
                $('.newCreditCheckBox').attr('checked', checked);
            }
        }
    });
    for (let i = 0; i < data.length; i++) {
        let checked = '';
        if (checkedData[data[i].id]) {
            checked = 'checked';
        }
        htmlString += `<div> <span> <input class='newCreditCheckBox' name='${data[i].CreditCardName}' ${checked} id="${data[i].id}_c" type="checkbox"></span> ${data[i].CreditCardName}</div>`
    }
    $("#creditNew").html(htmlString);
}

function renderLoungesData(data, lounges) {
    let htmlString = ``;
    let checkedData = {};
    for (let i = 0; i < lounges.length; i++) {
        checkedData[lounges[i].id] = lounges[i];
    }
    let uncheckVal = $('#check-all');
    $(uncheckVal).change(function () {
        if (!uncheckVal[0].checked) {

            $('.newCheckBox').attr('checked', false);

        } else {
            for (let i = 0; i < data.length; i++) {
                let checked = false;
                if (checkedData[data[i].id]) {
                    checked = true;
                }
                $('.newCheckBox').attr('checked', checked);

            }


        }
    });
    for (let i = 0; i < data.length; i++) {
        let checked = '';
        if (checkedData[data[i].id]) {
            checked = 'checked';
        }
        htmlString += `<div> <span> <input class='demoCheckBox' type="checkbox"/> <input class='newCheckBox' name='${data[i].LoungeName}' ${checked} id="${data[i].id}_l" type="checkbox"></span> ${data[i].LoungeName}</div>`
    }
    $("#loungesNew").html(htmlString);
}

