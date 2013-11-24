exports = module.exports = function(db) {
  
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
  return [ loadFromDb,
           render ];
}

exports['@require'] = [ 'db/todos' ];
