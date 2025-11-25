module.exports = {
  query: () => {
    return `
    SELECT
      te.employee_id,
      te.employee_number,
      CASE
        WHEN te_kpi.employee_number IS NOT NULL
          THEN te_kpi.employee_number
        WHEN teha.nipp_ats IS NOT NULL
          THEN te_teha.employee_number
        WHEN teh.NIPP_ATS_BARU IS NOT NULL
          THEN teh.NIPP_ATS_BARU
        ELSE ''
      END as employee_number_superior,
      CASE
        WHEN te_kpi.employee_number IS NOT NULL
          THEN te_kpi.firstname
        WHEN teha.nipp_ats IS NOT NULL
          THEN te_teha.firstname
        WHEN teh.NIPP_ATS_BARU IS NOT NULL
          THEN teh.NAMA_ATS
        ELSE ''
      END as name_superior,
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
      INNER JOIN tb_employee_position tep
        ON tep.employee_number = te.employee_number
        AND tep.end_date = (
          SELECT
            MAX(end_date)
          FROM tb_employee_position tep2
          WHERE tep2.employee_number = te.employee_number
        )
        AND tep.last_updated_date = (
          SELECT
            MAX(last_updated_date)
          FROM tb_employee_position tep3
          WHERE tep3.employee_number = te.employee_number
        )
      LEFT JOIN tb_position_v2 tpv
        ON tpv.position_id = tep.position_id
      LEFT JOIN tb_kpi_score_final tksf
        ON tksf.employee_number = te.employee_number
        AND tksf.createdAt = (
          SELECT
            MAX(createdAt)
          FROM tb_kpi_score_final tksf2
          WHERE tksf2.employee_number = te.employee_number
          AND tksf2.final_score IS NOT NULL
        )
      LEFT JOIN tb_kpi tk
        ON tk.employee_number = te.employee_number
      LEFT JOIN tb_employee te_kpi
        ON te_kpi.employee_number = tk.employee_number_atasan
      LEFT JOIN tb_position_master tpm
        ON tpm.position_master_id = tpv.position_master_id

      LEFT JOIN tb_employee_hierarchy teh
        ON teh.NIPP_BARU = te.employee_number
        OR teh.NIPP = te.employee_number
      LEFT JOIN tb_employee_hierarchy_addition teha
        ON te.employee_number = teha.nipp
      LEFT JOIN tb_employee te_teha
        ON te_teha.employee_number = teha.nipp_ats
  WHERE 1=1
      AND te.employee_id = :employee_id
      AND tk.lakhar_id IS NULL
    GROUP BY
      te.employee_id,
      te.employee_number,
      te_kpi.employee_number,
      te_kpi.firstname ,
      tpv.name,
      tpv.position_id,
      tksf.periode,
      tksf.year,
      tksf.final_score,
      teha.nipp_ats,
      teh.NIPP_ATS_BARU,
      teh.NAMA_ATS
    `;
  },
};
