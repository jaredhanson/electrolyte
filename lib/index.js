var Container = require('./container');


exports = module.exports = new Container();

exports.Container = Container;

exports.node = require('./loaders/node');
exports.node_modules = require('./loaders/node_modules');
