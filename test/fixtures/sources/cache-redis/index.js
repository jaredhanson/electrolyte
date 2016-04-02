exports = module.exports = function redis(id) {
  var map = {
    'cache': './rediscache'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};


exports.RedisCache = require('./rediscache').RedisCache;
