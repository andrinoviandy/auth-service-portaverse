const { firebaseAdmin } = require("../../services");
const { firebaseauth, firebaseappauth } = firebaseAdmin;
const { User } = require("../../models");
const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ClientError = require("../../commons/exceptions/ClientError");

/**
 * Add user to firebase app and to records
 * @req body contains email and password
 */
module.exports = async (req, res) => {
  const params = req.body;
  let uid = null;
  let errors;

  try {
    // Add to Firebase
    await firebaseauth
      .createUserWithEmailAndPassword(
        firebaseappauth,
        params.email,
        params.password ?? `kms-default-password-${new Date().getTime()}`
      )
      .then((userCredential) => {
        uid = userCredential.user.uid;
      })
      .catch((error) => {
        errors = error;
        uid = false;
      });
    if (errors?.code === "auth/email-already-in-use") {
      throw new ClientError("Email already exist");
    }
    if (!uid) {
      res.status(500).send({
        success: false,
        message: "Creating user in firebase fails",
        error: errors,
      });
      return;
    }

    // Add user in db
    const addUser = await User.create({
      email: params.email,
      role_code: params.role_code,
      uid: uid,
    });

    return resSuccessHandler(res, addUser, "success");
  } catch (error) {
    return resErrorHandler(res, error);
  }
};
