var Factory = require('./patterns/factory')
  , Constructor = require('./patterns/constructor')
  , Prototype = require('./patterns/prototype')
  , Singleton = require('./patterns/singleton')
  , debug = require('debug')('ionic');


function Container() {
  this._o = {};
  this._loaders = [];
}

Container.prototype.create = function(id) {
  var comp = this._o[id];
  if (!comp) {
    // No component is registered with the given ID.  Attempt to register the
    // component by loading its corresponding module.
    this._loadModule(id);
  }
  comp = this._o[id];
  if (!comp) {
    // After attemting auto-loading, the component ID is still unregistered,
    // which is a terminal condition.
    throw new Error("Unable to create component '" + id + "'");
  }
  
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
  debug('register constructor %s %s', id, dependencies);
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

Container.prototype.loader = function(fn) {
  this._loaders.push(fn);
}

Container.prototype._loadModule = function(id) {
  var loaders = this._loaders
    , loader, mod;
  for (var i = 0, len = loaders.length; i < len; ++i) {
    loader = loaders[i];
    mod = loader(id);
    if (mod) {
      this._registerModule(id, mod);
      break;
    }
  }
}

Container.prototype._registerModule = function(id, mod) {
  var pattern = mod['@pattern']
    , dependencies = mod['@require'] || [];
  
  if (!pattern) {
    // Auto-detect the pattern, if not explicitly declared.
    if (typeof mod == 'function') {
      var name = mod.name || 'anonymous';
      if (name[0] == name[0].toUpperCase()) { pattern = 'constructor'; }
      else { pattern = 'factory'; }
    }
  }
  
  switch (pattern) {
  case 'constructor':
    this.constructor(id, dependencies, mod);
    break;
  }
}

module.exports = Container;
