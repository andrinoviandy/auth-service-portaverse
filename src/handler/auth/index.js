const afterLogin = require("./afterLogin");
const logout = require("./logout");
const postReferalCode = require("./postReferalCode");
const resetPassword = require("./resetPassword");
const firebaseCrossDomain = require("./firebaseCrossDomain");
const firebaseCrossDomainSessionLogin = require("./firebaseCrossDomainSessionLogin");
const refreshToken = require("./refreshToken");
const afterLoginSso = require("./afterLoginSso");
const refreshTokenSso = require("./refreshTokenSso");
const getUidUserSso = require("./getUidUserSso");

module.exports = {
  afterLogin,
  logout,
  postReferalCode,
  resetPassword,
  firebaseCrossDomain,
  firebaseCrossDomainSessionLogin,
  refreshToken,
  afterLoginSso,
  refreshTokenSso,
  getUidUserSso,
};
