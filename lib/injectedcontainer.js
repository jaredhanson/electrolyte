// Load modules.
var path = require('canonical-path')
  , ExposedComponent = require('./exposedcomponent');


/**
 * Container wrapper used when injected into a factory.
 *
 * When a factory requires that the container itself be injected, the
 * container is first wrapped.  This wrapper provides an interface that can be
 * used by the factory to introspect its environment, which is useful when
 * loading plugins, among other functionality.  The wrapper also restricts
 * inadvertent use of other functionality in the wrapped container.
 *
 * Note that requiring an injected container makes the requiring object
 * dependent on the IoC runtime's existence.  The need to couple the object to
 * the runtime should be carefully considered, and avoided if an alternative
 * approach is possible.
 *
 * @constructor
 * @api private
 */
function InjectedContainer(c, parent) {
  var pasm = parent ? parent._assembly : undefined;
  
  this._c = c;
  this._parent = parent;
  this._ns = (pasm && pasm.namespace) || '';
}

/**
 * Create an object.
 *
 * This function is equivalent to Container#create.
 *
 * @param {string} id - The id of the object to create.
 * @param {Component} [comp] - (private) The component to create.
 * @returns {Promise}
 * @public
 */
InjectedContainer.prototype.create = function(id, comp) {
  return this._c.create(id, this._parent, comp);
}

/**
 * Introspect component specifications.
 *
 * This function is equivalent to Container#components, with the exception that
 * the object component specifications returned can be filtered in various ways
 * relative to the component performing introspecting.
 *
 * @returns {array}
 * @public
 */
InjectedContainer.prototype.components = function(q, filt) {
  if (typeof q == 'string' && !Array.isArray(q)) {
    q = [ q ];
  } else if (typeof q == 'boolean') {
    filt = q;
    q = undefined;
  }
  
  if (filt === true) {
    // When `filt` is set to true, the exposed components will be filtered to
    // consist of only those that exist within the namespace of the
    // introspecting component.
    filt = this._ns;
  }
  
  var comps = this._c.components()
    , exposed = []
    , comp, rid, i, len;
  for (i = 0, len = comps.length; i < len; ++i) {
    comp = comps[i];
    
    if (typeof filt == 'string') {
      // Filter the exposed specs to only those that exist within the namespace
      // of the object being created.
      rid = path.relative(filt, comp.id);
      if (rid.indexOf('../') == 0) { continue; }
    }
    
    if (!q) {
      exposed.push(new ExposedComponent(comp, this));
    } else if (comp.implements.some(function(i) { return i == q })) {
      // The component implements one of the requested interfaces.
      exposed.push(new ExposedComponent(comp, this));
    }
  }
  return exposed;
}


// Expose constructor.
module.exports = InjectedContainer;
