module.exports = {
  query: () => {
    return `
      SELECT
        tk.employee_number,
        CASE
          WHEN lakhar_id IS NOT NULL
          THEN true
          ELSE false
        end as is_lakhar,
        te.firstname,
        tf.link

      FROM tb_employee te
      LEFT JOIN tb_kpi tk
        ON tk.employee_number = te.employee_number
      LEFT JOIN tb_file tf
        ON tf.file_id = te.file_id
      WHERE 1=1
        AND tk.employee_number_atasan = :superior_employee_number
      GROUP BY
        tk.employee_number,
        tk.lakhar_id
      ORDER BY
        tk.lakhar_id DESC
      `;
  },
};
