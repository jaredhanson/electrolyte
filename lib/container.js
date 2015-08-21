// Load modules.
var path = require('path')
  , Factory = require('./patterns/factory')
  , Constructor = require('./patterns/constructor')
  , Literal = require('./patterns/literal')
  , debug = require('debug')('electrolyte');


/**
 * Contains and manages components within an application.
 *
 * A container manages one or more objects, known as components.  Using
 * inversion of control principles, a container automatically instantiates and
 * assembles the set of components needed in an application.
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
  
  id = this.resolve(id);
  
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

Container.prototype.resolve = function(id) {
  var resolvers = this._resolvers
    , fn, rid, i, len;
  for (i = 0, len = resolvers.length; i < len; ++i) {
    fn = resolvers[i];
    rid = fn(id);
    if (rid) { return rid; }
  }
  throw new Error("Unable to resolve interface \"" + id + "\"");
}

Container.prototype.factory = function(id, dependencies, fn, sid) {
  if (typeof dependencies == 'function') {
    fn = dependencies;
    dependencies = [];
  }
  debug('register factory %s %s', id, dependencies);
  this.register(new Factory(id, dependencies, fn), sid);
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

Container.prototype.resolver = function(fn) {
  this._resolvers.push(fn);
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
