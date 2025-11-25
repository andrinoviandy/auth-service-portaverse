const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const userRegistrationService = require("../../services/user-registration");

/**
 * Get list of submitted user registration requests (admin endpoint)
 * @req query contains page, size, search
 */
module.exports = async (req, res) => {
  try {
    const { page = 1, size = 10, search = "" } = req.query;

    const result = await userRegistrationService.adminGetListRequest({
      page,
      size,
      search,
    });

    return resSuccessHandler(res, result, "Success");
  } catch (error) {
    return resErrorHandler(res, error);
  }
};
