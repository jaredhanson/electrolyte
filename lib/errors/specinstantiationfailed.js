/**
 * `SpecInstantiationFailedError` error.
 *
 * @api public
 */
function SpecInstantiationFailedError(message, cause) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'SpecInstantiationFailedError';
  this.message = message;
  this.code = 'SPEC_INSTANTIATION_FOUND';
  this.cause = cause;
}

/**
 * Inherit from `Error`.
 */
SpecInstantiationFailedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `SpecInstantiationFailedError`.
 */
module.exports = SpecInstantiationFailedError;