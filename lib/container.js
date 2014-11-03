/**
 * Module dependencies.
 */
var path = require('path')
  , Factory = require('./patterns/factory')
  , Singleton = require('./patterns/singleton')
  , Constructor = require('./patterns/constructor')
  , Literal = require('./patterns/literal')
  , debug = require('debug')('electrolyte');


/**
 * `Container` constructor.
 *
 * A container contains a set of named object instances, known as components.
 * These components are automatically created when needed and injected into
 * other components that require them.
 *
 * A default `Container` singleton is exported via the module.  Applications
 * should not need to construct additional instances, and are advised against
 * doing so.
 *
 * @api public
 */
function Container() {
  this._o = {};
  this._sources = {};
  this._order = [];
  this._expose = undefined;
}

/**
 * Create a component.
 *
 * When the component being created requires other components (using `@require`
 * annotations), those components will automatically be created and injected
 * into the component.  In this way, complex graphs of objects can be
 * constructed with a single line of code, eliminating extraneous boilerplate.
 *
 * A component can be annotated as being a singletion (using `@singleton`).  If
 * so, only one instance of the named component will be created.  Subsequent
 * calls to create the component will return the singleton instance.
 *
 * Examples:
 *
 *     var foo = IoC.create('foo');
 *
 *     var boop = IoC.create('beep/boop');
 *
 * @param {String} id
 * @return {mixed}
 * @api public
 */
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

Container.prototype.loader =
Container.prototype.use = function(prefix, fn, options) {
  if (typeof prefix == 'function') {
    fn = prefix;
    prefix = '';
  }
  if (typeof fn != 'function') {
    // Adding a loader that isn't a function is bad mojo
    throw new Error("Loader requires a function, was passed a '" + (typeof fn) + "'");
    
  }
  if (prefix.length && prefix[prefix.length - 1] != '/') { prefix += '/'; }
  var id = this._order.length;
  this._sources[id] = { prefix: prefix, fn: fn, options: options };
  this._order.push({ id: id, prefix: prefix, fn: fn });
}

Container.prototype.expose = function(cb) {
  this._expose = cb;
}

Container.prototype._loadModule = function(id) {
  debug('autoload %s', id);
  var sources = this._order
    , source, prefix, rid, mod;
  for (var i = 0, len = sources.length; i < len; ++i) {
    source = sources[i];
    prefix = source.prefix;
    if (id.indexOf(prefix) !== 0) { continue; }
    rid = id.slice(prefix.length);
    mod = source.fn(rid);
    
    if (mod) {
      this._registerModule(id, mod, source.id);
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
  
  // TODO: Clean this up.  Singleton should be eliminated and handled
  //       as an option by both factory and constructor patterns.
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
