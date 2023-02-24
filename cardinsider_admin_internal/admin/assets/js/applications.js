let CARDAPPLICATIONLIST = {}
let SELECT_OPTIONS = {}
let filterReset = document.getElementById("filterReset")

let total_pages = 50
let filterObject = {}
let pageNo
let sort = ""
let entriesPerPageElement =
    document.querySelector("#entriesPerPage")
let pages = document.querySelector("#pages")
let entries = document.querySelector("#entries")
let pageNoElement = document.querySelector("#page-no")
pageNo = pageNoElement.value
let tableHeader = document.querySelector("#table-header")
let tableFilter = document.querySelector("#table-filter-row")
let prevPage = document.querySelector('#prevPage')
let nextPage = document.querySelector('#nextPage')
const monthNames = ["January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
]

filterReset.addEventListener("click", () => {
    document.getElementById("id").value = ""
    document.getElementById("Application_number").value = ""
    document.getElementById("user_number").value = ""
    document.getElementById("card_insider_user").value = ""
    document.getElementById("user_name").value = ""
    document.getElementById("card-issuer-options").value = "any"
    document.getElementById("credit-card-options").value = "any"
    document.getElementById("application_through-options").value =
        "any"
    document.getElementById("application_status-options").value =
        "any"
    document.getElementById("from_application_date").value = ""
    document.getElementById("to_application_date").value =
        ""
    document.getElementById("Cashback_paid-options").value = "any"
    document.getElementById("entriesPerPage").value = "10"
    filterObject = {}
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
})

entriesPerPageElement.onchange = (e) => {
    filterObject.entriesPerPage = entriesPerPageElement.value
    getTableBody()
}
tableHeader.addEventListener("click", (e) => {
    if (
        e.target.tagName === "ICON" ||
        e.target.tagName === "SPAN"
    ) {
        if (
            e.target.dataset.filter !==
            e.currentTarget.dataset.filter
        ) {
            [...e.currentTarget.children].map((elem, i, arr) => {
                if (i !== arr.length - 1) {
                    if (
                        elem.children[0].children[1].classList.contains(
                            "upside-down"
                        )
                    ) {
                        elem.children[0].children[1].classList.remove(
                            "upside-down"
                        )
                    }
                    if (!elem.children[0].children[1].classList.contains(
                        "invisible"
                    )) {
                        elem.children[0].children[1].classList.add("invisible")
                    }
                }
            })
            sort = `-${e.target.dataset.filter}`
            e.currentTarget.dataset.filterValue = -1
            e.currentTarget.dataset.filter =
                e.target.dataset.filter
            // //console.log(e.target.parent.children[1]);
            e.target.parentNode.children[1].classList.remove(
                "invisible"
            )
            e.target.parentNode.children[1].classList.add(
                "upside-down"
            )
        } else {
            if (e.currentTarget.dataset.filterValue * 1 === 1) {
                e.currentTarget.dataset.filterValue = 0
                e.target.parentNode.children[1].classList.add(
                    "invisible"
                )
                sort = ``

            } else if (
                e.currentTarget.dataset.filterValue * 1 ===
                0
            ) {
                sort = `-${e.target.dataset.filter}`
                e.currentTarget.dataset.filterValue = -1
                e.target.parentNode.children[1].classList.remove(
                    "invisible"
                )
                e.target.parentNode.children[1].classList.add(
                    "upside-down"
                )

            } else {
                sort = `${e.target.dataset.filter}`
                e.currentTarget.dataset.filterValue = 1
                e.target.parentNode.children[1].classList.remove(
                    "upside-down"
                )
            }
        }
        getTableBody()
    }
})

tableFilter.addEventListener("change", (e) => {
    if (
        e.target.tagName === "INPUT" ||
        e.target.tagName === "SELECT"
    ) {
        filterObject[e.target.name] = e.target.value
        getTableBody()
    }
})

function createElementFromHTML(htmlString) {
    var div = document.createElement("div")
    div.innerHTML = htmlString.trim()

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.childNodes
}

