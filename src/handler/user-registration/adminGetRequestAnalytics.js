const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const userRegistrationService = require("../../services/user-registration");

/**
 * Get user registration request analytics (admin endpoint)
 * @req no query parameters required
 */
module.exports = async (req, res) => {
  try {
    const result = await userRegistrationService.adminGetRequestAnalytics();

    return resSuccessHandler(res, result, "Success");
  } catch (error) {
    return resErrorHandler(res, error);
  }
};
