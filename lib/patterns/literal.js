// Load modules.
var Spec = require('../spec')
  , util = require('util');


function LiteralSpec(id, obj, hs) {
  Spec.call(this, id, obj, hs);
  this.instance = obj;
}

// Inherit from `Spec`.
util.inherits(LiteralSpec, Spec);

LiteralSpec.prototype.instantiate = function() {
  return this.instance;
}


// Expose constructor.
module.exports = LiteralSpec;
