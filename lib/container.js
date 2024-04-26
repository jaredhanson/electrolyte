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
  , ImplNotFoundError = require('./errors/implnotfound')
  , ComponentNotFoundError = require('./errors/componentnotfound')
  , ComponentCreateError = require('./errors/componentcreate')
  , pMultiFilter = require('./p-multifilter')
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
 * requirements include parameters and other objects required by the object
 * being created.  When an object requires other objects, the required objects
 * will be created prior to the requiring object, and so on, transitively
 * assembling the complete graph of objects as necessary.  Component
 * specifications, and the objects created from them, are often colloquially
 * referred to as simply "components."
 *
 * A component specification can request objects that conform to an interface.
 * An interface declares the abstract behavior of an object, without concern
 * for implementation details.  The container will create an object that
 * conforms to the interface according to the runtime environment and
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
  this._filters = [];
  this._sorters = [];
  this._variables = {};
  this._wrappers = {};
  
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
Container.prototype.use = function(ns, pkg) {
  if (typeof ns !== 'string') {
    // force ns to be an empty string if not specified
    pkg = ns;
    ns = '';
  }
  pkg = pkg || {};
  
  // TODO: Clean this up
  if (pkg.use) {
    //console.log('');
    pkg.use(this);
  }

  // accept either object or loader function
  if (typeof pkg == 'function') {
    // TODO: test this export flag
    pkg = { load: pkg, export: true };
  }

  if (typeof pkg.load != 'function') {
    throw new TypeError("Container#use requires `pkg` to be either a function or an object with a `load` function, '" + (typeof pkg.load) + "' has been passed");
  }
  
  // TODO: test the load order
  var h = this._order.length;
  pkg = new Assembly(h, ns, pkg);
  this._assemblies[h] = pkg;
  this._order.unshift(h);
  
  
  
  // Register components exported by the package.  Registering at load time
  // allows the container to construct a registry of which interfaces are
  // implemented by which components.  This allows other components to require
  // components by interface name, rather than module identifer, thus decoupling
  // from implementation details.
  var ids = pkg.components
    , comp, i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    comp = pkg.load(ids[i]);
    if (!comp) {
      throw new ComponentNotFoundError("Cannot find component '" + ids[i] + "'");
    }
    this._registerComponent(ids[i], comp, pkg);
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
Container.prototype.create = function(id, parent, ecomp, options) {
  //if (id == 'http://i.bixbyjs.org/http/middleware/session') {
  if (id == 'http://i.bixbyjs.org/http/middleware/authenticate') {
    console.log('!!! ATTEMPTED TO CREATE AUTH MIDDLEWARE: ' + parent.id);
  }
  
  
  // TODO: Implement feature to create from function???
  /*
  if (typeof id == 'function') {
    var fc = new FactoryComponent('__anonymous__', id);
    var c = fc.create(this);
    
    c.then(function(i) {
      console.log('*******________ RESOLVED')
      console.log(i);
    })
    return c;
  }
  */
  
  if (id[id.length - 1] == '?') {
    console.log('**** IT IS OPTIONAL ***');
    console.log(id);
  }
  
  var optional = false;
  if (id[id.length - 1] == '?') {
    optional = true;
    id = id.slice(0, id.length - 1);
  }
  
  
  // built-ins
  switch (id) {
  case '!container':
    return Promise.resolve(new InjectedContainer(this, parent));
  //case '$location':
    //console.log('*** CREATE LOCATION ****');
    
    // TODO: Factor this better
    //return require('./resolvers/location')(this, parent);
  }
  
  if (this._variables[id]) {
    console.log('IT IS A VARIABLE ****');
    return this._variables[id](this, parent);
  }
  
  
  
  // FIXME: self should be defined here, not in the promise
  return new Promise(function(resolve, reject) {
    var self = this;
    function create(comp) {
      if (!parent || comp._assembly.h == parent._assembly.h) {
        // The object is being created by another object within the same
        // assembly, or by the main script.
        return resolve(comp.create(self, options));
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
        return resolve(comp.create(self, options));
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
    id = this.resolve(id, parent, optional);
    if (!id) {
      // optional
      return resolve(undefined);
    }
    
    if (Array.isArray(id)) {
      pMultiFilter(id, self._filters)
        .then(function(candidates) {
          // TODO: handle 0-length array
          
          if (candidates.length > 1) {
            // FIXME: hack to auto-select "app/" prefixed components.  This should be factored
            // out to a bixby-based resolver
            var countAppProvided = 0
              , iAppProvided, i, len;
            for (i = 0, len = candidates.length; i < len; ++i) {
              if (candidates[i].id.indexOf('app/') == 0) {
                countAppProvided++;
                iAppProvided = i;
              }
            }
            if (countAppProvided == 1) {
              return create(candidates[iAppProvided]);
            }
            
            // TODO: Make this error string to candidate ids
            // FIXME: this is giving [object Object],[object Object] in string where the map is
            reject(new Error("Multiple components provide interface '" + id + "' required by '" + (parent || 'unknown') + "'. Configure one of: " + candidates.map(function(c) { return c.id }).join(', ')));
          }
          
          var c = candidates[0];
          return create(c);
        });
        
      return;
    }
    if (typeof id == 'object') {
      // TODO: In what cases do we fall below and need to regiser components?
      //console.log('**** RETURNED A COMPONENT, OPTIMIZE FAST PATH');
      return create(id);
    }
    
    // TODO: Eliminate this below here by always returning a component from a resolver.
    
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
          reject(new ComponentNotFoundError("Unable to create component '" + id + "' required by '" + (parent && parent.id || 'unknown') + "'", id));
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

Container.prototype.resolve = function(id, parent, optional) {
  var resolvers = this._resolvers
    , fn, rid, i, len;
  for (i = 0, len = resolvers.length; i < len; ++i) {
    fn = resolvers[i];
    rid = fn(id, parent && parent.id);
    
    /*
    if (rid) {
      if (Array.isArray(rid)) {
        console.log('NEED TO FILTER THIS...');
        return;
      }
    }
    */
    
    if (rid) { return rid; }
  }
  if (optional) { return undefined; }
  throw new ImplNotFoundError("Cannot find implementation of '" + id + "' required by '" + (parent && parent.id || 'unknown') + "'", id);
}


Container.prototype.resolver = function(fn) {
  this._resolvers.push(fn);
}

Container.prototype.filter = function(fn) {
  this._filters.push(fn);
}

Container.prototype.sorter = function(fn) {
  this._sorters.push(fn);
}

Container.prototype.variable = function(name, fn) {
  this._variables['$' + name] = fn;
}

Container.prototype.wrap = function(name, fn) {
  this._wrappers[name] = fn;
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
  return cb(new ComponentNotFoundError("Cannot find component '" + id + "'", id));
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
