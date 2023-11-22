// Load modules.
var Component = require('../component')
  , util = require('util');


/**
 * A component created using a constructor.
 *
 * Objects will be created by applying the `new` operator to the constructor
 * with any required dependencies and returning the result.
 *
 * @constructor
 * @param {string} id - The id of the component.
 * @param {object} mod - The module containing the object constructor.
 * @param {number} asm - The assembly from which the component was loaded.
 * @protected
 */
function ConstructorComponent(id, ctor, hs) {
  Component.call(this, id, ctor, hs);
  this._ctor = ctor;
}

// Inherit from `Component`.
util.inherits(ConstructorComponent, Component);

/**
 * Instantiate an object from the component specification.
 *
 * @private
 */
ConstructorComponent.prototype.instantiate = function() {
  var args = [].slice.call(arguments)
    , ctor = this._ctor;
  return new ctor(...args);
}


// Expose constructor.
module.exports = ConstructorComponent;
