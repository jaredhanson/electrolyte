var Component = require('../component')
  , util = require('util');


function Literal(id, dependencies, obj) {
  Component.call(this, id, dependencies, obj);
  this.obj = obj;
  this.loaded = true;
}

util.inherits(Literal, Component);

Literal.prototype.instantiate = function() {
  return this.obj;
}

module.exports = Literal;
