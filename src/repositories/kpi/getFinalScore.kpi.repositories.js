module.exports = {
  query: ({ queryInAndFilters }) => {
    return `
        WITH kpi_list AS (
            (
                WITH teh00 AS (
                SELECT * FROM tb_employee_hierarchy
                    WHERE employee_atasan_bawahan_id IN (
                        SELECT MAX(employee_atasan_bawahan_id)
                        FROM tb_employee_hierarchy
                        WHERE 1 = 1 
                        GROUP BY NIPP_BARU
                    )
                )
                SELECT 
                tkst.employee_number, 
                tkst.employee_number_atasan, 
                tkst.periode,
                tkst.year,
                tkst.total_score,
                tkst.begda,
                NULL AS enda,
                teh00.NAMA_JABATAN AS position,
                1 AS is_active
                FROM tb_kpi_score_total tkst
                LEFT JOIN teh00 ON tkst.employee_number = teh00.NIPP_BARU
                WHERE tkst.total_score IS NOT NULL
                AND tkst.job_sharing_id IS NULL
                AND tkst.from_job_sharing_id IS NULL
            )
            UNION
            (
                SELECT 
                tkho.employee_number,
                tkho.employee_number_atasan,
                tkho.store_period AS periode,
                tkhst.year,
                tkhst.total_score,
                tkho.begda,
                tkho.enda,
                tkho.subdi_text AS position,
                0 AS is_active
                FROM tb_kpi_history_score_total tkhst 
                LEFT JOIN tb_kpi_history_owner tkho ON tkhst.kpi_history_owner_id = tkho.kpi_history_owner_id 
                WHERE tkhst.total_score IS NOT NULL
                AND tkho.job_sharing_id IS NULL
                AND tkho.from_job_sharing_id IS NULL
            )
        )
        SELECT 
        GROUP_CONCAT(is_active) AS is_active,
        GROUP_CONCAT(
            CASE
                WHEN total_score IS NOT NULL THEN total_score
                ELSE 0
            END
        ) AS perscore,
        GROUP_CONCAT(position) AS position,
        GROUP_CONCAT(
            PERIOD_DIFF( 
            CASE
                WHEN is_active = 0 THEN DATE_FORMAT(enda + INTERVAL 1 DAY, '%Y%m')
                WHEN periode = 'TW1' THEN CONCAT(kl.year, '03')
                WHEN periode = 'TW2' THEN CONCAT(kl.year, '06')
                WHEN periode = 'TW3' THEN CONCAT(kl.year, '09')
                WHEN periode = 'TW4' THEN CONCAT(kl.year, '12')
            END,
            CASE
                WHEN is_active = 1 THEN DATE_FORMAT(begda - INTERVAL 1 DAY, '%Y%m')
                WHEN periode = 'TW1' THEN CONCAT(kl.year, '01')
                WHEN periode = 'TW2' THEN CONCAT(kl.year, '04')
                WHEN periode = 'TW3' THEN CONCAT(kl.year, '07')
                WHEN periode = 'TW4' THEN CONCAT(kl.year, '10')
            END
            ) / 3
        ) AS formula,
        GROUP_CONCAT(
            CASE
                WHEN is_active = 1 AND periode = 'TW1' THEN CONCAT(kl.year, '-3-31')
                WHEN is_active = 1 AND periode = 'TW2' THEN CONCAT(kl.year, '-6-30')
                WHEN is_active = 1 AND periode = 'TW3' THEN CONCAT(kl.year, '-9-30')
                WHEN is_active = 1 AND periode = 'TW4' THEN CONCAT(kl.year, '-12-31')
                ELSE enda
            END
        ) AS enda,
        GROUP_CONCAT(
            begda
        ) AS begda,
        GROUP_CONCAT(te_superior.firstname) AS superior_name,
        kl.employee_number,
        te.firstname
        FROM kpi_list kl
        LEFT JOIN tb_employee te ON te.employee_number = kl.employee_number
        LEFT JOIN tb_employee te_superior ON te_superior.employee_number = kl.employee_number_atasan
        WHERE 1 = 1
        ${queryInAndFilters || ""}
        GROUP BY employee_number
      `;
  },
};
