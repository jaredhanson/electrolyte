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
    , dir = path.resolve(dirname);
  
  return function(id) {
    var aid = path.join(dir, id)
      , script = scripts.resolve(aid, extensions);
    
    if (!existsSync(script)) { return; }
    return require(script);
  }
}
