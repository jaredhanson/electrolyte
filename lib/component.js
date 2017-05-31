// Load modules.
var Promise = require('promise')
  , debug = require('debug')('electrolyte');
  


/**
 * A specification of an object.
 *
 * A specification defines how an object is created.  The specification includes
 * a "factory" which is used to create objects.  A factory is typically a
 * function which returns the object or a constructor that is invoked with the
 * `new` operator.  A specification also declares any objects required by the
 * object.  Any such required objects will be injected into the object when it
 * is created.
 *
 * A specification also contains annotations, which are used by the IoC
 * container when creating an object.   These annotations are:
 *
 *   - `@require` - Declares other objects needed by this object.
 *   - `@singleton` - Declares whether or not a single instance of this object
 *                    should be created.
 *   - `@implements` - Declares the interfaces implemented by this object.
 *
 * A specification may contain other annotations, and the complete set of
 * annotations is available under the `.a` hash (short for annotations).  Such
 * annotations are typically used by higher-level frameworks for purposes such
 * as declaring service endpoints and loading plug-ins.
 *
 * @constructor
 * @param {string} id - The id of the component.
 * @param {object} mod - The module containing the component specification.
 * @param {number} asm - The assembly from which the component was loaded.
 * @protected
 */
function Component(id, mod, asm) {
  var keys, i, len;
  
  this.id = id;
  this.dependencies = mod['@require'] || [];
  this.singleton = mod['@singleton'];
  this.implements = mod['@implements'] || [];
  if (typeof this.implements == 'string') {
    this.implements = [ this.implements ]
  }
  this.a = {};
  
  if (typeof mod === 'object' || typeof mod === 'function') {
    keys = Object.keys(mod);
    for (i = 0, len = keys.length; i < len; ++i) {
      if (keys[i].indexOf('@') == 0) {
        this.a[keys[i]] = mod[keys[i]];
      }
    }
  }
  this._assembly = asm;
}

/**
 * Create an object from the specification.
 *
 * @protected
 */
Component.prototype.create = function(container) {
  debug('create %s', this.id);
  
  // Immediately return cached instance.  Optimization for singleton and literal
  // components.
  if (this._instance) { return this._instance; }
  
  // Create an array of promises which, once resolved, will be an array of
  // objects that are dependencies of the object being created.
  var deps = this.dependencies
    , promises = []
    , promise, p, i, len;
  for (i = 0, len = deps.length; i < len; ++i) {
    promise = container.create(deps[i], this);
    promises.push(promise);
  }
  
  // Resolve all the promises, and then instantiate the object with its
  // dependencies.
  p = Promise.all(promises)
    .then(function(args) {
      var i = this.instantiate.apply(this, args);
      container.emit('create', i, this);
      
      // Once the promise has been resolved, cache the object instance if the
      // spec was annotated as being a singleton.
      if (this.singleton) { this._instance = i; }
      return i;
    }.bind(this));
  
  // Cache the promise if the spec was annotated as being a singleton.  This
  // ensures that a singleton object is resolved, if the object is created
  // multiple times while waiting for resolution.  Upon the promise being
  // resolved, the created object will be cached.
  if (this.singleton) { this._instance = p; }
  return p;
}

/**
 * Instantiate an object from the specification.
 *
 * @private
 */
Component.prototype.instantiate = function() {
  throw new Error("Component#instantiate must be overridden by subclass");
}


// Expose constructor.
module.exports = Component;
