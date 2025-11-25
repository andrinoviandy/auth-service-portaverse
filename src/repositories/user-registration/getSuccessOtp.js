const { selectQuery } = require("../../models");

/**
 * Get success OTP for a user registration
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - User registration ID
 * @param {string} params.email - User email
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object|null} - Success OTP data or null if not found
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId, email } = params;
  const { transaction } = options;

  const query = `
    SELECT 
      user_registration_otp_id,
      user_registration_id,
      otp_code,
      expired_at,
      sent_at,
      verification_status,
      createdAt,
      updatedAt,
      email
    FROM tb_user_registration_otp
    WHERE user_registration_id = :userRegistrationId
      AND email = :email
      AND verification_status = 'SUCCESS'
      AND deletedAt IS NULL
    ORDER BY createdAt DESC
    LIMIT 1
  `;

  const result = await selectQuery(
    query,
    { userRegistrationId, email },
    { transaction }
  );

  return result.length > 0 ? result[0] : null;
};
