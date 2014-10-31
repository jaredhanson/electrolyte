var Component = require('../component')
  , util = require('util')
  , debug = require('debug')('electrolyte');


function Singleton(id, dependencies, fn) {
  Component.call(this, id, dependencies, fn);
  this.fn = fn;
  this.inst = undefined;
}

util.inherits(Singleton, Component);

Singleton.prototype.instantiate = function() {
  if (this.inst) { return this.inst; }
  debug('instantiate %s', this.id);
  
  this.inst = this.fn.apply(undefined, arguments);
  this.loaded = true;
  return this.inst;
}

module.exports = Singleton;
