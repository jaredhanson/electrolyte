/**
 * `ComponentNotFoundError` error.
 *
 * @api public
 */
function ComponentNotFoundError(message) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.code = 'COMPONENT_NOT_FOUND';
}

/**
 * Inherit from `Error`.
 */
ComponentNotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ComponentNotFoundError`.
 */
module.exports = ComponentNotFoundError;
