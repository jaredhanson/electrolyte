// Load modules.
var Container = require('./container');


exports = module.exports = new Container();

// Exports.
exports.Container = Container;

exports.fs =
exports.node = require('./loaders/node');
exports.node_modules = require('./loaders/node_modules');
