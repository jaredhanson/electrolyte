/**
 * `ResolutionFailedError` error.
 *
 * @api public
 */
function ResolutionFailedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'ResolutionFailedError';
  this.message = message;
  this.code = 'RESOLUTION_FAILED';
}

/**
 * Inherit from `Error`.
 */
ResolutionFailedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ResolutionFailedError`.
 */
module.exports = ResolutionFailedError;
