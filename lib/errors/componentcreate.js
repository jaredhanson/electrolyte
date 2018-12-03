/**
 * `ComponentCreateError` error.
 *
 * @api public
 */
function ComponentCreateError(message) {
  // from https://stackoverflow.com/a/17936621/824979
  const temp = Error.apply(this, arguments);
  temp.name = this.name = 'ComponentCreateError';
  temp.code = this.code = 'COMPONENT_CREATE_ERROR';
  this.message = temp.message;
  Object.defineProperty(this, 'stack', {
      get: function() {
          return temp.stack
      },
      configurable: true
  })
}

/**
 * Inherit from `Error`.
 */
const IntermediateInheritor = function () {};
IntermediateInheritor.prototype = Error.prototype;
ComponentCreateError.prototype = new IntermediateInheritor();

/**
 * Expose `ComponentCreateError`.
 */
module.exports = ComponentCreateError;
