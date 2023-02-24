

CASHBACKREQUESTDETAILS = {}

$("#edit_payment_details").click(()=>{
	$("#ciPaymentDetailsEdit").modal("show");
})

// Enabling button after detecting change on the form 
$('#updatePaymentDetailsForm').on('change keyup paste', ':input', function(e) {
	$("#ciPaymentDetailsEditBtn").prop("disabled" , false);
});

$("#ciPaymentDetailsEditBtn").click(()=>{
	
	let editId = $("#idEdit").val();
	let accountNumber = $("#accountNumberEdit").val();
	let upi = $("#upiEdit").val();
	let accountName = $("#accountNameEdit").val();
	let bankName = $("#bankNameEdit").val();
	let ifsc = $("#ifscEdit").val();

	$.ajax({
		url: "/update-payment-details",
		type: "POST",
		data: {
			user_id : editId,
			account_name : accountName,
			account_number : accountNumber,
			upi_id : upi,
			bank_name: bankName,
			ifsc_code : ifsc
		},
		success: (res) => {
		  window.location.reload();
		},
		error: function (jqXHR, exception) {
			alert("Error Updating Details")
		}
	})
})

$('#pay-btn').click(() => {
	let identifier = location.search.split('=')[1]
	$.ajax({
		url: "/set-cashback-referral-paid",
		type: "POST",
		data: {
			identifier,
			checkCashback: 'true',
			checkReferrals: 'true'
		},
		success: (res) => {
			alert(res.status)
		},
		error: function (jqXHR, exception) {
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
			alert(msg)
		},
	})
})
$(document).ready(() => {
	if (document.getElementById('totalAmount').querySelector('span').innerText * 1 == 0) {
		$('#pay-btn').hide()
	}
})



CASHBACKREQUESTDETAILS.markPaid = async function () {
	let userId = 1

}







