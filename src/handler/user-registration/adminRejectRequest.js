const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Admin reject user registration request
 * @req body contains user_registration_id and rejection_notes
 */
module.exports = async (req, res) => {
  const { user_registration_id, rejection_notes } = req.body;

  // Validate body parameters
  if (!user_registration_id) {
    return resErrorHandler(
      res,
      new ValidationError("user_registration_id is required")
    );
  }

  if (!rejection_notes) {
    return resErrorHandler(
      res,
      new ValidationError("rejection_notes is required")
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
  const rejectedBy = res.locals.user_id || 0;

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle rejection
    const result = await userRegistrationService.adminRejectRequest(
      {
        userRegistrationId,
        rejectionNotes: rejection_notes,
        rejectedBy,
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
