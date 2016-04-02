function Logger() {
}

Logger.prototype.info = function() {
}


exports = module.exports = function() {
  return new Logger();
}
exports['@singleton'] = true;

exports.Logger = Logger;
