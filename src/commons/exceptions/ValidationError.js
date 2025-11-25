const ClientError = require("./ClientError");

class ValidationError extends ClientError {
  constructor(message, errors) {
    super(message, 400, errors);
    this.name = "ValidationError";
  }
}

module.exports = ValidationError;
