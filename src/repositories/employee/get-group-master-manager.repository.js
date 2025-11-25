const {
  //  Employee, File, GroupMaster,
  sequelize,
} = require("../../models");

const getCorpuManagerByGroupMasterIdRepository = async (group_master_id) => {
  return await sequelize.query(
    `
SELECT
	tgm.group_master_id,
	tpmv2.position_master_id,
	te.employee_id AS manager_employee_id,
	tgm.name AS group_master_name,
	tpmv2.name AS position_master_name,
	te.firstname AS manager_name,
	te.employee_number as manager_employee_number
FROM
	tb_group_master tgm
LEFT JOIN tb_position_master_organization_sync tpmos ON
	tgm.group_master_id = tpmos.organization_master_id
	AND NOW() BETWEEN tpmos.start_date AND tpmos.end_date
LEFT JOIN tb_position_master_v2 tpmv2 ON
	tpmos.position_master_id = tpmv2.position_master_id
LEFT JOIN tb_position_master_variant tpmv ON
	tpmv2.position_master_id = tpmv.position_master_id
LEFT JOIN tb_employee_position_master_sync tepms ON
	tpmv.position_master_variant_id = tepms.position_master_variant_id
	AND NOW() BETWEEN tepms.start_date AND tepms.end_date
	AND tepms.lakhar_id IS NULL
	AND tepms.job_sharing_id IS NULL
LEFT JOIN tb_employee te ON
	tepms.employee_number = te.employee_number
WHERE
	1 = 1
	AND tpmv2.position_master_type_id = 5
	AND tgm.group_master_id = :group_master_id
GROUP BY
	tgm.group_master_id,
	tpmv2.position_master_id
LIMIT 1;
        `,
    {
      replacements: { group_master_id },
      type: sequelize.QueryTypes.SELECT,
    }
  );
};

const getGroupMasterByUserIdRepository = async (user_id) => {
  return await sequelize.query(
    `
        SELECT
          tgm.group_master_id,
          tpmv2.position_master_id,
          te.employee_id AS employee_id,
          tgm.name AS group_master_name,
          tgm.org_type,
          tpmv2.name AS position_master_name,
          te.firstname AS employee_name,
          te.employee_number as employee_number,
          tci.type_org
        FROM
          tb_group_master tgm
        LEFT JOIN tb_position_master_organization_sync tpmos ON
          tgm.group_master_id = tpmos.organization_master_id
          AND NOW() BETWEEN tpmos.start_date AND tpmos.end_date
        LEFT JOIN tb_position_master_v2 tpmv2 ON
          tpmos.position_master_id = tpmv2.position_master_id
        LEFT JOIN tb_position_master_variant tpmv ON
          tpmv2.position_master_id = tpmv.position_master_id
        LEFT JOIN tb_employee_position_master_sync tepms ON
          tpmv.position_master_variant_id = tepms.position_master_variant_id
          AND NOW() BETWEEN tepms.start_date AND tepms.end_date
          AND tepms.lakhar_id IS NULL
          AND tepms.job_sharing_id IS NULL
        LEFT JOIN tb_employee te ON
          tepms.employee_number = te.employee_number
        LEFT JOIN tb_user tu ON
          te.user_id = tu.user_id
        LEFT JOIN tb_company_in tci ON
          tgm.company_id = tci.company_in_id
        WHERE
          1 = 1
          AND tu.user_id = :user_id
        GROUP BY
          tgm.group_master_id,
          tpmv2.position_master_id
        LIMIT 1;
      `,
    {
      replacements: { user_id },
      type: sequelize.QueryTypes.SELECT,
    }
  );
};

const getTier1ForCabangAnperNonCluster = async (group_master_id) => {
  if (!group_master_id) return [];
  return await sequelize.query(
    `
    WITH RECURSIVE org_hierarchy AS (
      SELECT 
        tgm.group_master_id, 
        tgm.parent_id, 
        tgm.name, 
        tgm.org_level
      FROM tb_group_master tgm
      WHERE tgm.group_master_id = :group_master_id
      UNION ALL
      SELECT 
        tgm.group_master_id, 
        tgm.parent_id, 
        tgm.name, 
        tgm.org_level
      FROM tb_group_master tgm
      INNER JOIN org_hierarchy oh ON tgm.group_master_id = oh.parent_id
    )
    SELECT *
    FROM org_hierarchy
    WHERE parent_id IS NULL;
    `,
    {
      replacements: { group_master_id },
      type: sequelize.QueryTypes.SELECT,
    }
  );
};



module.exports = {
  getCorpuManagerByGroupMasterIdRepository,
  getGroupMasterByUserIdRepository,
  getTier1ForCabangAnperNonCluster
};
