const ClientError = require("./ClientError");

exports.resErrorHandler = (res, error) => {
  if (error.code === "ECONNREFUSED") {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "service unavailable",
      dev: error.message,
    });
  }

  if (error instanceof ClientError) {
    const response = {
      success: false,
      message: error.message,
      error: error.errors,
    };
    return res.status(error.statusCode).json(response);
  }

  if (error.response) {
    return res.status(error.response.status).json(error.response.data);
  }

  // Server ERROR!
  console.log(error);
  console.log(error.message);
  const response = {
    success: false,
    message: "Maaf, terjadi kegagalan pada server kami.",
    dev: error,
  };
  return res.status(500).json(response);
};

exports.resSuccessHandler = (res, data, message, code = 200) => {
  const response = {
    success: true,
    data,
    message,
  };
  return res.status(code).send(response);
};
