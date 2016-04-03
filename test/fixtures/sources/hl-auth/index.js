exports = module.exports = function auth(id) {
  var map = {
    'authenticator': './authenticator'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};

exports.used = function(container) {
  container.spec('./authenticator');
}
