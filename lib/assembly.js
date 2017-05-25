var path = require('canonical-path');


function Assembly(h, ns, asm) {
  this.h = h;
  this.namespace = ns || '';
  this.components = [];
  this._load = asm.load;
  
  var ids = asm.components || []
    , aid, i, len;
  for (i = 0, len = ids.length; i < len; ++i) {
    aid = path.join(this.namespace, ids[i]);
    this.components.push(aid);
  }
}

Assembly.prototype.load = function(id) {
  var rid = path.relative(this.namespace, id);
  return this._load(rid);
}


module.exports = Assembly;
