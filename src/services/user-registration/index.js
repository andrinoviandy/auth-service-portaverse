const checkNipp = require("./checkNipp");
const sendVerificationCode = require("./sendVerificationCode");
const verifyOtp = require("./verifyOtp");
const createPassword = require("./createPassword");
const submitRequest = require("./submitRequest");
const adminGetListRequest = require("./adminGetListRequest");
const adminGetRequestById = require("./adminGetRequestById");
const adminRejectRequest = require("./adminRejectRequest");
const adminAcceptRequest = require("./adminAcceptRequest");
const adminGetRequestAnalytics = require("./adminGetRequestAnalytics");

module.exports = {
  checkNipp,
  sendVerificationCode,
  verifyOtp,
  createPassword,
  submitRequest,
  adminGetListRequest,
  adminGetRequestById,
  adminRejectRequest,
  adminAcceptRequest,
  adminGetRequestAnalytics,
};
