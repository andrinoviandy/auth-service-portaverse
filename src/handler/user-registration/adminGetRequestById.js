const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const userRegistrationService = require("../../services/user-registration");

/**
 * Get a submitted user registration request by ID (admin endpoint)
 * @req query contains user_registration_id
 */
module.exports = async (req, res) => {
  try {
    const { user_registration_id } = req.query;

    if (!user_registration_id) {
      return resErrorHandler(res, {
        statusCode: 400,
        message: "User registration ID is required",
      });
    }

    const result = await userRegistrationService.adminGetRequestById({
      user_registration_id,
    });

    return resSuccessHandler(res, result, "Success");
  } catch (error) {
    return resErrorHandler(res, error);
  }
};
