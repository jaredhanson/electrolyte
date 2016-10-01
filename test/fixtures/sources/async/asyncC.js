var Promise = require('bluebird');

exports = module.exports = function (dep) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve({waited: dep});
    }, 10);
  });
}

exports['@async'] = true;
exports['@require'] = ['syncC'];
