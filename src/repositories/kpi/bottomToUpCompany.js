module.exports = {
  query: () => {
    return `
        -- to bottom to up
        WITH RECURSIVE cte_bottom_to_up_company
        AS (SELECT company_in_id, parent_id
                FROM tb_company_in
                WHERE company_in_id IN (:company_in_id)  -- start here
            UNION ALL
            SELECT tci.company_in_id, tci.parent_id
                FROM tb_company_in tci
                INNER JOIN cte_bottom_to_up_company cte
                ON tci.company_in_id = cte.parent_id)
        `;
  },
};
