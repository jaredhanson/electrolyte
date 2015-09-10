// Load modules.
var path = require('canonical-path')
  , FactorySpec = require('./patterns/factory')
  , ConstructorSpec = require('./patterns/constructor')
  , LiteralSpec = require('./patterns/literal')
  , debug = require('debug')('electrolyte');


/**
 * Manages objects within an application.
 *
 * A container creates and manages the set of objects within an application.
 * Using inversion of control principles, a container automatically instantiates
 * and assembles these objects.
 *
 * Objects are created from a specification.  A specification defines the
 * requirements needed in order to create an object.  Such requirements include
 * the objects required by the object being created.  When an object requires
 * other objects, the required objects will be created prior to the requiring
 * object, and so on, transitively assembling the complete graph of objects as
 * necessary.
 *
 * @constructor
 * @api public
 */
function Container() {
  this._o = {};
  this._sources = {};
  this._order = [];
  this._expose = undefined;
  this._resolvers = [];
  
  this.resolver(require('./resolvers/id')());
}

/**
 * Create an object.
 *
 * Creates an object from the specifications registered with the container.
 * When the object being created requires other objects, tthe required will
 * automatically be created and injected into the requiring object.  In this
 * way, complex graphs of objects can be created in a single single line of
 * code, eliminating extraneous boilerplate.
 *
 * A specification can declare an object to be a singleton.  In such cases, only
 * one instance of the object will be created.  Subsequent calls to create the
 * object will return the singleton instance.
 *
 * Examples:
 *
 *     var foo = IoC.create('foo');
 *
 *     var boop = IoC.create('beep/boop');
 *
 * @param {string} id - The id of the object to create.
 * @param {Spec} [parent] - (private) The parent specification requiring the object.
 * @returns {object}
 * @public
 */
Container.prototype.create = function(id, parent) {
  if (parent && id[0] == '.') {
    // resolve relative component ID
    id = path.join(path.dirname(parent.id), id);
  }
  
  // special modules
  switch (id) {
  case '$container':
    return this;
  }
  
  id = this.resolve(id, parent && parent.id);
  
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

Container.prototype.resolve = function(id, pid) {
  var resolvers = this._resolvers
    , fn, rid, i, len;
  for (i = 0, len = resolvers.length; i < len; ++i) {
    fn = resolvers[i];
    rid = fn(id, pid);
    if (rid) { return rid; }
  }
  // TODO: Give more debugging information here.  What was the requiring file?
  throw new Error("Unable to resolve interface \"" + id + "\"");
}

Container.prototype.factory = function(id, dependencies, fn, sid) {
  if (typeof dependencies == 'function') {
    fn = dependencies;
    dependencies = [];
  }
  debug('register factory %s %s', id, dependencies);
  this.register(new FactorySpec(id, dependencies, fn), sid);
}

Container.prototype.constructor = function(id, dependencies, ctor, sid) {
  if (typeof dependencies == 'function') {
    ctor = dependencies;
    dependencies = [];
  }
  debug('register constructor %s %s', id, dependencies);
  this.register(new ConstructorSpec(id, dependencies, ctor), sid);
}

Container.prototype.literal = function(id, obj, sid) {
  debug('register literal %s', id);
  this.register(new LiteralSpec(id, [], obj), sid);
}

Container.prototype.register = function(comp, sid) {
  // TODO: Pass sid to constructor (??)
  comp._sid = sid;
  this._o[comp.id] = comp;
}

/**
 * Utilize a source of components within the container.
 *
 * The container creates a components from component sources.  Sources are
 * typically a directory on the file system or a package of components that are
 * specifically designed to function together.
 */
Container.prototype.loader =
Container.prototype.use = function(prefix, fn, options) {
  if (typeof prefix == 'function') {
    options = fn;
    fn = prefix;
    prefix = '';
  }
  if (typeof fn != 'function') {
    throw new Error("Container#use requires a function, was passed a '" + (typeof fn) + "'");
  }
  
  if (prefix.length && prefix[prefix.length - 1] != '/') { prefix += '/'; }
  var id = this._order.length;
  this._sources[id] = { mod: fn, prefix: prefix, options: options };
  this._order.unshift(id);
}

Container.prototype.resolver = function(fn) {
  this._resolvers.push(fn);
}

Container.prototype.expose = function(cb) {
  this._expose = cb;
}

Container.prototype._loadModule = function(id) {
  debug('autoload %s', id);
  var order = this._order
    , source, prefix, rid, mod;
  for (var i = 0, len = order.length; i < len; ++i) {
    source = this._sources[order[i]];
    prefix = source.prefix;
    if (id.indexOf(prefix) !== 0) { continue; }
    rid = id.slice(prefix.length);
    mod = source.mod(rid);
    
    if (mod) {
      this._registerModule(id, mod, source.id);
      break;
    }
  }
}

Container.prototype.iterateOverSources = function(fn) {
  var order = this._order
    , sources = this._sources
    , source, i, len, done;
  for (i = 0, len = order.length; i < len; ++i) {
    source = sources[order[i]];
    cont = fn(source.mod, source.prefix);
    if (done === true) {
      break;
    }
  }
}

Container.prototype._registerModule = function(id, mod, sid) {
  var dependencies = mod['@require'] || []
    , pattern = 'literal'
    , singleton = mod['@singleton'];
  
  if (typeof mod == 'function' && mod['@literal'] !== true) {
    var name = mod.name || 'anonymous';
    if (name[0] == name[0].toUpperCase()) {
      pattern = 'constructor';
    } else {
      pattern = 'factory';
    }
  }
  
  switch (pattern) {
  case 'factory':
    this.factory(id, dependencies, mod, sid);
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
