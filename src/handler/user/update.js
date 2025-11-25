const { User } = require("../../models");
const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
// const { firebaseAdmin } = require("../../../services");
// const { adminAuth } = firebaseAdmin;
const NotFoundError = require("../../commons/exceptions/NotFoundError");
const { adminAuth } = require("../../services/firebase.admin");

/**
 * Update user from firebase app and records
 *
 */
module.exports = async (req, res) => {
  const payload = req.body;
  const uid = res.locals.uid;
  try {
    const currentUser = await User.findOne({ where: { uid } });
    if (!currentUser) throw new NotFoundError("User not found");

    //  -------- firebase change email
    if (currentUser.email !== payload?.email) {
      await adminAuth.auth().updateUser(uid, {
        email: payload.email,
      });
    }

    const dbResult = await User.update({ ...payload }, { where: { uid } });
    return resSuccessHandler(res, dbResult, "success");
  } catch (error) {
    return resErrorHandler(res, error);
  }
};
