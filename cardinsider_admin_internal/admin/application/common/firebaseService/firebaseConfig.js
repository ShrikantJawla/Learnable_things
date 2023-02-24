var admin = require("firebase-admin");
var serviceAccount = require("./firebase_sdk");


admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
}, );

// admin.app("Card Insider Android App").initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

//admin.app = admin.app("Card Insider Android App");






module.exports.admin = admin;

// var initFire = admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
// });

//firebaseService.initFire();

//console.log(firebaseService.initFire, "intifire");

// firebaseService.sendNotificationWithFCMToken = function (formData) {
//   var dataToReturn = {};
//   var fcmRegistrationToken =
//     "d3XLXAZES4Gya-fyvAxnYw:APA91bFQfKDmnhw1YCXuleAbDNDePSRQgZE5ZbUD7YAayMIZ7drlyNff-0JZy0IXrvT2eaiRNIAvml0EHio_VcqEYbzivCpJcoY4u0-hKXmEua-t3DAnX9RAiCySTBZgMmMA2HZ9mNkK";
//   var payload = {
//     notification: {
//       title: formData.notifictionTitle,
//       body: formData.notificationText,
//     },
//   };

//   var options = {
//     priority: "high",
//     timeToLive: 3,
//   };

//   console.log("sending notification now");

//   admin
//     .messaging()
//     .sendToDevice(fcmRegistrationToken, payload, options)
//     .then(function (resp) {
//       console.log("notification send successfully ------  >>>>> ", resp);
//       dataToReturn = resp;
//     })
//     .catch((err) => {
//       console.log(
//         "there is a problem while sending messgae from node admin ----- >>>",
//         err
//       );
//       dataToReturn = err;
//     });
//   return dataToReturn;
// };