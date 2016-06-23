/* global describe, it, expect */
var sinon = require('sinon');
var Spec = require('../lib/spec');


describe('Spec', function() {
  
  describe('#instatiate', function() {
      
    it('should throw an error', function() {
      expect(function() {
        var spec = new Spec('foo', {});
        spec.instantiate();
      }).to.throw(Error, "Spec#instantiate must be overridden by subclass");
    });
    
  });
  
  describe('#create', function() {
    var containerApi = {create: function() {}, createAsync: function() {}}
      , sandbox;

    beforeEach(function() {
      sandbox = sinon.sandbox.create();
    });

    afterEach(function() {
      sandbox.restore();
    });

    context('when synchronous', function() {
      var spec = new Spec('foo', {'@require': ['dep1', 'dep2']});

      it('should create required dependencies', function() {
        sandbox.stub(spec, 'instantiate');
        var mockCreate = sandbox.stub(containerApi, 'create');

        spec.create(containerApi);
        expect(mockCreate).to.have.been.calledTwice;
        expect(mockCreate).to.have.been.calledWith('dep1');
        expect(mockCreate).to.have.been.calledWith('dep2');
      });

      it('should pass dependencies to instantiate', function() {
        var mockInstantiate = sandbox.stub(spec, 'instantiate');
        var mockCreate = sandbox.stub(containerApi, 'create');
        mockCreate.onFirstCall().returns('foo');
        mockCreate.onSecondCall().returns('bar');

        spec.create(containerApi);
        expect(mockCreate).to.have.been.calledTwice;
        expect(mockInstantiate).to.have.been.calledWith('foo', 'bar');
      });

      it('should return the resulting value', function() {
        var expected = {my: {fancy: 'obj'}};
        var mockInstantiate = sandbox.stub(spec, 'instantiate').returns(expected);

        var result = spec.create(containerApi);
        expect(result).to.equal(expected);
      });
    });

    context('when asynchronous', function() {
      var spec = new Spec('foo', {'@async': true, '@require': ['dep1', 'dep2']});

      it('should create required dependencies', function() {
        sandbox.stub(spec, 'instantiate');
        var mockCreate = sandbox.stub(containerApi, 'createAsync');

        return spec.create(containerApi).then(function () {
          expect(mockCreate).to.have.been.calledTwice;
          expect(mockCreate).to.have.been.calledWith('dep1');
          expect(mockCreate).to.have.been.calledWith('dep2');
        });
      });

      it('should pass dependencies to instantiate', function() {
        var mockInstantiate = sandbox.stub(spec, 'instantiate');
        var mockCreate = sandbox.stub(containerApi, 'createAsync');
        mockCreate.onFirstCall().returns(Promise.resolve('foo'));
        mockCreate.onSecondCall().returns('bar');

        return spec.create(containerApi).then(function(result) {
          expect(mockInstantiate).to.have.been.calledWith('foo', 'bar');
        });
      });

      it('should return the resulting value', function() {
        var expected = {my: {fancy: 'obj'}};
        var mockInstantiate = sandbox.stub(spec, 'instantiate').returns(expected);

        return spec.create(containerApi).then(function(result) {
          expect(result).to.equal(expected);
        });
      });

      it('should wait for dependencies to resolve', function() {
        var resolveDependency;

        var mockFulfill = sandbox.stub();
        var mockInstantiate = sandbox.stub(spec, 'instantiate');
        var mockCreate = sandbox.stub(containerApi, 'createAsync');
        mockCreate.onFirstCall().returns('foo');
        mockCreate.onSecondCall().returns(new Promise(function (resolve) {
          resolveDependency = function (v) {
            mockFulfill();
            return resolve(v);
          };
        }));

        setTimeout(resolveDependency.bind(null, 'bar'), 10);
        return spec.create(containerApi).then(function(result) {
          expect(mockFulfill).to.have.been.called;
          expect(mockInstantiate).to.have.been.calledWith('foo', 'bar');
        });
      });
    });
  });

});
