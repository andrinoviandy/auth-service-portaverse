const getEmployeeByNipp = require("./getEmployeeByNipp");
const getAcceptedRegistrationByNipp = require("./getAcceptedRegistrationByNipp");
const getSubmittedOrAcceptedRegistrationByNipp = require("./getSubmittedOrAcceptedRegistrationByNipp");
const getRegistrationByNipp = require("./getRegistrationByNipp");
const getRegistrationById = require("./getRegistrationById");
const getActiveOtp = require("./getActiveOtp");
const getSuccessOtp = require("./getSuccessOtp");
const getSubmittedRequestList = require("./getSubmittedRequestList");
const getSubmittedRequestById = require("./getSubmittedRequestById");
const getRequestAnalytics = require("./getRequestAnalytics");

module.exports = {
  getEmployeeByNipp,
  getAcceptedRegistrationByNipp,
  getSubmittedOrAcceptedRegistrationByNipp,
  getRegistrationByNipp,
  getRegistrationById,
  getActiveOtp,
  getSuccessOtp,
  getSubmittedRequestList,
  getSubmittedRequestById,
  getRequestAnalytics,
};
