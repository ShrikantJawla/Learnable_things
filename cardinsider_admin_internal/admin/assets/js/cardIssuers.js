filterReset.addEventListener("click", () => {
    document.getElementById("id").value = ""
    document.getElementById("ApplyNow").value = "0"
    document.getElementById("IssuerName").value = ""
    document.getElementById("published_at").value = "any"

    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value

    getTableBody()
})

let clickedId

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    // deleteFunction('/delete/cardIssuer', clickedId)
    document.getElementById('deleteCloseBtn').click()
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
                                        </tr>`
    const res = await fetch("/get-filtered-card-issuers", {
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
    const { cardIssuersList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < cardIssuersList.length; i++) {
        const date = new Date(
            cardIssuersList[i]["updated_at"]
        )
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${cardIssuersList[i]['id']},'edit-cardIssuer')">
                <td style="text-align:center">${cardIssuersList[i]["id"]}</td>
                <td style="text-align:center">${cardIssuersList[i]["IssuerName"]}</td>
                <td style="max-width:110px; text-align:center" >${cardIssuersList[i]["creditreportshow"] ? "true" : "false"}</td>
                <td style="max-width:110px; text-align:center" >${cardIssuersList[i]["ApplyNow"] ? "true" : "false"}</td>
                <td style="width:200px;text-align:center">${cardIssuersList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                <td style="text-align:center">
                    ${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}
                </td>
                <td style="width:100px;">
                    <div style="display:flex;flex-direction:horizontal;gap:5px;">
                    <a href='/edit-cardIssuer?id=${cardIssuersList[i]["id"]}' target="_blank"
                    ><i class="material-icons has-sub-menu action-btns">edit</i>
                            </a>
                            <button class='deleteBtnTable' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${cardIssuersList[i]["id"]}"
                                ><i class="material-icons has-sub-menu action-btns">delete</i>
                                </button>
                    </div>
                </td>
                </tr>
        `
    }
    // <button class='publishBtnTable' onclick="duplicate(${cardIssuersList[i]["id"]},'cardIssuer')"
    // ><i class="material-icons has-sub-menu action-btns">content_copy</i>
    // </button>
    tableBodyData.innerHTML = tableBodyHTML
}

$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = 10
    filterObject.entriesPerPage =
        entriesPerPageElement.value
    getTableBody()


})