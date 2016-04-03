function DigestScheme() {
  this.scheme = 'digest';
}


exports = module.exports = function() {
  return new DigestScheme();
}
exports['@implements'] = 'http://example.test/ap/auth/Scheme';
