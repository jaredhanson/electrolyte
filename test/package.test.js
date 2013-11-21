/* global describe, it, expect */

var electrolyte = require('..');

describe('electrolyte', function() {
  
  it('should export constructors', function() {
    expect(electrolyte.Container).to.be.a('function');
  });
  
});
