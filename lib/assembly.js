function Assembly(h, ns, asm) {
  this.h = h;
  this.namespace = ns;
  this.components = asm.components || [];
  this._load = asm.load;
}

Assembly.prototype.load = function(id) {
  return this._load(id);
}


module.exports = Assembly;
