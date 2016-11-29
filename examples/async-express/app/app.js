/**
 * Expose application.
 */
exports = module.exports = function (http, express, Promise, router) {
  var app = express();

  app.use(router);
  
  return new Promise(function (resolve) {
    var server = http.createServer(app);
    server.listen(3000, resolve.bind(null, server));
  }).then(function (server) {
    var addr = server.address();
    console.log('server listening on http://' + addr.address + ':' + addr.port);
  })
};

exports['@async'] = true;
exports['@singleton'] = true;
exports['@require'] = ['http', 'express', 'bluebird', 'router'];
