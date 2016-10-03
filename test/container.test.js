/* global describe, it, expect */
var Promise = require('bluebird');
var Container = require('../lib/container');


describe('Container', function() {
  
  describe('#create', function() {
    var container = new Container();
    
    describe('unknown component', function() {
      it('should throw an error when created without a parent', function() {
        expect(function() {
          var obj = container.create('unknown');
        }).to.throw(Error, 'Unable to create object "unknown" required by: unknown');
      });
      
      it('should throw an error when created with a parent', function() {
        expect(function() {
          var obj = container.create('unknown', { id: 'main' });
        }).to.throw(Error, 'Unable to create object "unknown" required by: main');
      });
      
      it('should throw an error when created with a parent, lacking an id', function() {
        expect(function() {
          var obj = container.create('unknown', {});
        }).to.throw(Error, 'Unable to create object "unknown" required by: unknown');
      });
    });
    
    describe('async component', function() {
      var container = new Container();
      container.use(require('./fixtures/sources/async'));

      it('should work but warn when created synchronously without @async annotation', function() {
        var obj = container.create('asyncLike');
        expect(obj).to.be.instanceof(Promise);
      });

      it('should throw an error when created synchronously', function() {
        expect(function() {
          var obj = container.create('asyncB');
        }).to.throw(Error, 'Container#create cannot be called on async dependency: "asyncB"');
      });

      it('should throw an error when created synchronously via dependency', function() {
        expect(function() {
          var obj = container.create('asyncFailure');
        }).to.throw(Error, 'Container#create cannot be called on async dependency: "asyncB"');
      });
    });

    describe('patterns', function() {
      
      var container = new Container();
      container.use(require('./fixtures/sources/patterns'));
      
      describe('factory', function() {
        
        it('should create object', function() {
          var obj = container.create('factory');
          expect(obj).to.be.an.instanceof(Object);
        });
        
        it('should create multiple instances of object', function() {
          var obj1 = container.create('factory');
          var obj2 = container.create('factory');
          expect(obj1).to.be.an.instanceof(Object);
          expect(obj2).to.be.an.instanceof(Object);
          expect(obj1).to.not.be.equal(obj2);
        });
        
      }); // factory
      
      describe('constructor', function() {
        
        it('should create object', function() {
          var obj = container.create('ctor');
          expect(obj.constructor.name).to.equal('Building')
        });
        
        it('should create multiple instances of object', function() {
          var obj1 = container.create('ctor');
          var obj2 = container.create('ctor');
          expect(obj1.constructor.name).to.equal('Building')
          expect(obj1.constructor.name).to.equal('Building')
          expect(obj1).to.not.be.equal(obj2);
        });
        
      }); // constructor
      
      describe('literal', function() {
        
        describe('object', function() {
          
          it('should create object', function() {
            var obj = container.create('literal/object');
            expect(obj).to.deep.equal({ greeting: 'Hello', name: 'object' });
          });
        
          it('should not create multiple instances of object', function() {
            var obj1 = container.create('literal/object');
            var obj2 = container.create('literal/object');
            expect(obj1).to.deep.equal({ greeting: 'Hello', name: 'object' });
            expect(obj2).to.deep.equal({ greeting: 'Hello', name: 'object' });
            expect(obj1).to.be.equal(obj2);
          });
          
        }); // object
        
        describe('string', function() {
          
          it('should create object', function() {
            var obj = container.create('literal/string');
            expect(obj).to.equal('Hello, string');
          });
        
          it('should not create multiple instances of object', function() {
            var obj1 = container.create('literal/string');
            var obj2 = container.create('literal/string');
            expect(obj1).to.equal('Hello, string');
            expect(obj2).to.equal('Hello, string');
            expect(obj1).to.be.equal(obj2);
          });
          
        }); // string
        
        describe('function', function() {
          
          it('should create object', function() {
            var obj = container.create('literal/function');
            expect(obj).to.be.a('function');
            expect(obj()).to.equal('Hello, function');
          });
        
          it('should not create multiple instances of object', function() {
            var obj1 = container.create('literal/function');
            var obj2 = container.create('literal/function');
            expect(obj1).to.be.equal(obj2);
          });
          
        }); // function
        
      }); // literal
    
    }); // patterns
    
  }); // #create
  
  describe('#use', function() {
    var container = new Container();
    
    describe('invalid loader', function() {
      it('should throw an error', function() {
        expect(function() {
          container.use('test', undefined);
        }).to.throw(Error, "Container#use requires a load function, was passed a 'undefined'");
      });
    });
    
  });
  
  
  describe('using common source', function() {
    var common = require('./fixtures/sources/common');
    
    var container = new Container();
    container.use(common);
    
    it('should not have any registered specs prior to creating object', function() {
      var specs = container.specs();
      expect(specs).to.be.an('array');
      expect(specs).to.have.length(0);
    });
    
    it('should create logger', function() {
      var obj = container.create('logger');
      expect(obj).to.be.an.instanceof(common.Logger);
    });
    
    it('should create singleton instance of logger', function() {
      var logger1 = container.create('logger');
      var logger2 = container.create('logger');
      expect(logger1).to.be.equal(logger2);
    });

    it('should throw an error when creating unknown object', function() {
      expect(function() {
        container.create('fubar');
      }).to.throw(Error, 'Unable to create object "fubar" required by: unknown');
    });
    
    it('should have registered specs after creating object', function() {
      var specs = container.specs();
      expect(specs).to.be.an('array');
      expect(specs).to.have.length(1);
      
      var spec = specs[0];
      expect(spec.id).to.equal('logger');
      expect(spec.singleton).to.equal(true);
      expect(spec.dependencies).to.deep.equal([]);
      expect(spec.implements).to.deep.equal([]);
    });
  });
  

  describe('using async source', function() {
    var asyncSource = require('./fixtures/sources/async');

    var container = new Container();
    container.use(asyncSource);

    it('should not have any registered specs prior to creating object', function() {
      var specs = container.specs();
      expect(specs).to.be.an('array');
      expect(specs).to.have.length(0);
    });

    it('should create asyncB', function() {
      return container.createAsync('asyncB').then(function (obj) {
        expect(obj).to.eql({waited: {done: 'B'}});
      });
    });

    it('should create singleton instance of asyncB', function() {
      return Promise.all([
        container.createAsync('asyncB'),
        container.createAsync('asyncB')
      ]).spread(function (asyncB1, asyncB2) {
        expect(asyncB1).to.be.equal(asyncB2);
      });
    });

    it('should create asyncA', function() {
      return container.createAsync('asyncA').then(function (obj) {
        expect(obj).to.eql([
          [{done: 'B'}, {done: 'C'}],
          {waited: {done: 'B'}},
          {waited: {done: 'C'}}
        ]);
      });
    });
  });

  describe('using Memory cache source', function() {
    var memory = require('./fixtures/sources/cache-memory');
    
    var container = new Container();
    container.use('cache', memory);
    
    it('should create Memory implementation of cache', function() {
      var obj = container.create('cache/cache');
      expect(obj).to.be.an.instanceof(memory.MemoryCache);
    });
  });
  
  describe('using Redis cache source in two namespaces', function() {
    var redis = require('./fixtures/sources/cache-redis');
    
    var container = new Container();
    container.use('cache', redis);
    container.use('cache/pages', redis);
    
    var cache1 = container.create('cache/cache');
    var cache2 = container.create('cache/cache');
    
    var pagecache1 = container.create('cache/pages/cache');
    var pagecache2 = container.create('cache/pages/cache');
    
    it('should create singleton instance of Redis cache in first namespace', function() {
      expect(cache1).to.be.an.instanceof(redis.RedisCache);
      expect(cache1).to.be.equal(cache2);
    });
    
    it('should create singleton instance of Redis cache in second namespace', function() {
      expect(pagecache1).to.be.an.instanceof(redis.RedisCache);
      expect(pagecache1).to.be.equal(pagecache2);
    });
    
    it('should create separate instances of Redis cache in different namespaces', function() {
      expect(cache1).to.not.be.equal(pagecache1);
    });
  });
  
  describe('using Redis cache source overridding Memory cache source', function() {
    var memory = require('./fixtures/sources/cache-memory');
    var redis = require('./fixtures/sources/cache-redis');
    
    var container = new Container();
    container.use('cache', memory);
    container.use('cache', redis);
    
    it('should create Redis implementation of cache', function() {
      var obj = container.create('cache/cache');
      expect(obj).to.be.an.instanceof(redis.RedisCache);
    });
  });
  
  describe('using node_modules loader', function() {
    var container = new Container();
    container.use(require('../lib/sources/node_modules')());

    it('should return the same module as require', function() {
      var obj = container.create('dgram');
      expect(obj).to.be.equal(require('dgram'));
    });
  });
  
});
