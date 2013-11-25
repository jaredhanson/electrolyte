var ioc = require('electrolyte');

module.exports = function() {
  ioc.loader('handlers', ioc.node('app/handlers'));
  ioc.loader(ioc.node('app/components'));
}
