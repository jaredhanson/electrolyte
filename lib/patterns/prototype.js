var Component = require('../component')
  , util = require('util');


function Prototype(id, dependencies, proto) {
  Component.call(this, id, dependencies);
  this.proto = proto;
}

util.inherits(Prototype, Component);

Prototype.prototype.instantiate = function() {
  return Object.create(this.proto);
}

module.exports = Prototype;
