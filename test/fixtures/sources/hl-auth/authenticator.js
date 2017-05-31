function Authenticator() {
  this.schemes = [];
}

Authenticator.prototype.use = function(scheme) {
  this.schemes.push(scheme);
}


exports = module.exports = function(container) {
  var authenticator = new Authenticator();
  
  var specs = container.components(true)
    , sspecs = []
    , spec, i, len;
  for (i = 0, len = specs.length; i < len; ++i) {
    spec = specs[i];
    if (spec.implements.indexOf('http://example.test/ap/auth/Scheme') !== -1) {
      sspecs.push(spec)
    }
  }
  
  return Promise.all(sspecs.map(function(spec) { return container.create(spec.id); } ))
    .then(function(schemes) {
      schemes.forEach(function(scheme) { authenticator.use(scheme); });
      return authenticator;
    });
}
exports['@singleton'] = true;
exports['@require'] = [ '!container' ];
exports['@implements'] = [ 'http://example.test/ap/Authenticator',
                           'http://example.test/ap/Authenticator@0' ];
