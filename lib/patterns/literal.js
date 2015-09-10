// Load modules.
var Spec = require('../spec')
  , util = require('util');


function LiteralSpec(id, dependencies, obj) {
  Spec.call(this, id, dependencies, obj);
  this.instance = obj;
}

// Inherit from `Spec`.
util.inherits(LiteralSpec, Spec);

LiteralSpec.prototype.instantiate = function() {
  return this.instance;
}

module.exports = LiteralSpec;
