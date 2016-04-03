function Authenticator() {
  this.schemes = [];
}

Authenticator.prototype.use = function(scheme) {
  this.schemes.push(scheme);
  console.log(this.schemes)
}


exports = module.exports = function(container) {
  
  var authenticator = new Authenticator();
  
  var specs = container.specs()
    , spec, scheme, i, len;
  for (i = 0, len = specs.length; i < len; ++i) {
    spec = specs[i];
    if (spec.implements.indexOf('http://example.test/ap/auth/Scheme') !== -1) {
      scheme = container.create(spec.id);
      authenticator.use(scheme);
    }
  }
  
  return authenticator;
}
exports['@singleton'] = true;
exports['@require'] = [ '!container' ];
exports['@implements'] = [ 'http://example.test/ap/Authenticator',
                           'http://example.test/ap/Authenticator@0' ];
