/* global describe, it, expect */

var Container = require('../lib/container');


describe('Container', function() {
  
  describe('higher-level functionality', function() {
    
    describe('using common source', function() {
      var common = require('./fixtures/sources/hl-common');
    
      var container = new Container();
      container.use(common);
    
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
    
  }); // higher-level functionality
  
});
