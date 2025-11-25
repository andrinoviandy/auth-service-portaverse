const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Admin accept user registration request
 * @req body contains user_registration_id
 */
module.exports = async (req, res) => {
  const { user_registration_id } = req.body;

  // Validate body parameters
  if (!user_registration_id) {
    return resErrorHandler(
      res,
      new ValidationError("user_registration_id is required")
    );
  }

  const userRegistrationId = parseInt(user_registration_id, 10);

  if (isNaN(userRegistrationId) || userRegistrationId <= 0) {
    return resErrorHandler(
      res,
      new ValidationError("user_registration_id must be a valid number")
    );
  }

  // Get user_id from middleware (res.locals). 0 is for system actions
  const acceptedBy = res.locals.user_id || 0;
  const acceptedByEmployeeId = res.locals.employee_id || null;

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle acceptance
    const result = await userRegistrationService.adminAcceptRequest(
      {
        userRegistrationId,
        acceptedBy,
        acceptedByEmployeeId,
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
