/* global describe, it, expect */

var Constructor = require('../../lib/patterns/constructor');


describe('Constructor', function() {
  
  describe('instantiated with too many arguments', function() {
    function Animal(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
    }
    var ctor = new Constructor('animal', [], Animal);
    
    it('should throw an error', function() {
      expect(function() {
        ctor.instantiate('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10')
      }).to.throw(Error, "Constructor for component 'animal' requires too many arguments");
    });
  });
});
