const userRegistrationRepository = require("../../repositories/user-registration");
const getLink = require("../../commons/helpers/getLink");
const NotFoundError = require("../../commons/exceptions/NotFoundError");

/**
 * Get a submitted user registration request by ID
 * @param {object} params - Parameters object
 * @param {number} params.user_registration_id - User registration ID
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - User registration data
 */
module.exports = async (params = {}, options = {}) => {
  const { user_registration_id } = params;

  const result = await userRegistrationRepository.getSubmittedRequestById(
    { user_registration_id },
    options
  );

  if (!result) {
    throw new NotFoundError(
      "User registration request not found or not in SUBMITTED status"
    );
  }

  // Process the data to format file links
  const processedResult = {
    ...result,
    profile_picture: getLink(result.profile_picture_link),
    id_card: getLink(result.id_card_link),
    decree: getLink(result.decree_link),
  };

  // Remove the raw link fields
  const { profile_picture_link, id_card_link, decree_link, ...finalResult } =
    processedResult;

  return finalResult;
};
