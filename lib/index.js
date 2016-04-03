// Load modules.
var Container = require('./container');


exports = module.exports = new Container();

// Exports.
exports.Container = Container;

exports.fs =
exports.node = require('./sources/node');
exports.node_modules = require('./sources/node_modules');
