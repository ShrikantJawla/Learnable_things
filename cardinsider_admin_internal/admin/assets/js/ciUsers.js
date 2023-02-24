// function exportToCsv(filename, rows) {
//     console.log("hi im in exportToCsv")
//     var processRow = function (row) {
//         var finalVal = ""
//         for (var j = 0; j < row.length; j++) {
//             var innerValue =
//                 row[j] === null ? "" : row[j].toString()
//             if (row[j] instanceof Date) {
//                 innerValue = row[j].toLocaleString()
//             }
//             var result = innerValue.replace(/"/g, '""')
//             if (result.search(/("|,|\n)/g) >= 0)
//                 result = '"' + result + '"'
//             if (j > 0) finalVal += ","
//             finalVal += result
//         }
//         return finalVal + "\n"
//     }

//     var csvFile = ""
//     for (var i = 0; i < rows.length; i++) {
//         csvFile += processRow(rows[i])
//     }

//     var blob = new Blob([csvFile], {
//         type: "text/csv;charset=utf-8;",
//     })
//     if (navigator.msSaveBlob) {
//         // IE 10+
//         navigator.msSaveBlob(blob, filename)
//     } else {
//         var link = document.createElement("a")
//         if (link.download !== undefined) {
//             // feature detection
//             // Browsers that support HTML5 download attribute
//             var url = URL.createObjectURL(blob)
//             link.setAttribute("href", url)
//             link.setAttribute("download", filename)
//             link.style.visibility = "hidden"
//             document.body.appendChild(link)
//             link.click()
//             document.body.removeChild(link)
//         }
//     }
// }

filterReset.addEventListener("click", () => {
    //can use loop here but didnt use it for better reading purposes
    document.getElementById("id").value = ""
    document.getElementById("params_id").value = ""
    document.getElementById("ciu_first_name").value = ""
    document.getElementById("ciu_last_name").value = ""
    document.getElementById("ciu_email").value = ""
    document.getElementById("ciu_number").value = ""
    document.getElementById("ciu_verified").checked = undefined
    document.getElementById("from_created_at").value = ""
    document.getElementById("to_created_at").value =
        new Date().toDateInputValue()
    document.getElementById("from_updated_at").value = ""
    document.getElementById("to_updated_at").value =
        new Date().toDateInputValue()

    document.getElementById("published_at").value = "any"
    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    filterObject.to_created_at = document.getElementById(
        "to_created_at"
    ).value
    filterObject.to_updated_at = document.getElementById(
        "to_updated_at"
    ).value
    getTableBody()
})


let clickedId

document.getElementById('finalDeleteButton').addEventListener('click', () => {
    deleteFunction('/delete/ciUser', clickedId)
})
let getTableBody = async () => {
    const tableBodyData = document.querySelector("#data-to-show")
    tableBodyData.innerHTML = `
    <tr >
        <td colspan="10">
            <div class="d-flex justify-content-center align-items-center"
            >
                <div class="sbl-circ-path"></div>
            </div>
        </td>
    </tr>`
    const res = await fetch("/get-filtered-ciUsers", {
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
    const { ciUsersList, count } = payload
    entries.innerHTML = `(${count} entries)`
    pages.innerHTML = `/ ${Math.ceil(
        count / filterObject.entriesPerPage
    )}`
    pageNoElement.setAttribute(
        "max",
        Math.ceil(count / filterObject.entriesPerPage)
    )

    let tableBodyHTML = ""
    for (i = 0; i < ciUsersList.length; i++) {
        const created_at = ciUsersList[i]['created_at'] ? new Date(ciUsersList[i]['created_at']) : null
        const updated_at = ciUsersList[i]['updated_at'] ? new Date(ciUsersList[i]['updated_at']) : null
        tableBodyHTML = tableBodyHTML + `
            <tr style=" font-size:13px;" class="tableRow" onclick="rowClick(event,${ciUsersList[i]['id']},'edit-ciUser')">
                <td style="text-align=center">${ciUsersList[i]["id"]}</td>
                <td style="text-align=center">${ciUsersList[i]["params_id"]}</td>
                <td style="text-align=center">${ciUsersList[i]["ciu_first_name"]}</td>
                <td style="text-align=center">${ciUsersList[i]["ciu_last_name"]}</td>
                <td style="text-align=center">${ciUsersList[i]["ciu_email"]}</td>
                <td style="text-align=center">${ciUsersList[i]["ciu_number"]}</td>
                <td style="text-align=center">
                        <label class="switch">  
                            <input type="checkbox" disabled ${ciUsersList[i]["ciu_verified"] === true ? "checked" : ""}>
                            <span class="slider round"></span>
                        </label>
                </td>
                <td style="text-align=center">${created_at.getDate().toString().padStart(2, 0)} ${monthNames[created_at.getMonth()]}, ${created_at.getFullYear()}</td>
                <td style="text-align=center">${updated_at.getDate().toString().padStart(2, 0)} ${monthNames[updated_at.getMonth()]}, ${updated_at.getFullYear()}</td>

                <td style="width:150px;text-align=center">${ciUsersList[i]["published_at"] ? 'Published' : 'Draft'}</td>
                <td>
                    <a href='/edit-ciUser?id=${ciUsersList[i]["id"]}'
                    ><i class="material-icons has-sub-menu action-btns">edit</i></a>
                    <button class='deleteBtnTable' data-bs-toggle="modal" data-bs-target="#deleteModal" onclick="clickedId=${ciUsersList[i]["id"]}"
                    ><i class="material-icons has-sub-menu action-btns">delete</i></button>
                </td>
            </tr>
            `
    }
    tableBodyData.innerHTML = tableBodyHTML
}


$(document).ready(function () {
    $("#to_created_at").flatpickr()
    $("#from_created_at").flatpickr()
    $("#to_created_at").val(new Date().toDateInputValue())

    $("#to_updated_at").flatpickr()
    $("#from_updated_at").flatpickr()
    $("#to_updated_at").val(new Date().toDateInputValue())

    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    getTableBody()
})