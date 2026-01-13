class ExpressError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;   // ✅ FIXED (capital C)
  }
}

module.exports = ExpressError;
