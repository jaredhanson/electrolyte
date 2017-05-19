/**
 * `InvalidArgumentError` error.
 *
 * @api public
 */
function InvalidArgumentError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'InvalidArgumentError';
  this.message = message;
  this.code = 'INVALID_ARGUMENT';
}

/**
 * Inherit from `Error`.
 */
InvalidArgumentError.prototype.__proto__ = Error.prototype;


/**
 * Expose `InvalidArgumentError`.
 */
module.exports = InvalidArgumentError;
