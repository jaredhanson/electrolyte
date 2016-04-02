/* global describe, it, expect */

var Container = require('../lib/container');


describe('Container', function() {
  
  describe('#create', function() {
    var container = new Container();
    
    describe('unknown component', function() {
      it('should throw an error when created without a parent', function() {
        expect(function() {
          var obj = container.create('unknown');
        }).to.throw(Error, 'Unable to create object "unknown" required by: unknown');
      });
      
      it('should throw an error when created with a parent', function() {
        expect(function() {
          var obj = container.create('unknown', { id: 'main' });
        }).to.throw(Error, 'Unable to create object "unknown" required by: main');
      });
      
      it('should throw an error when created with a parent, lacking an id', function() {
        expect(function() {
          var obj = container.create('unknown', {});
        }).to.throw(Error, 'Unable to create object "unknown" required by: unknown');
      });
    });
    
  });
  
  describe('#use', function() {
    var container = new Container();
    
    describe('invalid loader', function() {
      it('should throw an error', function() {
        expect(function() {
          container.use('test', undefined);
        }).to.throw(Error, "Container#use requires a function, was passed a 'undefined'");
      });
    });
    
  });
  
  
  describe('using node_modules loader', function() {
    var container = new Container();
    container.use(require('../lib/loaders/node_modules')());

    it('should return the same module as require', function() {
      var obj = container.create('dgram');
      expect(obj).to.be.equal(require('dgram'));
    });
  });
  
});
