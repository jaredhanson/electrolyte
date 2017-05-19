/**
 * `SpecInitFailedError` error.
 *
 * @api public
 */
function SpecInitFailedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'SpecInitFailedError';
  this.message = message;
  this.code = 'SPEC_INIT_FAILED';
}

/**
 * Inherit from `Error`.
 */
SpecInitFailedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `SpecInitFailedError`.
 */
module.exports = SpecInitFailedError;
