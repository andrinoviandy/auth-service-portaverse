const { selectQuery } = require("../../models");

/**
 * Get employee from tb_employee by employee_number where deletedAt is null
 * @param {object} params - Parameters object
 * @param {string} params.employeeNumber - Employee number (NIPP)
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object|null} - Employee data or null if not found
 */
module.exports = async (params = {}, options = {}) => {
  const { employeeNumber } = params;
  const { transaction } = options;

  const query = `
    SELECT 
      employee_id,
      employee_number,
      firstname,
      middlename,
      lastname
    FROM tb_employee
    WHERE employee_number = :employeeNumber
      AND deletedAt IS NULL
    LIMIT 1
  `;

  const result = await selectQuery(query, { employeeNumber }, { transaction });

  return result.length > 0 ? result[0] : null;
};
