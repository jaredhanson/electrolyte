// Load modules.
var debug = require('debug')('electrolyte');


/**
 * A component of an application.
 *
 * A component is an object whose lifecycle is managed by the container.
 * Depending on configuration, there may be one more instances of a given
 * component.  If a component is declared as being a singleton, only one
 * instance will be created.
 *
 * Components have an identifier, which uniquely identifies the component
 * within the container.  Components also declare dependencies on other
 * components.  When a component is created, all of its dependencies are also
 * created and injected automatically.
 *
 * @constructor
 * @api public
 */
function Component(id, dependencies, mod) {
  this.id = id;
  this.dependencies = dependencies;
  this.singleton = mod['@singleton'];
  this._module = mod;
  this._loaded = false;
}

Component.prototype.create = function(container) {
  debug('create %s', this.id);
  
  // Immediately return cached instance.  Optimization for singleton and literal
  // components.
  if (this.instance) { return this.instance; }
  
  if (!this._loaded) {
    // FIXME: Call load() when the bundle is `use`d.
    if (this._module.load) { this._module.load(container); }
    this._loaded = true;
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

Component.prototype.instantiate = function() {
  throw new Error("Unable to instantiate component '" + this.id + "'");
}

module.exports = Component;
