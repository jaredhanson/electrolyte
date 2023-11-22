var singleton = require('../../lib/sources/singleton');

describe('source/singleton', function() {
	var sglt = {foo: 'bar'};
  var source = singleton('settings', sglt)
  
	var obj = source('settings')
	
  it('should return @singleton component', function() {
		expect(obj['@singleton']).to.be.equal(true);
  });
	
  it('should return undefined if module not found', function() {
    var obj = source('fubar');
    expect(obj).to.be.undefined;
  });
	
	let resolved;
	
	before(function(done) {
		obj.then(function(o) {
			resolved = o;
			done();
		}, done);
	});
	
  it('should be resolved with settings', function() {
    expect(resolved).to.be.equal(sglt);
  });
  
});
