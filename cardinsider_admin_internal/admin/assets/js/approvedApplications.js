let checkedData = []
let applicationsData = []
let payAllBtn = document.getElementById('payAll')
let checkAll = document.getElementById('allCheck')
filterReset.addEventListener("click", () => {
    //can use loop here but didnt use it for better reading purposes
    document.getElementById("id").value = ""
    document.getElementById("Application_number").value = ""
    document.getElementById("Phone_Number").value = ""
    document.getElementById("card-issuer-options").value = ""
    document.getElementById("credit-card-options").value = ""
    document.getElementById("Cashback_applicable").value = ""
    document.getElementById("Cashback_to_be_paid-options").value = ""
    document.getElementById("Cashback_paid").value = ""

    document.getElementById("from_application_date").value = ""
    document.getElementById("to_application_date").value =
        new Date().toDateInputValue()
    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    getTableBody()
})

let getTableBody = async () => {
    tableBodyData.innerHTML = `
    <tr>
        <td colspan="10">
            <div class="d-flex justify-content-center align-items-center">
                    <div class="sbl-circ-path"></div>
            </div>
        </td>
    </tr>`
    return $.ajax({
        url: "/filtered-approved-applications",
        method: "POST",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
        success: function (result) {
            let { approvedApplicationsList, count } = result.payload
            approvedApplicationsList = approvedApplicationsList.map(elem => ({ ...elem, 'Cashback_paid': elem['Cashback_paid'] || false }))
            applicationsData = approvedApplicationsList
            entries.innerHTML = `(${count} entries)`
            pages.innerHTML = `/ ${Math.ceil(
                count / filterObject.entriesPerPage
            )}`
            pageNoElement.setAttribute(
                "max",
                Math.ceil(count / filterObject.entriesPerPage)
            )

            let tableBodyHTML = ""
            for (i = 0; i < approvedApplicationsList.length; i++) {

                const date = new Date(approvedApplicationsList[i]["Application_date"])
                tableBodyHTML = tableBodyHTML + `
                <tr style=" font-size:13px; cursor:default;" class="tableRow"  >
                <td ><input class="form-check-input rowCheckbox" type="checkbox" value=""  id="check-${approvedApplicationsList[i]["id"]}" style=" width: 18px; height: 18px;"></td>
                <td style="text-align:center;">${approvedApplicationsList[i]["id"]}</td>
                <td style="text-align:center;">${approvedApplicationsList[i]["Application_number"]}</td>
                <td style="text-align:center;">${approvedApplicationsList[i]["user_name"] || ''}</td>
                <td style="text-align:center;">${approvedApplicationsList[i]["Phone_Number"] || ''}</td>
                <td style="text-align:center;">${approvedApplicationsList[i]["IssuerName"]}</td>
                <td style="text-align:center;">${approvedApplicationsList[i]["CreditCardName"]}</td>
                <td style="text-align:center;">${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}</td>
                <td >
                    <div class="d-flex">
                        <label class="switch">
                        <input type="checkbox" disabled ${approvedApplicationsList[i]["Cashback_applicable"] ? "checked" : ""}>
                        <span class="slider round"></span>
                    </label>
                    </div>

                </td>
                <td style="text-align:center;">${approvedApplicationsList[i]["Cashback_to_be_paid"]}</td>
                <td >
                    <div class="d-flex  justify-content-center">
                        <label class="switch">
                            <input type="checkbox" disabled ${approvedApplicationsList[i]["Cashback_paid"] ? "checked" : ""}>
                            <span class="slider round"></span>
                        </label>
                    </div>
                    
                </td>
                <td style="text-align:center;"><div ><button style="margin: 0;" id="btn-${approvedApplicationsList[i]["id"]}" class="ci-btn ${approvedApplicationsList[i]["Cashback_paid"] ? `btn-danger` : ``}">${approvedApplicationsList[i]["Cashback_paid"] ? `Unpay` : `Pay`}</button></</td>
            </tr>
            `
            }
            tableBodyData.innerHTML = tableBodyHTML
            $('#allCheck').prop('checked', false)
            checkedData = []
            validatePayAll()
        }
    }).then(res => res.data)
}

