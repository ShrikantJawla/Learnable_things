const jwt = require("jsonwebtoken");

let commonHelper = {};

commonHelper.userToken = async function (id, name, uuid, mobile, email , isVerified) {
	let userToken = await jwt.sign({
		id: id,
		name: name,
		uuid: uuid,
		mobile: mobile,
		email: email,
		isVerified: isVerified
	}, process.env.JWTSECRET);
	
	return userToken;
}

module.exports = commonHelper;