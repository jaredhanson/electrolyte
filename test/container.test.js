/* global describe, it, expect */
var Promise = require('promise');
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
    
    describe.skip('async component', function() {
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
        
        describe('creating an object', function() {
          var p = container.create('factory');
          
          it('should return promise', function() {
            expect(p).to.be.an.instanceof(Promise);
          });
          
          describe('resolving promise', function() {
            var obj;
            
            before(function(done) {
              p.then(function(o) {
                obj = o;
                done();
              }, done);
            });
            
            it('should supply object', function() {
              expect(obj).to.be.an.instanceof(Object);
              expect(obj).to.not.be.an.instanceof(Promise);
            });
          });
        });
        
        describe('creating multiple instances of object', function() {
          var p1 = container.create('factory')
            , p2 = container.create('factory');
          
          it('should return multiple promises', function() {
            expect(p1).to.be.an.instanceof(Promise);
            expect(p2).to.be.an.instanceof(Promise);
            expect(p1).to.not.be.equal(p2);
          });
        
          describe('resolving multiple promises', function() {
            var obj1, obj2;
            
            before(function(done) {
              Promise.all([p1, p2]).then(function(args) {
                obj1 = args[0];
                obj2 = args[1];
                done();
              }, done);
            });
        
            it('should supply multiple objects', function() {
              expect(obj1).to.be.an.instanceof(Object);
              expect(obj2).to.be.an.instanceof(Object);
              expect(obj1).to.not.be.equal(obj2);
              expect(obj1).to.not.be.an.instanceof(Promise);
              expect(obj2).to.not.be.an.instanceof(Promise);
            });
          });
        });
        
      }); // factory
      
      describe('constructor', function() {
        
        describe('creating an object', function() {
          var p = container.create('ctor');
          
          it('should return promise', function() {
            expect(p).to.be.an.instanceof(Promise);
          });
          
          describe('resolving promise', function() {
            var obj;
            
            before(function(done) {
              p.then(function(o) {
                obj = o;
                done();
              }, done);
            });
            
            it('should supply object', function() {
              expect(obj.constructor.name).to.equal('Building')
            });
          });
        });
        
        describe('creating multiple instances of object', function() {
          var p1 = container.create('ctor');
          var p2 = container.create('ctor');
        
          it('should return promise', function() {
            expect(p1).to.be.an.instanceof(Promise);
            expect(p2).to.be.an.instanceof(Promise);
          });
        
          describe('resolving promise', function() {
            var obj1, obj2;
          
            before(function(done) {
              Promise.all([p1, p2]).then(function(args) {
                obj1 = args[0];
                obj2 = args[1];
                done();
              }, done);
            });
          
            it('should supply multiple object', function() {
              expect(obj1.constructor.name).to.equal('Building')
              expect(obj1.constructor.name).to.equal('Building')
              expect(obj1).to.not.be.equal(obj2);
            });
          });
        });
        
      }); // constructor
      
      describe('literal', function() {
        
        describe('object', function() {
          
          describe('creating an object', function() {
            var p = container.create('literal/object');
          
            it('should return promise', function() {
              expect(p).to.be.an.instanceof(Promise);
            });
          
            describe('resolving promise', function() {
              var obj;
            
              before(function(done) {
                p.then(function(o) {
                  obj = o;
                  done();
                }, done);
              });
            
              it('should supply object', function() {
                expect(obj).to.deep.equal({ greeting: 'Hello', name: 'object' });
              });
            });
          });
          
          describe('creating multiple instances of object', function() {
            var p1 = container.create('literal/object');
            var p2 = container.create('literal/object');
        
            it('should return promise', function() {
              expect(p1).to.be.an.instanceof(Promise);
              expect(p2).to.be.an.instanceof(Promise);
            });
        
            describe('resolving promise', function() {
              var obj1, obj2;
          
              before(function(done) {
                Promise.all([p1, p2]).then(function(args) {
                  obj1 = args[0];
                  obj2 = args[1];
                  done();
                }, done);
              });
          
              it('should supply multiple object', function() {
                expect(obj1).to.deep.equal({ greeting: 'Hello', name: 'object' });
                expect(obj2).to.deep.equal({ greeting: 'Hello', name: 'object' });
                expect(obj1).to.be.equal(obj2);
              });
            });
          });
          
        }); // object
        
        describe('string', function() {
          
          describe('creating an object', function() {
            var p = container.create('literal/string');
          
            it('should return promise', function() {
              expect(p).to.be.an.instanceof(Promise);
            });
          
            describe('resolving promise', function() {
              var obj;
            
              before(function(done) {
                p.then(function(o) {
                  obj = o;
                  done();
                }, done);
              });
            
              it('should supply object', function() {
                expect(obj).to.equal('Hello, string');
              });
            });
          });
          
          describe('creating multiple instances of object', function() {
            var p1 = container.create('literal/string');
            var p2 = container.create('literal/string');
        
            it('should return promise', function() {
              expect(p1).to.be.an.instanceof(Promise);
              expect(p2).to.be.an.instanceof(Promise);
            });
        
            describe('resolving promise', function() {
              var obj1, obj2;
          
              before(function(done) {
                Promise.all([p1, p2]).then(function(args) {
                  obj1 = args[0];
                  obj2 = args[1];
                  done();
                }, done);
              });
          
              it('should supply multiple object', function() {
                expect(obj1).to.equal('Hello, string');
                expect(obj2).to.equal('Hello, string');
                expect(obj1).to.be.equal(obj2);
              });
            });
          });
          
        }); // string
        
        describe('function', function() {
          
          describe('creating an object', function() {
            var p = container.create('literal/function');
          
            it('should return promise', function() {
              expect(p).to.be.an.instanceof(Promise);
            });
          
            describe('resolving promise', function() {
              var obj;
            
              before(function(done) {
                p.then(function(o) {
                  obj = o;
                  done();
                }, done);
              });
            
              it('should supply object', function() {
                expect(obj).to.be.a('function');
                expect(obj()).to.equal('Hello, function');
              });
            });
          });
          
          describe('creating multiple instances of object', function() {
            var p1 = container.create('literal/function');
            var p2 = container.create('literal/function');
        
            it('should return promise', function() {
              expect(p1).to.be.an.instanceof(Promise);
              expect(p2).to.be.an.instanceof(Promise);
            });
        
            describe('resolving promise', function() {
              var obj1, obj2;
          
              before(function(done) {
                Promise.all([p1, p2]).then(function(args) {
                  obj1 = args[0];
                  obj2 = args[1];
                  done();
                }, done);
              });
          
              it('should not supply multiple object', function() {
                expect(obj1).to.be.a('function');
                expect(obj1()).to.equal('Hello, function');
                expect(obj2).to.be.a('function');
                expect(obj2()).to.equal('Hello, function');
                expect(obj1).to.be.equal(obj2);
              });
            });
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
    
    it.skip('should not have any registered specs prior to creating object', function() {
      var specs = container.specs();
      expect(specs).to.be.an('array');
      expect(specs).to.have.length(0);
    });
    
    describe('create logger', function() {
      var obj;
  
      before(function(done) {
        container.create('logger')
          .then(function(o) {
            obj = o;
            done();
          }, done);
      })
  
      it('should create logger', function() {
        expect(obj).to.be.an.instanceof(common.Logger);
      });
      
    });
    
    describe('create singleton instance of logger', function() {
      var plogger1 = container.create('logger')
        , plogger2 = container.create('logger')
      
      var logger1, logger2;
  
      before(function(done) {
        Promise.all([ plogger1, plogger2 ])
          .then(function(args) {
            logger1 = args[0];
            logger2 = args[1];
            done();
          }, done);
      })
  
      it('should create singleton instance of logger', function() {
        expect(logger1).to.be.equal(logger2);
      });
      
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
  

  describe.skip('using async source', function() {
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
    
    describe('creating implementation of cache', function() {
      var cache;
      
      before(function(done) {
        container.create('cache/cache')
          .then(function(obj) {
            cache = obj;
            done();
          }, done);
      })
      
      it('should create Memory implementation of cache', function() {
        expect(cache).to.be.an.instanceof(memory.MemoryCache);
      });
    });
  });
  
  describe('using Redis cache source in two namespaces', function() {
    var redis = require('./fixtures/sources/cache-redis');
    
    var container = new Container();
    container.use('cache', redis);
    container.use('cache/pages', redis);
    
    var pcache1 = container.create('cache/cache');
    var pcache2 = container.create('cache/cache');
    var cache1, cache2;
    
    var ppagecache1 = container.create('cache/pages/cache');
    var ppagecache2 = container.create('cache/pages/cache');
    var pagecache1, pagecache2;
    
    
    describe('creating singleton instance of Redis cache in first namespace', function() {
      before(function(done) {
        Promise.all([pcache1, pcache2])
          .then(function(args) {
            cache1 = args[0];
            cache2 = args[1];
            done();
          }, done);
      })
      
      it('should create Redis implementation of cache', function() {
        expect(cache1).to.be.an.instanceof(redis.RedisCache);
        expect(cache1).to.be.equal(cache2);
      });
      
      describe('and then creating singleton instance of Redis cache in second namespace', function() {
        before(function(done) {
          Promise.all([ppagecache1, ppagecache2])
            .then(function(args) {
              pagecache1 = args[0];
              pagecache2 = args[1];
              done();
            }, done);
        })
      
        it('should create Redis implementation of cache', function() {
          expect(pagecache1).to.be.an.instanceof(redis.RedisCache);
          expect(pagecache1).to.be.equal(pagecache2);
        });
        
        it('should create separate instances of Redis cache in different namespaces', function() {
          expect(cache1).to.not.be.equal(pagecache1);
        });
      });
      
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
