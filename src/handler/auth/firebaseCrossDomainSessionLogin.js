const ClientError = require("../../commons/exceptions/ClientError");
const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const { adminAuth } = require("../../services/firebase.admin");

module.exports = async (req, res) => {
  try {
    // Get the ID token passed and the CSRF token.
    console.log(req.body);
    const idToken = req.body.idToken.toString();
    // Todo: uncomment to Guard against CSRF attacks.
    // const csrfToken = req.body.csrfToken.toString();
    // if (csrfToken !== req.cookies.csrfToken) {
    //   res.status(401).send("UNAUTHORIZED REQUEST!");
    //   return;
    // }
    // Set session expiration to 5 days.
    const expiresIn = 60 * 60 * 24 * 5 * 1000;
    // Create the session cookie. This will also verify the ID token in the process.
    // The session cookie will have the same claims as the ID token.
    // To only allow session cookie setting on recent sign-in, auth_time in ID token
    // can be checked to ensure user was recently signed in before creating a session cookie.
    await adminAuth
      .auth()
      .createSessionCookie(idToken, { expiresIn })
      .then(
        (sessionCookie) => {
          // Set cookie policy for session cookie.
          const options = {
            maxAge: expiresIn,
            // Todo: set to real domain
            domain: "localhost",
            httpOnly: true,
            secure: true,
          };
          res.cookie("__session", sessionCookie, options);
          return resSuccessHandler(res, { sessionCookie }, "success");
        },
        (error) => {
          throw new ClientError("UNAUTHORIZED", 401, error);
        }
      );
  } catch (error) {
    resErrorHandler(res, error);
  }
};
