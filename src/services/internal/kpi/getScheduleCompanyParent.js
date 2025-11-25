const getScheduleCompany = require("./getScheduleCompany");

module.exports = async ({
  kpi_schedule_id,
  company_in_id,
  year,
  periode,
  employee_number,
  exact_company_filter,
  page,
  size,
}) => {
  const getSchedules = async (currentScheduleOnly) => {
    const [schedules, count] = await getScheduleCompany({
      kpi_schedule_id,
      company_in_id,
      year,
      periode,
      page,
      size,
      employeeNumber: employee_number,
      currentScheduleOnly: !!currentScheduleOnly,
      excludeCount: !!employee_number,
      exact_company_filter,
    });

    return [schedules, count];
  };

  const [schedules, count] = await getSchedules(!!employee_number);

  return {
    schedules:
      !!employee_number && !schedules?.length
        ? [
            await (async () => {
              const [schedules] = await getSchedules();

              return {
                type: "SPARE",
                periode: schedules?.[0]?.periode || 1,
                year: schedules?.[0]?.year || new Date().getFullYear(),
              };
            })(),
          ]
        : schedules,
    count,
    totalPage: Math.ceil(count / +size),
  };
};
