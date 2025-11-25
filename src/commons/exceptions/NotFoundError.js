const ClientError = require("./ClientError");

class NotFoundError extends ClientError {
  constructor(message, errors) {
    super(message, 404, errors);
    this.name = "NotFoundError";
  }
}

module.exports = NotFoundError;
