/**
 * `SpecNotFound` error.
 *
 * @api public
 */
function SpecNotFoundError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'SpecNotFoundError';
  this.message = message;
  this.code = 'SPEC_NOT_FOUND';
}

/**
 * Inherit from `Error`.
 */
SpecNotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `SpecNotFoundError`.
 */
module.exports = SpecNotFoundError;