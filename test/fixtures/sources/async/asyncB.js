var Promise = require('promise');

exports = module.exports = function (dep) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve({waited: dep});
    }, 5);
  });
}

exports['@async'] = true;
exports['@singleton'] = true;
exports['@require'] = ['syncB'];
