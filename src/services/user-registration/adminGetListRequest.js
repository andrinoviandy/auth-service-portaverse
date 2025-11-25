const userRegistrationRepository = require("../../repositories/user-registration");
const getLink = require("../../commons/helpers/getLink");

/**
 * Get list of submitted user registration requests
 * @param {object} params - Parameters object
 * @param {number} params.page - Page number
 * @param {number} params.size - Page size
 * @param {string} params.search - Search term
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - { data, dataCount, pageCount }
 */
module.exports = async (params = {}, options = {}) => {
  const { page = 1, size = 10, search = "" } = params;

  const result = await userRegistrationRepository.getSubmittedRequestList(
    { page, size, search },
    options
  );

  // Process the data to format profile picture links
  if (result.data && Array.isArray(result.data)) {
    result.data = result.data.map((item) => ({
      ...item,
      profile_picture: getLink(item.profile_picture_link),
    }));

    // Remove the raw profile_picture_link field
    result.data = result.data.map((item) => {
      const { profile_picture_link, ...rest } = item;
      return rest;
    });
  }

  return result;
};
