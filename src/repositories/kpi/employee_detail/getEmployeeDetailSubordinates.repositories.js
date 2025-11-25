module.exports = {
  query: () => {
    return `
      -- get subordinate in superior replacement, currently not accomodate bulk
      SELECT
          te.firstname,
          te.employee_number,
          tf.link

      FROM tb_employee te
        LEFT JOIN tb_position tp ON te.position_id = tp.position_id
        LEFT JOIN tb_employee_hierarchy teh ON
          (te.employee_number = teh.NIPP_BARU OR te.old_employee_number = teh.NIPP)
          AND (teh.NIPP_ATS_BARU = :superior_employee_number OR teh.NIPP_ATS = :superior_employee_number)
        LEFT JOIN tb_employee_hierarchy_addition teha ON te.employee_number = teha.nipp AND teha.NIPP_ATS = :superior_employee_number
        LEFT JOIN tb_employee_hierarchy_addition teha2 ON te.employee_number = teha2.nipp -- without atasan
        LEFT JOIN tb_file tf
          ON tf.file_id = te.file_id
      WHERE te.deletedAt IS NULL
        AND (
          (teh.NIPP_BARU IS NULL AND teha2.nipp IS NOT NULL AND teha.nipp IS NOT NULL)
          OR (teh.NIPP_BARU IS NOT NULL AND teha2.nipp IS NULL)
          OR (teh.NIPP_BARU = teha.nipp AND teh.NIPP_ATS_BARU  = :superior_employee_number AND teha.nipp_ats = :superior_employee_number)
        )
      GROUP BY te.employee_id
      `;
  },
};