const validatePayAll = function () {
    console.log(checkedData)
    let allSame = true
    if (checkedData.length > 0) {
        let firstVal = checkedData[0]['Cashback_paid']
        for (i = 0; i < checkedData.length; i++) {
            if (checkedData[i]['Cashback_paid'] !== firstVal) {
                allSame = false
                break
            }
        }
        if (allSame) {
            payAllBtn.disabled = false
            if (firstVal) {
                payAllBtn.innerText = "unpay"
                payAllBtn.classList.add('btn-danger')
            }

        }
        else {
            payAllBtn.classList.remove('btn-danger')
            payAllBtn.innerText = "pay"
            payAllBtn.disabled = true
        }
    }
    else {
        payAllBtn.classList.remove('btn-danger')
        payAllBtn.innerText = "pay"
        payAllBtn.disabled = true
    }
}

checkAll.addEventListener('change', (e) => {
    checkedData = []
    $('.rowCheckbox').prop('checked', e.target.checked)
    if (e.target.checked) {
        applicationsData.forEach(elem => {
            checkedData.push({ id: elem.id, Cashback_paid: elem.Cashback_paid })
        })
    }
    else {
        checkedData = []
    }
    console.log(checkedData)
    validatePayAll()
})

cardIssuersInSelect = function (result) {
    let selectTag = document.getElementById("card-issuer-options")
    let appendData = `<option  value="">Select Card Issuer</option>`
    for (let i = 0; i < result.payload.length; i++) {
        appendData =
            appendData +
            `<option value = "${result.payload[i].id}" > ${result.payload[i].IssuerName} </option> `
    }
    selectTag.innerHTML = appendData
}

getCardIssuersName = function () {
    $.ajax({
        url: "/cardIssuersInApplication",
        type: "POST",
        contentType: "application/jsonrequest",

        success: function (result) {
            cardIssuersInSelect(result)
        },
    })
}

creditCardNameInSelect = function (result) {
    let selectTag = document.getElementById("credit-card-options")
    let appendData = `<option value="">Select Credit Card</option>`
    for (let i = 0; i < result.payload.length; i++) {
        appendData =
            appendData +
            `<option value="${result.payload[i].id}" > ${result.payload[i].CreditCardName} </option>`
    }
    selectTag.innerHTML = appendData
}

getCreditCardNames = function () {
    $.ajax({
        url: "/creditcardforrelationpresentincardapplications",
        type: "GET",
        success: function (result) {
            creditCardNameInSelect(result)
        },
    })
}
tableBodyData.addEventListener('change', (e) => {
    if (e.target.classList.contains('rowCheckbox')) {
        let targetId = e.target.id.replace('check-', '')
        if (e.target.checked) {
            checkedData.push({ id: targetId, 'Cashback_paid': applicationsData.find(elem => elem.id == targetId)['Cashback_paid'] })
            if (checkedData.length == entriesPerPageElement.value) {
                document.getElementById('allCheck').checked = true
            }
        }
        else {
            console.log("Hi")
            checkedData = checkedData.filter(el => el.id != targetId)
            document.getElementById('allCheck').checked = false
        }
        console.log(checkedData)
        validatePayAll()
    }
})
tableBodyData.addEventListener('click', (e) => {
    if (e.target.tagName === 'BUTTON') {
        let targetId = e.target.id.replace('btn-', '')
        checkedData = []
        checkedData.push({ id: targetId, 'Cashback_paid': applicationsData.find(elem => elem.id == targetId)['Cashback_paid'] })
        $('#confirmModal').modal('show')
    }
})
payAllBtn.addEventListener('click', (e) => {
    $('#confirmModal').modal('show')
})


document.getElementById('finalPayBtn').addEventListener('click', (e) => {
    // /approved-mark-paid
    $.ajax({
        url: "/approved-mark-paid",
        method: "POST",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            checkedData
        }),
        success: async () => {
            $('#confirmModal').modal('hide')
            await getTableBody()
        }
    })
})
$(document).ready(async () => {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getCardIssuersName()
    getCreditCardNames()
    await getTableBody()
})