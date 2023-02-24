let router = require("express").Router();
let authController = require("../controller/authController");
let sessionMiddleWare = require("../utils/common/sessionMiddleware");
// route to render login page
router.get("/login", sessionMiddleWare.checkAuthStatus ,authController.renderLoginPage);

// route to send verification otp
router.post("/send-otp", authController.sendLoginOtp);

// route to verify otp
router.post("/verify-otp", authController.verifyLoginOtp);

// route to complete profile
router.post("/complete-profile", authController.completeUserProfile);

// route to handle errors
router.get("*", function (req, res, next) {
  res.send("error");
});

module.exports = router;
