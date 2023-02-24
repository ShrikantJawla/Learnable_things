filterReset.addEventListener("click", () => {
    document.getElementById("id").value = ""
    document.getElementById("BrandName").value = ""
    document.getElementById("BrandWebsite").value = ""
    document.getElementById("BrandAlexa").value = ""
    document.getElementById("updated_by").value = ""
    document.getElementById("published_at").value = "any"

    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
})

let clickedId
document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/brand', clickedId)
})
let getTableBody = async () => {
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
    const res = await fetch("/get-filtered-brands", {
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
    const { brandsList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < brandsList.length; i++) {
        const date = brandsList[i]['updated_at'] ? new Date(brandsList[i]['updated_at']) : null
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${brandsList[i]["id"]},'edit-brand')" >
                <td style="text-align:center">${brandsList[i]["id"]}</td>
                <td style="text-align:center">${brandsList[i]["BrandName"]}</td>
                <td style="text-align:center"><a href=${brandsList[i]["BrandWebsite"]}><i class="fa-solid fa-up-right-from-square"></i>
                <span style="margin-left:10px;">${brandsList[i]["BrandWebsite"]}</span></a></td>
                <td style="text-align:center">${brandsList[i]["BrandAlexa"]}</td>
                 <td style="width:150px;text-align:center">${brandsList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                <td style="text-align:center !important ">${brandsList[i]["updated_by_admin_name"]}</td>
                <td style="text-align:center !important ">${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}</td>
                <td>
                     <a href='/edit-brand?id=${brandsList[i]["id"]}' target="_blank"
                    ><i class="material-icons has-sub-menu action-btns">edit</i></a>
                <a href="#"
                    ><button class='deleteBtnTable d-none' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${brandsList[i]["id"]}"
                    ><i class="material-icons has-sub-menu action-btns">delete</i></button>
                </td>
            </tr>
        `
    }
    tableBodyData.innerHTML = tableBodyHTML
}
$(document).ready(function () {
    $('#hide-sidebar-toggle-button').click()
    $("#entriesPerPage").value = "10"
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    getTableBody()
})