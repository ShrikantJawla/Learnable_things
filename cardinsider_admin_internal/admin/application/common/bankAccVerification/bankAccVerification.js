
let axios = require('axios');

let bankAccVerification = {};


bankAccVerification.verifiyBankAcc = async function (bankAccNumber, ifscCode) {

	let axiosResp = false;

	let apiUrl = "https://api.attestr.com/api/v1/public/finanx/acc";

	if (bankAccNumber && ifscCode) {

		try {
			await axios.post(apiUrl, {
				"acc": bankAccNumber,
				"ifsc": ifscCode
			}, {
				headers: {
					"Content-Type": "application/json",
					"Authorization": process.env.UPI_TOKEN
				}
			}).then((response) => {
				//console.log(response);
				axiosResp = response.data
			})
				.catch((error) => {
					//console.log(error.response);
					axiosResp = error.response.data;
				});

		} catch (error) {
			axiosResp = error;
		}

	}

	return axiosResp;

}


module.exports = bankAccVerification;