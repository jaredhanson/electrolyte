var singleton = require('../../lib/sources/singleton');

describe('source/singleton', function() {
	var sglt = {foo: 'bar'};
  var source = singleton('settings', sglt)
  
  it('should return node module', function() {
    var obj = source('settings');
    expect(obj).to.be.equal(sglt);
  });
  
  it('should return undefined if module not found', function() {
    var obj = source('fubar');
    expect(obj).to.be.undefined;
  });
  
});
