// Load modules.
var debug = require('debug')('electrolyte');


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
 * Specifications have an identifier, which uniquely identifies the
 * specification, and hence any objects created from it, within a container.
 *
 * @constructor
 * @protected
 */
function Spec(id, dependencies, mod) {
  this.id = id;
  this.dependencies = dependencies;
  this.singleton = mod['@singleton'];
  this._module = mod;
  this._initialized = false;
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
  if (this.instance) { return this.instance; }
  
  if (!this._initialized) {
    if (this._module.initialize) { this._module.initialize(container); }
    this._initialized = true;
  }
  
  
  var source = container._sources[this._sid];
  
  var deps = this.dependencies
    , args = [];
  for (var i = 0, len = deps.length; i < len; ++i) {
    var inst = container.create(deps[i], this);
    if (source) {
      if (typeof source.mod.scope == 'function') {
        inst = source.mod.scope(deps[i], inst, { prefix: source.prefix, options: source.options });
      }
    }
    args.push(inst);
  }
    
  var i = this.instantiate.apply(this, args);
  
  // Cache the instance if the component was annotated as being a singleton.
  if (this.singleton) { this.instance = i; }
  
  if (container._expose) {
    container._expose.call(container, this.id, i, this.singleton)
  }
  
  return i;
}

/**
 * Instantiate an object from the specification.
 *
 * @private
 */
Spec.prototype.instantiate = function() {
  throw new Error("Unable to instantiate object from spec '" + this.id + "'");
}


// Expose constructor.
module.exports = Spec;
