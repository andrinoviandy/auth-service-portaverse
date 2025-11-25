const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const { checkSso } = require("../../commons/helpers/jwt");
const getUidUser = require("../../services/internal/getUidUser");

module.exports = async (req, res) => {
  try {
    // Ambil employee_number dari body atau query (bebas tergantung kebutuhan)
    const { access_token } = req.body;
    const payload = await checkSso(access_token)
    const employee_number  = payload?.portal_si_username;
    
    if (!employee_number) {
      return resErrorHandler(res, {
        message: "employee_number is required",
        statusCode: 400,
      });
    }

    // Panggil service function yang kita buat sebelumnya
    const results = await getUidUser(employee_number);

    // Kirim response sukses
    return resSuccessHandler(res, results, "Success get employee info");
  } catch (error) {
    // Tangani error (misal dari NotFoundError)
    return resErrorHandler(res, error);
  }
};
