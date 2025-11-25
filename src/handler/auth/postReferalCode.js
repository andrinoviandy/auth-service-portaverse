const { User } = require("./../../models");
const {
  sendGamificationPoint,
} = require("../../services/external/message_broker/producer");

module.exports = async (req, res) => {
  try {
    const { referal_code, referal_employee_id } = req.body;

    console.log(res.locals.user_id);

    const user = await User.findOne({
      attributes: ["user_id"],
      where: { user_id: res.locals.user_id },
    });

    user.referal_code = referal_code;
    user.referal_employee_id = referal_employee_id;

    await user.save();

    return res.status(200).send({
      success: true,
      data: {},
      message: "success",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({ success: false, message: "fails", error: error });
  }
};
