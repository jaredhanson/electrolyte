/* global describe, it, expect */

var Container = require('../lib/container');


// Counter

function Counter(i) {
  this.count = i;
}

function DoubleCounter(i, single) {
  this.count = i;
  this.single = single;
}

function TripleCounter(i, duble, single) {
  this.count = i;
  this.double = duble;
  this.single = single;
}


describe('Container#factory', function() {
  
  describe('creating an object', function() {
    var container = new Container();
    var si = 0
      , di = 0;

    container.factory('counter', function() {
      return new Counter(++si);
    });
    
    var obj = container.create('counter');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(Counter);
    });
    
    it('should create object with dependencies injected', function() {
      expect(obj.count).to.equal(1);
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('counter');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
  describe('creating an object with one dependency', function() {
    var container = new Container();
    var si = 0
      , di = 0;

    container.factory('counter', function() {
      return new Counter(++si);
    });
    container.factory('doubleCounter', [ 'counter' ], function(single) {
      return new DoubleCounter(++di, single);
    });
    
    var s1 = container.create('counter');
    var obj = container.create('doubleCounter');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(DoubleCounter);
    });
    
    it('should create object with dependencies injected', function() {
      expect(obj.count).to.equal(1);
      expect(obj.single).to.be.an.instanceOf(Counter);
      expect(obj.single.count).to.equal(2);
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('doubleCounter');
      expect(obj).to.not.be.equal(obj2);
    });
  });
  
  describe('creating an object with two dependencies', function() {
    var container = new Container();
    var si = 0
      , di = 0
      , ti = 0;

    container.factory('counter', function() {
      return new Counter(++si);
    });
    container.factory('doubleCounter', [ 'counter' ], function(single) {
      return new DoubleCounter(++di, single);
    });
    container.factory('tripleCounter', [ 'doubleCounter', 'counter' ], function(duble, single) {
      return new TripleCounter(++ti, duble, single);
    });
    
    var s1 = container.create('counter');
    var d1 = container.create('doubleCounter');
    var obj = container.create('tripleCounter');
    
    it('should create an object', function() {
      expect(obj).to.be.an('object');
      expect(obj).to.be.an.instanceOf(TripleCounter);
    });
    
    it('should create object with dependencies injected', function() {
      expect(obj.count).to.equal(1);
      expect(obj.double).to.be.an.instanceOf(DoubleCounter);
      expect(obj.double.count).to.equal(2);
      expect(obj.single).to.be.an.instanceOf(Counter);
      expect(obj.single.count).to.equal(4);
    });
    
    it('should create unique instances', function() {
      var obj2 = container.create('tripleCounter');
      expect(obj).to.not.be.equal(obj2);
    });
  });
});
