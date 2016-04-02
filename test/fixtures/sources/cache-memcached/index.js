exports = module.exports = function memcached(id) {
  var map = {
    'cache': './memcachedcache'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};


exports.MemcachedCache = require('./memcachedcache').MemcachedCache;
