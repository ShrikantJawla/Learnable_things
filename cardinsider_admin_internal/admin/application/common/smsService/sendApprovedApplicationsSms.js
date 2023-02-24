


let axios = require('axios');
let smsObj = {};


smsObj.sendApprovedApplicationsSms = async function ({ sendersList }) {


	let axiosResp = false;

	if (sendersList && sendersList.length > 0) {
		let apiUrl = "https://api.msg91.com/api/v5/flow/";
		try {
			await axios.post(apiUrl, {
				"flow_id": "634807ccde3003557307a865",
				"sender": "1307166556899399999",
				"recipients": sendersList
			}, {
				headers: {
					"Content-Type": "application/json",
					"authkey": process.env.MSG91_TOKEN
				}
			}).then((response) => {
				console.log(response.data);
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

	} else {
		return false;
	}


}





module.exports = smsObj;