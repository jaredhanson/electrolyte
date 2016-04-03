function RedisCache(client) {
  this._client = client;
}

RedisCache.prototype.get = function(key) {
  return this._client.get('cache:' + key);
}

RedisCache.prototype.set = function(key, val) {
  this._client.set('cache:' + key, val);
}


exports = module.exports = function(client) {
  return new RedisCache(client);
}
exports['@singleton'] = true;
exports['@require'] = [ './client' ];

exports.RedisCache = RedisCache;
