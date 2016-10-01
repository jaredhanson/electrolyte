exports = module.exports = function (A, B, C) {
  return [A, B, C];
}

exports['@async'] = true;
exports['@require'] = ['syncA', 'asyncB', 'asyncC'];
