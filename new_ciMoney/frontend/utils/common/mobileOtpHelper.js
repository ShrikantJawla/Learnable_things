const http = require("http");
const { pool } = require("../config/database");
const mobileOtpHelper = {};

mobileOtpHelper.generateOtp = async function (number) {
    let generatedOtp = Math.floor(100000 + Math.random() * 900000);
    // await mobileOtpHelper.sendOtp(number, generatedOtp);
    // return generatedOtp;
    console.log(generatedOtp)
    return generatedOtp
};
mobileOtpHelper.sendOtp = async function (number, otp) {
    let smsAutoFillKey = "";
    var options = {
        method: "POST",
        hostname: "api.msg91.com",
        port: null,
        path: "/api/v5/flow/",
        headers: {
            authkey: process.env.MSG91_OTP,
            "content-type": "application/JSON",
        },
    };

    var req = http.request(options, function (res) {
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = Buffer.concat(chunks);
            console.log("-------------error---", body.toString());
        });
    });
    req.write(
        '{\n  "flow_id": "62bd9ff7d6fc0517bb06ab22",\n  "mobiles": "91' +
        number +
        '",\n  "OTP": "' +
        otp +
        '",\n  "ANOT": "' +
        smsAutoFillKey +
        '"\n}'
    );
    req.end();
};

mobileOtpHelper.setOtpToZero = async function (number) {
    let query = `UPDATE cim_users SET cim_number_otp = '0'  WHERE cim_number = '${number}'`;
    try {
        await pool.query(query);
    } catch(err){
        console.log(err);
    }
};
module.exports = mobileOtpHelper;
