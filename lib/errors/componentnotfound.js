/**
 * `ComponentNotFoundError` error.
 *
 * @api public
 */
function ComponentNotFoundError(message) {
  // from https://stackoverflow.com/a/17936621/824979
  const temp = Error.apply(this, arguments);
  temp.name = this.name = 'ComponentNotFoundError';
  temp.code = this.code = 'COMPONENT_NOT_FOUND';
  this.message = temp.message;
  Object.defineProperty(this, 'stack', {
      get: function() {
          return temp.stack
      },
      configurable: true
  })
  this.name = "ComponentNotFoundError";
}

/**
 * Inherit from `Error`.
 */

const IntermediateInheritor = function () {};
IntermediateInheritor.prototype = Error.prototype
ComponentNotFoundError.prototype = new IntermediateInheritor()

/**
 * Expose `ComponentNotFoundError`.
 */
module.exports = ComponentNotFoundError;
