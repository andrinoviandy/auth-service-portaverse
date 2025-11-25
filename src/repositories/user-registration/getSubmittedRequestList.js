const { QueryBuilder } = require("../QueryBuilder");

/**
 * Get submitted user registration requests list with pagination and search
 * @param {object} params - Parameters object
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.size - Page size (default: 10)
 * @param {string} params.search - Search term for employee name
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object} - { data, dataCount, pageCount }
 */
module.exports = async (params = {}, options = {}) => {
  const { page = 1, size = 10, search = "" } = params;
  const { transaction } = options;

  const baseQuery = `
    SELECT 
      ur.user_registration_id,
      ur.employee_number AS nipp,
      ur.employee_name AS nama,
      ur.submitted_at,
      ur.employee_status AS status_pekerja,
      ur.work_unit AS unit_kerja,
      ur.superior_position_name AS jabatan_atasan_langsung,
      f.link AS profile_picture_link
    FROM tb_user_registration ur
    LEFT JOIN tb_file f ON ur.profile_picture_file_id = f.file_id AND f.deletedAt IS NULL
    WHERE ur.status = 'SUBMITTED'
      AND ur.deletedAt IS NULL
      ${search ? "AND ur.employee_name LIKE :search" : ""}
    ORDER BY ur.submitted_at DESC
  `;

  const queryBuilder = new QueryBuilder();
  queryBuilder
    .setQuery(baseQuery, {
      flatQuery: true,
      count: {
        by: null,
        distinct: false,
      },
    })
    .setReplacement({ search: `%${search}%` })
    .setPagination({ page: parseInt(page), size: parseInt(size) });

  if (transaction) {
    queryBuilder.setTransaction(transaction);
  }

  return await queryBuilder.execute();
};
