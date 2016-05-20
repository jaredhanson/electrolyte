function MemoryCache() {
}

MemoryCache.prototype.get = function() {
}

MemoryCache.prototype.set = function() {
}


exports = module.exports = function() {
  return new MemoryCache();
}
exports['@singleton'] = true;

exports.MemoryCache = MemoryCache;
