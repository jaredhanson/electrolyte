/**
 * `ImplementationNotFoundError` error.
 *
 * @api public
 */
function ImplementationNotFoundError(message, iface) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.code = 'IMPLEMENTATION_NOT_FOUND';
  this.interface = iface;
}

/**
 * Inherit from `Error`.
 */
ImplementationNotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `ImplementationNotFoundError`.
 */
module.exports = ImplementationNotFoundError;
