function Authenticator() {
  this.schemes = [];
}

Authenticator.prototype.use = function(scheme) {
  this.schemes.push(scheme);
}


exports = module.exports = function(container) {
  
  var authenticator = new Authenticator();
  
  container.create('schemes/fubar');
  
  return authenticator;
}
exports['@singleton'] = true;
exports['@require'] = [ '!container' ];
exports['@implements'] = [ 'http://example.test/ap/Authenticator',
                           'http://example.test/ap/Authenticator@0' ];
