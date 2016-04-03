function RedisClient() {
  this._val = 41;
}

RedisClient.prototype.get = function(key) {
  return this._val;
}

RedisClient.prototype.set = function(key, val) {
  this._val = val;
}


exports = module.exports = function() {
  return new RedisClient();
}
exports['@singleton'] = true;
