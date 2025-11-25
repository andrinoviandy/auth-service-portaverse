const DBQuery = require("../../../repositories/DBQuery.repositories");
const getFinalScoreKpiRepositories = require("../../../repositories/kpi/getFinalScore.kpi.repositories");
const getFinalScoreJobSharing = require("../../../repositories/kpi/getFinalScoreJobSharing.kpi.repositories");
const toMapIdAsKey = require("../../../commons/mocks/toMapIdAsKey");

const getJobSharingFinalScores = async ({ employee_number, periode, year }) => {
  const finalScoreJobSharingQuery = getFinalScoreJobSharing.query({
    isJobSharing: true,
  });

  const dbQueryJobSharing = new DBQuery(finalScoreJobSharingQuery, {
    employee_number: Array.isArray(employee_number)
      ? employee_number
      : [employee_number],
    periode,
    year,
  });

  const resultScoreJobSharing = await dbQueryJobSharing.execute();

  // from job sharing
  const finalScoreFromJobSharingQuery = getFinalScoreJobSharing.query({
    isFromJobSharing: true,
  });

  const dbQueryFromJobSharing = new DBQuery(finalScoreFromJobSharingQuery, {
    employee_number: Array.isArray(employee_number)
      ? employee_number
      : [employee_number],
    periode,
    year,
  });
  const resultScoreFromJobSharing = await dbQueryFromJobSharing.execute();

  return toMapIdAsKey(
    [].concat(
      resultScoreJobSharing.map((e) => ({ ...e, is_from_job_sharing: false })),
      resultScoreFromJobSharing.map((e) => ({
        ...e,
        is_from_job_sharing: true,
      }))
    ),
    "employee_number",
    "Array"
  );
};

const calculateAllFinalScores = async ({
  jobSharingFinalScores = {},
  definitiveFinalScores = [],
}) => {
  const returnedKpis = [];
  for (const employee of definitiveFinalScores) {
    const jobSharingScore = (
      jobSharingFinalScores[employee?.employee_number] || []
    ).filter((e) => !e.is_from_job_sharing);

    const totalJobSharing = jobSharingScore?.length;

    const isAllJobSharingScoreMoreThan90 = jobSharingScore.every(
      (e) => e.total_score >= 90
    );
    const isDefinitiveScoreMoreThan90 = employee.result.score >= 90;

    let finalScore;
    if (totalJobSharing) {
      // hitung skor akhir semua job sharing berdasarkan bobot bulanan
      const totalJobSharingScore = jobSharingScore.reduce((acc, curr) => {
        const newScore =
          ((curr.total_score || 0) * (curr.total_months || 0)) / 3 +
          ((employee.result.score || 0) * (3 - (curr.total_months || 0))) / 3;
        return acc + newScore;
      }, 0);

      finalScore =
        (totalJobSharingScore + employee.result.score) / (totalJobSharing + 1);

      if (isAllJobSharingScoreMoreThan90 && isDefinitiveScoreMoreThan90)
        finalScore += 10;
    } else {
      finalScore = employee?.result?.score || 0;
    }

    returnedKpis.push({
      ...employee,
      result: {
        ...employee.result,
        score: finalScore,
        is_plus_ten:
          isAllJobSharingScoreMoreThan90 && isDefinitiveScoreMoreThan90,
        job_sharing_scores: jobSharingScore.map((e) => {
          return {
            total_score: e?.total_score || 0,
            total_months: e?.total_months || 0,
            begda: e?.begda,
            enda: e?.enda,
            display_begda: e?.display_begda,
            display_enda: e?.display_enda,
            position: e?.position,
            employee_number_atasan: e?.employee_number_atasan,
            superior_name: e?.superior_name,
          };
        }),
        definitive_score: employee.result.score,
      },
      score: finalScore,
    });
  }
  return returnedKpis;
};

