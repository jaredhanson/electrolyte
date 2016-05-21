// Load modules.
var Spec = require('../spec')
  , util = require('util')
  , debug = require('debug')('electrolyte');


/**
 * A specification using a factory function.
 *
 * Objects will be created by calling the factory function with any required
 * dependencies and returning the result.
 *
 * @constructor
 * @param {string} id - The id of the specification.
 * @param {object} mod - The module containing the object factory.
 * @param {number} hs - The handle of the source from which the spec was loaded.
 * @protected
 */
function FactorySpec(id, fn, hs) {
  Spec.call(this, id, fn, hs);
  this._fn = fn;
}

// Inherit from `Spec`.
util.inherits(FactorySpec, Spec);

/**
 * Instantiate an object from the specification.
 *
 * @private
 */
FactorySpec.prototype.instantiate = function() {
  debug('instantiate %s', this.id);
  
  var ctx = {
    id: this.id,
    baseNS: this._source.namespace
  }
  return this._fn.apply(ctx, arguments);
}


// Expose constructor.
module.exports = FactorySpec;
