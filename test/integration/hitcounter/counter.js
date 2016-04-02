function Counter(cache) {
  this._cache = cache;
}

Counter.prototype.inc = function() {
  var hits = this._cache.get('hits');
  hits++;
  return hits;
}


exports = module.exports = function(cache) {
  return new Counter(cache);
}
exports['@singleton'] = true;
exports['@require'] = [ './cache/cache' ];
