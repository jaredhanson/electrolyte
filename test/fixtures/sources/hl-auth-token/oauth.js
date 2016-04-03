function OAuthScheme() {
  this.scheme = 'oauth';
}


exports = module.exports = function() {
  return new OAuthScheme();
}
exports['@implements'] = 'http://example.test/ap/auth/Scheme';
