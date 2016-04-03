/* global describe, it, expect */

var Constructor = require('../../lib/patterns/constructor');


describe('Constructor', function() {
  function Animal(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
    this._a0 = a0;
    this._a1 = a1;
    this._a2 = a2;
    this._a3 = a3;
    this._a4 = a4;
    this._a5 = a5;
    this._a6 = a6;
    this._a7 = a7;
    this._a8 = a8;
    this._a9 = a9;
  }
  
  var ctor = new Constructor('animal', Animal);
  
  
  it('should instantiate with 1 argument', function() {
    var inst = ctor.instantiate('0')
    
    expect(inst).to.be.an('object');
    expect(inst._a0).to.equal('0');
    expect(inst._a1).to.be.undefined;
    expect(inst._a2).to.be.undefined;
    expect(inst._a3).to.be.undefined;
    expect(inst._a4).to.be.undefined;
    expect(inst._a5).to.be.undefined;
    expect(inst._a6).to.be.undefined;
    expect(inst._a7).to.be.undefined;
    expect(inst._a8).to.be.undefined;
    expect(inst._a9).to.be.undefined;
  });
  
  it('should throw an error', function() {
    expect(function() {
      ctor.instantiate('0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10');
    }).to.throw(Error, "Constructor for object 'animal' requires too many arguments");
  });
});
