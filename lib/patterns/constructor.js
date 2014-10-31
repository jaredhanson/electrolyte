var Component = require('../component')
  , util = require('util')
  , debug = require('debug')('electrolyte');


function Constructor(id, dependencies, ctor) {
  Component.call(this, id, dependencies, ctor);
  this.ctor = ctor;
}

util.inherits(Constructor, Component);

Constructor.prototype.instantiate = function() {
  debug('instantiate %s', this.id);
  var args = [].slice.call(arguments)
    , ctor = this.ctor;
  switch (args.length) {
  case  0: return new ctor();
  case  1: return new ctor(args[0]);
  case  2: return new ctor(args[0], args[1]);
  case  3: return new ctor(args[0], args[1], args[2]);
  case  4: return new ctor(args[0], args[1], args[2], args[3]);
  case  5: return new ctor(args[0], args[1], args[2], args[3], args[4]);
  case  6: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5]);
  case  7: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6]);
  case  8: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7]);
  case  9: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8]);
  case 10: return new ctor(args[0], args[1], args[2], args[3], args[4], args[5], args[6], args[7], args[8], args[9]);
  }
  throw new Error("Constructor for component '" + this.id + "' requires too many arguments");
}

module.exports = Constructor;
