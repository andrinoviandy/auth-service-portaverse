const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Check NIPP (employee_number) and handle user registration
 * @req query contains employee_number (required)
 */
module.exports = async (req, res) => {
  // Validate query parameter
  const { employee_number } = req.query;

  if (!employee_number) {
    throw new ValidationError("employee_number is required");
  }

  if (typeof employee_number !== "string" || employee_number.trim() === "") {
    throw new ValidationError("employee_number must be a valid string");
  }

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle the check-nipp logic
    const result = await userRegistrationService.checkNipp(
      { employeeNumber: employee_number.trim() },
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
