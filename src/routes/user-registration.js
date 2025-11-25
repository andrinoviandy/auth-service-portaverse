const express = require("express");
const router = express.Router();
const { uploadMiddleware } = require("../services/storage");
const { kmsMiddleware } = require("../middleware");

const userRegistrationHandler = require("../handler/user-registration");

// Public endpoint - no kmsMiddleware
router.get("/check-nipp", userRegistrationHandler.checkNipp);
router.post(
  "/send-verification-code",
  userRegistrationHandler.sendVerificationCode
);
router.post("/verify-otp", userRegistrationHandler.verifyOtp);
router.post("/create-password", userRegistrationHandler.createPassword);

// Test with storage middleware (upload.any())
router.post(
  "/submit-request",
  uploadMiddleware,
  userRegistrationHandler.submitRequest
);

// Admin endpoint - protected with kmsMiddleware
router.get(
  "/admin/list-request",
  kmsMiddleware(),
  userRegistrationHandler.adminGetListRequest
);

router.get(
  "/admin/request-detail",
  kmsMiddleware(),
  userRegistrationHandler.adminGetRequestById
);

router.post(
  "/admin/reject-request",
  kmsMiddleware(),
  userRegistrationHandler.adminRejectRequest
);

router.post(
  "/admin/accept-request",
  kmsMiddleware(),
  userRegistrationHandler.adminAcceptRequest
);

router.get(
  "/admin/request-analytics",
  kmsMiddleware(),
  userRegistrationHandler.adminGetRequestAnalytics
);

module.exports = router;
