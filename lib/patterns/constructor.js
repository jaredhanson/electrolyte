// Load modules.
var Component = require('../component')
  , util = require('util')
  , ComponentCreateError = require('../errors/componentcreate');


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
  switch (args.length) {
  case  0: return new ctor();
  case  1: return new ctor(args[0]);
  case  2: return new ctor(args[0], args[1]);
  case  3: return new ctor(args[0], args[1], args[2]);
  case  4: return new ctor(args[0], args[1], args[2], args[3]);
  case  5: return new ctor(args[0], args[1], args[2], args[3], args[4]);
  case  6: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
  case  7: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
  case  8: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
  case  9: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
  case 10: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
  }
  throw new ComponentCreateError("Constructor for object '" + this.id + "' requires too many arguments");
}


// Expose constructor.
module.exports = ConstructorComponent;
