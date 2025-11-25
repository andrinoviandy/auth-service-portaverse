const setTokenIfRememberMe = require("../../services/internal/setTokenIfrememberMe");
const {
  resErrorHandler,
  resSuccessHandler,
} = require("../../commons/exceptions/resHandler");

const { UserToken } = require("../../models");
const AuthenticationError = require("../../commons/exceptions/AuthenticationError");

module.exports = async (req, res) => {
  try {
    const uid = res.locals.uid;
    const refreshToken = req.body.refresh_token;

    const userToken = await UserToken.findOne({
      where: {
        uid,
        refresh_token: refreshToken,
      },
    });

    const diff = userToken.expired_token - Math.floor(Date.now() / 1000);

    if (diff <= 0) {
      throw new AuthenticationError("Token Expired");
    }

    const { jwt, data } = await setTokenIfRememberMe(res, uid);

    resSuccessHandler(
      res,
      { jwt, user: data, refresh_token: refreshToken },
      "success"
    );
  } catch (err) {
    resErrorHandler(res, err);
  }
};
