var path = require('canonical-path');


function InjectedContainer(c, ns) {
  this._c = c;
  this._ns = ns || '';
}

InjectedContainer.prototype.create = function(id) {
  // TODO: Prevent '..' from being used here, by resovling path and making sure in ns
  // TODO: Preserve parent here.
  // TODO: handle relative paths, pass parent id in
  // TODO: Isolate create to namespace
  return this._c.create(id);
}

InjectedContainer.prototype.specs = function() {
  // TODO: Filter these to only those that are within the prefix.  Make this
  //       filtering optional, and by default not filtered.
  var specs = this._c.specs()
    , isolated = []
    , spec, rid, i, len;
  for (i = 0, len = specs.length; i < len; ++i) {
    spec = specs[i];
    rid = path.relative(this._ns, spec.id);
    if (rid.indexOf('../') == 0) { continue; }
    
    isolated.push(spec);
  }
  return isolated;
}


module.exports = InjectedContainer;
