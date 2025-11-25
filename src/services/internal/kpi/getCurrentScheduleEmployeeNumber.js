const getScheduleCompany = require("./getScheduleCompany");

module.exports = async ({ employee_number }) => {
  const [schedules] = await getScheduleCompany({
    employee_number,
    currentScheduleOnly: 1,
    page: 1,
    size: 1,
    excludeCount: 1,
  });

  return schedules?.[0];
};
