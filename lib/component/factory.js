var Component = require('../component')
  , util = require('util');


function Factory(id, dependencies, fn) {
  Component.call(this, id, dependencies);
  this.fn = fn;
}

util.inherits(Factory, Component);

Factory.prototype.instantiate = function() {
  return this.fn.apply(undefined, arguments);
}

module.exports = Factory;
