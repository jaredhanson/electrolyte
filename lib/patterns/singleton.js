var Component = require('../component')
  , util = require('util');


function Singleton(id, dependencies, fn) {
  Component.call(this, id, dependencies);
  this.fn = fn;
  this.inst = undefined;
}

util.inherits(Singleton, Component);

Singleton.prototype.instantiate = function() {
  if (this.inst) { return this.inst; }
  this.inst = this.fn.apply(undefined, arguments);
  return this.inst;
}

module.exports = Singleton;
