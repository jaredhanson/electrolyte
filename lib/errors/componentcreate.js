/**
 * `ComponentCreateError` error.
 *
 * @api public
 */
function ComponentCreateError(message, cause) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.code = 'COMPONENT_CREATE_ERROR';
  this.cause = cause;
}

/**
 * Inherit from `Error`.
 */
ComponentCreateError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ComponentCreateError`.
 */
module.exports = ComponentCreateError;
