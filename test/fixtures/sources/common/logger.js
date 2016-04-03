function Logger() {
  this.messages = [];
}

Logger.prototype.info = function(msg) {
  this.messages.push(msg);
}


exports = module.exports = function() {
  return new Logger();
}
exports['@singleton'] = true;

exports.Logger = Logger;
