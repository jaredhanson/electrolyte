/**
 * `NotImplementedError` error.
 *
 * @api public
 */
function NotImplementedError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.name = 'NotImplementedError';
  this.message = message;
  this.code = 'NOT_IMPLEMENTED';
}

/**
 * Inherit from `Error`.
 */
NotImplementedError.prototype.__proto__ = Error.prototype;


/**
 * Expose `NotImplementedError`.
 */
module.exports = NotImplementedError;
