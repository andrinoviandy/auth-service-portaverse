const { selectQuery } = require("../../models")

const getEmployeePositionHistoryV2Repository = async (
  filter = {},
  options = {}
) => {
  const query = `
    SELECT
      tepms.employee_number,
      tepms.start_date,
      tepms.end_date,
      IF(NOW() BETWEEN tepms.start_date AND tepms.end_date,
      1,
      0) AS is_active,
      tpm.name AS position_name,
      tpm.position_master_id,
      tpm.job_class_level,
      GROUP_CONCAT(tjf.name SEPARATOR ', ') AS job_function_name,
      tci.name AS company_name,
      tgm.name AS group_name,
      tgm.group_master_id,
      tgm.parent_id
    FROM
      tb_employee_position_master_sync tepms
    LEFT JOIN tb_position_master_variant tpmv ON
      tpmv.position_master_variant_id = tepms.position_master_variant_id
    LEFT JOIN tb_position_master_v2 tpm ON
      tpm.position_master_id = tpmv.position_master_id
    LEFT JOIN tb_position_master_organization_sync tpmos ON
      tpmos.position_master_id = tpm.position_master_id
      AND NOW() BETWEEN tpmos.start_date AND tpmos.end_date
    LEFT JOIN tb_group_master tgm ON
      tgm.group_master_id = tpmos.organization_master_id
    LEFT JOIN tb_company_in tci ON
      tci.company_in_id = tgm.company_id
    LEFT JOIN tb_job_function_position_master tjfpm ON
      tjfpm.position_master_id = tpm.position_master_id
    LEFT JOIN tb_job_function tjf ON
      tjf.job_function_id = tjfpm.job_function_id
    WHERE 1=1
        AND tepms.employee_number = :employee_number
        AND tepms.start_date <= CURRENT_DATE()
        AND tepms.end_date > CURRENT_DATE()
        AND tepms.job_sharing_id IS NULL
        AND tepms.lakhar_id IS NULL
    GROUP BY
      tepms.employee_position_master_sync_id
    ORDER BY
      tepms.end_date DESC
  `;



  const result = await selectQuery(query, {
    employee_number: filter?.employee_number
  });

  return result;
};

module.exports = getEmployeePositionHistoryV2Repository;
