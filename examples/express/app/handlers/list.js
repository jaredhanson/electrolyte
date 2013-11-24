exports = module.exports = function(db, logger) {
  
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
    res.render('list');
  }

  /**
   * GET /
   */
  return [ logRequest,
           loadFromDb,
           render ];
}

exports['@require'] = [ 'db/todos', 'logger' ];
