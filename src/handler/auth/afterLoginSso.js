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

    console.log('custom_token', customToken)
    // 2. Exchange custom token -> ID Token
    const response = await axios.post(
      `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${process.env.FB_API_KEY}`,
      {
        token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJodHRwczovL2lkZW50aXR5dG9vbGtpdC5nb29nbGVhcGlzLmNvbS9nb29nbGUuaWRlbnRpdHkuaWRlbnRpdHl0b29sa2l0LnYxLklkZW50aXR5VG9vbGtpdCIsImlhdCI6MTc2NDc1MDE3OCwiZXhwIjoxNzY0NzUzNzc4LCJpc3MiOiJmaXJlYmFzZS1hZG1pbnNkay1jNHFic0BzbWFydGttc3lzdGVtLTI3MDVmLmlhbS5nc2VydmljZWFjY291bnQuY29tIiwic3ViIjoiZmlyZWJhc2UtYWRtaW5zZGstYzRxYnNAc21hcnRrbXN5c3RlbS0yNzA1Zi5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVpZCI6IklXcHAzek5HbGJUd3pUY1ltcDBHR3ZKS2RDMTIiLCJjbGFpbXMiOnsiZW1haWwiOiJhdWxpYS5pa2hzYW5AaWxjcy5jby5pZCIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfX0.CBL5D8Xg6PDTH9nxZG2UYop8Pih_Pnax61D4GqircsFaAPuuyUXqQoZYzD0ffwWP0Kg6s5M7j2zrLu4Ot0QFI81O3-aym5HvohOgcHYPZejyhvqtk5YfcCYTqZJDcuBQbffBPs5B179fpc6Z9JYlLvm-S5b3rikcs2Y-Aidfrshukehz2qiZBaYVTb5sta2BVlsoxoEMei8SttKr6fQlMw7Zq1F9qq1RTye69rLQp2973fK4KUnenzNdB1u3ySCHUXCJ1XJTWk2lfUJgvQjyILB1yycu8JmRNniEAiUltg4xA1qb9iNcKhgbdW0N9JeMMTSfVkjPQNLbsA4BuFHMxw',
        returnSecureToken: true,
      }
    );

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
