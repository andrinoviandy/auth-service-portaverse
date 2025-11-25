const validateNotNullArrAndNonArr = require("../../../commons/helpers/validateArrAndNonArr");
const DBQuery = require("../../../repositories/DBQuery.repositories");
const bottomToUpCompany = require("../../../repositories/kpi/bottomToUpCompany");
const getCompanyEmployee = require("./getCompanyEmployee");

module.exports = async ({
  kpi_schedule_id,
  company_in_id,
  exact_company_filter,
  year,
  periode,
  currentScheduleOnly = false,
  page,
  size,
  excludeCount,
  employeeNumber,
}) => {
  if (employeeNumber) {
    company_in_id = await getCompanyEmployee({
      employeeNumbers: [employeeNumber],
      year,
      periode,
    }).then((e) => e?.[0]?.company_in_id);
  }

  const isExistCompany = validateNotNullArrAndNonArr(company_in_id);

  const query = `
  ${isExistCompany ? bottomToUpCompany.query() : ""}
  SELECT
    ${
      isExistCompany
        ? `
    cbtuc.company_in_id,
    `
        : ""
    }
    tci.name AS company_name,
    tkvs.company_id,
    tkvs.kpi_schedule_id,
    tkvs.name,
    tkvs.company_cluster_id,
    tkvs.periode, 
    tkvs.year, 
    tkvs.type, 
    tkvs.time_start, 
    tkvs.time_end,
    tkvs.createdAt,
    tkvs.updatedAt,
    te2.firstname AS updated_by_employee
  FROM tb_kpi_v2_schedule tkvs  
  LEFT JOIN tb_user tu2 ON tu2.user_id = tkvs.updatedBy
  LEFT JOIN tb_employee te2 ON te2.user_id = tu2.user_id
  LEFT JOIN tb_company_in tci ON tci.company_in_id = tkvs.company_id
  ${
    isExistCompany
      ? `
      LEFT JOIN cte_bottom_to_up_company cbtuc ON cbtuc.company_in_id = tkvs.company_id 
  `
      : ""
  }
  WHERE 1 = 1 
  ${
    isExistCompany
      ? `
      AND ((cbtuc.company_in_id IS NOT NULL AND tkvs.company_id IS NOT NULL) OR (cbtuc.company_in_id IS NULL AND tkvs.company_id IS NULL))
      ${exact_company_filter ? `AND tkvs.company_id IN (:company_in_id)` : ""}
  `
      : "AND tkvs.company_id IS NULL"
  }
  ${
    currentScheduleOnly
      ? `AND tkvs.time_start <= NOW() AND tkvs.time_end >= NOW()`
      : ""
  }
  ${year ? "AND tkvs.year = :year" : ""}
  ${periode ? "AND tkvs.periode = :periode" : ""}
  ${kpi_schedule_id ? "AND tkvs.kpi_schedule_id = :kpi_schedule_id" : ""}
  GROUP BY kpi_schedule_id
  ORDER BY ${
    isExistCompany ? `cbtuc.company_in_id DESC,` : ""
  } tkvs.time_start DESC
  `;

  const dbQuery = new DBQuery(query, {
    company_in_id,
    year,
    periode,
    kpi_schedule_id,
  });

  const schedules = await dbQuery.execute({
    limit: +size,
    offset: (+page - 1) * +size,
  });

  let count;
  if (!excludeCount) {
    count = await dbQuery.getCount().then((e) => e?.[0]?.count);
  }

  return [schedules, count];
};
