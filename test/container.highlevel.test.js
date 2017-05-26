/* global describe, it, expect */

var Container = require('../lib/container');


describe('Container', function() {
  
  describe('higher-level functionality', function() {
    
    describe('using common source', function() {
      var container = new Container();
      container.use(require('./fixtures/sources/hl-common'));
    
      it('should have registered specs prior to creating object', function() {
        var specs = container.components();
        expect(specs).to.be.an('array');
        expect(specs).to.have.length(1);
      
        var spec = specs[0];
        expect(spec.id).to.equal('logger');
        expect(spec.singleton).to.equal(true);
        expect(spec.dependencies).to.deep.equal([]);
        expect(spec.implements).to.deep.equal([ 'http://example.test/Logger' ]);
      });
    
      describe('create logger', function() {
        var obj;
    
        before(function(done) {
          container.create('logger')
            .then(function(o) {
              obj = o;
              done();
            }, done);
        })
    
        it('should create logger', function() {
          expect(obj).to.be.an('object');
        });
    
        it('should still have registered specs after creating object', function() {
          var specs = container.components();
          expect(specs).to.be.an('array');
          expect(specs).to.have.length(1);
      
          var spec = specs[0];
          expect(spec.id).to.equal('logger');
          expect(spec.singleton).to.equal(true);
          expect(spec.dependencies).to.deep.equal([]);
          expect(spec.implements).to.deep.equal([ 'http://example.test/Logger' ]);
        });
        
      });
    }); // using common source
    
    describe('using auth source, without plugins', function() {
      var container = new Container();
      container.use('auth', require('./fixtures/sources/hl-auth'));
    
      it('should have registered specs prior to creating object', function() {
        var specs = container.components();
        expect(specs).to.be.an('array');
        expect(specs).to.have.length(1);
      
        var spec = specs[0];
        expect(spec.id).to.equal('auth/authenticator');
        expect(spec.singleton).to.equal(true);
        expect(spec.dependencies).to.deep.equal([ '!container' ]);
        expect(spec.implements).to.deep.equal([ 'http://example.test/ap/Authenticator',
                                                'http://example.test/ap/Authenticator@0' ]);
      });
    
      describe('create authenticator', function() {
        var authenticator;
        
        before(function(done) {
          container.create('auth/authenticator')
            .then(function(obj) {
              authenticator = obj;
              done();
            }, done);
        })
        
        it('should not register plugins', function() {
          expect(authenticator).to.be.an('object');
          expect(authenticator.schemes).to.deep.equal([]);
        });
      });
    }); // using auth source, without plugins
    
    describe('using auth source, with password plugins', function() {
      var container = new Container();
      container.use('auth', require('./fixtures/sources/hl-auth'));
      container.use('auth', require('./fixtures/sources/hl-auth-password'));
    
      describe('create authenticator', function() {
        var authenticator;
        
        before(function(done) {
          container.create('auth/authenticator')
            .then(function(obj) {
              authenticator = obj;
              done();
            }, done);
        })
    
        it('should register plugins', function() {
          expect(authenticator.schemes).to.have.length(2);
          expect(authenticator.schemes[0].scheme).to.equal('basic');
          expect(authenticator.schemes[1].scheme).to.equal('digest');
        });
      });
    }); // using auth source, with password plugins
    
    describe('using auth source, with password and token plugins', function() {
      var container = new Container();
      container.use('auth', require('./fixtures/sources/hl-auth'));
      container.use('auth/plugins', require('./fixtures/sources/hl-auth-password'));
      container.use('auth/plugins', require('./fixtures/sources/hl-auth-token'));
    
      describe('create authenticator', function() {
        var authenticator;
        
        before(function(done) {
          container.create('auth/authenticator')
            .then(function(obj) {
              authenticator = obj;
              done();
            }, done);
        })
    
        it('should register plugins', function() {
          expect(authenticator.schemes).to.have.length(4);
          expect(authenticator.schemes[0].scheme).to.equal('basic');
          expect(authenticator.schemes[1].scheme).to.equal('digest');
          expect(authenticator.schemes[2].scheme).to.equal('bearer');
          expect(authenticator.schemes[3].scheme).to.equal('oauth');
        });
      });
    }); // using auth source, with password and token plugins
    
    describe('using auth source twice, under different namespaces with different plugins', function() {
      var container = new Container();
      container.use('auth/password', require('./fixtures/sources/hl-auth'));
      container.use('auth/password', require('./fixtures/sources/hl-auth-password'));
      container.use('auth/token', require('./fixtures/sources/hl-auth'));
      container.use('auth/token', require('./fixtures/sources/hl-auth-token'));
    
      describe('create password authenticator', function() {
        var authenticator;
        
        before(function(done) {
          container.create('auth/password/authenticator')
            .then(function(obj) {
              authenticator = obj;
              done();
            }, done);
        })
        
        it('should register plugins', function() {
          expect(authenticator.schemes).to.have.length(2);
          expect(authenticator.schemes[0].scheme).to.equal('basic');
          expect(authenticator.schemes[1].scheme).to.equal('digest');
        });
      });
      
      describe('create token authenticator', function() {
        var authenticator;
        
        before(function(done) {
          container.create('auth/token/authenticator')
            .then(function(obj) {
              authenticator = obj;
              done();
            }, done);
        })
        
        it('should register plugins', function() {
          expect(authenticator.schemes).to.have.length(2);
          expect(authenticator.schemes[0].scheme).to.equal('bearer');
          expect(authenticator.schemes[1].scheme).to.equal('oauth');
        });
      });
    }); // using auth source twice, under different namespaces with different plugins
    
    describe('creating object with injected container, that causes not found error', function() {
      var container = new Container();
      container.use('auth', require('./fixtures/sources/hl-auth'));
      container.use('auth/schemes', require('./fixtures/sources/hl-auth-password'));
      
      describe('creating authenticator', function() {
        var error;
        
        before(function(done) {
          container.create('auth/fubar/notfound')
            .then(function(obj) {
              done(new Error('should not create authenticator'));
            })
            .catch(function(err) {
              error = err;
              done();
            });
        })
        
        it('should fail with error', function() {
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal("Unable to create component 'auth/schemes/fubar' required by 'auth/fubar/notfound'");
        });
      });
    }); // using source that attempts to register spec outside of namespace
    
    // FIXME: This is failing with the introduction of relative namespace in InjectedContainer create
    describe.skip('creating object with injected container, that causes outside of namespace error', function() {
      var container = new Container();
      container.use(require('./fixtures/sources/hl-common'));
      container.use('auth', require('./fixtures/sources/hl-auth'));
      container.use('auth/schemes', require('./fixtures/sources/hl-auth-password'));
      
      describe('creating authenticator', function() {
        var error;
        
        before(function(done) {
          container.create('auth/fubar/outofns')
            .then(function(obj) {
              done(new Error('should not create authenticator'));
            })
            .catch(function(err) {
              error = err;
              done();
            });
        })
        
        it('should fail with error', function() {
          expect(error).to.be.an.instanceOf(Error);
          expect(error.message).to.equal('../logger not within namespace');
        });
      });
    }); // using source that attempts to register spec outside of namespace
    
  }); // higher-level functionality
  
});
