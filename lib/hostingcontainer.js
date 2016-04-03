var path = require('canonical-path');


function UsingContainer(c, prefix) {
  this._c = c;
  this._prefix = prefix;
}

UsingContainer.prototype.register = function(id) {
  id = path.join(this._prefix, id);
  this._c._loadSpec(id);
}


module.exports = UsingContainer;
