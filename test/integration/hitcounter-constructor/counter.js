function Counter(cache, logger) {
  this._cache = cache;
  this._logger = logger;
}
Counter['@singleton'] = true;
Counter['@require'] = [ 'cache/cache', 'logger' ];

Counter.prototype.peek = function() {
  return this._cache.get('hits');
}

Counter.prototype.inc = function() {
  this._logger.info('Fetching current hit count from cache');
  var hits = this._cache.get('hits');
  hits++;
  this._cache.set('hits', hits);
  return hits;
}


exports = module.exports = Counter;

