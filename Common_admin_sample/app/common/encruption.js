const crypto = require('crypto');
// Generate a public-private key pair
// const { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
//     modulusLength: 4096,
//     publicKeyEncoding: {
//       type: 'spki',
//       format: 'pem'
//     },
//     privateKeyEncoding: {
//       type: 'pkcs8',
//       format: 'pem'
//     }
//   });
const publicKey = process.env.CRYPTO_PUBLIC_KEY;
const privateKey = process.env.CRYPTO_PRIVATE_KEY;
//Encrypting text
let encruptionObj = {};
encruptionObj.encrypt = function (text) {
    const data = text;
    const encryptedData = crypto.publicEncrypt({ key: publicKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(data));
    const encryptedDataString = encryptedData.toString('base64');
    return encryptedDataString;
}

// Decrypting text
encruptionObj.decrypt = function (text) {
    try {
        const decryptedData = crypto.privateDecrypt({ key: privateKey, padding: crypto.constants.RSA_PKCS1_PADDING }, Buffer.from(text, 'base64'));
        //console.log(decryptedData.toString());
        return decryptedData.toString();
    } catch (e) {
        return '';
    }

}

// Text send to encrypt function

module.exports = encruptionObj;