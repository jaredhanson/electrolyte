/* global describe, it, expect */

var Container = require('../lib/container');


describe('Container', function() {
  var container = new Container();
  
  describe('#create', function() {
    
    describe('unknown component', function() {
      it('should throw an error', function() {
        expect(function() {
          var obj = container.create('unknown');
        }).to.throw(Error, "Unable to create component 'unknown'");
      });
    });
    
  });
  
});
