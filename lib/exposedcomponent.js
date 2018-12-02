function ExposedComponent(comp, ic) {
  this.id = comp.id;
  this.implements = comp.implements;
  this.a = comp.a;
  this._comp = comp;
  this._ic = ic;
}

ExposedComponent.prototype.create = function(options) {
  return this._ic.create(this.id, this._comp, options);
}


module.exports = ExposedComponent;
