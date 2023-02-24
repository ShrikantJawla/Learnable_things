let transactionId = window.location.search.split('=')[1]
let transactionTableBody = document.getElementById('transactionTableBody')
let transactionStatusSelect = document.getElementById('td_status')
let updateBtn = document.getElementById('update')
let inputObject = {
    transId: transactionId,
    transStatus: "",
    transNote: ""
}
let applicationCashback = 0, referralCashback = 0
function createElementFromHTML(htmlString) {
    var div = document.createElement("div")
    div.innerHTML = htmlString.trim()

    // Change this to div.childNodes to support multiple top-level nodes.
    return div.firstChild
}
const getTransactionDetails = async function (itemId) {
    return $.ajax({
        url: `/view-transaction?id=${itemId}&html=false`,
        type: "GET",
        contentType: "application/jsonrequest",
        success: (res) => {
            let { transactionDetail } = res
            const array = ['td_upi_id', 'td_account_name', 'td_account_number', 'td_bank_name', 'td_ifsc_code']
            $(`#td_status`).val(transactionDetail["td_status"])
            if (transactionDetail["td_status"] === 'Completed' || transactionDetail["td_status"] === 'Failed') {
                transactionStatusSelect.disabled = true
            }
            $(`#td_method`).val(transactionDetail["td_method"])
            array.forEach(el => {
                if (!transactionDetail[el]) {
                    $(`#copy-${el}`).hide()
                }
            })
            document.querySelectorAll('.copyBtn').forEach(node => node.addEventListener('click', (e) => {
                e.preventDefault()
                const parent = e.target.parentElement.closest('.copyBtn')
                navigator.clipboard.writeText(transactionDetail[`${parent.id.replace('copy-', '')}`])
                alert(`Text Copied`)
            }, false))
            if (transactionDetail.breakup && transactionDetail.breakup.length > 0) {
                let html = transactionTableBody.innerHTML
                transactionDetail.breakup.filter(obj => !obj.tarj_is_referred).sort((a, b) => a.tarj_id - b.tarj_id).forEach(obj => {
                    html += `
                    <tr>
                        <td>${obj["tarj_id"]}</td>
                        <td><a href="/card-application" target="_blank">${obj["tarj_application"]}</a></td>
                        <td colspan="2">${obj["Application_number"]}</td>
                        <td colspan="2">${obj["IssuerName"]}</td>
                        <td colspan="2">${obj["CreditCardName"]}</td>
                        <td colspan="1">-</td>
                        <td colspan="2">-</td>
                        <td >${obj["tarj_application_cashback"]}</td>
                    </tr>
                    `
                    applicationCashback += obj["tarj_application_cashback"] * 1
                })
                html += ` 
                <tr>
                    <th class="text-white" style="background-color:#61ACFC;" colspan="11"> Total Application Cashback</th>
                    <td class="text-white" style="background-color:#61ACFC;">${applicationCashback}</td>
                </tr>
                `
                transactionDetail.breakup.filter(obj => obj.tarj_is_referred).sort((a, b) => a.tarj_id - b.tarj_id).forEach(obj => {
                    html += `
                    <tr>
                        <td>${obj["tarj_id"]}</td>
                        <td>-</td>
                        <td colspan="2">-</td>
                        <td colspan="2">-</td>
                        <td colspan="2">-</td>
                        <td colspan="1"><a href="/edit-ciUser?id=${obj["tarj_referred_user"]}" target="_blank">${obj["tarj_referred_user"]}</a></td>
                        <td colspan="2">${obj["referred_user_name"]}</td>
                        <td >${obj["tarj_referred_amount"]}</td>
                    </tr>
                    `
                    referralCashback += obj["tarj_referred_amount"] * 1
                })
                html += `
                <tr>
                    <th class="text-white" style="background-color:#FF4857;" colspan="11"> Total Referral Cashback</th>
                    <td class="text-white" style="background-color:#FF4857;">${referralCashback}</td>
                </tr>
                `
                html += `
                <tr>
                    <th class="text-white" style="background-color:#6e6e6e;border:1px solid ; border-width:0px 1px 0px 0px;" colspan="11"> Total Cashback</th>
                    <td class="text-white" style="background-color:#6e6e6e; ">${transactionDetail["td_amount"]}</td>
                </tr>
                `
                transactionTableBody.innerHTML = html
            }
        }
    }).then(res => res.data)
}

transactionStatusSelect.addEventListener('change', (e) => {
    inputObject.transStatus = e.target.value
    updateBtn.disabled = false
})
document.getElementById('td_message').addEventListener('change', e => {
    inputObject.transNote = e.target.value
})
updateBtn.addEventListener('click', e => {
    $('#confirmModal').modal('show')
})
document.querySelector('#finalPayBtn').addEventListener('click', e => {
    $.ajax({
        // url: "/set-cashback-referral-paid",
        url: "/complete-transaction",
        type: "POST",
        data: inputObject,
        success: () => location.reload()
    })
})
$(document).ready(async function () {
    $('#hide-sidebar-toggle-button').click()
    await getTransactionDetails(transactionId)
})