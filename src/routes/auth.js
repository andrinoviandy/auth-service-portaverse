const express = require("express");
const router = express.Router();

const authHandler = require("../handler/auth");
const { firebaseMiddleware, kmsMiddleware } = require("../middleware");

// no privilege code
router.post("/after-login", firebaseMiddleware, authHandler.afterLogin);
router.post("/after-login-sso", authHandler.afterLoginSso);
router.post("/get-uid-user-sso", authHandler.getUidUserSso);
router.post("/logout", kmsMiddleware(), authHandler.logout);

// no privilege code
router.post("/reset-password", authHandler.resetPassword);

router.post("/referal", kmsMiddleware(), authHandler.postReferalCode);

// no privilege code
router.post("/session", authHandler.firebaseCrossDomainSessionLogin);
router.get("/status", authHandler.firebaseCrossDomain);
router.post("/refresh-token", firebaseMiddleware, authHandler.refreshToken);
router.post("/refresh-token-sso", authHandler.refreshTokenSso);

module.exports = router;
