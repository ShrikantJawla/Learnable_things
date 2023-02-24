filterReset.addEventListener('click', () => {
    document.getElementById("id").value = ""
    document.getElementById("ListName").value = ""
    document.getElementById("information").value = ""
    document.getElementById("published_at").value = "any"
    filterObject = {}
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value

    getTableBody()
})
$("#information").keypress(function (e) {
    if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault()

        const event = new Event('change', { bubbles: true })
        e.target.dispatchEvent(event)

    }
})
let clickedId

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/loungeNetwork', clickedId)
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
    const res = await fetch("/get-filtered-loungeNetworks", {
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
    const { loungeNetworkList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < loungeNetworkList.length; i++) {
        const date = loungeNetworkList[i]['updated_at'] ? new Date(loungeNetworkList[i]['updated_at']) : null
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${loungeNetworkList[i]['id']},'edit-loungeNetwork')">
                <td >${loungeNetworkList[i]["id"]}</td>
                <td style="text-align:center">${loungeNetworkList[i]["ListName"]}<span>(${loungeNetworkList[i]['lounge_count']})</span></td>
                <td style="max-width:400px; padding-left:50px; padding-right:50px; text-align:justify !important "><pre style="font-size:13px !important ">${loungeNetworkList[i]["information"]}</pre></td>
                <td style="  text-align:center !important">${loungeNetworkList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                <td style="text-align:center !important ">${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}</td>
                <td style="text-align:center !important ">
                    <a href='/edit-loungeNetwork?id=${loungeNetworkList[i]["id"]}'
                    ><i class="material-icons has-sub-menu action-btns">edit</i></a>
                    
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