// Load modules.
var scripts = require('scripts')
  , path = require('path')
  , fs = require('fs')
  , existsSync = fs.existsSync || path.existsSync // node <=0.6


/**
 * Sources objects from a directory.
 *
 * This source allows objects located in a directory on the file system to be
 * created and injected as dependencies.
 *
 * This directory typically contains application-specific objects such as
 * proprietary classes and non-standardized endpoints.
 *
 * Over the course of developing an application, it is normal for objects to
 * start out as application-specific.  After successive iterations, it is common
 * for these objects to be factored into reusable classes with well-defined
 * interfaces.  When that occurs, it is recommended for such classes to be
 * extracted from the application and packaged in a stand-alone source.  For
 * example, Bixby.js provides a suite of sources that are commonly required when
 * developing cloud services.
 *
 * Examples:
 *
 *    IoC.use(IoC.dir('app'));
 *
 * @return {function}
 * @public
 */
module.exports = function(options) {
  if ('string' == typeof options) {
    options = { dirname: options }
  }
  options = options || {};
  var dirname = options.dirname || 'app'
    , extensions = options.extensions
    , dir = path.resolve(dirname);
  
  return function app(id) {
    var aid = path.join(dir, id)
      , script = scripts.resolve(aid, extensions);
    
    if (!existsSync(script)) { return; }
    return require(script);
  };
};
