exports = module.exports = function auth(id) {
  var map = {
    'authenticator': './authenticator',
    'fubar/notfound': './fubar/notfound',
    'fubar/outofns': './fubar/outofns'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};

exports.used = function(container) {
  container.add('authenticator');
}
