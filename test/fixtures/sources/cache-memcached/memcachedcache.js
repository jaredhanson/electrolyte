function MemcachedCache() {
}

MemcachedCache.prototype.get = function() {
}

MemcachedCache.prototype.set = function() {
}


exports = module.exports = function() {
  return new MemcachedCache();
}
exports['@singleton'] = true;

exports.MemcachedCache = MemcachedCache;
