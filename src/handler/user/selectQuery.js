const ClientError = require("../../commons/exceptions/ClientError");
const {
  resSuccessHandler,
  resErrorHandler,
} = require("../../commons/exceptions/resHandler");
const { User } = require("../../models");

module.exports = async (req, res) => {
  try {
    const { user_query } = req.body;

    if (!user_query)
      throw new ClientError("user_query should be not undefined");

    // specifying whats to be included on queryOptions based on req.body.include
    const queryOptions = { ...user_query };

    const result = await User.findAll(queryOptions);

    resSuccessHandler(res, result, "success");
  } catch (error) {
    resErrorHandler(res, error);
  }
};
