/**
 * `ComponentNotFoundError` error.
 *
 * @api public
 */
function ComponentNotFoundError(message, iface) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.code = 'IMPLEMENTATION_NOT_FOUND';
  this.interface = iface;
}

/**
 * Inherit from `Error`.
 */
ComponentNotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ComponentNotFoundError`.
 */
module.exports = ComponentNotFoundError;
