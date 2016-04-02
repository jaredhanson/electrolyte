/* global describe, it, expect */

var Spec = require('../lib/spec');


describe('Spec', function() {
  
  describe('#instatiate', function() {
      
    it('should throw an error', function() {
      expect(function() {
        var spec = new Spec('foo', {});
        spec.instantiate();
      }).to.throw(Error, "Spec#instantiate must be overridden by subclass");
    });
    
  });
  
});
