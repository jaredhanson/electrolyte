var path = require('canonical-path');


function UsingContainer(c, prefix) {
  this._c = c;
  this._prefix = prefix;
}

UsingContainer.prototype.register = function(id) {
  id = path.join(this._prefix, id);
  
  var spec = this._c._spec[id];
  // FIXME: This should always load, so later used sources correctly override earlier ones.
  if (spec) { return; } // already registered
  this._c._loadSpec(id);
}


module.exports = UsingContainer;
