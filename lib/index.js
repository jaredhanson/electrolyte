var Container = require('./container');


exports = module.exports = new Container();

exports.Container = Container;

exports.node = require('./loaders/node');
