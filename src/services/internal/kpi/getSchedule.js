const DBQuery = require("../../../../repositories/DBQuery.repositories");
const getCompanyClusterEmployee = require("../company_cluster/getCompanyClusterEmployee");

module.exports = async ({
  kpi_schedule_id,
  company_cluster_id,
  year,
  periode,
  currentScheduleOnly = false,
  page,
  size,
  excludeCount,
  employeeNumber,
  search,
}) => {
  if (employeeNumber) {
    company_cluster_id = await getCompanyClusterEmployee({
      employeeNumbers: [employeeNumber],
      year,
      periode,
    }).then((e) => e?.[0]?.company_cluster_id);
  }

  const query = `
  SELECT 
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
  WHERE 1 = 1 
  ${
    company_cluster_id
      ? "AND (tkvs.company_cluster_id = :company_cluster_id OR tkvs.company_cluster_id IS NULL)"
      : "AND tkvs.company_cluster_id IS NULL"
  }
  ${
    currentScheduleOnly
      ? `AND tkvs.time_start <= NOW() AND tkvs.time_end >= NOW()`
      : ""
  }
  ${year ? "AND tkvs.year = :year" : ""}
  ${periode ? "AND tkvs.periode = :periode" : ""}
  ${search ? "AND tkvs.name LIKE :search" : ""}
  ORDER BY tkvs.company_cluster_id DESC, tkvs.time_start DESC
  `;

  const dbQuery = new DBQuery(query, {
    company_cluster_id,
    year,
    periode,
    search: `%${search}%`,
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
