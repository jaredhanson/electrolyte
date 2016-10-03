// Load modules.
var EventEmitter = require('events')
  , util = require('util')
  , path = require('canonical-path')
  , Promise = require('bluebird')
  , FactorySpec = require('./patterns/factory')
  , ConstructorSpec = require('./patterns/constructor')
  , LiteralSpec = require('./patterns/literal')
  , InjectedContainer = require('./injectedcontainer')
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
  
  this.resolver(require('./resolvers/id')());
}

// Inherit from `EventEmitter`.
util.inherits(Container, EventEmitter);


/**
 * Utilize a source of objects.
 *
 * The container creates a objects from object sources.  Sources are typically
 * a directory on the file system or a package of objects that are specifically
 * designed to function together.
 *
 * @param {string} ns - The namespace under which to mount the source.
 * @param {function} fn - Loader of object specifications from the source.
 * @public
 */
Container.prototype.use = function(ns, s, options) {
  if (typeof ns !== 'string') {
    options = s;
    s = ns;
    ns = '';
  }
  options = options || {};
  
  var load = s
    , manifest = {}
    , ids, aid, spec, i, len;
  
  if (typeof s == 'object') {
    manifest = s;
    load = s.load || function noop(id) { return; };
  }
  
  if (typeof load != 'function') {
    throw new Error("Container#use requires a load function, was passed a '" + (typeof load) + "'");
  }
  
  var h = this._order.length;
  var source = { namespace: ns, load: load };
  this._sources[h] = source;
  this._order.unshift(h);
  
  ids = Object.keys(manifest);
  for (i = 0, len = ids.length; i < len; ++i) {
    aid = path.join(source.namespace, ids[i]);
    spec = manifest[ids[i]];
    if (spec === load) { continue; }
    this._registerSpec(aid, spec, source);
  }
  
  return this;
}

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
  return this._create(id, parent, false);
};

Container.prototype.createAsync = function(id, parent) {
  return this._create(id, parent, true);
};

Container.prototype._create = function(id, parent, isAsync) {
  if (parent && id[0] == '.') {
    // resolve relative component ID
    id = path.join(path.dirname(parent.id), id);
  }
  var psource = parent ? parent._source : undefined;
  
  // built-ins
  switch (id) {
  case '!container':
    return new InjectedContainer(this, parent, psource && psource.namespace);
  }
  
  id = this.resolve(id, parent);
  
  var spec = this._specs[id];
  if (!spec) {
    // No specification is registered with the given ID.  Attempt to register
    // the specification by loading its corresponding module.
    try {
      this._loadSpec(id);
    } catch (_) {}
  }
  
  spec = this._specs[id];
  if (!spec) {
    // After attemting auto-loading, the component ID is still unregistered,
    // which is a terminal condition.
    throw new Error('Unable to create object "' + id + '" required by: ' + (parent && parent.id || 'unknown'));
  }
  
  if (isAsync) {
    return Promise.resolve(spec.create(this)).then(function (obj) {
      this.emit('create', obj, spec);
      return obj;
    }.bind(this));
  } else {
    if (spec.isAsync) {
      throw new Error('Container#create cannot be called on async dependency: "' + id + '"');
    }

    var obj = spec.create(this);
    if (obj && typeof obj === 'object' && typeof obj.then === 'function') {
      deprecate('Promise-like component created via `create`, use `createAsync` instead');
    }

    this.emit('create', obj, spec);
    return obj;
  }
}

Container.prototype.specs = function() {
  // TODO: Wrap specs so they can be created in an optimzied way
  
  var ids = Object.keys(this._specs)
    , specs = []
    , i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    specs.push(this._specs[ids[i]]);
  }
  return specs;
}

Container.prototype.resolve = function(id, parent) {
  var resolvers = this._resolvers
    , fn, rid, i, len;
  for (i = 0, len = resolvers.length; i < len; ++i) {
    fn = resolvers[i];
    rid = fn(id, parent && parent.id);
    if (rid) { return rid; }
  }
  throw new Error('Unable to resolve interface "' + id + '" required by: ' + (parent && parent.id || 'unknown'));
}

Container.prototype.loader = deprecate.function(Container.prototype.use, 'Container#loader: Use Container#use instead');


Container.prototype.resolver = function(fn) {
  this._resolvers.push(fn);
}

/**
 * Load object specification.
 *
 * As a prerequisite for creating an object, an object specification must be
 * available.  The specification declares instructions about how to create an
 * object, such as whether the object should be a singleton instance and any
 * other objects required by the object to be created.
 *
 * Object instances will be created by invoking the specification's factory
 * function.  A factory function is typically a function that returns the
 * object or a constructor that is invoked using the `new` operator.
 *
 * @param {string} id - The id of the specification to load.
 * @private
 */
Container.prototype._loadSpec = function(id) {
  debug('autoload %s', id);
  var order = this._order
    , source, mod, rid;
  
  for (var i = 0, len = order.length; i < len; ++i) {
    source = this._sources[order[i]];
    rid = path.relative(source.namespace, id);
    if (rid.indexOf('../') == 0) { continue; }
    mod = source.load(rid);
  
    if (mod) {
      this._registerSpec(id, mod, source);
      return;
    }
  }
  
  throw new Error('Unable to load object specification "' + id + '"');
}

/**
 * Register object specification.
 *
 * When a specification is registered, the creational pattern used to create
 * instances of the object will be determined.  Creational patterns include
 * factory functions which return an object and constructors that are invoked
 * using the `new` operator.
 *
 * Additionally, common annotations needed when creating the instance are
 * examined.  Such annotations include `@require`, which is used to declare
 * other objects required by this object and `@singleton` which is set to
 * `true` to indicate that only a single instance of the object should be
 * created.  Other annotations may be declared, but such annotations are not
 * interpreted by the IoC container and are intended to be used by higher-level
 * frameworks.
 *
 * @param {string} id - The id of the specification to load.
 * @param {object} mod - The module containing the object factory.
 * @param {number} hs - The handle of the source from which the spec was loaded.
 * @private
 */
Container.prototype._registerSpec = function(id, mod, source) {
  var spec, pattern;
  
  if (mod['@literal']) {
    pattern = 'literal';
  } else if (typeof mod == 'function') {
    // The module exports a function.  If the function name begins with a
    // capital letter, it will be treated as a constructor.  Otherwise, it will
    // be treated as a factory function;
    var name = mod.name || 'anonymous';
    if (name[0] == name[0].toUpperCase()) {
      pattern = 'constructor';
    } else {
      pattern = 'factory';
    }
  }
  
  switch (pattern) {
  case 'factory':
    debug('register factory %s', id);
    spec = new FactorySpec(id, mod, source);
    break;
  case 'constructor':
    debug('register constructor %s', id);
    spec = new ConstructorSpec(id, mod, source);
    break;
  case 'literal':
  default:
    debug('register literal %s', id);
    spec = new LiteralSpec(id, mod, source);
    break;
  }
  
  this._specs[spec.id] = spec;
}


// Expose constructor.
module.exports = Container;
