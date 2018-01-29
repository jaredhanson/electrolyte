/**
 * Automatic interface resolver.
 *
 * Automatically resolves an interface to an object that implements that
 * interface.  Automatic resolution reduces the amount of configuration that
 * must be specified.
 *
 * For consistency and saftey in the development cycle, such resolution succeeds
 * if and only if there is one object within the container that implements the
 * interface.  If multiple objects implement the interface, automatic resolution
 * would be ambiguous, and is therefore not performed.  In such cases, the exact
 * object to resolve can be explicitly declared in configuration.
 *
 * @return {function}
 * @protected
 */
module.exports = function(container) {
  
  return function(iface, pid) {
    var specs = container.components()
      , candidates = []
      , spec, i, len;
    for (i = 0, len = specs.length; i < len; ++i) {
      spec = specs[i];
      if (spec.implements.indexOf(iface) !== -1) {
        candidates.push(spec.id);
      }
    }
    
    if (candidates.length == 1) {
      return candidates[0];
    } else if (candidates.length > 1) {
      throw new Error('Multiple objects implement interface \"' + iface + '\" required by \"' + (pid || 'unknown') + '\". Configure one of: ' + candidates.join(', '));
    }
  };
}
