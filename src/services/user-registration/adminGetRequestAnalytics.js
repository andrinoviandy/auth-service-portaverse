const userRegistrationRepository = require("../../repositories/user-registration");

/**
 * Get user registration request analytics
 * @param {object} params - Parameters object (empty for now)
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - Analytics data with counts and percentages
 */
module.exports = async (params = {}, options = {}) => {
  const result = await userRegistrationRepository.getRequestAnalytics(
    params,
    options
  );

  return result;
};
