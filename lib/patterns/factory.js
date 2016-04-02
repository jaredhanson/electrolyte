// Load modules.
var Spec = require('../spec')
  , util = require('util')
  , debug = require('debug')('electrolyte');


function FactorySpec(id, fn, hs) {
  Spec.call(this, id, fn, hs);
  this.fn = fn;
}

util.inherits(FactorySpec, Spec);

FactorySpec.prototype.instantiate = function() {
  debug('instantiate %s', this.id);
  return this.fn.apply(undefined, arguments);
}


// Expose constructor.
module.exports = FactorySpec;
