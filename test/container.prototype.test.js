/* global describe, it, expect */

var Container = require('../lib/container');


// Bacteria

function Bacteria(food) {
  this.food = food;
}

Bacteria.prototype.eat = function() {
  return this.food;
}


describe('Container#prototype', function() {
  
  describe('creating an object', function() {
    var container = new Container();
    var proto = new Bacteria('starch');
    container.prototype('bacteria', proto);
    
    var obj = container.create('bacteria');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Bacteria);
      expect(obj.__proto__).to.equal(proto);
    });
    
    it('should create object with prototype properties', function() {
      expect(obj.eat()).to.equal('starch');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('bacteria');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
  describe('creating an object from object literal', function() {
    var container = new Container();
    var proto = { foo: 'bar' };
    container.prototype('foo', proto);
    
    var obj = container.create('foo');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Object);
      expect(obj.__proto__).to.equal(proto);
    });
    
    it('should create object with prototype properties', function() {
      expect(obj.foo).to.equal('bar');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('foo');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
});
