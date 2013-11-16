function Container() {
  this._o = {};
}

Container.prototype.create = function(id) {
  var spec = this._o[id];
  if (!spec) { throw new Error("Cannot find component '" + id + "'"); }
  
  if (spec.type == 'constructor') {
    console.log('CONSTRUCTOR!');
    return new spec.fn();
  }
  
  // TODO: Better error messages
  throw new Error("Bad component type");
}

Container.prototype.register = function(id, spec) {
  this._o[id] = spec;
}

Container.prototype.constructor = function(id, fn) {
  this.register(id, { type: 'constructor', fn: fn });
}

module.exports = Container;
