const { selectQuery } = require("../../models");

/**
 * Get user registration by user_registration_id
 * @param {object} params - Parameters object
 * @param {number} params.userRegistrationId - User registration ID
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object|null} - User registration data or null if not found
 */
module.exports = async (params = {}, options = {}) => {
  const { userRegistrationId } = params;
  const { transaction } = options;

  const query = `
    SELECT 
      user_registration_id,
      employee_number,
      employee_name,
      email,
      is_email_verified,
      work_unit,
      employee_status,
      superior_employee_number,
      superior_employee_name,
      superior_position_name,
      firebase_account_uid,
      status,
      last_step,
      profile_picture_file_id,
      id_card_file_id,
      sk_file_id,
      phone_number,
      birthdate,
      birthplace,
      success_user_id,
      success_employee_id,
      rejected_at,
      rejected_by,
      rejection_notes,
      accepted_at,
      accepted_by,
      submitted_at,
      createdAt,
      updatedAt
    FROM tb_user_registration
    WHERE user_registration_id = :userRegistrationId
      AND deletedAt IS NULL
    LIMIT 1
  `;

  const result = await selectQuery(
    query,
    { userRegistrationId },
    { transaction }
  );

  return result.length > 0 ? result[0] : null;
};
