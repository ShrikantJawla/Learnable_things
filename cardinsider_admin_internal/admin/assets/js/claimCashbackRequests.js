let checkedData = []
let applicationsData = []
let payAllBtn = document.getElementById('payAll')
let checkAll = document.getElementById('allCheck')
let modalBody = document.querySelector('#status-body')
filterReset.addEventListener("click", () => {
	//can use loop here but didnt use it for better reading purposes
	document.getElementById("user_id").value = ""
	document.getElementById("ciu_number").value = ""
	document.getElementById("user_name").value = ""
	document.getElementById("payment_method").value = ""
	document.getElementById("is_upi_valid").value = ""
	document.getElementById("is_bank_valid").value = ""
	document.getElementById("upi_valid_name").value = ""
	document.getElementById("bank_valid_name").value = ""

	entriesPerPageElement.value = "10"
	filterObject = {}
	filterObject.entriesPerPage = document.querySelector("#entriesPerPage").value
	getTableBody()
})
const handlePay = async (id) => {
	// console.log("Handling Pay Id")
	return $.ajax({
		// url: "/set-cashback-referral-paid",
		url: "/process-transaction",
		type: "POST",
		data: {
			identifier: id,
			checkCashback: 'true',
			checkReferrals: 'true'
		},
		success: (res) => {
			// html += `<div><span> Status for id (${checkedData[i]['id'] * 1}) : </span> <span id="status-${checkedData[i]['id'] * 1}">Processing<span></div> `
			// console.log("Success", id)
			// document.querySelector(`span#status-${id}`).innerText = 'Success'
			// console.log(document.querySelector(`span#status-${id}`))
			// await getTableBody()
			let textNode = document.createElement("div")
			textNode.innerHTML = `<span> Status for id (${id}) : </span> <span id="status-${id}">Success<span>`
			modalBody.appendChild(textNode)
		},
		error: function (jqXHR, exception) {
			let textNode = document.createElement("div")
			textNode.innerHTML = `<span> Status for id (${id}) : </span> <span id="status-${id}">Error<span>`
			modalBody.appendChild(textNode)
			var msg = ''
			if (jqXHR.status === 0) {
				msg = 'Not connect.\n Verify Network.'
			} else if (jqXHR.status == 404) {
				msg = 'Requested page not found. [404]'
			} else if (jqXHR.status == 500) {
				msg = 'Internal Server Error [500].'
			} else if (exception === 'parsererror') {
				msg = 'Requested JSON parse failed.'
			} else if (exception === 'timeout') {
				msg = 'Time out error.'
			} else if (exception === 'abort') {
				msg = 'Ajax request aborted.'
			} else {
				msg = 'Uncaught Error.\n' + jqXHR.responseText
			}
		},
	}).then(res => res.data)
}

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
		url: "/get-cashbacks",
		method: "POST",
		contentType: "application/json",
		dataType: 'json',
		data: JSON.stringify({
			filterObject,
			pageNo,
			sort,
		}),
		success: function (result) {
			let { claimCashbackRequestsLists, count } = result.payload
			// console.log(claimCashbackRequestsLists)
			// claimCashbackRequestsLists = claimCashbackRequestsLists.map(elem => ({ ...elem, 'Cashback_paid': elem['Cashback_paid'] || false }))
			applicationsData = claimCashbackRequestsLists
			entries.innerHTML = `(${count} entries)`
			pages.innerHTML = `/ ${Math.ceil(
				count / filterObject.entriesPerPage
			)}`
			pageNoElement.setAttribute(
				"max",
				Math.ceil(count / filterObject.entriesPerPage)
			)

			let tableBodyHTML = ""
			for (i = 0; i < claimCashbackRequestsLists.length; i++) {
				// const date = new Date(claimCashbackRequestsLists[i]["Application_date"])
				tableBodyHTML = tableBodyHTML + `
                <tr style=" font-size:13px; cursor:default;" class="tableRow"  >
                <td >
				<div style="display:flex;flex-direction:row;gap:10px;justify-content:center;align-items:center;">
					<input class="form-check-input rowCheckbox" type="checkbox" value=""  id="check-${claimCashbackRequestsLists[i]["user_id"]}" style=" width: 18px; height: 18px;">
					<a href="/cashbacks?id=${claimCashbackRequestsLists[i]["user_id"]}" target="_blank" style="position:relative;top:5px;"><i class="material-icons has-sub-menu action-btns">edit</i></a>
				</div>
				</td>
                <td style="text-align:center;">${claimCashbackRequestsLists[i]["user_id"]}</td>
                <td style="text-align:center;">${claimCashbackRequestsLists[i]["ciu_number"]}</td>
                <td style="text-align:center;">${claimCashbackRequestsLists[i]["user_name"]}</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["payment_method"]}</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["upi_id"] || '-'}</td>
				<td>
					<label class="switch">
						<input type="checkbox" id="is_upi_valid" ${claimCashbackRequestsLists[i]["is_upi_valid"] ? "checked" : ""} disabled>
						<span class="slider round"></span>
					</label>
				</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["upi_valid_name"] || '-'}</td>
				<td>
					<label class="switch">
						<input type="checkbox" id="is_bank_valid" ${claimCashbackRequestsLists[i]["is_bank_valid"] ? "checked" : ""} disabled>
						<span class="slider round"></span>
					</label>
				</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["bank_valid_name"] || "-"}</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["totalApplicationCasback"]}</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["totalReferrelCasback"]}</td>
				<td style="text-align:center;">${claimCashbackRequestsLists[i]["totalCasback"]}</td>
				<td><button style="margin: 0;"  class="ci-btn" id="btn-${claimCashbackRequestsLists[i]["user_id"]}" ${+claimCashbackRequestsLists[i]["totalCasback"] > 0 ? "" : "disabled"} >Process</button></td>
            </tr>
            `
			}
			tableBodyData.innerHTML = tableBodyHTML
			$('#allCheck').prop('checked', false)
			checkedData = []
			//validatePayAll()
		}
	}).then(res => res.data)
}

