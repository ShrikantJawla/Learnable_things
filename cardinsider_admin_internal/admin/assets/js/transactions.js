let applicationsData = []
let checkedData = []
let checkAll = document.getElementById('allCheck')
let exportCsv = document.getElementById('exportCsv')
filterReset.addEventListener("click", () => {
    const arr = [
        'td_id',
        'td_uuid',
        'td_status',
        'td_user_id',
        'td_from_amount',
        'td_to_amount',
        'td_upi_id',
        'td_account',
        'td_account_number',
        'td_bank_name',
        'td_ifsc_code',
        'td_method',
        'td_from_created_at',
        'td_to_created_at',
        'td_from_updated_at',
        'td_to_updated_at',
        'td_message',
        'is_upi_valid',
        'is_bank_valid',
        'upi_valid_name',
        'bank_valid_name'
    ]
    arr.forEach(el => {
        // console.log(el)
        document.getElementById(el).value = ""
    })
    entriesPerPageElement.value = "10"
    filterObject = {}
    filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
    getTableBody()

})

let inputObject
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
        url: "/filtered-transactions",
        method: "POST",
        contentType: "application/json",
        dataType: 'json',
        data: JSON.stringify({
            filterObject,
            pageNo,
            sort,
        }),
        success: function (result) {
            let { transactionsList, count } = result.payload
            // console.log(result)
            applicationsData = transactionsList
            entries.innerHTML = `(${count} entries)`
            pages.innerHTML = `/ ${Math.ceil(
                count / filterObject.entriesPerPage
            )}`
            pageNoElement.setAttribute(
                "max",
                Math.ceil(count / filterObject.entriesPerPage)
            )

            let tableBodyHTML = ""
            for (i = 0; i < transactionsList.length; i++) {

               // console.log(transactionsList[i]);

                const date = new Date(transactionsList[i]["td_created_at"])
                const date2 = new Date(transactionsList[i]["td_updated_at"])
                tableBodyHTML = tableBodyHTML + `
                <tr style=" font-size:13px; cursor:default;" class="tableRow"  >
                    <td >
                        <div style="display:flex;flex-direction:row;gap:10px;justify-content:center;align-items:center;">
                        <input class="form-check-input rowCheckbox" type="checkbox" value=""  id="check-${transactionsList[i]["td_id"]}" style=" width: 18px; height: 18px;">
                        <a href="/view-transaction?id=${transactionsList[i]["td_uuid"]}" target="_blank" style="position:relative;top:5px;"><i class="material-icons has-sub-menu action-btns">edit</i></a>
                        </div>
                    </td>
                    <td style="text-align:center;" class="td_id">${transactionsList[i]["td_id"]}</td>
                    <td style="text-align:center;"><a href="/edit-ciUser?id=${transactionsList[i]["td_user_id"]}">${transactionsList[i]["user_name"]}</a></td>
                    <td style="text-align:center;">${transactionsList[i]["td_uuid"]}</td>
                    <td style="text-align:center;">
                     ${transactionsList[i]["td_status"]}
                    </td>
                    <td style="text-align:center;">${transactionsList[i]["td_message"]}</td>

                    <td style="text-align:center;"><a href="/edit-ciUser?id=${transactionsList[i]["td_user_id"]}">${transactionsList[i]["td_user_id"] || ''}</a></td>
                    <td style="text-align:center;">${transactionsList[i]["td_amount"]}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_upi_id"] || '-'}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_account_name"] || '-'}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_account_number"] || '-'}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_bank_name"] || '-'}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_ifsc_code"] || '-'}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_method"]}</td>
                    <td>
					<label class="switch">
						<input type="checkbox" id="is_upi_valid" ${transactionsList[i]["is_upi_valid"] ? "checked" : ""} disabled>
						<span class="slider round"></span>
					</label>
				</td>
				<td style="text-align:center;">${transactionsList[i]["upi_valid_name"] || '-'}</td>
				<td>
					<label class="switch">
						<input type="checkbox" id="is_bank_valid" ${transactionsList[i]["is_bank_valid"] ? "checked" : ""} disabled>
						<span class="slider round"></span>
					</label>
				</td>
				<td style="text-align:center;">${transactionsList[i]["bank_valid_name"] || "-"}</td>
                    <td style="text-align:center;">${date.getDate().toString().padStart(2, 0)} ${monthNames[date.getMonth()]}, ${date.getFullYear()}</td>
                    <td style="text-align:center;">${date2.getDate().toString().padStart(2, 0)} ${monthNames[date2.getMonth()]}, ${date2.getFullYear()}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_created_by"]}</td>
                    <td style="text-align:center;">${transactionsList[i]["td_updated_by"]}</td>
                    
                </tr>
            `
            }
            tableBodyData.innerHTML = tableBodyHTML
        }
    }).then(res => res.data)
}

checkAll.addEventListener('change', (e) => {
    checkedData = []
    $('.rowCheckbox').prop('checked', e.target.checked)
    if (e.target.checked) {
        applicationsData.forEach(elem => {
            checkedData.push(elem.td_id)
        })
    }
    else {
        checkedData = []
    }
    // console.log(checkedData)
})

tableBodyData.addEventListener('change', (e) => {
    if (e.target.classList.contains('rowCheckbox')) {
        let targetId = e.target.id.replace('check-', '')

        if (e.target.checked) {
            checkedData.push(targetId)
            if (checkedData.length == entriesPerPageElement.value) {
                document.getElementById('allCheck').checked = true
            }
        }
        else {
            checkedData = checkedData.filter(el => el != targetId)
            document.getElementById('allCheck').checked = false
        }
    }
    // console.log(checkedData)
})

exportCsv.addEventListener('click', async e => {
    //console.log(checkedData)
    await $.ajax({
        url: "/transactions/export-csv",
        type: "POST",
        //contentType: "application/json",
        //dataType: 'json',
        data: { selectedIds: JSON.stringify(checkedData) },
    }).done(function (result) {
        // console.log("sdfbiunvuenuinb");
        saveData(result, "cardinsider_final_transactions.csv")
    })
})
const saveData = (function () {
    const a = document.createElement("a")
    document.body.appendChild(a)
    a.style = "display: none"
    return function (data, fileName) {
        const blob = new Blob([data], { type: "octet/stream" }),
            url = window.URL.createObjectURL(blob)
        a.href = url
        a.download = fileName
        a.click()
        window.URL.revokeObjectURL(url)
    }
}())
$(document).ready(async () => {
    $('#hide-sidebar-toggle-button').click()
    entriesPerPageElement.value = "10"
    filterObject.entriesPerPage =
        document.querySelector("#entriesPerPage").value
    await getTableBody()
})