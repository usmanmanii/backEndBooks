module.exports.CustomError = class CustomError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.status = statusCode;
    this.success = false;
  }
};
