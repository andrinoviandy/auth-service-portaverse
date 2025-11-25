const DBQuery = require("../DBQuery.repositories");

const getByEmployeeId = async ({ employee_id }) => {
  try {
    // Get generic learning hours
    const queryGeneric = new DBQuery(
      `
      SELECT
		    te.employee_number,
        te.firstname,
        tcce.employee_id,
        tcce.course_chapter_id,
        tcc.course_id,
        tcc.class_id as class_id ,
        tc.name,
        tc.open_date,
        tc.close_date,
        tc.type,
        ROUND(SUM(
            CASE
              WHEN tcce.is_finish THEN tcc.learning_hour
              WHEN tcce.time_track IS NOT NULL THEN tcce.time_track
              ELSE 0
            END
          )) as seconds,
        'GENERIC' as status
      FROM tb_course_chapter tcc
      LEFT JOIN tb_course_chapter_employee tcce
        ON tcc.course_chapter_id = tcce.course_chapter_id
      LEFT JOIN tb_course tc
        ON tc.course_id = tcc.course_id
      LEFT JOIN tb_employee te
      	ON te.employee_id = tcce.employee_id
      WHERE 1=1
        AND tcce.employee_id = :employee_id
        AND tcce.deletedAt IS NULL
        AND tcce.is_learning_hour_ignored != 1
      GROUP BY
        tcc.course_id,
        tcc.class_id
      HAVING
        seconds != 0
    `,
      {
        employee_id,
      }
    );

    // Get external learning hour
    const queryExternal = new DBQuery(
      `
      SELECT
        te.employee_number,
        te.firstname,
        tce.created_by as employee_id,
        tce.course_name as name,
        tce.start_date as open_date,
        tce.end_date as close_date,
        '-' as type,
        '-' as course_id,
        '-' as class_id,
        tce.learning_hour  as seconds,
        'EXTERNAL' as status
      FROM tb_course_external tce
      LEFT JOIN tb_employee te
      	ON te.employee_id = tce.created_by
      WHERE 1=1
        AND tce.status = 'Diterima'
        AND tce.deletedAt IS NULL
        AND tce.created_by = :employee_id
        AND tce.is_learning_hour_ignored != 1
    `,
      {
        employee_id,
      }
    );

    // * Get external learning hour on tb_course_employee
    const queryExternal2 = new DBQuery(
      `
      SELECT
        te.employee_number,
        te.firstname,
        tce.employee_id as employee_id,
        tce.course_class_id as class_id,
        tc.course_id,
        tc.name,
        tc.open_date,
        tc.close_date,
        tc.type as type,
        tce.external_course_learning_hour  as seconds,
        'EXTERNAL' as status
      FROM tb_course_employee tce
      LEFT JOIN tb_employee te
        ON te.employee_id = tce.employee_id
      LEFT JOIN tb_course tc
        ON tc.course_id = tce.course_id
      WHERE 1=1
      AND tce.is_learning_hour_ignored != 1
      AND tce.employee_id = :employee_id
      AND tce.deletedAt IS NULL
      AND tce.external_course_learning_hour IS NOT NULL
      HAVING
        seconds > 0
    `,
      {
        employee_id,
      }
    );

    // Execute
    const [generic, external, external_tce] = await Promise.all([
      queryGeneric.execute(),
      queryExternal.execute(),
      queryExternal2.execute(),
    ]);

    const data = generic.concat(external);
    const result = data.concat(external_tce);
    return result;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = getByEmployeeId;