const validatePayAll = function () {
	// console.log(checkedData)
	let allSame = true
	if (checkedData.length > 0) {
		let firstVal = checkedData[0]['Cashback_paid']
		for (i = 0; i < checkedData.length; i++) {
			if (checkedData[i]['Cashback_paid'] !== firstVal) {
				allSame = false
				break
			}
		}
		if (allSame) {
			if (!firstVal) {
				payAllBtn.disabled = false
				payAllBtn.innerText = "Process"
			}
			else {
				payAllBtn.innerText = "Processed"
			}

		}
		else {
			payAllBtn.innerText = "Process"
			payAllBtn.disabled = true
		}
	}
	else {
		payAllBtn.classList.remove('btn-danger')
		payAllBtn.innerText = "Process"
		payAllBtn.disabled = true
	}
}

checkAll.addEventListener('change', (e) => {
	checkedData = []
	$('.rowCheckbox').prop('checked', e.target.checked)
	if (e.target.checked) {
		applicationsData.forEach(elem => {
			checkedData.push({ id: elem.user_id, 'Cashback_paid': (+elem['totalCasback'] === 0) })
		})
	}
	else {
		checkedData = []
	}
	// console.log(checkedData)
	validatePayAll()
})

tableBodyData.addEventListener('change', (e) => {
	if (e.target.classList.contains('rowCheckbox')) {
		let targetId = e.target.id.replace('check-', '')
		if (e.target.checked) {
			checkedData.push({ id: targetId, 'Cashback_paid': applicationsData.find(elem => +elem.user_id == targetId)['totalCasback'] === 0 })
			if (checkedData.length == entriesPerPageElement.value) {
				document.getElementById('allCheck').checked = true
			}
		}
		else {
			checkedData = checkedData.filter(el => el.id != targetId)
			document.getElementById('allCheck').checked = false
		}
		validatePayAll()
	}
})



tableBodyData.addEventListener('click', (e) => {
	if (e.target.tagName === 'BUTTON') {
		let targetId = e.target.id.replace('btn-', '')
		// console.log(targetId)
		checkedData = []
		checkedData.push({ id: targetId, 'Cashback_paid': applicationsData.find(elem => +elem.user_id === +targetId)['totalCasback'] === 0 })
		$('#confirmModal').modal('show')
	}
})


payAllBtn.addEventListener('click', (e) => {
	$('#confirmModal').modal('show')
})


document.getElementById('finalPayBtn').addEventListener('click', async (e) => {
	$('#confirmModal').modal('hide')

	// let html = ``
	// for (i = 0; i < checkedData.length; i++) {
	// 	html += `<div><span> Status for id (${checkedData[i]['id'] * 1}) : </span> <span id="status-${checkedData[i]['id'] * 1}">Processing<span></div> `
	// }
	// $('.modal-body').html(html)
	$('#cashbackModal').modal('show')
	for (i = 0; i < checkedData.length; i++) {
		try {
			await handlePay(checkedData[i]['id'] * 1)
		}
		catch (err) {
			console.log(err)
		}
		// $.ajax({
		// 	url: "/cashback-to-multiple-users",
		// 	method: "POST",
		// 	contentType: "application/json",
		// 	dataType: 'json',
		// 	data: JSON.stringify({
		// 		checkedData
		// 	}),
		// 	success: () => {
		// 		alert("cashback paid succcessfully")
		// 		location.reload()
		// 	}
		// })
	}
	$('#wait').hide()
	$('#reload').prop('disabled', false)

})


$(document).ready(async () => {
	$('#hide-sidebar-toggle-button').click()
	entriesPerPageElement.value = "10"
	filterObject.entriesPerPage =
		document.querySelector("#entriesPerPage").value
	// getCardIssuersName()
	// getCreditCardNames()
	await getTableBody()
})
$('#reload').click(async () => {
	$('#cashbackModal').modal('hide')
	await getTableBody()
	validatePayAll()
})
