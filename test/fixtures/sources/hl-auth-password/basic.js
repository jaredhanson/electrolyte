function BasicScheme() {
  this.scheme = 'basic';
}


exports = module.exports = function() {
  return new BasicScheme();
}
exports['@implements'] = 'http://example.test/ap/auth/Scheme';
