/* global describe, it, expect */

var Container = require('../lib/container');


function Bacteria() {
}

Bacteria.prototype.eat = function() {
  return 'sugar';
}


function Fish(bacteria) {
  this.bacteria;
}

Fish.prototype.eat = function() {
  return 'bacteria, ' + this.bacteria.eat();
}


describe('Container#constructor', function() {
  var container = new Container();
  container.constructor('bacteria', Bacteria);
  container.constructor('fish', Fish);
  
  describe('creating an object', function() {
    var obj = container.create('bacteria');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Bacteria);
    });
    
    it('should create a functioning object', function() {
      expect(obj.eat()).to.equal('sugar');
    });
  });
  
  describe('creating an object with one dependency', function() {
    var obj = container.create('fish');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Fish);
    });
    
    it.skip('should create a functioning object', function() {
      expect(obj.eat()).to.equal('bacteria, sugar');
    });
  });
  
});
