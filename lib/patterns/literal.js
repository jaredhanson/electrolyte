// Load modules.
var Component = require('../component')
  , util = require('util');


/**
 * A component that is an object literal.
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
 * @param {string} id - The id of the component.
 * @param {object} obj - The module containing the literal object.
 * @param {number} asm - The assembly from which the component was loaded.
 * @protected
 */
function LiteralComponent(id, obj, asm) {
  Component.call(this, id, obj, asm);
  this._instance = obj;
}

// Inherit from `Component`.
util.inherits(LiteralComponent, Component);


// Expose constructor.
module.exports = LiteralComponent;
