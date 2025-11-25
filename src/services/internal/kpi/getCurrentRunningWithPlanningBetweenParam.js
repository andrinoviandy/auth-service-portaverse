const getCurrentScheduleEmployeeNumber = require("./getCurrentScheduleEmployeeNumber");

module.exports = async ({ employee_number, year, periode, type }) => {
  const schedule = await getCurrentScheduleEmployeeNumber({
    employee_number,
  });

  const currentRunningWithPlanning =
    ((!!year &&
      !!periode &&
      +schedule?.year === +year &&
      +schedule?.periode === +periode &&
      schedule?.type === "PLANNING" &&
      (type === "PLANNING" || !type)) ||
      (!year && !periode)) &&
    ((!!type && type === "PLANNING") || !type);

  return currentRunningWithPlanning;
};
