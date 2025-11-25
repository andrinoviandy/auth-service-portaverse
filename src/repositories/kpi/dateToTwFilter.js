const dateServerTransform = require("../../commons/helpers/dateServerTransform");

module.exports = {
  query: ({ tbAlias, begdaField = "start_date", endaField = "end_date" }) => {
    const begdaColumn = dateServerTransform(tbAlias, begdaField);
    const endaColumn = dateServerTransform(tbAlias, endaField);

    const startTwField = `
        CASE
            WHEN DATE_FORMAT(${begdaColumn}, '%m') IN ('01', '02', '03') THEN 1
            WHEN DATE_FORMAT(${begdaColumn}, '%m') IN ('04', '05', '06') THEN 2
            WHEN DATE_FORMAT(${begdaColumn}, '%m') IN ('07', '08', '09') THEN 3
            WHEN DATE_FORMAT(${begdaColumn}, '%m') IN ('10', '11', '12') THEN 4
        END
    `;
    const endTwField = `
        CASE
            WHEN DATE_FORMAT(${endaColumn}, '%m') IN ('01', '02', '03') THEN 1
            WHEN DATE_FORMAT(${endaColumn}, '%m') IN ('04', '05', '06') THEN 2
            WHEN DATE_FORMAT(${endaColumn}, '%m') IN ('07', '08', '09') THEN 3
            WHEN DATE_FORMAT(${endaColumn}, '%m') IN ('10', '11', '12') THEN 4
        END
    `;

    const startYearField = `YEAR(${begdaColumn})`;
    const endYearField = `YEAR(${endaColumn})`;

    const finalQuery = `
        (
            CONCAT(:year, :periode) >= CONCAT(${startYearField}, ${startTwField})
            AND
            CONCAT(:year, :periode) <= CONCAT(${endYearField}, ${endTwField})
        )
    `;

    return finalQuery;
  },
};

// eslint-disable-next-line no-unused-vars
const oldButGold = (startYearField, endYearField, startTwField, endTwField) => `
(
    (
        ${startYearField} <= :year AND (${endYearField} >= :year OR ${endYearField} IS NULL))
        AND 
        ${startTwField} <= :periode AND (${endTwField} >= :periode OR ${endTwField} IS NULL)
    OR (
        ${startYearField} < :year AND (${endYearField} > :year OR ${endYearField} IS NULL)
    )
    OR (
        ${startYearField} <= :year AND (${endYearField} > :year OR ${endYearField} IS NULL) 
        AND
        ${startTwField} <= :periode
    )
    OR (
        ${startYearField} < :year AND (${endYearField} >= :year OR ${endYearField} IS NULL)
        AND
        (${endTwField}  >= :periode OR ${endTwField} IS NULL)
    )
)
`;
