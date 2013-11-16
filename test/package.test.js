/* global describe, it, expect */

var ionic = require('..');

describe('ionic', function() {
  
  it('should export constructors', function() {
    expect(ionic.Container).to.be.a('function');
  });
  
});
