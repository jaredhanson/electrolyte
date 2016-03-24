// Load modules.
var EventEmitter = require('events')
  , util = require('util')
  , path = require('canonical-path')
  , FactorySpec = require('./patterns/factory')
  , ConstructorSpec = require('./patterns/constructor')
  , LiteralSpec = require('./patterns/literal')
  , InjectedContainer = require('./wrap/injected')
  , UsingContainer = require('./wrap/using')
  , deprecate = require('depd')('electrolyte')
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
  EventEmitter.call(this);
  this._specs = {};
  this._sources = {};
  this._order = [];
  this._resolvers = [];
  this._special = {};

  this.resolver(require('./resolvers/id')());
}

util.inherits(Container, EventEmitter);

/**
 * Create an object.
 *
 * Creates an object from the specifications registered with the container.
 * When the object being created requires other objects, the required objects
 * will automatically be created and injected into the requiring object.  In
 * this way, complex graphs of objects can be created in a single single line of
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

  // built-ins
  switch (id) {
  case '!container':
    // TODO: Get the source prefix and pass it here.   Isolate introspected specs
    //       to the prefix.
    return new InjectedContainer(this);
  }


  id = this.resolve(id, parent && parent.id);

  var spec = this._specs[id];
  if (!spec) {
    // No specification is registered with the given ID.  Attempt to register
    // the specification by loading its corresponding module.
    this._loadSpec(id);
  }

  spec = this._specs[id];
  if (!spec) {
    // After attemting auto-loading, the component ID is still unregistered,
    // which is a terminal condition.
    throw new Error("Unable to create object '" + id + "'");
  }

  var obj = spec.create(this);
  this.emit('create', obj, spec);
  return obj;
}

Container.prototype.specs = function() {
  var ids = Object.keys(this._specs)
    , specs = []
    , i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    specs.push(this._specs[ids[i]]);
  }
  return specs;
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

/**
 * Utilize a source of components within the container.
 *
 * The container creates a components from component sources.  Sources are
 * typically a directory on the file system or a package of components that are
 * specifically designed to function together.
 */
Container.prototype.use = function(prefix, fn) {
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
  this._sources[id] = { load: fn, prefix: prefix };
  this._order.unshift(id);

  if (fn && fn.used) {
    var wc = new UsingContainer(this, prefix);
    fn.used(wc);
  }
}

Container.prototype.loader = deprecate.function(Container.prototype.use, 'Container#loader: Use Container#use instead');


Container.prototype.resolver = function(fn) {
  this._resolvers.push(fn);
}

Container.prototype.special = function(id, fn) {
  this._special[id] = fn;
}

Container.prototype._loadSpec = function(id) {
  debug('autoload %s', id);
  var order = this._order
    , source, prefix, rid, mod;
  for (var i = 0, len = order.length; i < len; ++i) {
    source = this._sources[order[i]];
    prefix = source.prefix;
    if (id.indexOf(prefix) !== 0) { continue; }
    rid = id.slice(prefix.length);
    mod = source.load(rid);

    if (mod) {
      this._registerSpec(id, mod, order[i]);
      break;
    }
  }
}

Container.prototype._registerSpec = function(id, mod, hsource) {
  var dependencies = mod['@require'] || []
    , pattern = 'literal'
    , singleton = mod['@singleton']
    , spec

  if (typeof mod == 'object' && mod['@literal'] !== true) {
    var name = mod.name || 'default';
    mod = mod[name];
  }

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
    debug('register factory %s %s', id, dependencies);
    spec = new FactorySpec(id, dependencies, mod);
    break;
  case 'constructor':
    debug('register constructor %s %s', id, dependencies);
    spec = new ConstructorSpec(id, dependencies, mod);
    break;
  case 'literal':
    debug('register literal %s', id);
    spec = new LiteralSpec(id, [], mod);
    break;
  }

  spec._hsource = hsource;
  this._specs[spec.id] = spec;
}

module.exports = Container;
