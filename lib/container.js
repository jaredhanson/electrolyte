var Factory = require('./patterns/factory')
  , Constructor = require('./patterns/constructor')
  , Prototype = require('./patterns/prototype')
  , Singleton = require('./patterns/singleton');


function Container() {
  this._o = {};
}

Container.prototype.create = function(id) {
  var comp = this._o[id];
  if (!comp) { throw new Error("Unable to create component '" + id + "'"); }
  
  return comp.create(this);
}

Container.prototype.factory = function(id, dependencies, fn) {
  if (typeof dependencies == 'function') {
    fn = dependencies;
    dependencies = [];
  }
  this.register(new Factory(id, dependencies, fn));
}

Container.prototype.constructor = function(id, dependencies, ctor) {
  if (typeof dependencies == 'function') {
    ctor = dependencies;
    dependencies = [];
  }
  this.register(new Constructor(id, dependencies, ctor));
}

Container.prototype.prototype = function(id, proto) {
  this.register(new Prototype(id, [], proto));
}

Container.prototype.singleton = function(id, obj) {
  this.register(new Singleton(id, [], obj));
}

Container.prototype.register = function(comp) {
  this._o[comp.id] = comp;
}

module.exports = Container;
