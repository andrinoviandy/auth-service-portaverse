module.exports = {
  query: () => {
    return `
    WITH teh0 AS (
        SELECT * FROM tb_employee_hierarchy
            WHERE employee_atasan_bawahan_id IN (
                SELECT MAX(employee_atasan_bawahan_id)
                FROM tb_employee_hierarchy
                WHERE 1 = 1 
                GROUP BY NIPP_BARU
            )
        ),
        teh00 AS (
        SELECT * FROM tb_employee_hierarchy
            WHERE employee_atasan_bawahan_id IN (
                SELECT MAX(employee_atasan_bawahan_id)
                FROM tb_employee_hierarchy
                WHERE 1 = 1 
                GROUP BY NIPP_ATS_BARU
            )
        ),
        spo0 AS (
            SELECT 
                SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT spo.WERKS_NEW ORDER BY spo.BEGDA DESC, spo.CREATED_DATE DESC, spo.LAST_UPDATED_DATE DESC), ',', 1) AS WERKS_NEW,
                SUBSTRING_INDEX(GROUP_CONCAT(DISTINCT spo.BTRTL_NEW ORDER BY spo.BEGDA DESC, spo.CREATED_DATE DESC, spo.LAST_UPDATED_DATE DESC), ',', 1) AS BTRTL_NEW,
                spo.PNALT_NEW
            FROM safm_perubahan_organisasi spo
            WHERE 1 = 1
            AND (BEGDA) <> '2023-07-01'
            AND SHORT <> '14104'
            AND (LAST_UPDATED_BY = 'SAP' OR CREATED_BY = 'SAP' OR LAST_UPDATED_BY = 'CENTRA' OR CREATED_BY = 'CENTRA' OR CREATED_BY = 'LOCAL' OR LAST_UPDATED_BY = 'LOCAL')
            AND COMPANY_CODE <> '9999'
            AND PNALT_NEW IS NOT NULL
            AND PNALT_NEW <> ''
            AND PNALT_NEW <> '-'
            GROUP BY spo.PNALT_NEW
        )
    SELECT 
        (
        CASE
            WHEN teh.NAMA IS NOT NULL THEN teh.NAMA
            ELSE te.firstname 
        END
        ) AS NAMA,
        tk.employee_number AS NIPP,
        spo.WERKS_NEW,
        spo.BTRTL_NEW,
        teh.NAMA_JABATAN,
        COUNT(DISTINCT tk.kpi_id) AS Jumlah_KPI,
        sum(tk.bobot)*count(DISTINCT tk.kpi_id)/count(*) AS Bobot_Total_KPI,
        (
        CASE 
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%DRAFT%' THEN 'Draft'
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%DRAFT_FROM_UP%' THEN 'Diedit Atasan'
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%DRAFT_FROM_DOWN%' THEN 'Diedit Bawahan'
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%READY_FROM_UP%' THEN 'Diajukan Atasan'
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%READY_FROM_DOWN%' THEN 'Diajukan Bawahan'
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%ACCEPT_FROM_DOWN%' THEN 'Diterima Bawahan'
            WHEN GROUP_CONCAT(DISTINCT tk.status) LIKE '%READY%' THEN 'Diterima Atasan'
        END
        ) AS Status_Penurunan_KPI,
        (
        CASE
            WHEN teh2.NAMA_ATS IS NOT NULL THEN teh2.NAMA_ATS
            ELSE te2.firstname 
        END
        ) AS Nama_Atasan_Level_1,
        tk.employee_number_atasan AS NIPP_Atasan_Level_1,
        teh2.NAMA_JABATAN_ATS AS Nama_Jabatan_Atasan_Level_1
    FROM tb_employee te 
    LEFT JOIN tb_kpi tk ON te.employee_number = tk.employee_number 
    LEFT JOIN teh0 teh ON teh.NIPP_BARU = tk.employee_number
    LEFT JOIN teh00 teh2 ON teh2.NIPP_ATS_BARU = tk.employee_number_atasan 
    LEFT JOIN tb_employee te2 ON te2.employee_number = tk.employee_number_atasan 
    LEFT JOIN spo0 spo ON te.employee_number = spo.PNALT_NEW
    WHERE tk.year = :year
    AND tk.deletedAt IS NULL
    AND (tk.is_float IS NULL OR tk.is_float = 0)
    GROUP BY tk.employee_number, tk.employee_number_atasan, spo.WERKS_NEW, spo.BTRTL_NEW,
        (
        CASE
            WHEN teh.NAMA IS NOT NULL THEN teh.NAMA
            ELSE te.firstname 
        END
        ), NIPP, NAMA_JABATAN, 
        (
        CASE
            WHEN teh2.NAMA_ATS IS NOT NULL THEN teh2.NAMA_ATS
            ELSE te2.firstname 
        END
        ), 
        NIPP_Atasan_Level_1, Nama_Jabatan_Atasan_Level_1
    `;
  },
};
