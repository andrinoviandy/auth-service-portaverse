const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const { ClientError } = require("../../commons/exceptions/ClientError");
const { checkSso } = require("../../commons/helpers/jwt");
const getUidUser = require("../../services/internal/getUidUser");
const { selectQuery } = require("../../models")
const getFinalScoreKpiInternalServices = require("../../services/internal/kpi/getFinalScore.kpi.internal.services");
const getScheduleCompanyParent = require("../../services/internal/kpi/getScheduleCompanyParent");
const getRecentMonitoringQuarter = require("../../services/internal/kpi/get-recent-monitoring-quarter");
const { getTotalByEmployeeId } = require("../../repositories/learning-hour");

function formatLearningHours(seconds) {
  const {
    hours: h,
    minutes: m,
    seconds: s,
  } = secondstoHoursMinutes(seconds);
  let result = "";

  if (h > 0) {
    result += `${h} Jam `;
  }

  result += `${m} Menit `;

  return result;
}

module.exports = async (req, res) => {
  try {
    const { nip, year, periode } = req.query;
    const employee_number = nip;

    const dataUser = await getUidUser(employee_number);

    let { schedules: open_quarter_period } = await getScheduleCompanyParent({
      employee_number,
      excludeCount: 1,
      page: 1,
      size: 1,
    });

    open_quarter_period = open_quarter_period?.[0];
    
    if (open_quarter_period?.type !== "MONITORING") {
      open_quarter_period = await getRecentMonitoringQuarter();
    }
    
    const static_score = await selectQuery(
      `
        WITH max_year_typ AS (
          SELECT MAX(year) AS max_year FROM tb_yearly_performance
          WHERE (final_score IS NOT NULL AND final_score > 0)
        )
        SELECT
          typ.employee_number,
          typ.year,
          typ.kpi_score AS kpi_final_score,
          typ.assessment_score,
          typ.final_score
        FROM
          tb_yearly_performance typ
        WHERE
          typ.employee_number = :employee_number
          ${year
        ? "AND typ.year = :year"
        : "AND typ.year = (SELECT myt.max_year FROM max_year_typ myt)"
      }
    `,
      {
        employee_number,
        year,
      }
    ).then((e) => e?.[0]);

    const { kpis } = await getFinalScoreKpiInternalServices({
      page: 1,
      size: 1,
      employee_number,
      year: year || open_quarter_period?.year,
      periode: periode || open_quarter_period?.periode,
      excludeCount: 1,
    });

    const assessment_score = await selectQuery(
      `
    WITH latest_akhlak_assessment AS (
      SELECT ta.assessment_id FROM tb_assessment ta
      WHERE ta.time_start <= CURRENT_TIMESTAMP
      AND ta.type = 'AKHLAK'
      ORDER BY ta.time_start DESC
      LIMIT 1
    )
    SELECT
        CASE
            WHEN ((taa.final_score * 6) / 100) = 1 THEN 40
            WHEN ((taa.final_score * 6) / 100) = 2 THEN 60
            WHEN ((taa.final_score * 6) / 100) = 3 THEN 80
            WHEN ((taa.final_score * 6) / 100) = 4 THEN 90
            WHEN ((taa.final_score * 6) / 100) = 5 THEN 105
            WHEN ((taa.final_score * 6) / 100) = 6 THEN 110
            WHEN ROUND(((taa.final_score * 6) / 100), 2) BETWEEN 1.00 AND 1.99 THEN 40 + (((taa.final_score * 6) / 100) - 1) * (60 - 40)
            WHEN ROUND(((taa.final_score * 6) / 100), 2) BETWEEN 2.00 AND 2.99 THEN 60 + (((taa.final_score * 6) / 100) - 2) * (80 - 60)
            WHEN ROUND(((taa.final_score * 6) / 100), 2) BETWEEN 3.00 AND 3.99 THEN 80 + (((taa.final_score * 6) / 100) - 3) * (90 - 80)
            WHEN ROUND(((taa.final_score * 6) / 100), 2) BETWEEN 4.00 AND 4.99 THEN 90 + (((taa.final_score * 6) / 100) - 4) * (105 - 90)
            WHEN ROUND(((taa.final_score * 6) / 100), 2) BETWEEN 5.00 AND 6.00 THEN 105 + (((taa.final_score * 6) / 100) - 5) * (110 - 105)
            ELSE 0
        END AS skor_konversi,
        taa.employee_number,
        taa.createdAt,
        taa.assessment_id
    FROM
        tb_assessment_assignment taa
    WHERE 1 = 1
      AND taa.assessment_id = (SELECT assessment_id FROM latest_akhlak_assessment)
      AND taa.employee_number = :employee_number
      GROUP BY taa.employee_number
      LIMIT 1
    `,
      {
        employee_number,
      }
    );

    const calculatedScore =
      static_score?.final_score ||
      (kpis?.[0]?.result?.score || 0) * 0.8 +
      (assessment_score?.[0]?.skor_konversi || 0) * 0.2;

    const raw_learning_hours = await getTotalByEmployeeId({ employee_id: dataUser?.employee_id });

    const learning_hours = raw_learning_hours[0]?.learning_hours;

    if (!open_quarter_period) {
      throw new ClientError("KPI Schedules Not Found");
    }

    const formatted_period = `TW 0${open_quarter_period?.periode} - ${open_quarter_period?.year}`;

    return resSuccessHandler(res, {
      kpi_score: calculatedScore?.toFixed(2) || 0,
      learning_hours_score: learning_hours ? formatLearningHours(learning_hours) : 0,
      batas_waktu_kpi: open_quarter_period?.time_end,
      label_batas_waktu_kpi: formatted_period
    });
  } catch (error) {
    // Tangani error (misal dari NotFoundError)
    return resErrorHandler(res, error);
  }
};
