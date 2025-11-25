const { selectQuery } = require("../../models");

/**
 * Get user registration by employee_number (any status except ACCEPTED)
 * @param {object} params - Parameters object
 * @param {string} params.employeeNumber - Employee number (NIPP)
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object|null} - User registration data or null if not found
 */
module.exports = async (params = {}, options = {}) => {
  const { employeeNumber } = params;
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
    WHERE employee_number = :employeeNumber
      AND deletedAt IS NULL
    LIMIT 1
  `;

  const result = await selectQuery(query, { employeeNumber }, { transaction });

  return result.length > 0 ? result[0] : null;
};
