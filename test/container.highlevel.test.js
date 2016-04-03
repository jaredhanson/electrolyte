/* global describe, it, expect */

var Container = require('../lib/container');


describe('Container', function() {
  
  describe('higher-level functionality', function() {
    
    describe('using common source', function() {
      var container = new Container();
      container.use(require('./fixtures/sources/hl-common'));
    
      it('should have registered specs prior to creating object', function() {
        var specs = container.specs();
        expect(specs).to.be.an('array');
        expect(specs).to.have.length(1);
      
        var spec = specs[0];
        expect(spec.id).to.equal('logger');
        expect(spec.singleton).to.equal(true);
        expect(spec.dependencies).to.deep.equal([]);
        expect(spec.implements).to.deep.equal([ 'http://example.test/Logger' ]);
      });
    
      it('should create logger', function() {
        var obj = container.create('logger');
        expect(obj).to.be.an('object');
      });
    
      it('should still have registered specs after creating object', function() {
        var specs = container.specs();
        expect(specs).to.be.an('array');
        expect(specs).to.have.length(1);
      
        var spec = specs[0];
        expect(spec.id).to.equal('logger');
        expect(spec.singleton).to.equal(true);
        expect(spec.dependencies).to.deep.equal([]);
        expect(spec.implements).to.deep.equal([ 'http://example.test/Logger' ]);
      });
    }); // using common source
    
    describe('using auth source, without plugins', function() {
      var container = new Container();
      container.use('auth', require('./fixtures/sources/hl-auth'));
    
      it('should have registered specs prior to creating object', function() {
        var specs = container.specs();
        expect(specs).to.be.an('array');
        expect(specs).to.have.length(1);
      
        var spec = specs[0];
        expect(spec.id).to.equal('auth/authenticator');
        expect(spec.singleton).to.equal(true);
        expect(spec.dependencies).to.deep.equal([ '!container' ]);
        expect(spec.implements).to.deep.equal([ 'http://example.test/ap/Authenticator',
                                                'http://example.test/ap/Authenticator@0' ]);
      });
    
      it('should create authenticator', function() {
        var authenticator = container.create('auth/authenticator');
        expect(authenticator).to.be.an('object');
        expect(authenticator.schemes).to.deep.equal([]);
      });
    }); // using auth source, without plugins
    
    describe('using auth source, with password plugins', function() {
      var container = new Container();
      container.use('auth', require('./fixtures/sources/hl-auth'));
      container.use('auth', require('./fixtures/sources/hl-auth-password'));
    
      it('should create authenticator', function() {
        var authenticator = container.create('auth/authenticator');
        expect(authenticator).to.be.an('object');
        expect(authenticator.schemes).to.have.length(2);
        expect(authenticator.schemes[0].scheme).to.equal('basic');
        expect(authenticator.schemes[1].scheme).to.equal('digest');
      });
    }); // using auth source, without plugins
    
  }); // higher-level functionality
  
});
