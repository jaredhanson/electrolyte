exports = module.exports = function memory(id) {
  var map = {
    'cache': './cache'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};


exports.MemoryCache = require('./cache').MemoryCache;
