const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Create password for user registration
 * @req body contains user_registration_id (required) and password (required)
 */
module.exports = async (req, res) => {
  // Validate body parameters
  const { user_registration_id, password } = req.body;

  if (!user_registration_id) {
    throw new ValidationError("user_registration_id is required");
  }

  if (!password) {
    throw new ValidationError("password is required");
  }

  const userRegistrationId = parseInt(user_registration_id, 10);

  if (isNaN(userRegistrationId) || userRegistrationId <= 0) {
    throw new ValidationError("user_registration_id must be a valid number");
  }

  if (typeof password !== "string" || password.trim() === "") {
    throw new ValidationError("password must be a valid string");
  }

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle password creation
    const result = await userRegistrationService.createPassword(
      {
        userRegistrationId,
        password: password.trim(),
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
