var factory = require('../../lib/resolvers/id');

describe('resolvers/id', function() {
  
  it('should export a factory function', function() {
    expect(factory).to.be.a('function');
  });
  
  describe('resolver', function() {
    var resolve = factory();
    
    it('should resolve alphabetical identifiers', function() {
      expect(resolve('foo')).to.equal('foo');
    });
    
    it('should resolve alphabetical, mixed case identifiers', function() {
      expect(resolve('fooBar')).to.equal('fooBar');
    });
    
    it('should resolve alpha-numeric identifiers', function() {
      expect(resolve('foo123')).to.equal('foo123');
    });
    
    it('should resolve identifers containing underscore', function() {
      expect(resolve('foo_bar')).to.equal('foo_bar');
    });
    
    it('should resolve identifers containing dash', function() {
      expect(resolve('foo-bar')).to.equal('foo-bar');
    });
    
    it('should resolve identifers containing dot', function() {
      expect(resolve('foo.2')).to.equal('foo.2');
    });
    
    it('should resolve alphabetical identifiers within namespace', function() {
      expect(resolve('foo/bar')).to.equal('foo/bar');
    });
    
    it('should not resolve identifiers containing spaces', function() {
      expect(resolve('foo bar')).to.equal(undefined);
    });
    
    it('should not resolve URLish identifiers', function() {
      expect(resolve('http://schemas.example.test/js/i/foo')).to.equal(undefined);
    });
  })
  
});
