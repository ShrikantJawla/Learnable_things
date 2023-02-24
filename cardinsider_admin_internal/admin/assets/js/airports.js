filterReset.addEventListener("click", () => {
    //can use loop here but didnt use it for better reading purposes
    document.getElementById("id").value = ""
    document.getElementById("AirportName").value = ""
    document.getElementById("AirportID").value = ""
    document.getElementById("AirportLocation").value = ""
    document.getElementById("AirportCity").value = ""
    document.getElementById("published_at").value = "any"
    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    getTableBody()
})


let clickedId

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/airport', clickedId)
})
let getTableBody = async () => {
    const tableBodyData = document.querySelector("#data-to-show")
    tableBodyData.innerHTML = `<tr >
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
    const res = await fetch("/get-filtered-airports", {
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
    const { payload } = await res.json()
    const { airportsList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < airportsList.length; i++) {
        const date = new Date(
            airportsList[i]["updated_at"]
        )
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${airportsList[i]['id']},'edit-airport')">
                <td >${airportsList[i]["id"]}</td>
                <td style="text-align:left">${airportsList[i]["AirportName"]}</td>
                <td style="text-align:center">${airportsList[i]["AirportID"]}</td>
                <td style="min-width:300px; max-width:450px important;  text-align:left !important "><pre style="font-size:13px !important ">${airportsList[i]["AirportLocation"]}</pre></td>
                <td style="text-align:left">${airportsList[i]["AirportCity"]}</td>
                <td style="width:150px">${airportsList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                 <td>
                    ${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}
                </td>
                <td>
                    <a href='/edit-airport?id=${airportsList[i]["id"]}'
                    ><i class="material-icons has-sub-menu action-btns">edit</i></a>
                    <button class='deleteBtnTable' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${airportsList[i]["id"]}"
                    ><i class="material-icons has-sub-menu action-btns">delete</i></button>
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
    getTableBody()
})