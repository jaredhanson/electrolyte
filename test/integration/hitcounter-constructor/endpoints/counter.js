exports = module.exports = function(counter, logger) {
  
  function logRequest(req, res, next) {
    logger.info('GET ' + req.url);
    next();
  }
  
  function incCounter(req, res, next) {
    res.locals = {};
    res.locals.hits = counter.inc();
    next();
  }
  
  function respond(req, res, next) {
    res.send('This page has been visited ' + res.locals.hits + ' times!');
  }
  
  
  return [
    logRequest,
    incCounter,
    respond
  ]
}

exports['@require'] = [ 'counter', 'logger' ];
