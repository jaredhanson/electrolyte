function BearerScheme() {
  this.scheme = 'bearer';
}


exports = module.exports = function() {
  return new BearerScheme();
}
exports['@implements'] = 'http://example.test/ap/auth/Scheme';
