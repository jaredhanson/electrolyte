/* global describe, it, expect */

var electrolyte = require('..');

describe('electrolyte', function() {
  
  it('should export constructors', function() {
    expect(electrolyte.Container).to.be.a('function');
  });
  
  it('should export sources', function() {
    expect(electrolyte.dir).to.be.a('function');
    expect(electrolyte.node_modules).to.be.a('function');
  });
  
  it('should alias fs source to dir', function() {
    expect(electrolyte.fs).to.be.equal(electrolyte.dir);
  });
  
  it('should export deprecated sources', function() {
    expect(electrolyte.node).to.be.a('function');
  });
  
});
