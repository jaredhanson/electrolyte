// Load modules.
var path = require('canonical-path')
  , deprecate = require('depd')('electrolyte');


/**
 * Container wrapper used when initializing a source.
 *
 * When a source of objects is `use()`ed, it is given an opportunity to
 * initialize the hosting container.  This wrapper provides the interface to
 * perform initialization, and restricts inadvertent use of other functionality
 * in the wrapped container.
 *
 * @constructor
 * @api private
 */
function HostingContainer(c, ns, hs) {
  this._c = c;
  this._ns = ns || '';
  this._hs = hs;
}

/**
 * Add an object specification.
 *
 * This function is used by a source to add an object specification.
 *
 * By default, specifications are automatically loaded when an object is
 * created.  As such, there is typically no need to declare specifications
 * ahead of time.
 *
 * Higher-level frameworks implement support for auto-wiring objects and loading
 * plugins based on annotations.  In such cases, the specification is needed
 * prior to the object being created in order to introspect the annotations.
 * Sources can provide such specifications by calling this function.
 *
 * @constructor
 * @api public
 */
HostingContainer.prototype.add = function(id) {
  var aid = path.join(this._ns, id);
  var rid = path.relative(this._ns, aid);
  if (rid.indexOf('../') == 0) {
    throw new Error(id + ' is not within source namespace');
  }
  
  // TODO: pass source handle here as optimization, prevent registration from other sources
  this._c._loadSpec(aid, this._hs, id);
  return this;
}
HostingContainer.prototype.register = deprecate.function(HostingContainer.prototype.add, 'Container#register: Use Container#add instead');


// Expose constructor.
module.exports = HostingContainer;
