exports = module.exports = function common(id) {
  var map = {
    'logger': './logger'
  };
  
  var mid = map[id];
  if (mid) {
    return require(mid);
  }
};


exports.Logger = require('./logger').Logger;
