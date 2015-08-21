/* global describe, it, expect */

var Component = require('../lib/component');


describe('Component', function() {
  
  describe('#create', function() {
    
    describe.skip('abstract component', function() {
      var comp = new Component('foo', [], {});
      
      it('should throw an error', function() {
        expect(function() {
          comp.create();
        }).to.throw(Error, "Unable to instantiate component 'foo'");
      });
    });
    
  });
  
});
