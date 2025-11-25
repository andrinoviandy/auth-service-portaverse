module.exports = {
  query: ({ isJobSharing, isFromJobSharing }) => {
    return `
      WITH main_query AS (
      SELECT
        tkst.employee_number,
        tkst.employee_number_atasan,
        tkst.periode,
        tkst.year,
        tkst.total_score,
        (CASE
          WHEN tkst.job_sharing_id IS NOT NULL THEN tejs.position
          ELSE tejs2.position
        END) AS position,
        (CASE
          WHEN tkst.job_sharing_id IS NOT NULL THEN tejs.BEGDA
          ELSE tejs2.BEGDA
        END) AS begda,
        (CASE
          WHEN tkst.job_sharing_id IS NOT NULL THEN (CASE
            WHEN tejs.is_ended IS NOT NULL THEN tejs.is_ended
            ELSE tejs.ENDA
          END)
          ELSE (CASE
            WHEN tejs2.is_ended IS NOT NULL THEN tejs2.is_ended
            ELSE tejs2.ENDA
          END)
        END) AS enda,
        (CASE
          WHEN tkst.job_sharing_id IS NOT NULL THEN tejs.start_tw
          ELSE tejs2.start_tw
        END) AS start_tw,
        (CASE
          WHEN tkst.job_sharing_id IS NOT NULL THEN (CASE
            WHEN tejs.is_ended IS NOT NULL THEN tejs.end_tw
            ELSE tejs.finish_tw
          END)
          ELSE (CASE
            WHEN tejs2.is_ended IS NOT NULL THEN tejs2.end_tw
            ELSE tejs2.finish_tw
          END)
        END ) AS end_tw,
        tkst.job_sharing_id,
        tkst.from_job_sharing_id,
        te.firstname AS employee_name,
        tpv.name AS definitive_position_name
      FROM
        tb_kpi_score_total tkst
      LEFT JOIN tb_employee_job_sharing tejs ON
        tejs.job_sharing_id = tkst.job_sharing_id
      LEFT JOIN tb_employee_job_sharing tejs2 ON
        tejs2.job_sharing_id = tkst.from_job_sharing_id
      LEFT JOIN tb_employee te ON te.employee_number = tkst.employee_number
      LEFT JOIN tb_position_v2 tpv ON tpv.position_id = te.position_id
      WHERE
        tkst.total_score IS NOT NULL
        AND tkst.year = :year
        AND tkst.periode = :periode
        AND tkst.employee_number IN (:employee_number)
        ${
          isJobSharing
            ? "AND tkst.job_sharing_id IS NOT NULL AND tkst.from_job_sharing_id IS NULL"
            : ""
        }
        ${
          isFromJobSharing
            ? "AND tkst.job_sharing_id IS NULL AND tkst.from_job_sharing_id IS NOT NULL"
            : ""
        }
      ),
      history_query AS (
      SELECT
        tkho.employee_number,
        tkho.employee_number_atasan,
        tkhst.periode,
        tkhst.year,
        tkhst.total_score,
        (CASE
          WHEN tkho.job_sharing_id IS NOT NULL THEN tejs.position
          ELSE tejs2.position
        END) AS position,
        (CASE
          WHEN tkho.job_sharing_id IS NOT NULL THEN tejs.BEGDA
          ELSE tejs2.BEGDA
        END) AS begda,
        (CASE
          WHEN tkho.job_sharing_id IS NOT NULL THEN (CASE
            WHEN tejs.is_ended IS NOT NULL THEN tejs.is_ended
            ELSE tejs.ENDA
          END)
          ELSE (CASE
            WHEN tejs2.is_ended IS NOT NULL THEN tejs2.is_ended
            ELSE tejs2.ENDA
          END)
        END) AS enda,
        (CASE
          WHEN tkho.job_sharing_id IS NOT NULL THEN tejs.start_tw
          ELSE tejs2.start_tw
        END) AS start_tw,
        (CASE
          WHEN tkho.job_sharing_id IS NOT NULL THEN (CASE
            WHEN tejs.is_ended IS NOT NULL THEN tejs.end_tw
            ELSE tejs.finish_tw
          END)
          ELSE (CASE
            WHEN tejs2.is_ended IS NOT NULL THEN tejs2.end_tw
            ELSE tejs2.finish_tw
          END)
        END ) AS end_tw,
        tkho.job_sharing_id,
        tkho.from_job_sharing_id,
        te.firstname AS employee_name,
        tpv.name AS definitive_position_name
      FROM
        tb_kpi_history_score_total tkhst
      LEFT JOIN tb_kpi_history_owner tkho ON
        tkho.kpi_history_owner_id = tkhst.kpi_history_owner_id
      LEFT JOIN tb_employee_job_sharing tejs ON
        tejs.job_sharing_id = tkho.job_sharing_id
      LEFT JOIN tb_employee_job_sharing tejs2 ON
        tejs2.job_sharing_id = tkho.from_job_sharing_id
      LEFT JOIN tb_employee te ON te.employee_number = tkho.employee_number
      LEFT JOIN tb_position_v2 tpv ON tpv.position_id = te.position_id
      WHERE
        tkhst.total_score IS NOT NULL
        AND tkhst.year = :year
        AND tkhst.periode = :periode
        AND tkho.employee_number IN (:employee_number)
        ${
          isJobSharing
            ? "AND tkho.job_sharing_id IS NOT NULL AND tkho.from_job_sharing_id IS NULL"
            : ""
        }
        ${
          isFromJobSharing
            ? "AND tkho.job_sharing_id IS NULL AND tkho.from_job_sharing_id IS NOT NULL"
            : ""
        }
      ),
      union_normal_history AS (
      SELECT
        *
      FROM
        main_query mq
      UNION ALL
      SELECT
        *
      FROM
        history_query hq
      )
      SELECT
        unh.*,
        (CASE
            -- case start dan end berada dalam satu tw
            WHEN unh.start_tw = unh.end_tw
              AND :periode = unh.start_tw
              AND :periode = unh.end_tw 
              THEN unh.begda
            -- case selected tw berada di tengah tengah
            WHEN unh.start_tw < :periode
              AND unh.end_tw > :periode 
              THEN (
                CASE
                  WHEN :periode = 'TW1' THEN DATE(CONCAT(:year, '-01-01'))
                  WHEN :periode = 'TW2' THEN DATE(CONCAT(:year, '-01-04'))
                  WHEN :periode = 'TW3' THEN DATE(CONCAT(:year, '-01-07'))
                  WHEN :periode = 'TW4' THEN DATE(CONCAT(:year, '-01-10'))
                END
              )
            -- case ketika selected tw merupakan tw yang sama dengan tw mulai
            WHEN unh.start_tw = :periode
            AND unh.end_tw <> :periode 
            THEN unh.begda
            -- case ketika selected tw merupakan tw yang sama dengan tw selesai
            WHEN unh.end_tw = :periode
              AND unh.start_tw <> :periode 
              THEN (
                CASE
                  WHEN :periode = 'TW1' THEN DATE(CONCAT(:year, '-01-01'))
                  WHEN :periode = 'TW2' THEN DATE(CONCAT(:year, '-01-04'))
                  WHEN :periode = 'TW3' THEN DATE(CONCAT(:year, '-01-07'))
                  WHEN :periode = 'TW4' THEN DATE(CONCAT(:year, '-01-10'))
                END
              )
        END
        ) AS display_begda,
        (CASE
            -- case start dan end berada dalam satu tw
            WHEN unh.start_tw = unh.end_tw
              AND :periode = unh.start_tw
              AND :periode = unh.end_tw 
              THEN unh.enda
            -- case selected tw berada di tengah tengah
            WHEN unh.start_tw < :periode
              AND unh.end_tw > :periode 
              THEN (
                CASE
                  WHEN :periode = 'TW1' THEN DATE(CONCAT(:year, '-03-31'))
                  WHEN :periode = 'TW2' THEN DATE(CONCAT(:year, '-06-30'))
                  WHEN :periode = 'TW3' THEN DATE(CONCAT(:year, '-09-30'))
                  WHEN :periode = 'TW4' THEN DATE(CONCAT(:year, '-12-31'))
                END
              )
            -- case ketika selected tw merupakan tw yang sama dengan tw mulai
            WHEN unh.start_tw = :periode
            AND unh.end_tw <> :periode 
            THEN (
                CASE
                  WHEN :periode = 'TW1' THEN DATE(CONCAT(:year, '-03-31'))
                  WHEN :periode = 'TW2' THEN DATE(CONCAT(:year, '-06-30'))
                  WHEN :periode = 'TW3' THEN DATE(CONCAT(:year, '-09-30'))
                  WHEN :periode = 'TW4' THEN DATE(CONCAT(:year, '-12-31'))
                END
              )
            -- case ketika selected tw merupakan tw yang sama dengan tw selesai
            WHEN unh.end_tw = :periode
              AND unh.start_tw <> :periode 
              THEN unh.enda
        END
        ) AS display_enda,
        (CASE
            -- case start dan end berada dalam satu tw
            WHEN unh.start_tw = unh.end_tw
              AND :periode = unh.start_tw
              AND :periode = unh.end_tw 
              THEN PERIOD_DIFF(DATE_FORMAT(unh.enda + INTERVAL 1 DAY, '%Y%m'), DATE_FORMAT(unh.begda, '%Y%m'))
            -- case selected tw berada di tengah tengah
            WHEN unh.start_tw < :periode
              AND unh.end_tw > :periode 
              THEN 3
            -- case ketika selected tw merupakan tw yang sama dengan tw mulai
            WHEN unh.start_tw = :periode
            AND unh.end_tw <> :periode 
            THEN PERIOD_DIFF((
              CASE
                WHEN :periode = 'TW1' THEN DATE_FORMAT(LAST_DAY(DATE(CONCAT(:year, '-03-01'))) + INTERVAL 1 DAY, '%Y%m')
                WHEN :periode = 'TW2' THEN DATE_FORMAT(LAST_DAY(DATE(CONCAT(:year, '-06-01'))) + INTERVAL 1 DAY, '%Y%m')
                WHEN :periode = 'TW3' THEN DATE_FORMAT(LAST_DAY(DATE(CONCAT(:year, '-09-01'))) + INTERVAL 1 DAY, '%Y%m')
                WHEN :periode = 'TW4' THEN DATE_FORMAT(LAST_DAY(DATE(CONCAT(:year, '-12-01'))) + INTERVAL 1 DAY, '%Y%m')
              END
            ), DATE_FORMAT(unh.begda, '%Y%m'))
            -- case ketika selected tw merupakan tw yang sama dengan tw selesai
            WHEN unh.end_tw = :periode
              AND unh.start_tw <> :periode 
              THEN PERIOD_DIFF(DATE_FORMAT(unh.enda + INTERVAL 1 DAY, '%Y%m'), (
                  CASE
                    WHEN :periode = 'TW1' THEN CONCAT(:year, '01')
                    WHEN :periode = 'TW2' THEN CONCAT(:year, '04')
                    WHEN :periode = 'TW3' THEN CONCAT(:year, '07')
                    WHEN :periode = 'TW4' THEN CONCAT(:year, '10')
                  END
                ))
              ELSE 0
        END
        ) AS total_months,
        te.firstname AS superior_name
      FROM
        union_normal_history unh
      LEFT JOIN tb_employee te ON te.employee_number = unh.employee_number_atasan
      `;
  },
};
