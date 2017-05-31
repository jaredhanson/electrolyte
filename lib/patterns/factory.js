// Load modules.
var Component = require('../component')
  , util = require('util')
  , debug = require('debug')('electrolyte');


/**
 * A component created using a factory function.
 *
 * Objects will be created by calling the factory function with any required
 * dependencies and returning the result.
 *
 * @constructor
 * @param {string} id - The id of the component.
 * @param {object} fn - The module containing the object factory.
 * @param {number} asm - The assembly from which the component was loaded.
 * @protected
 */
function FactoryComponent(id, fn, asm) {
  Component.call(this, id, fn, asm);
  this._fn = fn;
}

// Inherit from `Component`.
util.inherits(FactoryComponent, Component);

/**
 * Instantiate an object from the component specification.
 *
 * @private
 */
FactoryComponent.prototype.instantiate = function() {
  debug('instantiate %s', this.id);
  
  var ctx = {
    id: this.id,
    baseNS: this._assembly.namespace
  }
  return this._fn.apply(ctx, arguments);
}


// Expose constructor.
module.exports = FactoryComponent;
