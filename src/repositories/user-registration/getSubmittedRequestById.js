const { selectQuery } = require("../../models");

/**
 * Get a submitted user registration request by ID
 * @param {object} params - Parameters object
 * @param {number} params.user_registration_id - User registration ID
 * @param {object} options - Options object
 * @param {object} options.transaction - Sequelize transaction object
 * @returns {object|null} - User registration data or null if not found
 */
module.exports = async (params = {}, options = {}) => {
  const { user_registration_id } = params;
  const { transaction } = options;

  const query = `
    SELECT 
      ur.user_registration_id,
      ur.employee_number AS nipp,
      ur.employee_name AS nama,
      ur.email,
      ur.birthplace AS tempat_lahir,
      ur.birthdate AS tanggal_lahir,
      ur.phone_number AS nomor_telepon,
      ur.superior_position_name AS jabatan_atasan,
      ur.superior_employee_name AS nama_atasan_langsung,
      ur.superior_employee_number AS nipp_atasan_langsung,
      ur.work_unit AS unit,
      ur.employee_status AS status_pekerja,
      ur.status,
      fp.link AS profile_picture_link,
      fid.link AS id_card_link,
      fsk.link AS decree_link
    FROM tb_user_registration ur
    LEFT JOIN tb_file fp ON ur.profile_picture_file_id = fp.file_id AND fp.deletedAt IS NULL
    LEFT JOIN tb_file fid ON ur.id_card_file_id = fid.file_id AND fid.deletedAt IS NULL
    LEFT JOIN tb_file fsk ON ur.sk_file_id = fsk.file_id AND fsk.deletedAt IS NULL
    WHERE ur.user_registration_id = :user_registration_id
      AND ur.status = 'SUBMITTED'
      AND ur.deletedAt IS NULL
    LIMIT 1
  `;

  const result = await selectQuery(query, {
    user_registration_id,
    transaction,
  });

  return result && result.length > 0 ? result[0] : null;
};
