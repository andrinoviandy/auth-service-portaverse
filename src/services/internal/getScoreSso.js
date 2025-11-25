const { selectQuery } = require("../../models");
const NotFoundError = require("../../../src/commons/exceptions/NotFoundError");

module.exports = async (employeeNumber) => {
  const results = await selectQuery(`
    SELECT 
        a.employee_number,
        '8386' AS id_aplikasi,
        'PORTAVERSE' AS nama_aplikasi,
        b.uid,
        'USER' AS nama_role,
        b.email 
    FROM tb_employee a
    JOIN tb_user b ON b.user_id = a.user_id
    WHERE a.employee_number = :employee_number;
  `, {
    employee_number: employeeNumber
  });

  if (!results || results.length === 0) {
    throw new NotFoundError(`Employee with number ${employeeNumber} not found`);
  }

  return results[0];
};
