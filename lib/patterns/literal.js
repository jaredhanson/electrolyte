// Load modules.
var Spec = require('../spec')
  , util = require('util');


/**
 * A specification of an object literal.
 *
 * A literal is returned directly when created by the IoC container.
 *
 * Due to the nature of being a literal, no dependencies are injected and only
 * a single instance of the object will be created.
 *
 * If a module exports a primitive type (object, string, number, etc.), the IoC
 * container will automatically detect it as a literal.  If the module exports
 * a function which is to be treated as a literal, the `@literal` annotation
 * must be set to `true`.  Otherwise, the default behavior will be to treat the
 * function as a factory.
 *
 * @constructor
 * @param {string} id - The id of the specification.
 * @param {object} mod - The module containing the object factory.
 * @param {number} hs - The handle of the source from which the spec was loaded.
 * @protected
 */
function LiteralSpec(id, obj, hs) {
  Spec.call(this, id, obj, hs);
  this._instance = obj;
}

// Inherit from `Spec`.
util.inherits(LiteralSpec, Spec);


// Expose constructor.
module.exports = LiteralSpec;
