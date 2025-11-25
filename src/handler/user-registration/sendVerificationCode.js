const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Send OTP verification code to user's email
 * @req body contains user_registration_id (required)
 */
module.exports = async (req, res) => {
  // Validate body parameter
  const { user_registration_id, email } = req.body;

  if (!user_registration_id) {
    throw new ValidationError("user_registration_id is required");
  }

  const userRegistrationId = parseInt(user_registration_id, 10);

  if (isNaN(userRegistrationId) || userRegistrationId <= 0) {
    throw new ValidationError("user_registration_id must be a valid number");
  }

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle sending verification code
    const result = await userRegistrationService.sendVerificationCode(
      { userRegistrationId, email },
      { transaction }
    );

    // Commit transaction
    await transaction.commit();

    return resSuccessHandler(res, result, "Success");
  } catch (error) {
    // Rollback transaction on error
    await transaction.rollback();
    return resErrorHandler(res, error);
  }
};