pageNoElement.onchange = (e) => {
    pageNo = e.target.value
    getTableBody()
}
prevPage.addEventListener('click', () => {
    pageNoElement.value = pageNoElement.value * 1 > 1 ? pageNoElement.value * 1 - 1 : 1
    pageNo = pageNoElement.value
    getTableBody()
})
nextPage.addEventListener('click', () => {
    pageNoElement.value = pageNoElement.value * 1 < pageNoElement.getAttribute('max') * 1 ? pageNoElement.value * 1 + 1 : pageNoElement.getAttribute('max') * 1
    pageNo = pageNoElement.value
    getTableBody()
})

SELECT_OPTIONS.cardIssuersInSelect = function (result) {
    let selectTag = document.getElementById("card-issuer-options")
    let appendData = `<option  value="any">Select</option>`
    for (let i = 0; i < result.payload.length; i++) {
        ////console.log(i);
        appendData =
            appendData +
            `<option value = "${result.payload[i].IssuerName}" > ${result.payload[i].IssuerName} </option> `
    }
    selectTag.innerHTML = appendData
}

SELECT_OPTIONS.getCardIssuersName = function () {
    $.ajax({
        url: "/cardIssuersInApplication",
        type: "POST",
        contentType: "application/jsonrequest",

        success: function (result) {
            SELECT_OPTIONS.cardIssuersInSelect(result)
        },
    })
}

SELECT_OPTIONS.creditCardNameInSelect = function (result) {
    let selectTag = document.getElementById("credit-card-options")
    let appendData = `<option value="any">Select</option>`
    for (let i = 0; i < result.payload.length; i++) {
        appendData =
            appendData +
            `<option value="${result.payload[i].CreditCardName}" > ${result.payload[i].CreditCardName} </option>`
    }
    selectTag.innerHTML = appendData
}

SELECT_OPTIONS.getCreditCardNames = function () {
    $.ajax({
        url: "/creditcardforrelationpresentincardapplications",
        type: "GET",
        success: function (result) {
            SELECT_OPTIONS.creditCardNameInSelect(result)
        },
    })
}

let getTableBody = async () => {
    const tableBodyData = document.querySelector("#data-to-show")
    tableBodyData.innerHTML = `<tr>
                                            <td colspan="10">
                                                <div
                                                    class="d-flex justify-content-center align-items-center"
                                                >
                                                    <div
                                                        class="sbl-circ-path"
                                                    ></div>
                                                </div>
                                            </td>
                                        </tr>`
    const res = await fetch("/application-get-all-applications", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
    })
    const { payload } = await res.json()
    const { applicationList, count } = payload
    console.log(applicationList)
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < applicationList.length; i++) {
        const date = new Date(
            applicationList[i]["Application_date"]
        )
        tableBodyHTML =
            tableBodyHTML +
            ` <tr style="text-align: center;cursor:default;"  class="tableRow">
                                        <td >${applicationList[i]["id"]}</td>
                                        <td >${applicationList[i]["card_insider_user"]}</td>
                                        <td style="width:10a0px;">${applicationList[i]["user_name"] || 'NO NAME'}</td>
                                        <td >${applicationList[i][
            "Application_number"
            ]
            }</td>
                                        <td>${applicationList[i]["user_number"]
            }</td>

                                        <td>${applicationList[i]["IssuerName"]
            }</td>
                                        <td style="max-width: 200px !important;">${applicationList[i]["CreditCardName"]
            }</td>
                                        <td>${applicationList[i][
            "application_through"
            ]
            }</td>
                                        <td>${applicationList[i][
            "Application_Status"
            ]
            }</td>
                                        <td>
                                                ${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}

                                        </td>
                                        <td>${applicationList[i]["Cashback_paid"]
            }</td>
                                        
                                    </tr>`
        // Actions
        // <td>
        //                                         <a href="/creditcards-list?id=${applicationList[i]["id"]
        //         }"
        //                                             ><i class="material-icons has-sub-menu action-btns">edit</i></a
        //                                         >
        //                                         <a href="#"
        //                                             ><i class="material-icons has-sub-menu action-btns">delete</i></a
        //                                         >
        //                                     </td>
    }
    tableBodyData.innerHTML = tableBodyHTML
}

Date.prototype.toDateInputValue = function () {
    var local = new Date(this)
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset())
    return local.toJSON().slice(0, 10)
}

$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    $("#to_application_date").flatpickr()
    $("#from_application_date").flatpickr()
    $("#entriesPerPage").value = "10"
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
    SELECT_OPTIONS.getCardIssuersName()
    SELECT_OPTIONS.getCreditCardNames()
})