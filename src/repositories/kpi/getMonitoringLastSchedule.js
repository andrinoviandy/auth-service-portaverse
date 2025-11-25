const NotFoundError = require("../../commons/exceptions/NotFoundError");
const { selectQuery } = require("../../models");

module.exports = async () => {
  const result = await selectQuery(`
        SELECT * FROM tb_kpi_monitoring_status tkms 
        WHERE 1 = 1
        AND tkms.time_start <= CURRENT_TIMESTAMP 
        AND type = 'MONITORING'
        ORDER BY tkms.time_start DESC
        LIMIT 1
    `).then((e) => e?.[0]);

  if (!result) {
    throw NotFoundError("Couldn't find last kpi monitoring schedule");
  }

  return result;
};
