const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const { NotificationToken } = require("../../models/index");

module.exports = async (req, res) => {
  try {
    const maxAge = -365 * 24 * 60 * 60 * 1000; // minus 1 year

    res.cookie("smartkmsystemAuth", "", {
      domain: process.env.DOMAIN,
      sameSite: "Lax",
      httpOnly: true,
      secure: true,
      maxAge,
    });
    res.cookie("user", "", {
      domain: process.env.DOMAIN,
      sameSite: "Lax",
      httpOnly: false,
      secure: true,
      maxAge,
    });

    res.cookie("rememberMe", "", {
      domain: process.env.DOMAIN,
      sameSite: "Lax",
      httpOnly: true,
      secure: true,
      maxAge,
    });

    res.cookie("cms-user", "", {
      domain: process.env.DOMAIN,
      sameSite: "Lax",
      httpOnly: false,
      secure: true,
      maxAge,
    });

    if (process.env.NODE_ENV === "development") {
      // development purpose
      res.cookie("smartkmsystemAuth", "", {
        domain: "localhost",
        sameSite: "Lax",
        secure: false,
        httpOnly: true,
        maxAge,
      });

      // development purpose
      res.cookie("user", "", {
        domain: "localhost",
        sameSite: "Lax",
        secure: false,
        httpOnly: false,
        maxAge,
      });

      res.cookie("rememberMe", "", {
        domain: "localhost",
        sameSite: "Lax",
        httpOnly: false,
        maxAge,
        secure: false,
      });

      res.cookie("cms-user", "", {
        domain: "localhost",
        sameSite: "Lax",
        httpOnly: false,
        maxAge,
        secure: false,
      });
    }
    if (req.body.fcm_token) {
      await NotificationToken.destroy({
        where: { token: req.body.fcm_token },
      });
    }

    return resSuccessHandler(res, {}, "success logout");
  } catch (error) {
    resErrorHandler(res, error);
  }
};
