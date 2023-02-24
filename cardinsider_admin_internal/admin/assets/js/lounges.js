let AirportOptions = document.getElementById('Airport')
let SELECT_OPTIONS = {}
let duplicateId = ''
// const arr = ['id', 'LoungeName', 'AirportCity', 'TerminalsSelect', 'published_at', 'Airport']
// arr.map(val => {
//     document.getElementById(`${val}-second`).addEventListener('change', e => {
//         const elem = document.getElementById(`${val}`)
//         const event = new Event('change', { bubbles: true })
//         elem.value = e.target.value
//         elem.dispatchEvent(event)
//     })
// })
$("#LoungeName").keypress(function (e) {
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()
        const event = new Event('change', { bubbles: true })
        e.target.dispatchEvent(event)
    }
})

filterReset.addEventListener("click", () => {
    document.getElementById("id").value = ""
    document.getElementById("LoungeName").value = ""
    document.getElementById("AirportCity").value = ""
    document.getElementById("Airport").value = "any"
    document.getElementById("TerminalsSelect").value = "any"
    document.getElementById("published_at").value = "any"
    // document.getElementById("id-second").value = ""
    // document.getElementById("LoungeName-second").value = ""
    // document.getElementById("AirportCity-second").value = ""
    // document.getElementById("Airport-second").value = "any"
    // document.getElementById("TerminalsSelect-second").value = "any"
    // document.getElementById("published_at-second").value = "any"
    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
})

SELECT_OPTIONS.airportsInSelect = function (result, id) {
    let selectTag = document.getElementById(`${id}`)
    let appendData = `<option  value="any">Select Airport</option>`
    for (let i = 0; i < result.length; i++) {
        appendData =
            appendData +
            `<option value = "${result[i].AirportName.split('|')[1].trim()}" > ${result[i].AirportName.split('|')[1].trim()} </option> `
    }
    selectTag.innerHTML = appendData
}

SELECT_OPTIONS.getAirportsName = function (id) {
    $.ajax({
        url: "/airportsforrelation",
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            SELECT_OPTIONS.airportsInSelect(result.payload, id)
        },
    })
}


SELECT_OPTIONS.citiesInSelect = function (result, id) {
    let selectTag = document.getElementById(`${id}`)
    let appendData = `<option  value="">Select City</option>`
    for (let i = 0; i < result.length; i++) {
        appendData =
            appendData +
            `<option value = "${result[i].AirportCity}" > ${result[i].AirportCity} </option> `
    }
    selectTag.innerHTML = appendData
}

SELECT_OPTIONS.getCitiesName = function (id) {
    $.ajax({
        url: "/get-airport-cities",
        type: "GET",
        contentType: "application/jsonrequest",

        success: function (result) {
            SELECT_OPTIONS.citiesInSelect(result.payload.cities, id)
        },
    })
}


let clickedId

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/lounge', clickedId)
})
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
                                </tr>
                                `
    const res = await fetch("/get-filtered-lounges", {
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
    const { loungesList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < loungesList.length; i++) {
        // const date = loungesList[i]['published_at'] ? new Date(loungesList[i]['published_at']) : null
        /*<td style="width:150px">${date.getFullYear().toString().padStart(4, 0)}-${(date.getMonth() + 1).toString().padStart(2, 0)}-${date.getDate().toString().padStart(2, 0)}</td> */
        const date = new Date(
            loungesList[i]["updated_at"]
        )
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${loungesList[i]['id']},'edit-lounge')">
                <td >${loungesList[i]["id"]}</td>
                <td style="text-align:left">${loungesList[i]["LoungeName"]}</td>
                <td style="text-align:left">${loungesList[i]["AirportCity"]}</td>
                <td style="min-width:200px; max-width:250px important;  text-align:left !important "><pre style="font-size:13px !important ">${loungesList[i]["Location"]}</pre></td>
                <td >${loungesList[i]["Directions"]}</td>
                <td >${loungesList[i]["AirportName"]}</td>
                <td>${loungesList[i]["LoungeNamePublic"]}</td>
                <td><span  style="width:100px !important">${loungesList[i]["TerminalsSelect"]}</span></td>
                <td >${loungesList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                <td>
                    ${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}
                </td>
                <td>
                    <div style="display:flex;flex-direction:horizontal;gap:5px;">
                        <button class='publishBtnTable' onclick="duplicate(${loungesList[i]["id"]},'lounge')"
                            ><i class="material-icons has-sub-menu action-btns">content_copy</i>
                        </button>
                        <a href='/edit-lounge?id=${loungesList[i]["id"]}' target="_blank"
                        ><i class="material-icons has-sub-menu action-btns">edit</i></a>
                        <button class='deleteBtnTable' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${loungesList[i]["id"]}"
                        ><i class="material-icons has-sub-menu action-btns">delete</i></button>
                    </div>
                </td>
            </tr>
        `
    }
    tableBodyData.innerHTML = tableBodyHTML
}

$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value

    SELECT_OPTIONS.getAirportsName('Airport')
    // SELECT_OPTIONS.getAirportsName('Airport-second')
    SELECT_OPTIONS.getCitiesName('AirportCity')
    // SELECT_OPTIONS.getCitiesName('AirportCity-second')
    getTableBody()


})