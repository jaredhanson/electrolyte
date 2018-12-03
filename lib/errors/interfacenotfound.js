/**
 * `InterfaceNotFoundError` error.
 *
 * @api public
 */
function InterfaceNotFoundError(message, iface) {
  // from https://stackoverflow.com/a/17936621/824979
  const temp = Error.apply(this, arguments);
  temp.name = this.name = 'InterfaceNotFoundError';
  temp.code = this.code = 'INTERFACE_NOT_FOUND';
  this.message = temp.message;
  Object.defineProperty(this, 'stack', {
      get: function() {
          return temp.stack
      },
      configurable: true
  })
  this.interface = iface;
}

/**
 * Inherit from `Error`.
 */
const IntermediateInheritor = function () {};
IntermediateInheritor.prototype = Error.prototype;
InterfaceNotFoundError.prototype = new IntermediateInheritor();


/**
 * Expose `InterfaceNotFoundError`.
 */
module.exports = InterfaceNotFoundError;
