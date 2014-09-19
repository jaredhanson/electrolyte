var path = require('path')
  , uuid = require('node-uuid').v4
  , Factory = require('./patterns/factory')
  , Singleton = require('./patterns/singleton')
  , Constructor = require('./patterns/constructor')
  , Literal = require('./patterns/literal')
  , debug = require('debug')('electrolyte');


function Container() {
  this._o = {};
  this._loaders = [];
  this._suites = {};
}

Container.prototype.create = function(id, parent) {
  if (parent && id[0] == '.') {
    // resolve relative component ID
    // TODO: Ensure that this uses '/' as a separator on Windows
    id = path.join(path.dirname(parent.id), id);
  }
  
  // special modules
  switch (id) {
  case '$container':
    return this;
  }
  
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

Container.prototype.factory = function(id, dependencies, fn, sid) {
  if (typeof dependencies == 'function') {
    fn = dependencies;
    dependencies = [];
  }
  debug('register factory %s %s', id, dependencies);
  this.register(new Factory(id, dependencies, fn), sid);
}

Container.prototype.singleton = function(id, dependencies, fn, sid) {
  if (typeof dependencies == 'function') {
    fn = dependencies;
    dependencies = [];
  }
  debug('register singleton %s %s', id, dependencies);
  this.register(new Singleton(id, dependencies, fn), sid);
}

Container.prototype.constructor = function(id, dependencies, ctor, sid) {
  if (typeof dependencies == 'function') {
    ctor = dependencies;
    dependencies = [];
  }
  debug('register constructor %s %s', id, dependencies);
  this.register(new Constructor(id, dependencies, ctor), sid);
}

Container.prototype.literal = function(id, obj, sid) {
  debug('register literal %s', id);
  this.register(new Literal(id, [], obj), sid);
}

Container.prototype.register = function(comp, sid) {
  // TODO: Pass sid to constructor (??)
  comp._sid = sid;
  this._o[comp.id] = comp;
}

Container.prototype.loader = function(prefix, fn, options) {
  if (typeof prefix == 'function') {
    fn = prefix;
    prefix = '';
  }
  if (prefix.length && prefix[prefix.length - 1] != '/') { prefix += '/'; }
  var id = uuid();
  this._loaders.push({ id: id, prefix: prefix, fn: fn });
  this._suites[id] = { prefix: prefix, options: options };
}

Container.prototype._loadModule = function(id) {
  debug('autoload %s', id);
  var loaders = this._loaders
    , loader, prefix, lid, mod;
  for (var i = 0, len = loaders.length; i < len; ++i) {
    loader = loaders[i];
    prefix = loader.prefix;
    if (id.indexOf(prefix) !== 0) { continue; }
    lid = id.slice(prefix.length);
    mod = loader.fn(lid);
    
    if (mod) {
      this._registerModule(id, mod, loader.id);
      break;
    }
  }
}

Container.prototype._registerModule = function(id, mod, sid) {
  var dependencies = mod['@require'] || []
    , pattern = 'literal';
  
  if (typeof mod == 'function') {
    var name = mod.name || 'anonymous'
      , arity = mod.length;
    if (name[0] == name[0].toUpperCase()) {
      pattern = 'constructor';
    } else {
      if (mod['@singleton']) {
        pattern = 'singleton';
      } else {
        pattern = 'factory';
      }
    }
    
    if (mod['@literal'] === true) {
      pattern = 'literal';
    }
  }
  
  switch (pattern) {
  case 'factory':
    this.factory(id, dependencies, mod, sid);
    break;
  case 'singleton':
    this.singleton(id, dependencies, mod, sid);
    break;
  case 'constructor':
    this.constructor(id, dependencies, mod, sid);
    break;
  case 'literal':
    this.literal(id, mod, sid);
    break;
  }
}

module.exports = Container;
