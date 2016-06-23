// Load modules.
var debug = require('debug')('electrolyte')
  , Promise = require('bluebird');


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
 * Note that `@implements` is not used directly by Electrolyte.  Rather, it
 * exists to support higher-level frameworks, such as Bixby.js, which encourage
 * component-based programming in which you code to an interface, not an
 * implementation.
 *
 * A specification may contain other annotations, and the complete set of
 * annotations is available under the `.a` hash (short for annotations).  Such
 * annotations are typically used by higher-level frameworks for purposes such
 * as declaring service endpoints and loading plug-ins.
 *
 * @constructor
 * @param {string} id - The id of the specification.
 * @param {object} mod - The module containing the object factory.
 * @param {number} hs - The handle of the source from which the spec was loaded.
 * @protected
 */
function Spec(id, mod, source) {
  var keys, i, len;
  
  this.id = id;
  this.isAsync = mod['@async'];
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
  this._source = source;
}

/**
 * Create an object from the specification.
 *
 * @protected
 */
Spec.prototype.create = function(container) {
  debug('create %s', this.id);
  
  // Immediately return cached instance.  Optimization for singleton and literal
  // components.
  if (this._instance) { return this._instance; }
  
  var deps = this.dependencies
    , args = []
    , inst;

  var createDependency = function (dep) {
    if (this.isAsync) {
      return container.createAsync(dep, this);
    } else {
      return container.create(dep, this);
    }
  }.bind(this);

  if (this.isAsync) {
    args = Promise.mapSeries(deps, createDependency);
    inst = args.spread(this.instantiate.bind(this));
  } else {
    args = deps.map(createDependency);
    inst = this.instantiate.apply(this, args);
  }
    
  // Cache the instance if the component was annotated as being a singleton.
  if (this.singleton) { this._instance = inst; }
  return inst;
}

/**
 * Instantiate an object from the specification.
 *
 * @private
 */
Spec.prototype.instantiate = function() {
  throw new Error("Spec#instantiate must be overridden by subclass");
}


// Expose constructor.
module.exports = Spec;
