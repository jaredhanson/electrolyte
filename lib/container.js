// Load modules.
var EventEmitter = require('events')
  , util = require('util')
  , path = require('canonical-path')
  , Promise = require('promise')
  , Assembly = require('./assembly')
  , FactorySpec = require('./patterns/factory')
  , ConstructorSpec = require('./patterns/constructor')
  , LiteralSpec = require('./patterns/literal')
  , InjectedContainer = require('./injectedcontainer')
  , CreationFailedError = require('./errors/creationfailed')
  , InvalidArgumentError = require('./errors/invalidargument')
  , ResolutionFailedError = require('./errors/resolutionfailed')
  , SpecNotFoundError = require('./errors/specnotfound')
  , SpecInitFailedError = require('./errors/specinitfailed')
  , debug = require('debug')('electrolyte');


/**
 * Manages objects within an application.
 *
 * A container creates and manages the set of objects within an application.
 * Using inversion of control principles, a container automatically instantiates
 * and assembles these objects.
 *
 * Objects are created from a specification.  A specification defines the
 * requirements necessary to create an object.  Such requirements include the
 * objects required by the object being created.  When an object requires other
 * objects, the required objects will be created prior to the requiring object,
 * and so on, transitively assembling the complete graph of objects as
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
 * Utilize an assembly.
 *
 * The container creates objects from assemblies.  An assembly is a collection
 * of objects that are built to work together and form a logical unit of
 * functionality.  An assembly is typically distributed as a package,
 * facilitating resuse across applications.  For application-specific objects
 * that are not reusable, an assembly can simply consist of a directory on the
 * file system.
 *
 * @param {string?} ns - optional namespace under which to mount the assembly.
 * @param {function|object} asm - assembly of object specifications.
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
    asm = { load: asm };
  }

  if (typeof asm.load != 'function') {
    throw new TypeError("Container#use requires \"asm\" to be either a function or an object with a \"load\" function, '" + (typeof asm.load) + "' has been passed");
  }
  
  var h = this._order.length;
  asm = new Assembly(h, ns, asm);
  this._sources[h] = asm;
  this._order.unshift(h);
  
  var ids = asm.components || []
    , aid, spec, i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    aid = path.join(asm.namespace, ids[i]);
    spec = asm.load(ids[i])
    this._registerSpec(aid, spec, asm);
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
 * @returns {Promise}
 * @public
 */
Container.prototype.create = function(id, parent) {
  var psource = parent ? parent._source : undefined;
  
  // built-ins
  switch (id) {
  case '!container':
    return Promise.resolve(new InjectedContainer(this, parent, psource && psource.namespace));
  }
  
  return new Promise(function(resolve, reject) {
    //console.log('ID----');
    //console.log('  id: ' + id)
    
    var self = this;
    function create(spec) {
      if (!parent || spec._source.h == parent._source.h) {
        // The object is being created by another object within the same
        // assembly, or by the main script.
        return resolve(spec.create(self));
      } else {
        // The object is being created by an object from another assembly.
        // Most typically, the object is requested by an interface, allowing
        // dynamic creation according to the runtime environment and
        // configuration.
        //
        // Assemblies declare the components they export for use by other
        // assemblies.  Any non-exported components are considered private, and
        // usable only within the assembly itself.  Restrictions are put in
        // place to prevent private components from being used outside of their
        // assembly.
        
        // TODO: Implement these restrictions
        /*
        if (rid == 'http/auth/bearer/verify') {
          console.log('## X2');
          console.log(id);
          console.log(rid)
          console.log(parent)
          console.log(parent._source)
          console.log(spec)
        }
        
        var ns = spec._source.namespace
          , ids = spec._source.asm.components || []
          , aid, i, len;
        
      
        for (i = 0, len = ids.length; i < len; ++i) {
          console.log('CHECK: ' + ids[i]);
          
          aid = path.join(ns, ids[i]);
          if (aid == spec.id) {
            console.log('OK!');
          }
        }
        */
        
        resolve(spec.create(self));
      }
    }
    
    
    if (parent && id[0] == '.') {
      // resolve relative component ID
      id = path.join(path.dirname(parent.id), id);
    }
    id = this.resolve(id, parent);
    
    var spec = this._specs[id];
    if (spec) {
      return create(spec);
    } else {
      var self = this;
      this._loadSpec(id, function(err, spec) {
        if (err instanceof SpecNotFoundError) {
          reject(new CreationFailedError('Unable to create object "' + id + '" required by: ' + (parent && parent.id || 'unknown')), err);
        } else if (err) {
          return reject(err);
        }
        return create(spec);
      });
    }
  }.bind(this));
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
  throw new ResolutionFailedError('Unable to resolve interface "' + id + '" required by: ' + (parent && parent.id || 'unknown'));
}


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
Container.prototype._loadSpec = function(id, cb) {
  debug('autoload %s', id);
  var order = this._order
    , source, mod, rid
    , i, len;
  
  for (i = 0, len = order.length; i < len; ++i) {
    source = this._sources[order[i]];
    rid = path.relative(source.namespace, id);
    if (rid.indexOf('../') == 0) { continue; }
    mod = source.load(rid);
  
    if (mod) {
      spec = this._registerSpec(id, mod, source);
      return cb(null, spec);
    }
  }
  return cb(new SpecNotFoundError('Cannot find spec "' + id + '"'));
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
  return spec;
}


// Expose constructor.
module.exports = Container;
