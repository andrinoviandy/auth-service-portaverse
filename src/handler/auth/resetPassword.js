const { User } = require("./../../models");
const { firebaseAdmin } = require("../../services");
const { firebaseauth, firebaseappauth } = firebaseAdmin;
const {
  sendGamificationPoint,
} = require("../../services/external/message_broker/producer");

module.exports = async (req, res) => {
  const params = req.body;
  let dev;
  let emails = [];
  if (Array.isArray(params.email)) {
    emails = params.email;
  } else {
    emails.push(params.email);
  }

  try {
    for (let index = 0; index < emails.length; index++) {
      const email = emails[index];

      // Send email verif
      await firebaseauth
        .sendPasswordResetEmail(firebaseappauth, email)
        .catch((error) => {
          dev = error;
          console.log(error);
        });
    }
    if (dev) {
      return res.status(500).send({
        success: false,
        message: "Sending reset link fails",
        dev: dev,
      });
    }

    return res.status(200).send({
      success: true,
      data: {},
      message: "success",
    });
  } catch (error) {
    res.status(500).send({ success: false, message: "fails", error: error });
  }
};
