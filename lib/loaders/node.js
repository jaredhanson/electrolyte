/**
 * Module dependencies.
 */
var scripts = require('scripts')
  , path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // node <=0.6


module.exports = function(options) {
  if ('string' == typeof options) {
    options = { dirname: options }
  }
  options = options || {};
  var dirname = options.dirname || 'app/objects'
    , extensions = options.extensions
    , dir = path.resolve(dirname)
    , prefix = options.prefix;
  
  if (prefix && prefix[prefix.length - 1] != '/') { prefix += '/'; }
  
  return function(id) {
    if (prefix && id.indexOf(prefix) !== 0) { return; }
    if (prefix) { id = id.slice(prefix.length); }
    
    var aid = path.join(dir, id)
      , script = scripts.resolve(aid, extensions);
    
    if (!existsSync(script)) { return; }
    return require(script);
  }
}
