// Load modules.
var Container = require('./container')
  , deprecate = require('depd')('electrolyte');


exports = module.exports = new Container();

// Exports.
exports.Container = Container;

exports.fs =
exports.dir = require('./sources/dir');
exports.node = deprecate.function(exports.dir, 'Container#node: Use Container#dir instead');

exports.node_modules = require('./sources/node_modules');
