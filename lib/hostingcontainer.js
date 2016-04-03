var path = require('canonical-path');


function UsingContainer(c, ns) {
  this._c = c;
  this._ns = ns || '';
}

UsingContainer.prototype.register = function(id) {
  id = path.join(this._ns, id);
  this._c._loadSpec(id);
}


module.exports = UsingContainer;
