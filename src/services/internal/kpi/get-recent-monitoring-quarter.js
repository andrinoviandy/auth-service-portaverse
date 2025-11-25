const { selectQuery } = require("../../../models");

module.exports = async () => {
  const recent_monitoring_quarter = await selectQuery(
    `SELECT
      tkvs.kpi_schedule_id AS monitoring_id,
      tkvs.periode,
      tkvs.year,
      tkvs.type,
      tkvs.time_start,
      tkvs.time_end,
      tkvs.createdAt,
      tkvs.updatedAt,
      -- te.firstname AS created_by_employee,
      te2.firstname AS updated_by_employee
    FROM tb_kpi_v2_schedule tkvs
    -- LEFT JOIN tb_user tu ON tu.user_id = tkvs.createdBy
    -- LEFT JOIN tb_employee te ON te.user_id = tu.user_id
    LEFT JOIN tb_user tu2 ON tu2.user_id = tkvs.updatedBy
    LEFT JOIN tb_employee te2 ON te2.user_id = tu2.user_id
    WHERE
      tkvs.type = 'MONITORING'
    ORDER BY time_end DESC
    LIMIT 1`
  );

  return recent_monitoring_quarter[0];
};
