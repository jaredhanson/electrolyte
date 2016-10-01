exports = module.exports = function () {
  return {done: 'B'};
};

exports['@singleton'] = true;
exports['@require'] = ['syncC'];
