const { sequelize } = require("../../models");

const getWalletAdminDataByEmployeeId = async (employee_id) => {
  return await sequelize.query(
    `
SELECT
	tlwa.lms_wallet_admin_id,
	tlw.lms_wallet_id,
	tgm.group_master_id,
	te.firstname AS employee_name,
	tgm.name AS wallet_name
FROM
	tb_lms_wallet_admin tlwa
LEFT JOIN tb_employee te ON
	tlwa.employee_id = te.employee_id
LEFT JOIN tb_lms_wallet tlw ON
	tlwa.lms_wallet_id = tlw.lms_wallet_id
LEFT JOIN tb_group_master tgm ON
	tlw.group_master_id = tgm.group_master_id
WHERE
	tlwa.employee_id = :employee_id
GROUP BY
	tlwa.lms_wallet_admin_id
    `,
    {
      replacements: { employee_id },
      type: sequelize.QueryTypes.SELECT,
    }
  );
};

module.exports = {
  getWalletAdminDataByEmployeeId,
};
