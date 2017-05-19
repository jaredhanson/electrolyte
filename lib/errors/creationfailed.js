/**
 * `CreationFailedError` error.
 *
 * @api public
 */
function CreationFailedError(message, cause) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'CreationFailedError';
  this.message = message;
  this.code = 'CREATION_FAILED';
  this.cause = cause;
}

/**
 * Inherit from `Error`.
 */
CreationFailedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `CreationFailedError`.
 */
module.exports = CreationFailedError;
