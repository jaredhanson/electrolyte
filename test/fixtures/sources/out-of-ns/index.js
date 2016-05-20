exports = module.exports = function outOfNS(id) {
  return undefined;
};

exports.used = function(container) {
  container.add('../logger');
}
