exports = module.exports = function authPassword(id) {
  var map = {
    'basic': './basic',
    'digest': './digest'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};

exports.used = function(container) {
  container.spec('./basic');
  container.spec('./digest');
}
