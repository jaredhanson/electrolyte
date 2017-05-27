// Load modules.
var EventEmitter = require('events')
  , util = require('util')
  , path = require('canonical-path')
  , Promise = require('promise')
  , Assembly = require('./assembly')
  , FactoryComponent = require('./patterns/factory')
  , ConstructorComponent = require('./patterns/constructor')
  , LiteralComponent = require('./patterns/literal')
  , InjectedContainer = require('./injectedcontainer')
  , InterfaceNotFoundError = require('./errors/interfacenotfound')
  , ComponentNotFoundError = require('./errors/componentnotfound')
  , ComponentCreateError = require('./errors/componentcreate')
  , debug = require('debug')('electrolyte');


/**
 * Manages objects within an application.
 *
 * A container creates and manages the set of objects within an application.
 * Using inversion of control principles, a container automatically instantiates
 * and assembles these objects.
 *
 * Objects are created according to a component specification.  A component
 * specification defines the requirements necessary to create an object.  Such
 * requirements include the objects required by the object being created.  When
 * an object requires other objects, the required objects will be created prior
 * to the requiring object, and so on, transitively assembling the complete
 * graph of objects as necessary.  Component specifications, and the objects
 * created from them, are often colloquially referred to as simply "components."
 *
 * A component specification can request objects that conform to an interface.
 * An interface declares the abstract behavior of an object, without concern
 * for implementation details.  The container will dynamically create an object
 * that conforms to the interface according to the runtime environment and
 * configuration.  This component-based approach to software development
 * increases modularity of the system.
 *
 * @constructor
 * @api public
 */
function Container() {
  EventEmitter.call(this);
  this._assemblies = {};
  this._order = [];
  this._components = {};
  this._resolvers = [];
  
  this.resolver(require('./resolvers/id')());
}

// Inherit from `EventEmitter`.
util.inherits(Container, EventEmitter);


/**
 * Utilize an assembly.
 *
 * The container creates objects from assemblies.  An assembly is a collection
 * of components that are built to work together and form a logical unit of
 * functionality.  An assembly is typically distributed as a package,
 * facilitating resuse across applications.  For application-specific components
 * that are not reusable, an assembly can simply consist of a directory on the
 * file system.
 *
 * @param {string?} ns - optional namespace under which to mount the assembly.
 * @param {function|object} asm - assembly of components.
 * @public
 */
Container.prototype.use = function(ns, asm) {
  if (typeof ns !== 'string') {
    // force ns to be an empty string if not specified
    asm = ns;
    ns = '';
  }
  asm = asm || {};

  // accept either object or loader function
  if (typeof asm == 'function') {
    asm = { load: asm, export: true };
  }

  if (typeof asm.load != 'function') {
    throw new TypeError("Container#use requires `asm` to be either a function or an object with a `load` function, '" + (typeof asm.load) + "' has been passed");
  }
  
  var h = this._order.length;
  asm = new Assembly(h, ns, asm);
  this._assemblies[h] = asm;
  this._order.unshift(h);
  
  var ids = asm.components
    , comp, i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    comp = asm.load(ids[i]);
    if (!comp) {
      throw new ComponentNotFoundError("Cannot find component '" + ids[i] + "'");
    }
    this._registerComponent(ids[i], comp, asm);
  }

  return this;
}

/**
 * Create an object.
 *
 * Creates an object from the assemblies registered with the container.  When
 * the object being created requires other objects, the required objects will
 * automatically be created and injected into the requiring object.  In this
 * way, complex graphs of objects can be created in a single single line of
 * code, eliminating extraneous boilerplate.
 *
 * A component specification can declare an object to be a singleton.  In such
 * cases, only one instance of the object will be created.  Subsequent calls to
 * create the object will return the singleton instance.
 *
 * Examples:
 *
 *     var foo = IoC.create('foo');
 *
 *     var boop = IoC.create('beep/boop');
 *
 * @param {string} id - The id or interface of the object to create.
 * @param {Component} [parent] - (private) The parent component requiring the object.
 * @param {Component} [ecomp] - (private) The component to create.
 * @returns {Promise}
 * @public
 */
