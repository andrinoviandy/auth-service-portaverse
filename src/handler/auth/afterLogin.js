const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const setTokenIfrememberMe = require("../../services/internal/setTokenIfrememberMe");
const checkRoleExternalUser = require("../../services/internal/checkRoleExternalUser");

module.exports = async (req, res) => {
  const uid = res.locals.uid;
  // const uid = "JsHUcS7fXkUokZzLmGkmhaBObVI2";
  const { isRemember, fcm_token, targetUID } = req.body;

  try {
    await checkRoleExternalUser(uid);
    const { data, jwt, refreshToken } = await setTokenIfrememberMe(
      res,
      uid,
      isRemember,
      fcm_token,
      req,
      targetUID
    );

    console.log("success all after login flow 9/9");

    return resSuccessHandler(
      res,
      { jwt, refresh_token: refreshToken, user: data },
      "success"
    );
  } catch (error) {
    resErrorHandler(res, error);
  }
};
