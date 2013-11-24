var IoC = require('electrolyte');


module.exports = function routes() {

  this.get('/', IoC.create('handlers/list'));
  this.post('/todo', IoC.create('handlers/create'));

}
