var Component = require('../component')
  , util = require('util')
  , debug = require('debug')('ionic');


function Factory(id, dependencies, fn) {
  Component.call(this, id, dependencies);
  this.fn = fn;
}

util.inherits(Factory, Component);

Factory.prototype.instantiate = function() {
  debug('instantiate %s', this.id);
  return this.fn.apply(undefined, arguments);
}

module.exports = Factory;
