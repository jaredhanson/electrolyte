/* global describe, it, expect */

var Container = require('../lib/container')
  , node = require('..').loaders.node;


describe('integration of Node loader', function() {
  
  describe('node', function() {
    var container = new Container();
    container.loader(node(__dirname + '/objects/node'));
    
    describe('creating laptop', function() {
      var obj = container.create('device/laptop');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('Laptop');
      });
      
      it('should conform to interface', function() {
        expect(obj.keyboard.desc()).to.equal('EN');
        expect(obj.cpu.type).to.equal('x86');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('device/laptop');
        expect(obj).to.not.be.equal(obj2);
      });
      
      it('should cache components', function() {
        expect(container._o['device/laptop']).to.be.an('object');
        expect(container._o['device/cpu/x86']).to.be.an('object');
        expect(container._o['device/storage/floppy']).to.be.undefined;
      });
    });
    
    describe('creating phone', function() {
      var obj = container.create('device/phone');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('Phone');
      });
      
      it('should conform to interface', function() {
        expect(obj.screen.resolution).to.equal('320x480');
        expect(obj.cpu.type).to.equal('ARM');
        expect(obj.dial('555-1212')).to.equal('Dialing 555-1212...');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('device/phone');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    describe('creating PPC CPU', function() {
      var obj = container.create('device/cpu/ppc');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('CPU');
      });
      
      it('should conform to interface', function() {
        expect(obj.type).to.equal('PowerPC');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('device/cpu/ppc');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    /*
    describe.only('creating car using constructor pattern', function() {
      var obj = container.create('car');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('Car');
      });
      
      it('should create object with normal properties', function() {
        expect(obj.start()).to.equal('using 240 volts');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('gasolineengine');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    */
  });
  
});
