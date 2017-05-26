var IoC = require('electrolyte');

var run = function() {
  IoC.use(IoC.node('app/components'));
  var checkEnv = IoC.create('check-environment');
  return checkEnv.check();
};

module.exports = {
  run: run
};
