// Load modules.
var path = require('canonical-path')
  , ExposedSpec = require('./exposedspec');


/**
 * Container wrapper used when injected into a factory.
 *
 * When a "factory" requires that the container itself be injected, the
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
function InjectedContainer(c, parent, ns) {
  this._c = c;
  this._parent = parent;
  this._ns = ns || '';
}

/**
 * Create an object.
 *
 * This function is equivalent to Container#create, with the exception that the
 * object being created must be within the namespace object creating it.
 *
 * @param {string} id - The id of the object to create.
 * @returns {Promise}
 * @public
 */
InjectedContainer.prototype.create = function(id) {
  if (id.indexOf('http://') == 0) {
    // HACK: Workaround passing interface names to IoC.create();  This needs fixing
    //INJ CREATE: http://i.bixbyjs.org/http/Server
    //CREATE: http:/i.bixbyjs.org/http/Server
    return this._c.create(id, this._parent);
  }
  
  var aid = path.join(this._ns, id);
  if (id[0] == '.') {
    // TODO: Test case for this
    // TODO: This logic can probably be enforced at the core container class, so that no
    //       components can break out of their namespace
    aid = path.join(path.dirname(this._parent.id), id);
  }
  var rid = path.relative(this._ns, aid);
  if (rid.indexOf('../') == 0) {
    return Promise.reject(new Error(id + ' not within namespace'));
  }
  
  return this._c.create(aid, this._parent);
}

/**
 * Introspect object specifications.
 *
 * This function is equivalent to Container#specs, with the exception that the
 * object object specifications returned are restricted to those within the
 * namespace object introspecting them.
 *
 * @returns {array}
 * @public
 */
InjectedContainer.prototype.specs = function(q) {
  if (q && !Array.isArray(q)) {
    q = [ q ];
  }
  
  // Filter the exposed specs to only those that exist within the namespace
  // of the object being created.
  var specs = this._c.specs()
    , exposed = []
    , spec, rid, i, len;
  for (i = 0, len = specs.length; i < len; ++i) {
    spec = specs[i];
    rid = path.relative(this._ns, spec.id);
    if (rid.indexOf('../') == 0) { continue; }
    if (!q) {
      exposed.push(new ExposedSpec(rid, spec));
    } else if (spec.implements.some(function(i) { return i == q })) {
      // The spec implements one of the requested interfaces.
      exposed.push(new ExposedSpec(rid, spec));
    }
  }
  return exposed;
}


// Expose constructor.
module.exports = InjectedContainer;
