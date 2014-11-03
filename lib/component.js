var debug = require('debug')('electrolyte');


function Component(id, dependencies, mod) {
  this.id = id;
  this.dependencies = dependencies;
  this.singleton = mod['@singleton'];
}

Component.prototype.create = function(container) {
  debug('create %s', this.id);
  
  var source = container._sources[this._sid];
  var loaded = this.loaded;
  
  if (!this.loaded) {
    var deps = this.dependencies
      , args = [];
    for (var i = 0, len = deps.length; i < len; ++i) {
      var inst = container.create(deps[i], this);
      if (source) {
        if (typeof source.fn.scope == 'function') {
          inst = source.fn.scope(deps[i], inst, { prefix: source.prefix, options: source.options });
        }
      }
      args.push(inst);
    }
  }
  var i = this.instantiate.apply(this, args);
  
  if (!loaded && container._expose) {
    container._expose.call(container, this.id, i, this.singleton)
  }
  
  return i;
}

Component.prototype.instantiate = function() {
  throw new Error("Unable to instantiate component '" + this.id + "'");
}

module.exports = Component;
