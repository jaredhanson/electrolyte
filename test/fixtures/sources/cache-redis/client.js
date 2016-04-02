function RedisClient() {
}

RedisClient.prototype.get = function(key) {
  return 41;
}

RedisClient.prototype.set = function(key, val) {
}


exports = module.exports = function() {
  return new RedisClient();
}
exports['@singleton'] = true;
