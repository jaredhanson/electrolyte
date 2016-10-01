/**
 * Render to-do list.
 *
 * This route handler is used to display the list of to-do items.
 *
 * Parameters:
 *
 *   - `settings`  Settings configured for the application.
 *
 *   - `db`  Connection to the database where todo records are stored.
 *
 *   - `logger`  Logger for logging warnings, errors, etc.
 */
exports = module.exports = function(settings, db, logger) {

  function logRequest(req, res, next) {
    logger.info(req.ip + ' ' + req.headers['user-agent']);
    next();
  }

  function loadFromDb(req, res, next) {
    db.findAll(function(err, todos) {
      if (err) { return next(err); }
      res.locals.todos = todos;
      next();
    });
  }

  function render(req, res, next) {
    res.locals.title = settings.get('title');
    res.render('list');
  }

  /**
   * GET /
   */
  return [ logRequest,
           loadFromDb,
           render ];
}

/**
 * Component annotations.
 */
exports['@async'] = true;
exports['@require'] = [ 'settings', 'db/todos', 'logger' ];
