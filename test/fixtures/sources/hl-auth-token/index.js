exports = module.exports = function authToken(id) {
  var map = {
    'bearer': './bearer',
    'oauth': './oauth'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};

exports.used = function(container) {
  container.spec('./bearer');
  container.spec('./oauth');
}
