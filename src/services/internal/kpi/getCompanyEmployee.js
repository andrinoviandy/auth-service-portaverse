const { selectQuery } = require("../../../models");
const dateToTwFilter = require("../../../repositories/kpi/dateToTwFilter");

module.exports = async ({ employeeNumbers, year, periode }) => {
  if (!employeeNumbers?.length) {
    return [];
  }
  const result = await selectQuery(
    `
    SELECT 
        tci.company_in_id,
        tepms.employee_number 
    FROM tb_company_in tci
    LEFT JOIN tb_group_master tgm ON tgm.company_id  = tci.company_in_id ${
      year && periode
        ? `AND ${dateToTwFilter.query({
            tbAlias: "tgm",
            begdaField: "start_date",
            endaField: "end_date",
          })}`
        : `
        AND NOW() >= tgm.start_date
        AND (NOW() <= tgm.end_date OR tgm.end_date IS NULL)
        `
    }
    LEFT JOIN tb_position_master_organization_sync tpmos ON tpmos.organization_master_id = tgm.group_master_id ${
      year && periode
        ? `AND ${dateToTwFilter.query({
            tbAlias: "tpmos",
            begdaField: "start_date",
            endaField: "end_date",
          })}`
        : `
        AND NOW() >= tpmos.start_date
        AND (NOW() <= tpmos.end_date OR tpmos.end_date IS NULL)
        `
    }
    LEFT JOIN tb_position_master_v2 tpm ON tpm.position_master_id = tpmos.position_master_id ${
      year && periode
        ? `AND ${dateToTwFilter.query({
            tbAlias: "tpm",
            begdaField: "start_date",
            endaField: "end_date",
          })}`
        : `
        AND NOW() >= tpm.start_date
        AND (NOW() <= tpm.end_date OR tpm.end_date IS NULL)
        `
    }
    LEFT JOIN tb_position_master_variant tpmv ON tpmv.position_master_id = tpm.position_master_id 
    LEFT JOIN tb_employee_position_master_sync tepms ON tepms.position_master_variant_id = tpmv.position_master_variant_id 
    AND tepms.deletedAt IS NULL
    ${
      year && periode
        ? `AND ${dateToTwFilter.query({
            tbAlias: "tepms",
            begdaField: "start_date",
            endaField: "end_date",
          })}`
        : `
        AND NOW() >= tepms.start_date
        AND (NOW() <= tepms.end_date OR tepms.end_date IS NULL)
        `
    }
    WHERE 1 = 1
    AND tepms.employee_number IN (:employeeNumbers)
    ${
      year && periode
        ? `AND ${dateToTwFilter.query({
            tbAlias: "tci",
            begdaField: "start_date",
            endaField: "end_date",
          })}`
        : `
        AND NOW() >= tci.start_date
        AND (NOW() <= tci.end_date OR tci.end_date IS NULL)
        `
    }
    `,
    {
      employeeNumbers,
      year,
      periode,
    }
  );

  return result;
};
