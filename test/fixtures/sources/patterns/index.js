exports = module.exports = function patterns(id) {
  console.log(id)
  var map = {
    'ctor': './constructor',
    'factory': './factory',
    'unspecified': './unspecified',
    'specified': './specified',
    'literal/function': './literal/function',
    'literal/object': './literal/object',
    'literal/string': './literal/string'
  };

  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};
