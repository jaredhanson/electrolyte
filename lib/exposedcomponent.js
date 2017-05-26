function ExposedComponent(comp) {
  this.id = comp.id;
  this.implements = comp.implements;
  this.a = comp.a;
}

ExposedComponent.prototype.create = function(id) {
  
}


module.exports = ExposedComponent;
