const envExport = require("../constants/envExport");

module.exports = (tbAlias, dateField) => {
  const field = `${tbAlias}${dateField ? "." : ""}${dateField || ""}`;
  return `
    CASE
        WHEN ${field} IS NULL THEN '9999-12-31 23:59:59'
        ELSE ${field} 
    END
    + interval (
    CASE
        WHEN YEAR(${field}) = 9999 OR ${field} IS NULL THEN 0
        ELSE ${envExport.serverGmt} 
    END
   ) hour`;
};
