class ClientError extends Error {
  constructor(message, statusCode = 400, errors) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ClientError";
    this.errors = errors;
  }
}

module.exports = ClientError;
