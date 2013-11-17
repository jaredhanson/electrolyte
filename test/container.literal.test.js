/* global describe, it, expect */

var Container = require('../lib/container');


// Bacteria

function Bacteria(food) {
  this.food = food;
}

Bacteria.prototype.eat = function() {
  return this.food;
}


describe('Container#literal', function() {
  
  describe('creating an object', function() {
    var container = new Container();
    var lit = new Bacteria('starch');
    container.literal('bacteria', lit);
    
    var obj = container.create('bacteria');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Bacteria);
      expect(obj).to.equal(lit);
    });
    
    it('should not create unique instances', function() {
      var obj2 = container.create('bacteria');
      expect(obj).to.be.equal(obj2);
    });
  });
  
  describe('creating an object from object literal', function() {
    var container = new Container();
    var lit = { foo: 'bar' };
    container.literal('foo', lit);
    
    var obj = container.create('foo');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Object);
      expect(obj).to.equal(lit);
    });
    
    it('should not create unique instances', function() {
      var obj2 = container.create('foo');
      expect(obj).to.be.equal(obj2);
    });
  });
  
});
