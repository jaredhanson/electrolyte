var Component = require('../component')
  , util = require('util');


function Literal(id, dependencies, obj) {
  Component.call(this, id, dependencies, obj);
  this.instance = obj;
}

util.inherits(Literal, Component);

Literal.prototype.instantiate = function() {
  return this.instance;
}

module.exports = Literal;
