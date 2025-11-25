const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const { adminAuth } = require("../../services/firebase.admin");

module.exports = async (req, res) => {
  try {
    let result, errors;
    const sessionCookie = req.cookies.__session || "";

    // Verify the session cookie. In this case an additional check is added to detect
    // if the user's Firebase session was revoked, user deleted/disabled, etc.
    await adminAuth
      .auth()
      .verifySessionCookie(sessionCookie, true /** checkRevoked */)
      .then((decodedClaims) => {
        result = decodedClaims;
      })
      .catch((error) => {
        // Session cookie is unavailable or invalid. Force user to login.
        errors = error;
      });
    if (errors) {
      return resErrorHandler(res, errors);
    }

    await adminAuth
      .auth()
      .createCustomToken(result.user_id)
      .then((token) => {
        return resSuccessHandler(res, { token: token }, "success");
      });
  } catch (error) {
    resErrorHandler(res, error);
  }
};
