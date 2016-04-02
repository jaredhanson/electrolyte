/* global describe, it, expect */

var chai = require('chai');
var Container = require('../../../lib/container');


describe('integration/hitcounter', function() {
  
  var container = new Container();
  container.use(require('../../fixtures/sources/common'));
  container.use('cache', require('../../fixtures/sources/cache-redis'));
  container.use(require('../../../lib/loaders/node')(__dirname));
  
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
  
  it('should do something', function() {
    expect(response.data).to.equal('This page has been visited 42 times!');
  });
  
});
