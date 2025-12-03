const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const setTokenIfrememberMeSso = require("../../services/internal/setTokenIfrememberMeSso");
const setTokenIfrememberMe = require("../../services/internal/setTokenIfrememberMe");
const checkRoleExternalUser = require("../../services/internal/checkRoleExternalUser");
const jwt = require("jsonwebtoken");

const { checkSso } = require("../../commons/helpers/jwt");
const getUidUser = require("../../services/internal/getUidUser");

const { adminAuth } = require("../../services/firebase.admin.js");
const fs = require("fs");
const { default: axios } = require("axios");

async function getTokenFirebase(uid, email) {
  try {
    const additionalClaims = {
      email: email,
      email_verified: true,
    };

    // 1. Generate custom token
    const customToken = await adminAuth
      .auth()
      .createCustomToken(uid, additionalClaims);

      console.log('customToken', customToken);
      
    // 2. Exchange custom token -> ID Token
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FB_API_KEY}`,
      {
        token: customToken,
        returnSecureToken: true,
      }
    );

    console.log('response', response);
    

    // 3. Return hasilnya
    return response.data;   // <-- return valid data
  } catch (error) {
    console.error("Error:", error);
    return null;            // <-- return jika gagal
  }
}

module.exports = async (req, res) => {
  try {
    const payload = req.body

    // const authHeader = req.headers.authorization || "";
    // const idToken = authHeader.startsWith("Bearer ")
    //   ? authHeader.substring(7, authHeader.length)
    //   : null;

    const decodedJwtSso = await checkSso(payload?.access_token);

    const dataUser = await getUidUser(decodedJwtSso?.portal_si_username);

    const uid = dataUser?.uid;
    const email = dataUser?.email

    const tokenFirebase = await getTokenFirebase(uid, email)

    const result = {
      ...tokenFirebase, targetUID: uid
    }
    return resSuccessHandler(
      res,
      result,
      "success"
    );
    
  } catch (error) {
    resErrorHandler(res, error);
  }
};
