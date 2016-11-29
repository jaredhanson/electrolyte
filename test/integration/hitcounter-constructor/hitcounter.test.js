/* global describe, it, expect */

var chai = require('chai');
var Container = require('../../../lib/container');


describe.skip('integration/hitcounter-constructor', function() {
  
  var container = new Container();
  container.use(require('../../fixtures/sources/common'));
  container.use('cache', require('../../fixtures/sources/cache-redis'));
  container.use(require('../../../lib/sources/dir')(__dirname));
  
  var response;
  
  before(function(done) {
    var endpoint = container.create('endpoints/counter');
    
    chai.express.handler(endpoint)
      .end(function(res) {
        response = res;
        done();
      })
      .req(function(req) {
        request = req;
      })
      .dispatch();
  });
  
  it('should respond with hit count', function() {
    expect(response.data).to.equal('This page has been visited 42 times!');
  });
  
  it('should update counter', function() {
    var counter = container.create('counter');
    expect(counter.peek()).to.equal(42);
  });
  
  it('should log messages', function() {
    var logger = container.create('logger');
    expect(logger.messages[0]).to.equal('GET /');
    expect(logger.messages[1]).to.equal('Fetching current hit count from cache');
  });
  
});
