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

function Primate(fish, bacteria) {
  this.fish = fish;
  this.bacteria = bacteria;
}

Primate.prototype.eat = function() {
  return 'fish, ' + this.fish.eat() + ', ' + this.bacteria.eat();
}


describe('Container#constructor', function() {
  var container = new Container();
  container.constructor('bacteria', Bacteria);
  container.constructor('fish', [ 'bacteria' ], Fish);
  container.constructor('primate', [ 'fish', 'bacteria' ], Primate);
  
  describe('creating an object with no dependencies', function() {
    var obj = container.create('bacteria');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Bacteria);
    });
    
    it('should create object with normal properties', function() {
      expect(obj.eat()).to.equal('sugar');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('bacteria');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
  describe('creating an object with one dependency at one level', function() {
    var obj = container.create('fish');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Fish);
    });
    
    it('should create object with dependency injected', function() {
      expect(obj.eat()).to.equal('bacteria, sugar');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('fish');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
  describe('creating an object with two dependencies, one of which is at two levels', function() {
    var obj = container.create('primate');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Primate);
    });
    
    it('should create object with dependencies injected', function() {
      expect(obj.eat()).to.equal('fish, bacteria, sugar, sugar');
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('primate');
      expect(obj).to.not.be.equal(obj2);
    });
  });
});
