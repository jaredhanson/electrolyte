// Load modules.
var Spec = require('../spec')
  , util = require('util')
  , debug = require('debug')('electrolyte');


/**
 * A specification using a constructor.
 *
 * Objects will be created by applying the `new` operator to the constructor
 * with any required dependencies and returning the result.
 *
 * @constructor
 * @param {string} id - The id of the specification.
 * @param {object} mod - The module containing the object factory.
 * @param {number} hs - The handle of the source from which the spec was loaded.
 * @protected
 */
function ConstructorSpec(id, ctor, hs) {
  Spec.call(this, id, ctor, hs);
  this._ctor = ctor;
}

// Inherit from `Spec`.
util.inherits(ConstructorSpec, Spec);

/**
 * Instantiate an object from the specification.
 *
 * @private
 */
ConstructorSpec.prototype.instantiate = function() {
  debug('instantiate %s', this.id);
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
  throw new Error("Constructor for object '" + this.id + "' requires too many arguments");
}


// Expose constructor.
module.exports = ConstructorSpec;
