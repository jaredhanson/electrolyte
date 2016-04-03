exports = module.exports = function redis(id) {
  var map = {
    'cache': './cache',
    'client': './client'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};


exports.RedisCache = require('./cache').RedisCache;
