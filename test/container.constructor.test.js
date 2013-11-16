/* global describe, it, expect */

var Container = require('../lib/container');


// Bacteria

function Bacteria() {
}

Bacteria.prototype.eat = function() {
  return 'sugar';
}

// Fish

function Fish(bacteria) {
  this.bacteria = bacteria;
}

Fish.prototype.eat = function() {
  return 'bacteria, ' + this.bacteria.eat();
}

// Primate


describe('Container#constructor', function() {
  var container = new Container();
  container.constructor('bacteria', Bacteria);
  container.constructor('fish', [ 'bacteria' ], Fish);
  
  describe('creating an object', function() {
    var obj = container.create('bacteria');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Bacteria);
    });
    
    it('should create object with dependencies injected', function() {
      expect(obj.eat()).to.equal('sugar');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('bacteria');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
  describe('creating an object with one dependency', function() {
    var obj = container.create('fish');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Fish);
    });
    
    it('should create object with dependencies injected', function() {
      expect(obj.eat()).to.equal('bacteria, sugar');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('fish');
      expect(obj).to.not.be.equal(obj2);
    });
  });
});
