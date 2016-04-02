exports = module.exports = function(logger) {
  
  function logRequest(req, res, next) {
    logger.info('GET ' + req.url);
    next();
  }
  
  function respond(req, res, next) {
    res.send('This page has been vistied ' + 1 + ' time!');
  }
  
  
  return [
    logRequest,
    respond
  ]
}

exports['@require'] = [ 'logger' ];
