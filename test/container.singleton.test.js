/* global describe, it, expect */

var Container = require('../lib/container');


// Bacteria

function Bacteria(food) {
  this.food = food;
}

Bacteria.prototype.eat = function() {
  return this.food;
}


describe('Container#singleton', function() {
  
  describe('creating an object', function() {
    var container = new Container();
    var singl = new Bacteria('starch');
    container.singleton('bacteria', singl);
    
    var obj = container.create('bacteria');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Bacteria);
      expect(obj).to.equal(singl);
    });
    
    it('should not create unique instances', function() {
      var obj2 = container.create('bacteria');
      expect(obj).to.be.equal(obj2);
    });
  });
  
  describe('creating an object from object literal', function() {
    var container = new Container();
    var singl = { foo: 'bar' };
    container.singleton('foo', singl);
    
    var obj = container.create('foo');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Object);
      expect(obj).to.equal(singl);
    });
    
    it('should not create unique instances', function() {
      var obj2 = container.create('foo');
      expect(obj).to.be.equal(obj2);
    });
  });
  
});
