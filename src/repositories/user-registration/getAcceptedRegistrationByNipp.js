const { selectQuery } = require("../../models");

/**
 * Get ACCEPTED user registration by employee_number
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
      status
    FROM tb_user_registration
    WHERE employee_number = :employeeNumber
      AND status = 'ACCEPTED'
      AND deletedAt IS NULL
    LIMIT 1
  `;

  const result = await selectQuery(query, { employeeNumber }, { transaction });

  return result.length > 0 ? result[0] : null;
};
