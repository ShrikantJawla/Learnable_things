let SELECT_OPTIONS = {}
let duplicateId = ''
// const arr = ['id', 'OfferName', 'BrandPrivate', 'FromWhere', 'CardIssuer', 'published_at_type', 'OfferCategory', 'OfferType', 'UpdatedBy']
// arr.map(val => {
// document.getElementById(`${val}-second`).addEventListener('change', e => {
//         const elem = document.getElementById(`${val}`)
//         const event = new Event('change', { bubbles: true })
//         elem.value = e.target.value
//         elem.dispatchEvent(event)
//     })
// })
$("#OfferName").keypress(function (e) {
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        const event = new Event('change', { bubbles: true })
        e.target.dispatchEvent(event)
    }
})
filterReset.addEventListener("click", () => {
    console.log("Hi")
    document.getElementById("id").value = ""
    // document.getElementById("id-second").value = ""
    document.getElementById("OfferName").value = ""
    // document.getElementById("OfferName-second").value = ""
    document.getElementById("BrandPrivate").value = ""
    // document.getElementById("BrandPrivate-second").value = ""
    document.getElementById("UpdatedBy").value = ""
    // document.getElementById("UpdatedBy-second").value = ""



    document.getElementById("published_at_type").value = "any"
    // document.getElementById("published_at_type-second").value = "any"
    document.getElementById("FromWhere").value = "any"
    // document.getElementById("FromWhere-second").value = "any"
    document.getElementById("OfferCategory").value = "any"
    // document.getElementById("OfferCategory-second").value = "any"
    document.getElementById("CardIssuer").value = "any"
    // document.getElementById("CardIssuer-second").value = "any"
    document.getElementById("OfferType").value = "any"
    // document.getElementById("OfferType-second").value = "any"


    document.getElementById("from_updated_at").value = ""
    document.getElementById("from_End_Date").value = ""
    document.getElementById("to_updated_at").value = ""
    document.getElementById("to_End_Date").value = ""





    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage =
        entriesPerPageElement.value

    getTableBody()
})









SELECT_OPTIONS.cardIssuersInSelect = function (elemId) {
    let array = ['AMEX', 'Canara Bank', 'AUBank', 'Axis', 'BankofBaroda', 'Citi', 'Federal', 'FederalBank', 'HDFC', 'HSBC', 'ICICI', 'IDBI', 'IDFC', 'Indusind', 'Kotak', 'MasterCard', 'OneCard', 'PNB', 'RBL', 'Rupay', 'SBICards', 'Slice', 'StandardChartered', 'Uni', 'UnionBank', 'Visa', 'YesBank']
    let selectTag = document.getElementById(elemId)
    let appendData = `<option  value="any">Select</option>`
    for (let i = 0; i < array.length; i++) {
        appendData =
            appendData +
            `<option value = "${array[i]}" > ${array[i]} </option> `
    }
    selectTag.innerHTML = appendData
}


let clickedId

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/offer', clickedId)
})

let getTableBody = async () => {
    tableBodyData.innerHTML = ` <tr>
                                    <td colspan="12">
                                        <div
                                            class="d-flex justify-content-center align-items-center"
                                        >
                                            <div
                                                class="sbl-circ-path"
                                            ></div>
                                        </div>
                                    </td>
                                </tr>
                                `
    const res = await fetch("/get-filtered-offers", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
    })
    const response = await res.json()
    const { count, offerList } = response.payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )


    let tableBodyHTML = ""
    for (i = 0; i < offerList.length; i++) {
        const date = new Date(offerList[i]['EndDate'])
        const date2 = offerList[i]['published_at'] ? new Date(offerList[i]['published_at']) : null
        const date3 = new Date(offerList[i]['updated_at'])


        tableBodyHTML = tableBodyHTML + `
        <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${offerList[i]['id']},'edit-offer')">
        <td >${offerList[i]["id"]}</td>
                <td style="max-width:120px !important;text-align:left">${offerList[i]["OfferName"]}</td>
                <td style="max-width:500px !important;  "><pre style="font-size:13px !important ">${offerList[i]["Description"]}</pre></td>
                <td style="text-align:center; width:100px;">${offerList[i]["BrandPrivate"]}</td>
                <td style="text-align:center">${offerList[i]["FromWhere"]}</td>
                <td style="text-align:center" >${offerList[i]["SelectCardIssuer"]}</td>
               
                <td style="text-align:center;">${offerList[i]["updated_by_admin_name"]}</td>
                
                <td style="text-align:center;">${offerList[i]["OfferCategory"]}</td>
                <td style="text-align:center;">${offerList[i]["OfferType"]}</td>
                 <td style="text-align:center;">${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}</td>
                <td style="text-align:center;">${date2 ? `${date2.getDate().toString().padStart(2, 0)} ${monthNames[date2.getMonth()]}, ${date2.getFullYear()}` : 'Draft'}</td>
                <td style="text-align:center;">${date3.getDate().toString().padStart(2, 0)} ${monthNames[date3.getMonth()]}, ${date3.getFullYear()}</td>
                <td>
                    <div style="display:flex;flex-direction:horizontal;gap:5px;">
                        <button class='publishBtnTable' onclick="duplicate(${offerList[i]["id"]},'offer')"
                        ><i class="material-icons has-sub-menu action-btns">content_copy</i>
                        </button>
                        
                        <a href="/edit-offer?id=${offerList[i]["id"]}" target="_blank"
                        ><i class="material-icons has-sub-menu action-btns">edit</i>
                        </a>
                        
                        <button class='deleteBtnTable ' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${offerList[i]["id"]}"
                        ><i class="material-icons has-sub-menu action-btns ">delete</i>
                        </button>

                    </div>
                </td>
                
            </tr>
            `
    }
    tableBodyData.innerHTML = tableBodyHTML
}

$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = 10
    $("#to_updated_at").flatpickr()
    $("#from_updated_at").flatpickr()

    // $("#to_start_date").flatpickr()
    // $("#from_start_date").flatpickr()
    // $("#to_start_date").val(new Date().toDateInputValue())

    $("#to_End_Date").flatpickr()
    $("#from_End_Date").flatpickr()

    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage =
        entriesPerPageElement.value

    // filterObject.to_expiry_date = document.querySelector(
    //     "#to_expiry_date"
    // ).value


    getTableBody()
    SELECT_OPTIONS.cardIssuersInSelect('CardIssuer')
    // SELECT_OPTIONS.cardIssuersInSelect('CardIssuer-second')

})