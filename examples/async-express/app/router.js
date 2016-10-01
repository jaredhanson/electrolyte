/**
 * Draw routes.
 *
 * Route handlers are created using Electrolyte, which automatically wires
 * together any necessary components, including database connections, logging
 * facilities, configuration settings, etc.
 */
exports = module.exports = function routes(express, listHandler, createHandler) {
  var router = express();

  router.get('/', listHandler);
  router.post('/todo', createHandler);

  return router;
}

exports['@async'] = true;
exports['@singleton'] = true;
exports['@require'] = ['express', 'handlers/list', 'handlers/create']
