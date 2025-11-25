const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Verify OTP verification code
 * @req body contains user_registration_id (required) and verification_code (required)
 */
module.exports = async (req, res) => {
  // Validate body parameters
  const { user_registration_id, verification_code } = req.body;

  if (!user_registration_id) {
    throw new ValidationError("user_registration_id is required");
  }

  if (!verification_code) {
    throw new ValidationError("verification_code is required");
  }

  const userRegistrationId = parseInt(user_registration_id, 10);

  if (isNaN(userRegistrationId) || userRegistrationId <= 0) {
    throw new ValidationError("user_registration_id must be a valid number");
  }

  if (
    typeof verification_code !== "string" ||
    verification_code.trim() === ""
  ) {
    throw new ValidationError("verification_code must be a valid string");
  }

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle OTP verification
    const result = await userRegistrationService.verifyOtp(
      {
        userRegistrationId,
        verificationCode: verification_code.trim(),
      },
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
