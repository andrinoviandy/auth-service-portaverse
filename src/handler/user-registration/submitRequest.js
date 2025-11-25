const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const ValidationError = require("../../commons/exceptions/ValidationError");
const userRegistrationService = require("../../services/user-registration");
const { sequelize } = require("../../models");

/**
 * Submit user registration request with file uploads
 * @req body contains user_registration_id (required)
 * @req files contains profile_picture, id_card, and decree (as array from upload.any())
 */
module.exports = async (req, res) => {
  // Validate body parameters
  const { user_registration_id } = req.body;

  if (!user_registration_id) {
    throw new ValidationError("user_registration_id is required");
  }

  const userRegistrationId = parseInt(user_registration_id, 10);

  if (isNaN(userRegistrationId) || userRegistrationId <= 0) {
    throw new ValidationError("user_registration_id must be a valid number");
  }

  // Validate files
  if (!req.files || req.files.length === 0) {
    throw new ValidationError("Files are required");
  }

  // Convert files array to object keyed by fieldname for easier access
  const filesObject = {};
  req.files.forEach((file) => {
    filesObject[file.fieldname] = [file];
  });

  // Check for required files
  if (
    !filesObject.profile_picture ||
    !filesObject.id_card ||
    !filesObject.decree
  ) {
    throw new ValidationError(
      "All three files are required: profile_picture, id_card, decree"
    );
  }

  const transaction = await sequelize.transaction();

  try {
    // Call service to handle submission
    const result = await userRegistrationService.submitRequest(
      {
        userRegistrationId,
        files: filesObject,
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
