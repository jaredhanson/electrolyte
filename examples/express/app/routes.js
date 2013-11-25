/**
 * Module dependencies.
 */
var IoC = require('electrolyte');


/**
 * Draw routes.
 *
 * Route handlers are created using Electrolyte, which automatically wires
 * together any necessary components, including database connections, logging
 * facilities, configuration settings, etc.
 */
module.exports = function routes() {

  this.get('/', IoC.create('handlers/list'));
  this.post('/todo', IoC.create('handlers/create'));

}
