const DBQuery = require("../DBQuery.repositories");

const getTotalByEmployeeId = async ({ employee_id }) => {
  try {
    // Get generic learning hours
    const queryGeneric = new DBQuery(
      `
      SELECT
        tvw.*
      FROM tb_course_employee_learning_hour_vw tvw
      WHERE 1=1
        AND tvw.employee_id = :employee_id
    `,
      {
        employee_id,
      }
    );

    // Execute
    const [generic] = await Promise.all([queryGeneric.execute()]);
    
    const data = generic;
    return data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getTotalByEmployeeId;