Container.prototype.create = function(id, parent, ecomp) {
  // built-ins
  switch (id) {
  case '!container':
    return Promise.resolve(new InjectedContainer(this, parent));
  }
  
  return new Promise(function(resolve, reject) {
    var self = this;
    function create(comp) {
      if (!parent || comp._assembly.h == parent._assembly.h) {
        // The object is being created by another object within the same
        // assembly, or by the main script.
        return resolve(comp.create(self));
      } else {
        // The object is being created by an object from another assembly.
        // Most typically, a component interface is requested, allowing dynamic
        // object creation according to the runtime environment and
        // configuration.
        //
        // Assemblies declare the components they export for use by other
        // assemblies.  Any non-exported components are considered private, and
        // usable only within the assembly itself.  Restrictions are put in
        // place to prevent private components from being used outside of their
        // assembly.
        if (!comp._assembly.isExported(comp.id)) {
          return reject(new ComponentCreateError("Private component '" + comp.id + "' required by '" + parent.id + "'"));
        }
        return resolve(comp.create(self));
      }
    }
    
    
    if (ecomp) {
      // A component has been exposed via introspection, and an object is being
      // created from the component specification.  This is a fast path,
      // implemented as an optimization to avoid redundant resolution
      // operations.
      return create(ecomp);
    }
    
    if (parent && id[0] == '.') {
      // resolve relative component ID
      id = path.join(path.dirname(parent.id), id);
    }
    id = this.resolve(id, parent);
    
    var comp = this._components[id];
    if (comp) {
      return create(comp);
    } else {
      var self = this;
      this._loadComponent(id, function(err, comp) {
        if (err instanceof ComponentNotFoundError) {
          // Reject with a more informative error message that indicates the
          // requiring component.  This assists the developer in finding and
          // fixing the cause of error.
          reject(new ComponentNotFoundError("Unable to create component '" + id + "' required by '" + (parent && parent.id || 'unknown') + "'"));
        } else if (err) {
          return reject(err);
        }
        return create(comp);
      });
    }
  }.bind(this));
}

Container.prototype.components = function() {
  var ids = Object.keys(this._components)
    , comps = []
    , i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    comps.push(this._components[ids[i]]);
  }
  return comps;
}

Container.prototype.resolve = function(id, parent) {
  var resolvers = this._resolvers
    , fn, rid, i, len;
  for (i = 0, len = resolvers.length; i < len; ++i) {
    fn = resolvers[i];
    rid = fn(id, parent && parent.id);
    if (rid) { return rid; }
  }
  throw new InterfaceNotFoundError("Cannot find component implementing interface '" + id + "' required by '" + (parent && parent.id || 'unknown') + "'", id);
}


Container.prototype.resolver = function(fn) {
  this._resolvers.push(fn);
}

/**
 * Load component specification.
 *
 * As a prerequisite for creating an object, a component specification must be
 * available.  The specification declares instructions about how to create an
 * object, such as whether the object should be a singleton instance and any
 * other objects required by the object to be created.
 *
 * Object instances will be created by invoking the component's factory
 * function.  A factory function is typically a function that returns the object
 * or a constructor that is invoked using the `new` operator.
 *
 * @param {string} id - The id of the component specification to load.
 * @private
 */
Container.prototype._loadComponent = function(id, cb) {
  debug('autoload %s', id);
  var order = this._order
    , asm, comp, rid
    , i, len;
  
  for (i = 0, len = order.length; i < len; ++i) {
    asm = this._assemblies[order[i]];
    rid = path.relative(asm.namespace, id);
    if (rid.indexOf('../') == 0) { continue; }
    comp = asm.load(id);
  
    if (comp) {
      spec = this._registerComponent(id, comp, asm);
      return cb(null, spec);
    }
  }
  return cb(new ComponentNotFoundError("Cannot find component '" + id + "'"));
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
Container.prototype._registerComponent = function(id, mod, source) {
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
    spec = new FactoryComponent(id, mod, source);
    break;
  case 'constructor':
    debug('register constructor %s', id);
    spec = new ConstructorComponent(id, mod, source);
    break;
  case 'literal':
  default:
    debug('register literal %s', id);
    spec = new LiteralComponent(id, mod, source);
    break;
  }
  
  this._components[spec.id] = spec;
  return spec;
}


// Expose constructor.
module.exports = Container;
