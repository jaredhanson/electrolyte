function UsingContainer(c) {
  this._c = c;
}

UsingContainer.prototype.register = function(id) {
  console.log('REGISTER SPEC: ' + id);
}

module.exports = UsingContainer;
