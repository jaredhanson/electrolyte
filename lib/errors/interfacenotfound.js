/**
 * `InterfaceNotFoundError` error.
 *
 * @api public
 */
function InterfaceNotFoundError(message, iface) {
  Error.call(this);
  Error.captureStackTrace(this, arguments.callee);
  this.message = message;
  this.code = 'INTERFACE_NOT_FOUND';
  this.interface = iface;
}

/**
 * Inherit from `Error`.
 */
InterfaceNotFoundError.prototype.__proto__ = Error.prototype;


/**
 * Expose `InterfaceNotFoundError`.
 */
module.exports = InterfaceNotFoundError;