module.exports = async ({
  size,
  page,
  excludeCount,
  periode,
  year,
  employee_number,
}) => {
  const limit = +size;
  const offset = (+page - 1) * limit;

  const inAndFilters = [
    ["kl", "year", year],
    ["kl", "periode", 'TW2'],
    ["kl", "employee_number", employee_number],
  ];

  const [queryInAndFilters, fieldInAndReplacements] =
    DBQuery.getInAndClauseFilterBulk(inAndFilters);

  const queryKpi = getFinalScoreKpiRepositories.query({
    queryInAndFilters,
  });
  const dbQuery = new DBQuery(queryKpi, {
    ...fieldInAndReplacements,
  });

  const kpis = await dbQuery.execute({ limit, offset });

  let count;
  if (!excludeCount) {
    count = await dbQuery.getCount();
  }

  const findActiveInactive = (kpi) => {
    const active_kpi_idx = kpi.is_active.split(",").findIndex((e) => +e === 1);
    const inactive_kpi_idx = kpi.is_active
      .split(",")
      .findIndex((e) => +e === 0);

    return {
      active_kpi_idx,
      inactive_kpi_idx,
    };
  };

  kpis.forEach((kpi) => {
    const { active_kpi_idx, inactive_kpi_idx } = findActiveInactive(kpi);

    const perscore = (() => {
      const splitted = kpi.perscore?.split(",");
      return {
        active: splitted?.[active_kpi_idx],
        inactive: splitted?.[inactive_kpi_idx],
      };
    })();
    const enda = (() => {
      const splitted = kpi.enda?.split(",");

      return {
        active: splitted?.[active_kpi_idx],
        inactive: splitted?.[inactive_kpi_idx],
      };
    })();
    const begda = (() => {
      const splitted = kpi.begda?.split(",");

      return {
        active: splitted?.[active_kpi_idx],
        inactive: splitted?.[inactive_kpi_idx],
      };
    })();
    const displayFormula = (() => {
      const splitted = kpi.formula?.split(",");

      return {
        active: splitted?.[active_kpi_idx] > 1 ? 1 : splitted?.[active_kpi_idx],
        inactive: splitted?.[inactive_kpi_idx],
      };
    })();
    const formula = (() => {
      const splitted = kpi.formula?.split(",");

      const rulesActive =
        (splitted?.[active_kpi_idx] > 1 && inactive_kpi_idx === -1) ||
        inactive_kpi_idx === -1
          ? 1
          : splitted?.[active_kpi_idx];

      return {
        active: rulesActive % 1 || 1,
        inactive: splitted?.[inactive_kpi_idx] % 1 || 1,
      };
    })();
    const position = (() => {
      const splitted = kpi.position?.split(",");

      return {
        active: splitted?.[active_kpi_idx],
        inactive: splitted?.[inactive_kpi_idx],
      };
    })();
    const superior_name = (() => {
      const splitted = kpi.superior_name?.split(",");

      return {
        active: splitted?.[active_kpi_idx],
        inactive: splitted?.[inactive_kpi_idx],
      };
    })();
    const score =
      (perscore.active || 0) * formula.active +
      (perscore.inactive || 0) * formula.inactive;
    //   active_kpi_idx && inactive_kpi_idx
    //     ? kpi.score
    //     : active_kpi_idx
    //     ? perscore.active
    //     : inactive_kpi_idx
    //     ? perscore.inactive
    //     : null;

    kpi.result = {
      formula,
      position,
      score,
      perscore,
      enda,
      begda,
      superior_name,
      display_formula: displayFormula,
    };
  });

  const jobSharingFinalScores = await getJobSharingFinalScores({
    employee_number,
    periode,
    year,
  });

  let fromJobSharingEmployeeNumbers = [];
  Object.keys(jobSharingFinalScores).forEach((e) => {
    fromJobSharingEmployeeNumbers = [
      ...fromJobSharingEmployeeNumbers,
      ...jobSharingFinalScores[e]
        ?.filter((item) => item?.is_from_job_sharing)
        .slice(0, 1),
    ];
  });

  const fromJobSharingNotInKpis = fromJobSharingEmployeeNumbers.filter(
    (e) => !kpis.map((item) => item.employee_number).includes(e.employee_number)
  );

  const mergedKpis = [
    ...kpis,
    ...fromJobSharingNotInKpis.map((e) => ({
      is_active: "1",
      perscore: e?.total_score ? `${e?.total_score}` : null,
      position: e?.definitive_position_name,
      formula: e?.total_months || 0 / 3,
      enda: e?.enda,
      begda: e?.begda,
      employee_number: e?.employee_number,
      firstname: e?.employee_name,
      result: {
        formula: { active: e?.total_months || 0 / 3, inactive: undefined },
        position: { active: e?.definitive_position_name, inactive: undefined },
        score: (e?.total_score * (e?.total_months || 0)) / 3,
        perscore: {
          active: e?.total_score ? `${e?.total_score}` : null,
          inactive: undefined,
        },
        enda: { active: e?.enda, inactive: undefined },
        begda: { active: e?.begda, inactive: undefined },
      },
    })),
  ];

  const finalScores = await calculateAllFinalScores({
    jobSharingFinalScores,
    definitiveFinalScores: mergedKpis,
  });

  return {
    kpis: finalScores,
    count: count?.[0].count,
  };
};
