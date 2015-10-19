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
  var keys = Object.keys(mod)
    , i, len;
  
  this.id = id;
  this.dependencies = dependencies;
  this.singleton = mod['@singleton'];
  this.implements = mod['@implements'];
  if (typeof this.implements == 'string') {
    this.implements = [ this.implements ]
  }
  this.a = {};
  for (i = 0, len = keys.length; i < len; ++i) {
    if (keys[i].indexOf('@') == 0) {
      this.a[keys[i]] = mod[keys[i]];
    }
  }
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
  
  
  var deps = this.dependencies
    , args = [];
  for (var i = 0, len = deps.length; i < len; ++i) {
    var inst = container.create(deps[i], this);
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
