function RedisCache() {
}

RedisCache.prototype.get = function() {
}

RedisCache.prototype.set = function() {
}


exports = module.exports = function() {
  return new RedisCache();
}
exports['@singleton'] = true;

exports.RedisCache = RedisCache;
