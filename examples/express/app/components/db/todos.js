/**
 * Initialize database.
 *
 * This component connects to the database used to store to-do records.
 *
 * Parameters:
 *
 *   - `settings`  Settings configured for the application.
 *
 *   - `logger`  Logger for logging warnings, errors, etc.
 */
exports = module.exports = function(settings, logger) {
  var db = new Database(logger);
  db.connect(settings.get('db host'));
  
  return db;
}

/**
 * Component annotations.
 */
exports['@singleton'] = true;
exports['@require'] = [ 'settings', 'logger' ];




var records = [
  { id: '1', description: 'Buy groceries' },
  { id: '2', description: 'Wash car' }
];

function Database(logger) {
  this.logger = logger;
}

Database.prototype.connect = function(host) {
  console.log('connecting to db server at ' + host);
}

Database.prototype.findAll = function(cb) {
  process.nextTick(function() {
    return cb(null, records);
  });
}

Database.prototype.add = function(item, cb) {
  var self = this;
  process.nextTick(function() {
    var id = records.length + 1;
    item.id = id;
    records.push(item);
    self.logger.info('added item "' + id + '" to database');
    return cb(null);
  });
}
