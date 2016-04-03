exports = module.exports = function memcached(id) {
  var map = {
    'cache': './cache'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};


exports.MemcachedCache = require('./cache').MemcachedCache;
