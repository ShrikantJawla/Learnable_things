
let axios = require('axios');

let upiVerificationObject = {};


upiVerificationObject.verifyUpiId = async function (upiId) {

	let axiosResp = false;

	let apiUrl = "https://api.attestr.com/api/v1/public/finanx/vpa";
	try {
		await axios.post(apiUrl, {
			"vpa": upiId
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
	return axiosResp;

}


module.exports = upiVerificationObject;