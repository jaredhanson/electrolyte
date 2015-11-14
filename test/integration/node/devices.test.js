/* global describe, it, expect */

var Container = require('../../../lib/container')
  , node = require('../../../lib/loaders/node');


describe('integration of Node loader', function() {
  
  describe('loading objects to create devices', function() {
    var container = new Container();
    container.use(node(__dirname + '/objects'));

    describe('creating server', function() {
      var obj = container.create('devices/server');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('Server');
      });
      
      it('should conform to interface', function() {
        expect(obj.cpu.type).to.equal('x86');
        expect(obj.chassis).to.equal('2U');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('devices/server');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    describe('creating desktop', function() {
      var obj = container.create('devices/desktop');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('Desktop');
      });
      
      it('should conform to interface', function() {
        expect(obj.keyboard.desc()).to.equal('EN+Calculator');
        expect(obj.cpu.type).to.equal('x86');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('devices/desktop');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    describe('creating laptop', function() {
      var obj = container.create('devices/laptop');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('Laptop');
      });
      
      it('should conform to interface', function() {
        expect(obj.keyboard.desc()).to.equal('EN');
        expect(obj.cpu.type).to.equal('x86');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('devices/laptop');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    describe('creating phone', function() {
      var obj = container.create('devices/phone');
      
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
        var obj2 = container.create('devices/phone');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    describe('creating PPC CPU', function() {
      var obj = container.create('devices/cpu/ppc');
      
      it('should create an object', function() {
        expect(obj).to.be.an('object');
        expect(obj.constructor.name).to.equal('CPU');
      });
      
      it('should conform to interface', function() {
        expect(obj.type).to.equal('PowerPC');
      });
      
      it('should create unique instances', function() {
        var obj2 = container.create('devices/cpu/ppc');
        expect(obj).to.not.be.equal(obj2);
      });
    });
    
    it('should cache loaded components', function() {
      expect(container._specs['devices/laptop']).to.be.an('object');
      expect(container._specs['devices/cpu/x86']).to.be.an('object');
    });
    
    it('should not cache unloaded components', function() {
      expect(container._specs['devices/storage/floppy']).to.be.undefined;
    });
  });
  
});
