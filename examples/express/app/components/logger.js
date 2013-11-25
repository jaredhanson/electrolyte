exports = module.exports = function() {
  var logger = new Logger();
  return logger;
}

exports['@singleton'] = true;




function Logger() {
}

Logger.prototype.log = function(msg) {
  console.log(msg);
}

Logger.prototype.info = function(msg) {
  console.info(msg);
}

Logger.prototype.warn = function(msg) {
  console.warn(msg);
}

Logger.prototype.error = function(msg) {
  console.error(msg);
}
