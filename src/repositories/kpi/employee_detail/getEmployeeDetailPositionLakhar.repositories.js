module.exports = {
  query: () => {
    return `
    SELECT
      te.employee_id,
      tel.lakhar_id,
      te.employee_number,
      tk.employee_number as lakhar_employee_number,
      te2.employee_number as employee_number_superior,
      te2.firstname as name_superior,
      tpm.job_class_level,
      tpv.name as position_name,
      tpv.position_id,
      tksf.periode,
      tksf.year,
      tksf.final_score,
      CASE
          WHEN
            COUNT(
                CASE
                    WHEN
                      tk.status = 'READY'
                    THEN TRUE
                    ELSE NULL
                END
            ) > 0
            AND
            SUM(
            CASE
              WHEN tk.status = 'READY'
              THEN tk.bobot
              ELSE 0
            END
          ) = 100
          THEN 'Selesai penurunan KPI'
            WHEN
              COUNT(
                CASE
                    WHEN tk.status = 'DRAFT' THEN TRUE
                    ELSE NULL
                END
              ) > 0
              OR COUNT(tk.kpi_id) = 0
            THEN 'Belum mendapatkan penurunan KPI'
            WHEN
              COUNT(
                CASE
                    WHEN tk.status NOT IN ('PUBLISHED', 'READY') THEN TRUE
                    ELSE NULL
                END
              )
            THEN 'Dalam Proses Review Penurunan KPI'
            WHEN
              COUNT(
                CASE
                    WHEN tk.status IN ('PUBLISHED', 'READY') THEN TRUE
                    ELSE NULL
                END
              )
            THEN 'KPI telah disetujui'
            WHEN
              SUM(tk.has_review_from_subordinate) > 0
          THEN 'Sudah mendapatkan penurunan KPI'
        END as status_penurunan

    FROM tb_employee te
      LEFT JOIN tb_employee_lakhar tel
          ON tel.employee_number_lakhar = te.employee_number
      INNER JOIN tb_kpi tk
          ON tel.lakhar_id = tk.lakhar_id
      INNER JOIN tb_employee_position tep
        ON tep.employee_number = tel.employee_number
        AND tep.end_date = (
          SELECT
            MAX(end_date)
          FROM tb_employee_position tep2
          WHERE tep2.employee_number = tel.employee_number
        )
        AND tep.last_updated_date = (
          SELECT
            MAX(last_updated_date)
          FROM tb_employee_position tep3
          WHERE tep3.employee_number = tel.employee_number
        )
      LEFT JOIN tb_position_v2 tpv
        ON tpv.position_id = tep.position_id
      LEFT JOIN tb_kpi_score_final tksf
        ON tksf.employee_number = tel.employee_number
        AND tksf.createdAt = (
          SELECT
            MAX(createdAt)
          FROM tb_kpi_score_final tksf2
          WHERE tksf2.employee_number = tel.employee_number
          AND tksf2.final_score IS NOT NULL
        )

      LEFT JOIN tb_employee te2
        ON te2.employee_number = tk.employee_number_atasan
      LEFT JOIN tb_position_master tpm
        ON tpm.position_master_id = tpv.position_master_id
    WHERE 1=1
      AND te.employee_id = :employee_id
      AND tk.lakhar_id IS NOT NULL
    GROUP BY
      te.employee_id,
      tel.lakhar_id,
      tk.employee_number,
      te2.employee_number,
      te2.firstname ,
      tpv.name,
      tpv.position_id,
      tksf.periode,
      tksf.year,
      tksf.final_score
      `;
  },
};
